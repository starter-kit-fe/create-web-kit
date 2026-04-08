import type { PkgInfo } from "../types/index.js";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import {
  mergeJson,
  updatePackageJson,
} from "../core/operations/files.js";
import { initializeHusky } from "./shared.js";

const TEMPLATE_NAME = "wxt-react";

interface WxtReactGeneratorOptions {
  noGit?: boolean;
  verbose?: boolean;
}

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "wxt.config.ts", destination: "wxt.config.ts" },
  { source: ".env.example", destination: ".env.example" },
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  {
    source: "entrypoints/background.ts",
    destination: "entrypoints/background.ts",
  },
  {
    source: "entrypoints/content.ts",
    destination: "entrypoints/content.ts",
  },
  {
    source: "entrypoints/popup/App.tsx",
    destination: "entrypoints/popup/App.tsx",
  },
  {
    source: "entrypoints/popup/main.tsx",
    destination: "entrypoints/popup/main.tsx",
  },
  {
    source: "entrypoints/options/App.tsx",
    destination: "entrypoints/options/App.tsx",
  },
  {
    source: "entrypoints/options/main.tsx",
    destination: "entrypoints/options/main.tsx",
  },
  {
    source: "src/components/extension-shell.tsx",
    destination: "src/components/extension-shell.tsx",
  },
  { source: "src/lib/storage.ts", destination: "src/lib/storage.ts" },
  { source: "src/styles/ui.css", destination: "src/styles/ui.css" },
];

function mergeKeywords(current: unknown, next: string[]): string[] {
  const currentKeywords = Array.isArray(current)
    ? current.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...currentKeywords, ...next])];
}

export function createWxtReactFiles(
  root: string,
  pkgInfo?: PkgInfo,
  options: WxtReactGeneratorOptions = {}
): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);

  updatePackageJson<Record<string, unknown>>(root, (pkg) => {
    const currentScripts =
      typeof pkg.scripts === "object" && pkg.scripts
        ? (pkg.scripts as Record<string, unknown>)
        : {};
    const currentLintStaged =
      typeof pkg["lint-staged"] === "object" && pkg["lint-staged"]
        ? (pkg["lint-staged"] as Record<string, unknown>)
        : {};

    const scripts: Record<string, unknown> = {
      ...currentScripts,
      format:
        typeof currentScripts.format === "string"
          ? currentScripts.format
          : "prettier --write .",
      typecheck:
        typeof currentScripts.typecheck === "string"
          ? currentScripts.typecheck
          : "tsc --noEmit",
    };

    if (!options.noGit) {
      scripts.prepare =
        typeof currentScripts.prepare === "string"
          ? currentScripts.prepare
          : "husky";
    }

    const nextPkg: Record<string, unknown> = {
      ...pkg,
      description:
        typeof pkg.description === "string" && pkg.description.length > 0
          ? pkg.description
          : "WXT React starter with popup, options, background, and content entrypoints",
      scripts,
      keywords: mergeKeywords(pkg.keywords, [
        "browser-extension",
        "wxt",
        "react",
        "manifest-v3",
      ]),
    };

    if (!options.noGit) {
      nextPkg["lint-staged"] = mergeJson(currentLintStaged, {
        "**/*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"],
      });
    }

    return nextPkg;
  });

  initializeHusky(root, pkgInfo, {
    ...options,
    initializeGitIfMissing: true,
  });
}
