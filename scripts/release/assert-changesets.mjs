#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const changesetDir = path.join(process.cwd(), ".changeset");

function getPendingChangesets() {
  if (!fs.existsSync(changesetDir)) {
    return [];
  }

  return fs
    .readdirSync(changesetDir)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort();
}

const pendingChangesets = getPendingChangesets();

if (pendingChangesets.length === 0) {
  console.error(
    "No pending changesets found. Run `pnpm run changeset` before preparing a release."
  );
  process.exit(1);
}

console.log("Pending changesets:");
for (const file of pendingChangesets) {
  console.log(`- .changeset/${file}`);
}
