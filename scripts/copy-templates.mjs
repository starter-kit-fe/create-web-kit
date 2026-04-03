import fs from 'node:fs'
import path from 'node:path'

const srcTemplatesDir = path.join(process.cwd(), 'src/templates')
const tempDistDir = path.join(process.cwd(), 'dist')
const tempTemplatesDir = path.join(tempDistDir, 'templates')
const srcAssetsDir = path.join(process.cwd(), 'src/assets')
const tempAssetsDir = path.join(tempDistDir, 'assets')

console.log('📂 Copying template files...')

function resetDir(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
    }
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
    }

    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
            console.log(`✅ Copied: ${path.relative(process.cwd(), destPath)}`)
        }
    }
}

if (fs.existsSync(srcTemplatesDir)) {
    resetDir(tempTemplatesDir)
    copyDir(srcTemplatesDir, tempTemplatesDir)
    console.log('🎉 Template files copied successfully!')
} else {
    console.warn('⚠️ Templates directory not found:', srcTemplatesDir)
}

// Also copy assets if they exist
if (fs.existsSync(srcAssetsDir)) {
    resetDir(tempAssetsDir)
    copyDir(srcAssetsDir, tempAssetsDir)
    console.log('🎉 Asset files copied successfully!')
}
