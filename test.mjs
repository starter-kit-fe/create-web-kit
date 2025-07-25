#!/usr/bin/env node

// Test script for the scaffolding tool
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('Testing scaffolding tool...')
console.log('Current directory:', process.cwd())
console.log('Script directory:', __dirname)

// Import and run the main function
import('./index.js').then(module => {
    console.log('Scaffolding tool loaded successfully!')
}).catch(error => {
    console.error('Error loading scaffolding tool:', error)
})
