#!/usr/bin/env node

/**
 * Test script to verify package manager replacement functionality
 */

import { replacePackageManagerInCommand } from './dist/utils/package-manager.js';

console.log('🧪 Testing package manager replacement...\n');

// Test commands
const testCommands = [
    'pnpx create-next-app@latest TARGET_DIR --typescript --tailwind',
    'pnpm dlx shadcn@latest init -y',
    'pnpm add @tanstack/react-table @tanstack/react-query',
    'pnpm add -D prettier @types/node',
    'pnpm create vue@latest TARGET_DIR'
];

// Test different package managers
const packageManagers = [
    { name: 'npm', version: '8.19.2' },
    { name: 'yarn', version: '1.22.19' },
    { name: 'yarn', version: '3.6.4' },
    { name: 'pnpm', version: '8.10.0' },
    { name: 'bun', version: '1.0.0' }
];

packageManagers.forEach(pkgInfo => {
    console.log(`📦 Testing with ${pkgInfo.name}@${pkgInfo.version}:`);

    testCommands.forEach(command => {
        const replaced = replacePackageManagerInCommand(command, pkgInfo);
        console.log(`  Original: ${command}`);
        console.log(`  Replaced: ${replaced}`);
        console.log();
    });

    console.log('---\n');
});

console.log('✅ Test completed!');
