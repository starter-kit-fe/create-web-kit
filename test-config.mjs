#!/usr/bin/env node

/**
 * Test script to verify the scaffolding tool
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

console.log("🧪 Testing scaffolding tool configuration...\n");

const projectRoot = process.cwd();
const srcPath = path.join(projectRoot, "src", "index.ts");
const distPath = path.join(projectRoot, "dist", "index.js");
const srcTemplatesPath = path.join(projectRoot, "src", "templates");
const distTemplatesPath = path.join(projectRoot, "dist", "templates");
const packageJsonPath = path.join(projectRoot, "package.json");
const frameworksModulePath = path.join(
  projectRoot,
  "dist",
  "config",
  "frameworks.js"
);
let hasFailure = false;

if (fs.existsSync(srcPath)) {
  console.log("✅ Source file exists:", srcPath);
} else {
  console.log("❌ Source file missing:", srcPath);
  hasFailure = true;
}

if (fs.existsSync(distPath)) {
  console.log("✅ Built file exists:", distPath);
} else {
  console.log("❌ Built file missing:", distPath);
  console.log('   Run "pnpm run build" first');
  hasFailure = true;
}

if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  console.log("✅ Package configuration:");
  console.log("   Name:", pkg.name);
  console.log("   Version:", pkg.version);
  console.log("   Bin:", pkg.bin);
  console.log("   Type:", pkg.type);

  if (pkg.name !== "create-web-kit") {
    console.log("❌ Unexpected package name:", pkg.name);
    hasFailure = true;
  }

  if (pkg.bin?.["create-web-kit"] !== "dist/index.js") {
    console.log("❌ Unexpected bin configuration:", pkg.bin);
    hasFailure = true;
  }
} else {
  console.log("❌ package.json missing:", packageJsonPath);
  hasFailure = true;
}

const frameworksModule = await import(pathToFileURL(frameworksModulePath).href);
const configuredTemplates = frameworksModule.FRAMEWORKS.flatMap((framework) =>
  framework.variants.map((variant) => variant.name)
);

const srcTemplateDirs = fs
  .readdirSync(srcTemplatesPath, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const distTemplateDirs = fs
  .readdirSync(distTemplatesPath, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

console.log("\n📁 Template directories in src/templates:");
srcTemplateDirs.forEach((dir) => {
  console.log("   -", dir);
});

console.log("\n📦 Template directories in dist/templates:");
distTemplateDirs.forEach((dir) => {
  console.log("   -", dir);
});

for (const template of configuredTemplates) {
  if (!srcTemplateDirs.includes(template)) {
    console.log(`❌ Missing src template directory for: ${template}`);
    hasFailure = true;
  }

  if (!distTemplateDirs.includes(template)) {
    console.log(`❌ Missing dist template directory for: ${template}`);
    hasFailure = true;
  }
}

const unexpectedSrcTemplates = srcTemplateDirs.filter(
  (template) => !configuredTemplates.includes(template)
);
const unexpectedDistTemplates = distTemplateDirs.filter(
  (template) => !configuredTemplates.includes(template)
);

for (const template of unexpectedSrcTemplates) {
  console.log(`❌ Unexpected src template directory: ${template}`);
  hasFailure = true;
}

for (const template of unexpectedDistTemplates) {
  console.log(`❌ Unexpected dist template directory: ${template}`);
  hasFailure = true;
}

console.log("\n🎯 Test completed!");
console.log("To test the CLI locally, run:");
console.log("   node dist/index.js --help");
console.log("   node dist/index.js test-project --template userscript");

if (hasFailure) {
  process.exit(1);
}
