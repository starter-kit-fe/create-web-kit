import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distAstroContentGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "astro-content.js")
).href;

const { createAstroContentFiles } = await import(distAstroContentGeneratorPath);

test("createAstroContentFiles adds content-site defaults and formatting config", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-astro-content-")
  );

  try {
    fs.writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify(
        {
          name: "astro-content-fixture",
          version: "0.0.0",
          private: true,
          scripts: {
            dev: "astro dev",
            build: "astro build",
          },
        },
        null,
        2
      ) + "\n"
    );

    createAstroContentFiles(tempRoot);

    const expectedFiles = [
      ".prettierrc",
      ".env.example",
      "astro.config.mjs",
      "src/content/config.ts",
      "src/content/pages/home.md",
      "src/layouts/site-layout.astro",
      "src/pages/index.astro",
      "src/styles/global.css",
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
    assert.equal(pkg.keywords.includes("content"), true);
    assert.equal(pkg.keywords.includes("marketing-site"), true);

    const astroConfig = fs.readFileSync(path.join(tempRoot, "astro.config.mjs"), "utf-8");
    assert.equal(astroConfig.includes("@astrojs/mdx"), true);
    assert.equal(astroConfig.includes("@astrojs/sitemap"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
