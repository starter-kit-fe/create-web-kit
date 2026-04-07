import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import type { PkgInfo } from "../types/index.js";
import { splitCommand } from "../utils/command.js";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { createPackageManagerAdapter } from "../core/package-manager.js";
import {
  ensureDirectory,
  mergeJson,
  updatePackageJson,
} from "../core/operations/files.js";

const TEMPLATE_NAME = "nextjs-csr";

interface NextjsCsrGeneratorOptions {
  noGit?: boolean;
  verbose?: boolean;
}

const TEMPLATE_FILES: TemplateFile[] = [
  // Config files
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "eslint.config.mjs", destination: "eslint.config.mjs" },
  { source: "next.config.ts", destination: "next.config.ts" },
  { source: ".env.development", destination: ".env.development" },
  { source: ".env.production", destination: ".env.production" },
  { source: ".env.stage", destination: ".env.stage" },
  { source: ".husky/pre-commit", destination: ".husky/pre-commit" },
  { source: ".husky/_/husky.sh", destination: ".husky/_/husky.sh" },

  // DevContainer
  {
    source: ".devcontainer/devcontainer.json",
    destination: ".devcontainer/devcontainer.json",
    isJson: true,
  },

  // App files
  { source: "src/app/layout.tsx", destination: "src/app/layout.tsx" },
  { source: "src/app/not-found.tsx", destination: "src/app/not-found.tsx" },
  { source: "src/app/error.tsx", destination: "src/app/error.tsx" },
  { source: "src/config/site.ts", destination: "src/config/site.ts" },
  { source: "scripts/build-stage.mjs", destination: "scripts/build-stage.mjs" },

  // Components
  { source: "src/components/show.tsx", destination: "src/components/show.tsx" },
  {
    source: "src/components/build-info.tsx",
    destination: "src/components/build-info.tsx",
  },

  {
    source: "src/components/providers/theme.tsx",
    destination: "src/components/providers/theme.tsx",
  },
  {
    source: "src/components/providers/query.tsx",
    destination: "src/components/providers/query.tsx",
  },
  {
    source: "src/components/providers/index.tsx",
    destination: "src/components/providers/index.tsx",
  },

  // Utils
  { source: "src/lib/request.ts", destination: "src/lib/request.ts" },
];

export function createNextjsCSRFiles(
  root: string,
  pkgInfo?: PkgInfo,
  options: NextjsCsrGeneratorOptions = {}
): void {
  // Copy all template files
  copyTemplateFiles(
    TEMPLATE_NAME,
    TEMPLATE_FILES.filter((file) =>
      options.noGit ? !file.destination.startsWith(".husky/") : true
    ),
    root
  );

  // Configure package.json with husky and lint-staged
  copyConfigHuskyPackage(root, options);

  // Copy IE compatibility page
  copyIECompatibilityPage(root);

  // Initialize husky after all files are copied
  initializeHusky(root, pkgInfo, options);
}

function copyConfigHuskyPackage(
  root: string,
  options: NextjsCsrGeneratorOptions
): void {
  try {
    updatePackageJson<Record<string, unknown>>(root, (pkg) => {
      const currentScripts =
        typeof pkg.scripts === "object" && pkg.scripts
          ? (pkg.scripts as Record<string, unknown>)
          : {};
      const currentLintStaged =
        typeof pkg["lint-staged"] === "object" && pkg["lint-staged"]
          ? (pkg["lint-staged"] as Record<string, unknown>)
          : {};

      const scripts: Record<string, unknown> = { ...currentScripts };

      if (!options.noGit) {
        scripts.prepare =
          typeof currentScripts["prepare"] === "string"
            ? currentScripts["prepare"]
            : "husky";
      }

      if (typeof scripts["build:stage"] !== "string") {
        scripts["build:stage"] = "node scripts/build-stage.mjs";
      }

      const nextPkg: Record<string, unknown> = {
        ...pkg,
        scripts,
      };

      if (!options.noGit) {
        nextPkg["lint-staged"] = mergeJson(
          currentLintStaged as Record<string, unknown>,
          {
            "**/*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
            "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
          }
        );
      }

      return nextPkg;
    });

    console.log(
      options.noGit
        ? "✅ Updated package.json with non-git project configuration"
        : "✅ Updated package.json with husky and lint-staged configuration"
    );
  } catch (error) {
    console.error("❌ Failed to update package.json:", error);
  }
}

function initializeHusky(
  root: string,
  pkgInfo?: PkgInfo,
  options: NextjsCsrGeneratorOptions = {}
): void {
  try {
    if (options.noGit) {
      if (options.verbose) {
        console.log("ℹ️ Skipping husky setup because --no-git is enabled");
      }
      return;
    }

    const gitDir = path.join(root, ".git");
    if (!fs.existsSync(gitDir)) {
      console.warn("⚠️ Skipping husky install because no Git repository was found");
      return;
    }

    const adapter = createPackageManagerAdapter(pkgInfo);
    runCommand(adapter.exec("husky install"), root);

    const huskyDir = path.join(root, ".husky");
    ensureDirectory(huskyDir);

    const huskyUnderscoreDir = path.join(huskyDir, "_");
    ensureDirectory(huskyUnderscoreDir);

    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${adapter.exec("lint-staged")}
`;
    fs.writeFileSync(preCommitPath, preCommitContent);

    try {
      fs.chmodSync(preCommitPath, 0o755);
    } catch (chmodError) {
      console.warn("⚠️ Could not set execute permission for pre-commit hook");
    }

    console.log("✅ Husky pre-commit hook created successfully");
  } catch (error) {
    console.error("❌ Failed to initialize husky:", error);
  }
}

function runCommand(command: string, cwd: string): void {
  const [cmd, ...args] = splitCommand(command);
  const result = spawn.sync(cmd, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}

function copyIECompatibilityPage(root: string): void {
  const ieHtmlPath = fileURLToPath(
    new URL("../assets/html/ie.html", import.meta.url)
  );

  let ieHtmlContent = "";
  try {
    ieHtmlContent = fs.readFileSync(ieHtmlPath, "utf-8");
  } catch (error) {
    console.error(error);
  }

  const publicDir = path.join(root, "public");
  ensureDirectory(publicDir);

  fs.writeFileSync(path.join(publicDir, "ie.html"), ieHtmlContent);
}
