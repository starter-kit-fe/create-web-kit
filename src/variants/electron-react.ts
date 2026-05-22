import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import type { ProjectContext } from "../core/context.js";
import { createElectronReactFiles } from "../generators/electron-react.js";

const { cyan } = colors;

export const electronReactVariantDefinition: VariantDefinition = {
  id: "electron-react",
  framework: "electron",
  displayName: "Electron + React + TypeScript",
  color: cyan,
  operations: [
    {
      kind: "create",
      description: "Creating Electron React project",
      packageName: "@quick-start/electron@latest",
      args: ["--template", "react-ts", "--skip"],
      targetArgument: "targetBasename",
      workingDir: "target-parent",
    },
    {
      kind: "install-packages",
      description: "Installing React runtime dependencies",
      packages: [
        "@tanstack/react-query",
        "jotai",
        "react-router-dom",
        "sonner",
        "lucide-react",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "radix-ui",
      ],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing Electron React development dependencies",
      packages: [
        "electron@latest",
        "electron-builder@latest",
        "tailwindcss",
        "@tailwindcss/vite",
        "tw-animate-css",
      ],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createElectronReactFiles(context.root);
  },
};

export default electronReactVariantDefinition;
