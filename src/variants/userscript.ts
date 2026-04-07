import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import type { ProjectContext } from "../core/context.js";
import { createUserscriptFiles } from "../generators/userscript.js";

const { yellow } = colors;

export const USERSCRIPT_VARIANT: VariantDefinition = {
  id: "userscript",
  framework: "userscript",
  displayName: "Userscript + Vanilla TypeScript",
  color: yellow,
  operations: [
    {
      kind: "dlx",
      description: "Creating userscript project with vanilla TypeScript",
      packageName: "create-monkey@latest",
      args: ["TARGET_DIR", "--template", "vanilla-ts"],
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing userscript tooling",
      packages: ["@types/tampermonkey"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createUserscriptFiles(context.root);
  },
};

export default USERSCRIPT_VARIANT;
