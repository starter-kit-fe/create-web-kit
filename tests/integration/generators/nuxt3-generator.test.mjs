import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distNuxt3GeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "nuxt3.js")
).href;

const { createNuxt3Files } = await import(distNuxt3GeneratorPath);

test("createNuxt3Files writes Nuxt starter files and updates package.json", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-web-kit-nuxt3-"));

  try {
    fs.writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify(
        {
          name: "nuxt3-fixture",
          version: "0.0.0",
          private: true,
          scripts: {
            dev: "nuxt dev",
            build: "nuxt build",
          },
        },
        null,
        2
      ) + "\n"
    );

    createNuxt3Files(tempRoot);

    const expectedFiles = [
      ".prettierrc",
      ".env.example",
      "app.vue",
      "app.config.ts",
      "nuxt.config.ts",
      "assets/css/main.css",
      "composables/use-api.ts",
      "pages/index.vue",
      "server/api/health.get.ts",
    ];

    for (const relativePath of expectedFiles) {
      assert.equal(
        fs.existsSync(path.join(tempRoot, relativePath)),
        true,
        `missing generated file: ${relativePath}`
      );
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "package.json"), "utf-8")
    );
    assert.equal(pkg.scripts.format, "prettier --write .");
    assert.equal(pkg.scripts.typecheck, "nuxt typecheck");
    assert.equal(pkg.keywords.includes("nuxt"), true);
    assert.equal(pkg.keywords.includes("ssr"), true);

    const nuxtConfig = fs.readFileSync(path.join(tempRoot, "nuxt.config.ts"), "utf-8");
    assert.equal(nuxtConfig.includes('"@nuxt/ui"'), true);
    assert.equal(nuxtConfig.includes('"@pinia/nuxt"'), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
