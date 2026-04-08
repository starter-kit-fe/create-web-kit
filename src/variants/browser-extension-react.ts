import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createWxtReactFiles } from "../generators/wxt-react.js";

const { yellow } = colors;

export const browserExtensionReactVariantDefinition: VariantDefinition = {
  id: "browser-extension-react",
  framework: "browser-extension",
  displayName: "Browser Extension + React",
  color: yellow,
  operations: [
    {
      kind: "command",
      description: "Creating browser extension project with WXT and React",
      command:
        "pnpm dlx wxt@latest init TARGET_DIR --template react --pm PACKAGE_MANAGER",
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing browser extension runtime dependencies",
      packages: [
        "@tanstack/react-query",
        "webextension-polyfill",
        "zustand",
      ],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: [
        "@types/webextension-polyfill",
        "prettier",
        "husky",
        "lint-staged",
      ],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createWxtReactFiles(context.root, context.pkgInfo, {
      noGit: context.noGit,
      verbose: context.verbose,
    });
  },
};

export default browserExtensionReactVariantDefinition;
