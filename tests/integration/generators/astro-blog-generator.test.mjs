import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distAstroBlogGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "astro-blog.js")
).href;

const { createAstroBlogFiles } = await import(distAstroBlogGeneratorPath);

test("createAstroBlogFiles adds content defaults and formatting config", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-astro-blog-")
  );

  try {
    fs.writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify(
        {
          name: "astro-blog-fixture",
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

    createAstroBlogFiles(tempRoot);

    const expectedFiles = [
      ".prettierrc",
      ".env.example",
      "src/content/blog/launch-notes.md",
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
    assert.equal(pkg.keywords.includes("astro"), true);
    assert.equal(pkg.keywords.includes("mdx"), true);

    const post = fs.readFileSync(
      path.join(tempRoot, "src/content/blog/launch-notes.md"),
      "utf-8"
    );
    assert.equal(post.includes("Launch Notes"), true);
    assert.equal(post.includes("official Astro blog template"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
