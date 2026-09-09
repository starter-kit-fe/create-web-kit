import fs from "node:fs";
import path from "node:path";
import type { PkgInfo } from "../types/index.js";
import {
  copyTemplateFiles,
  getTemplatePath,
  readTemplateFile,
  type TemplateFile,
} from "../utils/template.js";
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
  { source: ".env.development", destination: ".env.development" },
  { source: ".env.production", destination: ".env.production" },
  { source: "src/main.tsx", destination: "src/main.tsx" },
  { source: "src/App.tsx", destination: "src/App.tsx" },
  { source: "index.html", destination: "index.html" },
  { source: "vite.config.ts", destination: "vite.config.ts" },
  { source: "public/_headers", destination: "public/_headers" },
  {
    source: "public/app-update-checker.worker.js",
    destination: "public/app-update-checker.worker.js",
  },
  {
    source: "src/components/ui/animated-segmented-tabs.tsx",
    destination: "src/components/ui/animated-segmented-tabs.tsx",
  },
  {
    source: "src/components/ui/sweep-shine.tsx",
    destination: "src/components/ui/sweep-shine.tsx",
  },
  {
    source: "src/components/cookie-consent-banner.tsx",
    destination: "src/components/cookie-consent-banner.tsx",
  },
  {
    source: "src/components/update-available-notice.tsx",
    destination: "src/components/update-available-notice.tsx",
  },
  {
    source: "src/components/providers/app-update-checker.tsx",
    destination: "src/components/providers/app-update-checker.tsx",
  },
  { source: "src/store/app-update.ts", destination: "src/store/app-update.ts" },
  { source: "README.md", destination: "README.md" },
  {
    source: "src/views/home/index.tsx",
    destination: "src/views/home/index.tsx",
  },
  {
    source: "src/views/about/index.tsx",
    destination: "src/views/about/index.tsx",
  },
  {
    source: "src/components/theme-toggle.tsx",
    destination: "src/components/theme-toggle.tsx",
  },
  {
    source: "src/components/theme/theme-toggle-button.tsx",
    destination: "src/components/theme/theme-toggle-button.tsx",
  },
  {
    source: "src/components/providers/theme-provider.tsx",
    destination: "src/components/providers/theme-provider.tsx",
  },
  { source: "src/hooks/use-theme.ts", destination: "src/hooks/use-theme.ts" },
  { source: "src/hooks/use-mobile.ts", destination: "src/hooks/use-mobile.ts" },
  { source: "src/store/theme.ts", destination: "src/store/theme.ts" },
  { source: "src/layout/index.tsx", destination: "src/layout/index.tsx" },
  { source: "src/components/providers/route-progress.tsx", destination: "src/components/providers/route-progress.tsx" },
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
  options: ReactViteGeneratorOptions = {},
): void {
  removePaths(root, DEFAULT_REACT_VITE_FILES);
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);

  // Keep shadcn's generated Tailwind imports and theme tokens in the same global file.
  const cssPath = path.join(root, "src/index.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const marker = "/* Create Web Kit global styles */";
  if (!css.includes(marker)) {
    const globalStyles = readTemplateFile(
      getTemplatePath(TEMPLATE_NAME),
      "src/index.css",
    );
    fs.writeFileSync(cssPath, `${css.trimEnd()}\n\n${marker}\n${globalStyles}`);
  }

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
    modernHusky: true,
  });
}
