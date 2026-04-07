import test from "node:test";
import assert from "node:assert/strict";

import {
  isSupportedPackageManager,
  resolvePackageManagerInfo,
} from "../../../dist/cli/options.js";

test("isSupportedPackageManager validates allowed package managers", () => {
  assert.equal(isSupportedPackageManager("npm"), true);
  assert.equal(isSupportedPackageManager("pnpm"), true);
  assert.equal(isSupportedPackageManager("yarn"), true);
  assert.equal(isSupportedPackageManager("bun"), true);
  assert.equal(isSupportedPackageManager("pip"), false);
});

test("resolvePackageManagerInfo preserves detected package manager when no override is given", () => {
  const detected = { name: "pnpm", version: "9.0.0" };

  assert.deepEqual(resolvePackageManagerInfo(undefined, detected), detected);
});

test("resolvePackageManagerInfo uses override when explicitly requested", () => {
  const resolved = resolvePackageManagerInfo("yarn", {
    name: "pnpm",
    version: "9.0.0",
  });

  assert.deepEqual(resolved, { name: "yarn", version: "4.0.0" });
});

test("resolvePackageManagerInfo reuses detected details when override matches", () => {
  const detected = { name: "yarn", version: "1.22.19" };

  assert.deepEqual(resolvePackageManagerInfo("yarn", detected), detected);
});
