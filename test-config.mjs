#!/usr/bin/env node

/**
 * Test script to verify the scaffolding tool
 */

import fs from 'node:fs'
import path from 'node:path'

console.log('🧪 Testing scaffolding tool configuration...\n')

const projectRoot = process.cwd()
const srcPath = path.join(projectRoot, 'src', 'index.ts')
const distPath = path.join(projectRoot, 'dist', 'index.js')

// Check if source file exists
if (fs.existsSync(srcPath)) {
    console.log('✅ Source file exists:', srcPath)
} else {
    console.log('❌ Source file missing:', srcPath)
}

// Check if dist file exists
if (fs.existsSync(distPath)) {
    console.log('✅ Built file exists:', distPath)
} else {
    console.log('❌ Built file missing:', distPath)
    console.log('   Run "npm run build" first')
}

// Check package.json configuration
const packageJsonPath = path.join(projectRoot, 'package.json')
if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    console.log('✅ Package configuration:')
    console.log('   Name:', pkg.name)
    console.log('   Version:', pkg.version)
    console.log('   Bin:', pkg.bin)
    console.log('   Type:', pkg.type)
}

// Check templates
const templateDirs = fs.readdirSync(projectRoot).filter(dir => dir.startsWith('template-'))
console.log('\n📁 Available templates:')
templateDirs.forEach(dir => {
    console.log('   -', dir)
})

console.log('\n🎯 Test completed!')
console.log('To test the CLI locally, run:')
console.log('   node dist/index.js --help')
console.log('   node dist/index.js test-project --template react-ts')
