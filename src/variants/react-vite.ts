import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createReactViteFiles } from "../generators/react-vite.js";

const { cyan } = colors;

// create-vite does not configure Tailwind or the aliases required by shadcn.
const prepareShadcn = `
const fs = require("node:fs");
const root = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
root.compilerOptions = { ...root.compilerOptions, paths: { "@/*": ["./src/*"] } };
fs.writeFileSync("tsconfig.json", JSON.stringify(root, null, 2));
const app = fs.readFileSync("tsconfig.app.json", "utf8");
fs.writeFileSync("tsconfig.app.json", app.replace('"compilerOptions": {', '"compilerOptions": { "resolveJsonModule": true, "paths": { "@/*": ["./src/*"] },'));
fs.writeFileSync("src/index.css", '@import "tailwindcss";\\n');
fs.writeFileSync("vite.config.ts", ${JSON.stringify('import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nimport { fileURLToPath, URL } from "node:url";\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },\n});\n')});
`;

export const reactViteVariantDefinition: VariantDefinition = {
  id: "react-vite",
  framework: "react",
  displayName: "React + Vite + shadcn/ui",
  color: cyan,
  operations: [
    {
      kind: "command",
      description: "Creating React Vite project with TypeScript",
      command:
        "pnpm dlx create-vite@latest TARGET_DIR --template react-ts --no-immediate --no-interactive",
      workingDir: "root",
      quiet: true,
      autoConfirm: true,
    },
    {
      kind: "install-packages",
      description: "Installing runtime and development dependencies",
      packages: [
        "@tanstack/react-query", "@tanstack/react-query-devtools", "@tanstack/react-table",
        "date-fns", "react-router-dom", "zod", "react-hook-form", "@hookform/resolvers",
        "jotai", "gsap", "@gsap/react", "lucide-react", "radix-ui", "nprogress", "sonner",
      ],
      devPackages: [
        "tailwindcss", "@tailwindcss/vite", "@types/node", "prettier", "@types/nprogress",
        "husky", "lint-staged", "prettier-plugin-tailwindcss",
        "@trivago/prettier-plugin-sort-imports", "eslint-config-prettier",
      ],
      workingDir: "target",
      quiet: true,
      autoConfirm: true,
    },
    {
      kind: "command",
      description: "Configuring Tailwind CSS and import aliases",
      command: `node -e '${prepareShadcn.replaceAll("'", "'\\''")}'`,
      workingDir: "target",
      packageManagerAware: false,
      quiet: true,
    },
    {
      kind: "dlx",
      description: "Initializing shadcn/ui for Vite",
      packageName: "shadcn@latest",
      args: ["init", "-y", "--base", "radix", "--preset", "nova"],
      workingDir: "target",
      quiet: true,
      autoConfirm: true,
    },
    {
      kind: "dlx",
      description: "Installing all shadcn/ui components",
      packageName: "shadcn@latest",
      args: ["add", "--all", "--yes"],
      workingDir: "target",
      quiet: true,
      autoConfirm: true,
    },
  ],
  augment(context: ProjectContext) {
    createReactViteFiles(context.root, context.pkgInfo, {
      noGit: context.noGit,
      verbose: context.verbose,
    });
  },
};

export default reactViteVariantDefinition;
