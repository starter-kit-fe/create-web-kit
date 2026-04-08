import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distTemplateUtilsPath = pathToFileURL(
  path.join(process.cwd(), "dist", "utils", "template.js")
).href;

const { readTemplateFile } = await import(distTemplateUtilsPath);

test("readTemplateFile falls back to non-dotfile aliases for dotfiles", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-template-utils-")
  );

  try {
    fs.mkdirSync(path.join(tempRoot, "nested"), { recursive: true });
    fs.writeFileSync(
      path.join(tempRoot, "nested", "gitignore"),
      "node_modules/\n.vite/\n",
      "utf-8"
    );

    const content = readTemplateFile(tempRoot, "nested/.gitignore");

    assert.equal(content, "node_modules/\n.vite/\n");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
