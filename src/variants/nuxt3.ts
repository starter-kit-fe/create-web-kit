import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createNuxt3Files } from "../generators/nuxt3.js";

const { green } = colors;

export const nuxt3VariantDefinition: VariantDefinition = {
  id: "nuxt3",
  framework: "nuxt",
  displayName: "Nuxt 3 + UI + Pinia",
  color: green,
  operations: [
    {
      kind: "command",
      description: "Creating Nuxt 3 project",
      command:
        "pnpm dlx create-nuxt@latest TARGET_DIR --packageManager PACKAGE_MANAGER --template v3 --no-install GIT_INIT_FLAG",
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing Nuxt ecosystem modules",
      packages: ["@nuxt/ui", "@pinia/nuxt", "@vueuse/nuxt", "zod"],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: ["prettier", "prettier-plugin-tailwindcss"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createNuxt3Files(context.root);
  },
};

export default nuxt3VariantDefinition;
