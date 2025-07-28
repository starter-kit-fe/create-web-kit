import colors from "picocolors";
import type { Framework } from "../types/index.js";

const { blue, cyan, green, magenta } = colors;

export const FRAMEWORKS: Framework[] = [
  {
    name: "nextjs",
    display: "Next.js",
    color: cyan,
    variants: [
      {
        name: "nextjs-csr",
        display: "Next.js CSR + ShadcnUI",
        color: cyan,
        multiStepCommands: [
          {
            command:
              "pnpx create-next-app@latest TARGET_DIR --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'",
            description:
              "Creating Next.js project with TypeScript and Tailwind",
            workingDir: "root",
          },
          {
            command: "pnpm dlx shadcn@latest init -y",
            description: "Installing ShadcnUI components",
            workingDir: "target",
          },
          {
            command:
              "pnpm add @tanstack/react-table @tanstack/react-query @tanstack/react-query-devtools",
            description: "Installing TanStack Table and Query",
            workingDir: "target",
          },
          {
            command:
              "pnpm add -D prettier @types/node husky lint-staged prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports eslint-config-prettier",
            description: "Installing development dependencies",
            workingDir: "target",
          },
          {
            command: "pnpm add date-fns next-themes motion",
            description: "Installing date-fns for date utilities",
            workingDir: "target",
          },
          {
            command: "pnpm dlx shadcn@latest add --all",
            description: "Installing all shadcnui components",
            workingDir: "target",
          },
        ],
      },
      {
        name: "nextjs-ssr",
        display: "Next.js SSR + ShadcnUI",
        color: blue,
        multiStepCommands: [
          {
            command:
              "pnpx create-next-app@latest TARGET_DIR --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'",
            description:
              "Creating Next.js SSR project with TypeScript and Tailwind",
            workingDir: "root",
          },
          {
            command: "pnpm dlx shadcn@latest init -y",
            description: "Installing ShadcnUI components",
            workingDir: "target",
          },
          {
            command: "pnpm add @tanstack/react-query next-auth prisma motion",
            description: "Installing SSR dependencies",
            workingDir: "target",
          },
          {
            command: "pnpm add -D @types/node prettier prisma",
            description: "Installing development dependencies",
            workingDir: "target",
          },
        ],
      },
    ],
  },
  {
    name: "vue",
    display: "Vue",
    color: green,
    variants: [
      {
        name: "vue3",
        display: "Vue 3 + TypeScript + Vite",
        color: green,
        multiStepCommands: [
          {
            command: "pnpm create vue@latest TARGET_DIR",
            description: "Creating Vue 3 project with TypeScript",
            workingDir: "root",
          },
          {
            command: "pnpm add pinia @vueuse/core",
            description: "Installing Vue ecosystem packages",
            workingDir: "target",
          },
          {
            command: "pnpm add -D @types/node prettier eslint",
            description: "Installing development tools",
            workingDir: "target",
          },
        ],
      },
    ],
  },
  {
    name: "electron",
    display: "Electron",
    color: magenta,
    variants: [
      {
        name: "electron-react",
        display: "Electron + React + TypeScript",
        color: cyan,
        multiStepCommands: [
          {
            command:
              "pnpm create electron-vite@latest TARGET_DIR --template react-ts",
            description: "Creating Electron React project",
            workingDir: "root",
          },
          {
            command: "pnpm add @tanstack/react-query zustand",
            description: "Installing React state management",
            workingDir: "target",
          },
          {
            command: "pnpm add -D @types/node prettier",
            description: "Installing development dependencies",
            workingDir: "target",
          },
        ],
      },
      {
        name: "electron-vue",
        display: "Electron + Vue 3 + TypeScript",
        color: green,
        multiStepCommands: [
          {
            command:
              "pnpm create electron-vite@latest TARGET_DIR --template vue-ts",
            description: "Creating Electron Vue project",
            workingDir: "root",
          },
          {
            command: "pnpm add pinia @vueuse/core",
            description: "Installing Vue ecosystem packages",
            workingDir: "target",
          },
          {
            command: "pnpm add -D @types/node prettier",
            description: "Installing development dependencies",
            workingDir: "target",
          },
        ],
      },
    ],
  },
];

export const TEMPLATES = FRAMEWORKS.map((f) =>
  f.variants.map((v) => v.name)
).reduce((a, b) => a.concat(b), []);

export const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
  _eslintrc: ".eslintrc.js",
  _npmrc: ".npmrc",
};

export const defaultTargetDir = "my-app";
