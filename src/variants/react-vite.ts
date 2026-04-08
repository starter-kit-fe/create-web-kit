import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createReactViteFiles } from "../generators/react-vite.js";

const { cyan } = colors;

export const reactViteVariantDefinition: VariantDefinition = {
  id: "react-vite",
  framework: "react",
  displayName: "React + Vite + shadcn/ui",
  color: cyan,
  operations: [
    {
      kind: "command",
      description: "Creating React Vite project with TypeScript",
      command: "pnpm dlx create-vite@latest TARGET_DIR --template react-ts",
      workingDir: "root",
    },
    {
      kind: "dlx",
      description: "Initializing shadcn/ui for Vite",
      packageName: "shadcn@latest",
      args: ["init", "-y"],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing SPA runtime dependencies",
      packages: [
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
        "@tanstack/react-table",
        "date-fns",
        "react-router-dom",
        "sonner",
      ],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: [
        "prettier",
        "husky",
        "lint-staged",
        "prettier-plugin-tailwindcss",
        "@trivago/prettier-plugin-sort-imports",
        "eslint-config-prettier",
      ],
      dev: true,
      workingDir: "target",
    },
    {
      kind: "dlx",
      description: "Installing starter shadcn/ui components",
      packageName: "shadcn@latest",
      args: [
        "add",
        "badge",
        "button",
        "card",
        "dialog",
        "dropdown-menu",
        "input",
        "label",
        "separator",
        "sheet",
        "skeleton",
        "table",
      ],
      workingDir: "target",
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
