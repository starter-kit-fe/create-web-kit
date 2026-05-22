import fs from "node:fs";
import path from "node:path";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { readJsonFile, updatePackageJson, writeJsonFile } from "../core/operations/files.js";

const TEMPLATE_NAME = "electron-react";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "components.json", destination: "components.json", isJson: true },
  { source: "eslint.config.js", destination: ".eslintrc.js" },
  { source: "scripts/ensure-electron.mjs", destination: "scripts/ensure-electron.mjs" },
  { source: "src/renderer/src/App.tsx", destination: "src/renderer/src/App.tsx" },
  {
    source: "src/renderer/src/assets/main.css",
    destination: "src/renderer/src/assets/main.css",
  },
  {
    source: "src/renderer/src/components/ui/badge.tsx",
    destination: "src/renderer/src/components/ui/badge.tsx",
  },
  {
    source: "src/renderer/src/components/ui/button.tsx",
    destination: "src/renderer/src/components/ui/button.tsx",
  },
  {
    source: "src/renderer/src/components/ui/card.tsx",
    destination: "src/renderer/src/components/ui/card.tsx",
  },
  {
    source: "src/renderer/src/components/ui/separator.tsx",
    destination: "src/renderer/src/components/ui/separator.tsx",
  },
  {
    source: "src/renderer/src/components/ui/sonner.tsx",
    destination: "src/renderer/src/components/ui/sonner.tsx",
  },
  {
    source: "src/renderer/src/components/ui/switch.tsx",
    destination: "src/renderer/src/components/ui/switch.tsx",
  },
  {
    source: "src/renderer/src/components/ui/tabs.tsx",
    destination: "src/renderer/src/components/ui/tabs.tsx",
  },
  { source: "src/renderer/src/lib/utils.ts", destination: "src/renderer/src/lib/utils.ts" },
  { source: "src/renderer/src/main.tsx", destination: "src/renderer/src/main.tsx" },
  { source: "src/renderer/src/store/app.ts", destination: "src/renderer/src/store/app.ts" },
];

type JsonObject = Record<string, unknown>;

function updateElectronViteConfig(root: string): void {
  const configPath = path.join(root, "electron.vite.config.ts");
  if (!fs.existsSync(configPath)) {
    return;
  }

  const content = fs.readFileSync(configPath, "utf-8");
  const withImport = content.includes("@tailwindcss/vite")
    ? content
    : content.replace(
        "import react from '@vitejs/plugin-react'",
        "import react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'"
      );

  const withPlugin = withImport.replace("plugins: [react()]", "plugins: [react(), tailwindcss()]");
  fs.writeFileSync(configPath, withPlugin);
}

function mergeAliasPaths(current: unknown): Record<string, string[]> {
  const paths =
    current && typeof current === "object" && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {};

  return {
    ...Object.fromEntries(
      Object.entries(paths).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
    ),
    "@renderer/*": ["./src/renderer/src/*"],
    "@/*": ["./src/renderer/src/*"],
  };
}

function updateTsconfig(root: string, relativePath: string): void {
  const tsconfigPath = path.join(root, relativePath);
  if (!fs.existsSync(tsconfigPath)) {
    return;
  }

  const tsconfig = readJsonFile<JsonObject>(tsconfigPath);
  const compilerOptions =
    typeof tsconfig.compilerOptions === "object" && tsconfig.compilerOptions
      ? (tsconfig.compilerOptions as JsonObject)
      : {};

  writeJsonFile(tsconfigPath, {
    ...tsconfig,
    compilerOptions: {
      ...compilerOptions,
      paths: mergeAliasPaths(compilerOptions.paths),
    },
  });
}

function updateEslintConfig(root: string): void {
  const eslintPath = path.join(root, "eslint.config.mjs");
  if (!fs.existsSync(eslintPath)) {
    return;
  }

  const content = fs.readFileSync(eslintPath, "utf-8");
  if (content.includes("src/renderer/src/components/ui/**/*.{ts,tsx}")) {
    return;
  }

  fs.writeFileSync(
    eslintPath,
    content.replace(
      "  eslintConfigPrettier\n)",
      `  {
    files: ['src/renderer/src/components/ui/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-refresh/only-export-components': 'off'
    }
  },
  eslintConfigPrettier
)`
    )
  );
}

export function createElectronReactFiles(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
  updateElectronViteConfig(root);
  updateTsconfig(root, "tsconfig.json");
  updateTsconfig(root, "tsconfig.web.json");
  updateEslintConfig(root);

  updatePackageJson<Record<string, unknown>>(root, (pkg) => {
    const currentScripts =
      typeof pkg.scripts === "object" && pkg.scripts
        ? (pkg.scripts as Record<string, unknown>)
        : {};

    return {
      ...pkg,
      scripts: {
        ...currentScripts,
        format:
          typeof currentScripts.format === "string"
            ? currentScripts.format
            : "prettier --write .",
        postinstall: "node scripts/ensure-electron.mjs && electron-builder install-app-deps",
      },
      pnpm: {
        ...(typeof pkg.pnpm === "object" && pkg.pnpm ? (pkg.pnpm as Record<string, unknown>) : {}),
        onlyBuiltDependencies: ["electron", "esbuild"],
      },
    };
  });
}
