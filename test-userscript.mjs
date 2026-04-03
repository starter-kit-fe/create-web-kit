#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

console.log("🧪 Testing userscript generator...\n");

const tempRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "create-web-kit-userscript-")
);
const projectRoot = path.join(tempRoot, "fixture");

fs.mkdirSync(path.join(projectRoot, "src"), { recursive: true });
fs.mkdirSync(path.join(projectRoot, "public"), { recursive: true });

fs.writeFileSync(
  path.join(projectRoot, "package.json"),
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

fs.writeFileSync(path.join(projectRoot, "index.html"), "<!doctype html>\n");
fs.writeFileSync(path.join(projectRoot, "vite.config.ts"), "export default {};\n");
fs.writeFileSync(path.join(projectRoot, "tsconfig.json"), "{ \"references\": [] }\n");
fs.writeFileSync(path.join(projectRoot, "tsconfig.app.json"), "{}\n");
fs.writeFileSync(path.join(projectRoot, "tsconfig.node.json"), "{}\n");
fs.writeFileSync(path.join(projectRoot, "src", "main.ts"), "console.log('old');\n");
fs.mkdirSync(path.join(projectRoot, "src", "components"), { recursive: true });
fs.writeFileSync(path.join(projectRoot, "src", "App.vue"), "<template>old</template>\n");
fs.writeFileSync(
  path.join(projectRoot, "src", "components", "HelloWorld.vue"),
  "<template>Hello</template>\n"
);
fs.writeFileSync(path.join(projectRoot, "src", "style.css"), "body {}\n");
fs.writeFileSync(path.join(projectRoot, "src", "vite-env.d.ts"), "/// <reference types=\"vite/client\" />\n");
fs.writeFileSync(path.join(projectRoot, "public", "vite.svg"), "<svg></svg>\n");

const modulePath = pathToFileURL(
  path.join(
    process.cwd(),
    "dist",
    "generators",
    "userscript.js"
  )
).href;

const { createUserscriptFiles } = await import(modulePath);
createUserscriptFiles(projectRoot);

const pkg = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
);

const expectedFiles = [
  ".gitignore",
  "README.md",
  "Makefile",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "src/App.vue",
  "src/main.ts",
  "src/vite-env.d.ts",
];

for (const relativePath of expectedFiles) {
  if (!fs.existsSync(path.join(projectRoot, relativePath))) {
    console.log(`❌ Missing generated file: ${relativePath}`);
    process.exit(1);
  }
}

const removedFiles = [
  "index.html",
  "src/components/HelloWorld.vue",
  "src/style.css",
  "public/vite.svg",
];

for (const relativePath of removedFiles) {
  if (fs.existsSync(path.join(projectRoot, relativePath))) {
    console.log(`❌ File should have been removed: ${relativePath}`);
    process.exit(1);
  }
}

if (
  pkg.scripts.build !== "vite build" ||
  pkg.scripts.typecheck !== "vue-tsc --noEmit"
) {
  console.log("❌ package.json scripts were not rewritten correctly");
  process.exit(1);
}

if (
  !pkg.keywords.includes("vite-plugin-monkey") ||
  pkg.keywords.includes("amazon") ||
  pkg.keywords.includes("vue")
) {
  console.log("❌ package.json keywords were not enriched");
  process.exit(1);
}

const viteConfig = fs.readFileSync(
  path.join(projectRoot, "vite.config.ts"),
  "utf-8"
);

if (!viteConfig.includes('import vue from "@vitejs/plugin-vue"')) {
  console.log("❌ vite.config.ts does not include Vue plugin");
  process.exit(1);
}

if (
  viteConfig.includes("Amazon") ||
  viteConfig.includes("amazon.") ||
  !viteConfig.includes('fileName: "userscript.user.js"')
) {
  console.log("❌ vite.config.ts still contains old starter defaults");
  process.exit(1);
}

console.log("✅ userscript generator output looks correct");
