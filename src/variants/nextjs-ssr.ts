import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import type { ProjectContext } from "../core/context.js";
import { createNextjsSSRFiles } from "../generators/nextjs-ssr.js";

const { blue } = colors;

export const nextjsSsrVariantDefinition: VariantDefinition = {
  id: "nextjs-ssr",
  framework: "nextjs",
  displayName: "Next.js SSR + ShadcnUI",
  color: blue,
  operations: [
    {
      kind: "create",
      description: "Creating Next.js SSR project with TypeScript and Tailwind",
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
      description: "Installing SSR dependencies",
      packages: ["@tanstack/react-query", "next-auth", "prisma", "motion"],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: ["@types/node", "prettier", "prisma"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createNextjsSSRFiles(context.root);
  },
};
