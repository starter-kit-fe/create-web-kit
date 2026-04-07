import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distElectronVueGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "electron-vue.js")
).href;

const { createElectronVueFiles } = await import(distElectronVueGeneratorPath);

test("createElectronVueFiles writes .eslintrc.js from template", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-electron-vue-")
  );

  try {
    createElectronVueFiles(tempRoot);

    const eslintConfigPath = path.join(tempRoot, ".eslintrc.js");
    assert.equal(fs.existsSync(eslintConfigPath), true);

    const eslintConfig = fs.readFileSync(eslintConfigPath, "utf-8");
    assert.equal(eslintConfig.includes("@electron-toolkit/eslint-config-ts"), true);
    assert.equal(eslintConfig.includes("@typescript-eslint/no-explicit-any"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
