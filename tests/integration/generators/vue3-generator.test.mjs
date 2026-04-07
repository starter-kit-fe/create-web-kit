import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distVue3GeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "vue3.js")
).href;

const { createVue3Files } = await import(distVue3GeneratorPath);

test("createVue3Files writes vite.config.ts from template", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-web-kit-vue3-"));

  try {
    createVue3Files(tempRoot);

    const viteConfigPath = path.join(tempRoot, "vite.config.ts");
    assert.equal(fs.existsSync(viteConfigPath), true);

    const viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
    assert.equal(viteConfig.includes('import vue from "@vitejs/plugin-vue";'), true);
    assert.equal(viteConfig.includes("export default defineConfig({"), true);
    assert.equal(viteConfig.includes('"@"'), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
