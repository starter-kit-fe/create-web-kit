import fs from 'node:fs'
import path from 'node:path'
import obfuscator from 'javascript-obfuscator'

const tempDistDir = path.join(process.cwd(), 'temp-dist')
const finalDistDir = path.join(process.cwd(), 'dist')

// 轻量混淆配置 - 适用于开发环境
const lightObfuscatorOptions = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,

    identifierNamesGenerator: 'mangled',
    renameGlobals: false,
    reservedNames: [
        'require', 'module', 'exports', '__dirname', '__filename', 'process', 'console',
        'argv', 'cwd', 'exit', 'env', 'npm', 'pnpm', 'yarn', 'bun',
        'nextjs', 'vue', 'react', 'electron', 'init', 'main', 'FRAMEWORKS'
    ],

    stringArray: true,
    stringArrayEncoding: [],
    stringArrayThreshold: 0.3,

    transformObjectKeys: false,
    unicodeEscapeSequence: false,
    target: 'node',
}

// 创建临时目录
if (!fs.existsSync(tempDistDir)) {
    fs.mkdirSync(tempDistDir, { recursive: true })
}

function obfuscateFile(filePath, outputPath) {
    console.log(`🔒 Obfuscating: ${path.relative(process.cwd(), filePath)}`)

    const sourceCode = fs.readFileSync(filePath, 'utf8')

    // Skip JSX files (check for JSX syntax)
    if (sourceCode.includes('<') && sourceCode.includes('/>') ||
        sourceCode.includes('jsx') ||
        sourceCode.includes('React') ||
        filePath.includes('layout.js') ||
        filePath.includes('not-found.js') ||
        filePath.includes('theme-provider.js') ||
        filePath.includes('query-provider.js')) {
        console.log(`⏭️ Skipping JSX file: ${path.relative(process.cwd(), filePath)}`)
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }
        fs.copyFileSync(filePath, outputPath)
        console.log(`📋 Copied original: ${path.relative(process.cwd(), outputPath)}`)
        return
    }

    try {
        const obfuscatedCode = obfuscator.obfuscate(sourceCode, lightObfuscatorOptions).getObfuscatedCode()

        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }

        let finalCode = obfuscatedCode
        if (sourceCode.startsWith('#!')) {
            const shebangLine = sourceCode.split('\n')[0]
            const codeWithoutShebang = sourceCode.split('\n').slice(1).join('\n')
            const obfuscatedCodeWithoutShebang = obfuscator.obfuscate(codeWithoutShebang, lightObfuscatorOptions).getObfuscatedCode()
            finalCode = shebangLine + '\n' + obfuscatedCodeWithoutShebang
        }

        fs.writeFileSync(outputPath, finalCode)
        console.log(`✅ Obfuscated: ${path.relative(process.cwd(), outputPath)}`)
    } catch (error) {
        console.error(`❌ Error obfuscating ${filePath}:`, error.message)
        fs.copyFileSync(filePath, outputPath)
        console.log(`📋 Copied original: ${path.relative(process.cwd(), outputPath)}`)
    }
}

function walkDir(dir, baseDir, targetDir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stats = fs.statSync(filePath)

        if (stats.isDirectory()) {
            walkDir(filePath, baseDir, targetDir)
        } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
            const relativePath = path.relative(baseDir, filePath)
            const outputPath = path.join(targetDir, relativePath)
            obfuscateFile(filePath, outputPath)
        } else {
            const relativePath = path.relative(baseDir, filePath)
            const outputPath = path.join(targetDir, relativePath)
            const outputDir = path.dirname(outputPath)

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true })
            }

            fs.copyFileSync(filePath, outputPath)
        }
    }
}

console.log('🚀 Starting code obfuscation...')

if (!fs.existsSync(tempDistDir)) {
    console.error('❌ temp-dist directory not found. Please run "tsc" first.')
    process.exit(1)
}

// 清理并创建最终目录
if (fs.existsSync(finalDistDir)) {
    fs.rmSync(finalDistDir, { recursive: true, force: true })
}
fs.mkdirSync(finalDistDir, { recursive: true })

walkDir(tempDistDir, tempDistDir, finalDistDir)

// 清理临时目录
fs.rmSync(tempDistDir, { recursive: true, force: true })

console.log('🎉 Code obfuscation completed!')

const mainFile = path.join(finalDistDir, 'index.js')
if (fs.existsSync(mainFile)) {
    fs.chmodSync(mainFile, '755')
    console.log('🔧 Set executable permissions for index.js')
}
