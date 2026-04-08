import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("npm pack includes the published userscript gitignore template asset", () => {
  const tempCacheDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-pack-cache-")
  );

  try {
    const result = spawnSync(
      "npm",
      ["pack", "--dry-run", "--json", "--cache", tempCacheDir],
      {
        cwd: process.cwd(),
        encoding: "utf-8",
      }
    );

    assert.equal(
      result.status,
      0,
      `npm pack failed: ${result.stderr || result.stdout}`
    );

    const packResult = JSON.parse(result.stdout);
    const packedPaths = packResult[0]?.files?.map((file) => file.path) ?? [];

    assert.equal(
      packedPaths.includes("dist/templates/userscript/gitignore"),
      true,
      "published package is missing dist/templates/userscript/gitignore"
    );
  } finally {
    fs.rmSync(tempCacheDir, { recursive: true, force: true });
  }
});
