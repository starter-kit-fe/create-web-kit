import type { PkgInfo } from "../types/index.js";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import {
  mergeJson,
  removePaths,
  updatePackageJson,
} from "../core/operations/files.js";
import { initializeHusky } from "./shared.js";

const TEMPLATE_NAME = "react-vite";

interface ReactViteGeneratorOptions {
  noGit?: boolean;
  verbose?: boolean;
}

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  {
    source: ".devcontainer/devcontainer.json",
    destination: ".devcontainer/devcontainer.json",
    isJson: true,
  },
  { source: ".env.development", destination: ".env.development" },
  { source: ".env.production", destination: ".env.production" },
  { source: "src/main.tsx", destination: "src/main.tsx" },
  { source: "src/App.tsx", destination: "src/App.tsx" },
  { source: "src/pages/home.tsx", destination: "src/pages/home.tsx" },
  {
    source: "src/components/build-info.tsx",
    destination: "src/components/build-info.tsx",
  },
  {
    source: "src/components/providers/query-provider.tsx",
    destination: "src/components/providers/query-provider.tsx",
  },
  { source: "src/lib/request.ts", destination: "src/lib/request.ts" },
];

const DEFAULT_REACT_VITE_FILES = [
  "src/App.css",
  "src/assets",
  "public/vite.svg",
];

function mergeKeywords(current: unknown, next: string[]): string[] {
  const currentKeywords = Array.isArray(current)
    ? current.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...currentKeywords, ...next])];
}

export function createReactViteFiles(
  root: string,
  pkgInfo?: PkgInfo,
  options: ReactViteGeneratorOptions = {}
): void {
  removePaths(root, DEFAULT_REACT_VITE_FILES);
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
          : "React + Vite starter with shadcn/ui, TanStack Query, and SPA-ready defaults",
      scripts,
      keywords: mergeKeywords(pkg.keywords, [
        "react",
        "vite",
        "spa",
        "shadcn-ui",
        "tanstack-query",
        "tanstack-table",
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
