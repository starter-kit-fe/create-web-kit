import fs from "node:fs";
import path from "node:path";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "userscript";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: ".gitignore", destination: ".gitignore" },
  { source: "README.md", destination: "README.md" },
  { source: "Makefile", destination: "Makefile" },
  { source: "tsconfig.json", destination: "tsconfig.json" },
  { source: "tsconfig.app.json", destination: "tsconfig.app.json" },
  { source: "tsconfig.node.json", destination: "tsconfig.node.json" },
  { source: "vite.config.ts", destination: "vite.config.ts" },
  { source: "src/main.ts", destination: "src/main.ts" },
  { source: "src/style.css", destination: "src/style.css" },
  { source: "src/vite-env.d.ts", destination: "src/vite-env.d.ts" },
];

const DEFAULT_VITE_FILES = [
  "index.html",
  "public/vite.svg",
  "src/typescript.svg",
  "src/counter.ts",
  "src/App.vue",
  "src/App.tsx",
  "src/App.css",
  "src/components",
  "src/main.ts",
  "src/main.tsx",
  "src/index.css",
  "src/style.css",
  "src/assets",
  "src/vite-env.d.ts",
  "tsconfig.app.json",
  "tsconfig.node.json",
];

export function createUserscriptFiles(root: string): void {
  removeDefaultViteFiles(root);
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
  updatePackageJson(root);
}

function removeDefaultViteFiles(root: string): void {
  for (const relativePath of DEFAULT_VITE_FILES) {
    const targetPath = path.join(root, relativePath);
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  }
}

function updatePackageJson(root: string): void {
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  pkg.private = true;
  pkg.type = "module";
  pkg.description =
    "Userscript starter powered by Vite, vite-plugin-monkey, and TypeScript";
  pkg.scripts = {
    dev: "vite",
    build: "vite build",
    typecheck: "tsc -b",
  };
  pkg.keywords = [
    "userscript",
    "tampermonkey",
    "vanilla",
    "vite",
    "vite-plugin-monkey",
    "typescript",
  ];

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
