#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const packageJsonPath = path.join(process.cwd(), "package.json");

function formatShanghaiVersion() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
  );

  const minor = String(Number(`${parts.month}${parts.day}`));
  const patch = String(Number(`${parts.hour}${parts.minute}`));

  return `${parts.year}.${minor}.${patch}`;
}

if (!fs.existsSync(packageJsonPath)) {
  console.error("package.json not found");
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const nextVersion = formatShanghaiVersion();
pkg.version = nextVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`Updated package.json version to ${nextVersion}`);
