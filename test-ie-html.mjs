#!/usr/bin/env node

/**
 * Test script to verify IE HTML file reading functionality
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing IE HTML file reading...\n');

// Test the file path resolution
const ieHtmlPath = path.join(__dirname, "src/assets/html/ie.html");
console.log('IE HTML file path:', ieHtmlPath);

if (fs.existsSync(ieHtmlPath)) {
    console.log('✅ IE HTML file exists');

    const content = fs.readFileSync(ieHtmlPath, 'utf-8');
    console.log('📄 File content length:', content.length, 'characters');
    console.log('🎯 File starts with:', content.substring(0, 50) + '...');
} else {
    console.log('❌ IE HTML file not found');
}

// Test the path resolution that will be used in the generator
const generatorPath = path.join(
    path.dirname(new URL('./src/generators/project.ts', import.meta.url).pathname),
    "../assets/html/ie.html"
);
console.log('\nGenerator resolved path:', generatorPath);

console.log('\n✅ Test completed!');
