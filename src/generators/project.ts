import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import * as prompts from "@clack/prompts";
import type { FrameworkVariant, PkgInfo } from "../types/index.js";

export async function executeMultiStepCommands(
  variant: FrameworkVariant,
  targetDir: string,
  root: string,
  cwd: string
): Promise<void> {
  if (!variant.multiStepCommands) return;

  prompts.log.step(`Setting up ${variant.display} project...`);

  for (const stepCommand of variant.multiStepCommands) {
    prompts.log.step(stepCommand.description);

    const workingDirectory = stepCommand.workingDir === "target" ? root : cwd;
    const command = stepCommand.command.replace(/TARGET_DIR/g, targetDir);

    // Parse the command and arguments
    const [cmd, ...args] = command.split(" ");

    try {
      const result = spawn.sync(cmd, args, {
        stdio: "inherit",
        cwd: workingDirectory,
      });

      if (result.status !== 0) {
        prompts.log.error(`Failed to execute: ${command}`);
        process.exit(result.status ?? 1);
      }
    } catch (error) {
      prompts.log.error(`Error executing command: ${command}`);
      console.error(error);
      process.exit(1);
    }
  }
}

export function createProjectFiles(template: string, root: string): void {
  // Add configuration files for specific project types
  if (template === "nextjs-csr") {
    createNextjsCSRFiles(root);
  }

  if (template === "nextjs-ssr") {
    createNextjsSSRFiles(root);
  }

  if (template === "vue3") {
    createVue3Files(root);
  }

  if (template === "electron-react") {
    createElectronReactFiles(root);
  }

  if (template === "electron-vue") {
    createElectronVueFiles(root);
  }
}

function createNextjsCSRFiles(root: string): void {
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    path.join(root, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const eslintConfig = `module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};`;

  fs.writeFileSync(path.join(root, ".eslintrc.js"), eslintConfig);
}

function createNextjsSSRFiles(root: string): void {
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    path.join(root, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const eslintConfig = `module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};`;

  fs.writeFileSync(path.join(root, ".eslintrc.js"), eslintConfig);

  // Create a basic auth setup for SSR
  const envLocal = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL="your-database-url"`;

  fs.writeFileSync(path.join(root, ".env.local"), envLocal);
  fs.writeFileSync(path.join(root, ".env.example"), envLocal);
}

function createVue3Files(root: string): void {
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    path.join(root, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})`;

  fs.writeFileSync(path.join(root, "vite.config.ts"), viteConfig);
}

function createElectronReactFiles(root: string): void {
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    path.join(root, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const eslintConfig = `module.exports = {
  extends: ['electron', '@electron-toolkit/eslint-config-ts', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};`;

  fs.writeFileSync(path.join(root, ".eslintrc.js"), eslintConfig);
}

function createElectronVueFiles(root: string): void {
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  };

  fs.writeFileSync(
    path.join(root, ".prettierrc"),
    JSON.stringify(prettierConfig, null, 2)
  );

  const eslintConfig = `module.exports = {
  extends: ['electron', '@electron-toolkit/eslint-config-ts', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};`;

  fs.writeFileSync(path.join(root, ".eslintrc.js"), eslintConfig);
}

export function generateSuccessMessage(
  targetDir: string,
  pkgManager: string
): string {
  return `🎉 Project created successfully!
    
Next steps:
  cd ${targetDir}
  ${pkgManager === "yarn" ? "yarn dev" : `${pkgManager} run dev`}`;
}
