#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

console.log('🔍 Pre-publish checklist...\n')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const distExists = fs.existsSync('dist')
const mainFileExists = fs.existsSync('dist/index.js')

// 检查必要文件
const checks = [
    {
        name: 'package.json exists',
        pass: fs.existsSync('package.json'),
        required: true
    },
    {
        name: 'README.md exists',
        pass: fs.existsSync('README.md'),
        required: true
    },
    {
        name: 'dist directory exists',
        pass: distExists,
        required: true
    },
    {
        name: 'main entry file exists',
        pass: mainFileExists,
        required: true
    },
    {
        name: 'bin file is executable',
        pass: mainFileExists && (fs.statSync('dist/index.js').mode & parseInt('111', 8)) !== 0,
        required: true
    },
    {
        name: 'package name is set',
        pass: pkg.name && pkg.name !== '',
        required: true
    },
    {
        name: 'version is set',
        pass: pkg.version && pkg.version !== '',
        required: true
    },
    {
        name: 'description is set',
        pass: pkg.description && pkg.description !== '',
        required: false
    },
    {
        name: 'author is set',
        pass: pkg.author && pkg.author !== '',
        required: false
    },
    {
        name: 'license is set',
        pass: pkg.license && pkg.license !== '',
        required: false
    },
    {
        name: 'repository is set',
        pass: pkg.repository && pkg.repository.url,
        required: false
    }
]

let allRequired = true
let warnings = 0

checks.forEach(check => {
    const icon = check.pass ? '✅' : (check.required ? '❌' : '⚠️')
    const status = check.pass ? 'PASS' : (check.required ? 'FAIL' : 'WARN')

    console.log(`${icon} ${check.name}: ${status}`)

    if (!check.pass && check.required) {
        allRequired = false
    }
    if (!check.pass && !check.required) {
        warnings++
    }
})

console.log('\n📊 Summary:')
console.log(`- Required checks: ${allRequired ? '✅ All passed' : '❌ Some failed'}`)
console.log(`- Warnings: ${warnings}`)

if (!allRequired) {
    console.log('\n❌ Cannot publish: Required checks failed')
    process.exit(1)
}

if (warnings > 0) {
    console.log('\n⚠️  You can publish, but consider fixing warnings for better package quality')
}

console.log('\n🚀 Ready to publish!')
console.log('\nNext steps:')
console.log('1. npm login (if not already logged in)')
console.log('2. npm publish')
console.log('3. Or npm publish --dry-run (to test first)')
