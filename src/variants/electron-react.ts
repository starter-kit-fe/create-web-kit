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
      packageName: "electron-vite@latest",
      args: ["--template", "react-ts"],
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing React state management",
      packages: ["@tanstack/react-query", "zustand"],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: ["@types/node", "prettier"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createElectronReactFiles(context.root);
  },
};

export default electronReactVariantDefinition;
