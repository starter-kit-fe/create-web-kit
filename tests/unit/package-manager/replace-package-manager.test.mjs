import test from "node:test";
import assert from "node:assert/strict";

import { replacePackageManagerInCommand } from "../../../dist/utils/package-manager.js";

const testCommands = [
  {
    command: "pnpx create-next-app@latest TARGET_DIR --typescript --tailwind",
    expected: {
      npm: "npx create-next-app@latest TARGET_DIR --typescript --tailwind",
      yarn1: "npx create-next-app@latest TARGET_DIR --typescript --tailwind",
      yarn3:
        "yarn dlx create-next-app@latest TARGET_DIR --typescript --tailwind",
      pnpm: "pnpx create-next-app@latest TARGET_DIR --typescript --tailwind",
      bun: "bunx create-next-app@latest TARGET_DIR --typescript --tailwind",
    },
  },
  {
    command: "pnpm dlx shadcn@latest init -y",
    expected: {
      npm: "npx shadcn@latest init -y",
      yarn1: "npx shadcn@latest init -y",
      yarn3: "yarn dlx shadcn@latest init -y",
      pnpm: "pnpm dlx shadcn@latest init -y",
      bun: "bunx shadcn@latest init -y",
    },
  },
  {
    command: "pnpm add @tanstack/react-table @tanstack/react-query",
    expected: {
      npm: "npm install @tanstack/react-table @tanstack/react-query",
      yarn1: "yarn add @tanstack/react-table @tanstack/react-query",
      yarn3: "yarn add @tanstack/react-table @tanstack/react-query",
      pnpm: "pnpm add @tanstack/react-table @tanstack/react-query",
      bun: "bun add @tanstack/react-table @tanstack/react-query",
    },
  },
  {
    command: "pnpm add -D prettier @types/node",
    expected: {
      npm: "npm install -D prettier @types/node",
      yarn1: "yarn add -D prettier @types/node",
      yarn3: "yarn add -D prettier @types/node",
      pnpm: "pnpm add -D prettier @types/node",
      bun: "bun add -D prettier @types/node",
    },
  },
  {
    command: "pnpm create vue@latest TARGET_DIR",
    expected: {
      npm: "npm create vue@latest TARGET_DIR",
      yarn1: "yarn create vue@latest TARGET_DIR",
      yarn3: "yarn create vue@latest TARGET_DIR",
      pnpm: "pnpm create vue@latest TARGET_DIR",
      bun: "bun create vue@latest TARGET_DIR",
    },
  },
  {
    command:
      "pnpm dlx create-monkey@latest TARGET_DIR --template vanilla-ts",
    expected: {
      npm: "npx create-monkey@latest TARGET_DIR --template vanilla-ts",
      yarn1: "npx create-monkey@latest TARGET_DIR --template vanilla-ts",
      yarn3: "yarn dlx create-monkey@latest TARGET_DIR --template vanilla-ts",
      pnpm: "pnpm dlx create-monkey@latest TARGET_DIR --template vanilla-ts",
      bun: "bunx create-monkey@latest TARGET_DIR --template vanilla-ts",
    },
  },
];

const packageManagers = [
  { label: "npm", name: "npm", version: "8.19.2" },
  { label: "yarn1", name: "yarn", version: "1.22.19" },
  { label: "yarn3", name: "yarn", version: "3.6.4" },
  { label: "pnpm", name: "pnpm", version: "8.10.0" },
  { label: "bun", name: "bun", version: "1.0.0" },
];

for (const pkgInfo of packageManagers) {
  test(`replacePackageManagerInCommand maps commands for ${pkgInfo.label}`, () => {
    for (const { command, expected } of testCommands) {
      const replaced = replacePackageManagerInCommand(command, pkgInfo);
      assert.equal(replaced, expected[pkgInfo.label]);
    }
  });
}
