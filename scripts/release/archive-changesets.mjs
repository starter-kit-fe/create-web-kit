#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const changesetDir = path.join(projectRoot, ".changeset");
const packageJsonPath = path.join(projectRoot, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json not found");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = String(pkg.version ?? "").trim();

if (!version) {
  console.error("package.json version is empty");
  process.exit(1);
}

const pendingChangesets = fs
  .readdirSync(changesetDir)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .sort();

if (pendingChangesets.length === 0) {
  console.log("No pending changesets to archive.");
  process.exit(0);
}

const archiveDir = path.join(changesetDir, "archive", version);
fs.mkdirSync(archiveDir, { recursive: true });

for (const file of pendingChangesets) {
  fs.renameSync(
    path.join(changesetDir, file),
    path.join(archiveDir, file)
  );
}

console.log(`Archived ${pendingChangesets.length} changeset(s) to .changeset/archive/${version}`);
