import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createNextjsCSRFiles } from "../generators/nextjs-csr.js";

const { cyan } = colors;

export const nextjsCsrVariantDefinition: VariantDefinition = {
  id: "nextjs-csr",
  framework: "nextjs",
  displayName: "Next.js CSR + ShadcnUI",
  color: cyan,
  operations: [
    {
      kind: "create",
      description: "Creating Next.js project with TypeScript and Tailwind",
      packageName: "next-app@latest",
      disableGitArg: "--disable-git",
      args: [
        "--typescript",
        "--tailwind",
        "--eslint",
        "--app",
        "--src-dir",
        "--import-alias",
        "@/*",
      ],
      workingDir: "root",
    },
    {
      kind: "dlx",
      description: "Installing ShadcnUI components",
      packageName: "shadcn@latest",
      args: ["init", "-y"],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing TanStack Table and Query",
      packages: [
        "@tanstack/react-table",
        "@tanstack/react-query",
        "@tanstack/react-query-devtools",
      ],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: [
        "prettier",
        "@types/node",
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
      kind: "install-packages",
      description: "Installing runtime utilities",
      packages: ["date-fns", "next-themes", "motion", "dotenv"],
      workingDir: "target",
    },
    {
      kind: "dlx",
      description: "Installing all shadcnui components",
      packageName: "shadcn@latest",
      args: ["add", "--all"],
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createNextjsCSRFiles(context.root, context.pkgInfo, {
      noGit: context.noGit,
      verbose: context.verbose,
    });
  },
};
