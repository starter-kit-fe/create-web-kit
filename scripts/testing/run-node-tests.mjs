#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const scope = process.argv[2] ?? "all";
const projectRoot = process.cwd();
const testsRoot = path.join(projectRoot, "tests");

function collectTestFiles(dirPath) {
  const files = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".test.mjs")) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveTestRoots() {
  if (scope === "all") {
    return [testsRoot];
  }

  return [path.join(testsRoot, scope)];
}

const files = resolveTestRoots()
  .flatMap((root) => collectTestFiles(root))
  .sort();

if (files.length === 0) {
  console.log(`No test files found for scope: ${scope}`);
  process.exit(0);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: projectRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
