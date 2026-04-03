#!/usr/bin/env node

import { splitCommand } from "./dist/utils/command.js";

console.log("🧪 Testing command argument parsing...\n");

const cases = [
  {
    command:
      "pnpx create-next-app@latest TARGET_DIR --typescript --import-alias '@/*'",
    expected: [
      "pnpx",
      "create-next-app@latest",
      "TARGET_DIR",
      "--typescript",
      "--import-alias",
      "@/*",
    ],
  },
  {
    command: 'node -e "console.log(\'hello world\')"',
    expected: ["node", "-e", "console.log('hello world')"],
  },
  {
    command: "pnpm exec prettier --write src/app/page.tsx",
    expected: ["pnpm", "exec", "prettier", "--write", "src/app/page.tsx"],
  },
];

for (const { command, expected } of cases) {
  const actual = splitCommand(command);

  console.log(`Command: ${command}`);
  console.log(`Parsed: ${JSON.stringify(actual)}`);

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.log(`❌ Expected: ${JSON.stringify(expected)}`);
    process.exit(1);
  }

  console.log("✅ Output matches expectation\n");
}

console.log("✅ Test completed!");
