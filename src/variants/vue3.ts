import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import type { ProjectContext } from "../core/context.js";
import { createVue3Files } from "../generators/vue3.js";

const { green } = colors;

export const vue3VariantDefinition: VariantDefinition = {
  id: "vue3",
  framework: "vue",
  displayName: "Vue 3 + TypeScript + Vite",
  color: green,
  operations: [
    {
      kind: "create",
      description: "Creating Vue 3 project with TypeScript",
      packageName: "vue@latest",
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
      description: "Installing development tools",
      packages: ["@types/node", "prettier", "eslint"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createVue3Files(context.root);
  },
};

export default vue3VariantDefinition;
