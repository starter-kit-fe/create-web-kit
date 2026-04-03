#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🧪 Running CLI help smoke test...\n");

const result = spawnSync(process.execPath, ["dist/index.js", "--help"], {
  cwd: __dirname,
  encoding: "utf-8",
});

if (result.status !== 0) {
  console.error("❌ CLI help command failed");
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

const helpOutput = result.stdout;
const expectedSnippets = [
  "Usage: create-web-kit",
  "nextjs-csr",
  "nextjs-ssr",
  "electron-react",
  "userscript",
];

for (const snippet of expectedSnippets) {
  if (!helpOutput.includes(snippet)) {
    console.error(`❌ Missing help output snippet: ${snippet}`);
    process.exit(1);
  }
}

console.log("✅ CLI help output looks correct");
