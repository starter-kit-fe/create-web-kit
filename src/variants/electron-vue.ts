import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import type { ProjectContext } from "../core/context.js";
import { createElectronVueFiles } from "../generators/electron-vue.js";

const { green } = colors;

export const electronVueVariantDefinition: VariantDefinition = {
  id: "electron-vue",
  framework: "electron",
  displayName: "Electron + Vue 3 + TypeScript",
  color: green,
  operations: [
    {
      kind: "create",
      description: "Creating Electron Vue project",
      packageName: "electron-vite@latest",
      args: ["--template", "vue-ts"],
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing Vue ecosystem packages",
      packages: ["pinia", "@vueuse/core"],
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
    createElectronVueFiles(context.root);
  },
};

export default electronVueVariantDefinition;
