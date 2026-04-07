import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distUserscriptGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "userscript.js")
).href;

const { createUserscriptFiles } = await import(distUserscriptGeneratorPath);

function createFixtureProject(root) {
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.mkdirSync(path.join(root, "public"), { recursive: true });

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: "userscript-fixture",
        version: "0.0.0",
        private: true,
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
      },
      null,
      2
    ) + "\n"
  );

  fs.writeFileSync(path.join(root, "index.html"), "<!doctype html>\n");
  fs.writeFileSync(path.join(root, "vite.config.ts"), "export default {};\n");
  fs.writeFileSync(path.join(root, "tsconfig.json"), "{ \"references\": [] }\n");
  fs.writeFileSync(path.join(root, "tsconfig.app.json"), "{}\n");
  fs.writeFileSync(path.join(root, "tsconfig.node.json"), "{}\n");
  fs.writeFileSync(path.join(root, "src", "main.ts"), "console.log('old');\n");
  fs.mkdirSync(path.join(root, "src", "components"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "App.tsx"), "export default null;\n");
  fs.writeFileSync(
    path.join(root, "src", "main.tsx"),
    "console.log('old react');\n"
  );
  fs.writeFileSync(
    path.join(root, "src", "components", "HelloWorld.tsx"),
    "export default function HelloWorld() { return null; }\n"
  );
  fs.writeFileSync(path.join(root, "src", "counter.ts"), "export {};\n");
  fs.writeFileSync(
    path.join(root, "src", "typescript.svg"),
    "<svg></svg>\n"
  );
  fs.writeFileSync(path.join(root, "src", "App.css"), ".app {}\n");
  fs.writeFileSync(path.join(root, "src", "index.css"), "body {}\n");
  fs.writeFileSync(path.join(root, "src", "style.css"), "body {}\n");
  fs.writeFileSync(
    path.join(root, "src", "vite-env.d.ts"),
    "/// <reference types=\"vite/client\" />\n"
  );
  fs.writeFileSync(path.join(root, "public", "vite.svg"), "<svg></svg>\n");
}

test("createUserscriptFiles rewrites fixture to userscript starter shape", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-userscript-")
  );
  const projectRoot = path.join(tempRoot, "fixture");

  try {
    createFixtureProject(projectRoot);
    createUserscriptFiles(projectRoot);

    const expectedFiles = [
      ".gitignore",
      "README.md",
      "Makefile",
      "tsconfig.json",
      "tsconfig.app.json",
      "tsconfig.node.json",
      "vite.config.ts",
      "src/main.ts",
      "src/style.css",
      "src/vite-env.d.ts",
    ];

    for (const relativePath of expectedFiles) {
      assert.equal(
        fs.existsSync(path.join(projectRoot, relativePath)),
        true,
        `missing generated file: ${relativePath}`
      );
    }

    const removedFiles = [
      "index.html",
      "src/App.tsx",
      "src/main.tsx",
      "src/components/HelloWorld.tsx",
      "src/counter.ts",
      "src/typescript.svg",
      "src/App.css",
      "src/index.css",
      "public/vite.svg",
    ];

    for (const relativePath of removedFiles) {
      assert.equal(
        fs.existsSync(path.join(projectRoot, relativePath)),
        false,
        `file should have been removed: ${relativePath}`
      );
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
    );
    assert.equal(pkg.scripts.build, "vite build");
    assert.equal(pkg.scripts.typecheck, "tsc -b");
    assert.equal(pkg.keywords.includes("vite-plugin-monkey"), true);
    assert.equal(pkg.keywords.includes("vanilla"), true);
    assert.equal(pkg.keywords.includes("react"), false);
    assert.equal(pkg.keywords.includes("amazon"), false);
    assert.equal(pkg.keywords.includes("vue"), false);

    const viteConfig = fs.readFileSync(
      path.join(projectRoot, "vite.config.ts"),
      "utf-8"
    );

    assert.equal(viteConfig.includes("@vitejs/plugin-react"), false);
    assert.equal(viteConfig.includes("Amazon"), false);
    assert.equal(viteConfig.includes("amazon."), false);
    assert.equal(viteConfig.includes('entry: "src/main.ts"'), true);
    assert.equal(viteConfig.includes('fileName: "userscript.user.js"'), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
