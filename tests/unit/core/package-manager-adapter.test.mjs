import test from "node:test";
import assert from "node:assert/strict";

import { createPackageManagerAdapter } from "../../../dist/core/package-manager.js";

test("package manager adapter builds add/create/dlx/exec commands for npm", () => {
  const adapter = createPackageManagerAdapter({ name: "npm", version: "10.0.0" });

  assert.equal(
    adapter.create("vue@latest", ["TARGET_DIR"]),
    "npm create vue@latest TARGET_DIR"
  );
  assert.equal(adapter.dlx("shadcn@latest", ["init", "-y"]), "npx shadcn@latest init -y");
  assert.equal(
    adapter.add(["prettier", "@types/node"], { dev: true }),
    "npm install -D prettier @types/node"
  );
  assert.equal(adapter.exec("husky install"), "npx husky install");
});

test("package manager adapter preserves yarn v1 create/dlx compatibility", () => {
  const adapter = createPackageManagerAdapter({
    name: "yarn",
    version: "1.22.19",
  });

  assert.equal(adapter.isYarn1, true);
  assert.equal(
    adapter.getFullCustomCommand("npm create vite@latest TARGET_DIR"),
    "yarn create vite TARGET_DIR"
  );
  assert.equal(adapter.dlx("shadcn@latest", ["init", "-y"]), "npx shadcn@latest init -y");
});

test("package manager adapter builds pnpm and bun exec-style commands", () => {
  const pnpmAdapter = createPackageManagerAdapter({
    name: "pnpm",
    version: "9.0.0",
  });
  const bunAdapter = createPackageManagerAdapter({
    name: "bun",
    version: "1.1.0",
  });

  assert.equal(
    pnpmAdapter.add(["@tanstack/react-query"]),
    "pnpm add @tanstack/react-query"
  );
  assert.equal(pnpmAdapter.exec("lint-staged"), "pnpm exec lint-staged");
  assert.equal(
    bunAdapter.create("vue@latest", ["TARGET_DIR"]),
    "bun create vue@latest TARGET_DIR"
  );
  assert.equal(bunAdapter.dlx("create-monkey@latest", ["TARGET_DIR"]), "bunx create-monkey@latest TARGET_DIR");
});
