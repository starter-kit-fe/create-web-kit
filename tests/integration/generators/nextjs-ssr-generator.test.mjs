import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distNextjsSsrGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "nextjs-ssr.js")
).href;

const { createNextjsSSRFiles } = await import(distNextjsSsrGeneratorPath);

test("createNextjsSSRFiles copies expected environment files", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-nextjs-ssr-")
  );

  try {
    createNextjsSSRFiles(tempRoot);

    const envLocalPath = path.join(tempRoot, ".env.local");
    const envExamplePath = path.join(tempRoot, ".env.example");

    assert.equal(fs.existsSync(envLocalPath), true);
    assert.equal(fs.existsSync(envExamplePath), true);

    const envLocal = fs.readFileSync(envLocalPath, "utf-8");
    const envExample = fs.readFileSync(envExamplePath, "utf-8");

    assert.equal(envLocal.length > 0, true);
    assert.equal(envExample, envLocal);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
