#!/usr/bin/env node

import fs from "node:fs";

console.log("🔍 Pre-publish checklist...\n");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const distExists = fs.existsSync("dist");
const mainFileExists = fs.existsSync("dist/index.js");

const checks = [
  {
    name: "package.json exists",
    pass: fs.existsSync("package.json"),
    required: true,
  },
  {
    name: "README.md exists",
    pass: fs.existsSync("README.md"),
    required: true,
  },
  {
    name: "dist directory exists",
    pass: distExists,
    required: true,
  },
  {
    name: "main entry file exists",
    pass: mainFileExists,
    required: true,
  },
  {
    name: "bin file is executable",
    pass:
      mainFileExists &&
      (fs.statSync("dist/index.js").mode & parseInt("111", 8)) !== 0,
    required: true,
  },
  {
    name: "package name is set",
    pass: Boolean(pkg.name),
    required: true,
  },
  {
    name: "version is set",
    pass: Boolean(pkg.version),
    required: true,
  },
  {
    name: "description is set",
    pass: Boolean(pkg.description),
    required: false,
  },
  {
    name: "author is set",
    pass: Boolean(pkg.author),
    required: false,
  },
  {
    name: "license is set",
    pass: Boolean(pkg.license),
    required: false,
  },
  {
    name: "repository is set",
    pass: Boolean(pkg.repository?.url),
    required: false,
  },
];

let allRequired = true;
let warnings = 0;

for (const check of checks) {
  const icon = check.pass ? "✅" : check.required ? "❌" : "⚠️";
  const status = check.pass ? "PASS" : check.required ? "FAIL" : "WARN";

  console.log(`${icon} ${check.name}: ${status}`);

  if (!check.pass && check.required) {
    allRequired = false;
  }
  if (!check.pass && !check.required) {
    warnings += 1;
  }
}

console.log("\n📊 Summary:");
console.log(
  `- Required checks: ${allRequired ? "✅ All passed" : "❌ Some failed"}`
);
console.log(`- Warnings: ${warnings}`);

if (!allRequired) {
  console.log("\n❌ Cannot publish: Required checks failed");
  process.exit(1);
}

if (warnings > 0) {
  console.log(
    "\n⚠️  You can publish, but consider fixing warnings for better package quality"
  );
}

console.log("\n🚀 Ready to publish!");
console.log("\nNext steps:");
console.log("1. pnpm run release:dry-run");
console.log("2. pnpm run release:publish");
