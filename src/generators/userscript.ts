import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import {
  removePaths,
  updatePackageJson as applyPackageJsonUpdate,
} from "../core/operations/files.js";

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
  updateUserscriptPackageJson(root);
}

function removeDefaultViteFiles(root: string): void {
  removePaths(root, DEFAULT_VITE_FILES);
}

function updateUserscriptPackageJson(root: string): void {
  applyPackageJsonUpdate<Record<string, unknown>>(root, (pkg) => ({
    ...pkg,
    private: true,
    type: "module",
    description:
      "Userscript starter powered by Vite, vite-plugin-monkey, and TypeScript",
    scripts: {
      ...(typeof pkg.scripts === "object" && pkg.scripts ? pkg.scripts : {}),
      dev: "vite",
      build: "vite build",
      typecheck: "tsc -b",
    },
    keywords: [
      "userscript",
      "tampermonkey",
      "vanilla",
      "vite",
      "vite-plugin-monkey",
      "typescript",
    ],
  }));
}
