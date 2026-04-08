import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createAstroContentFiles } from "../generators/astro-content.js";

const { blue } = colors;

export const astroContentVariantDefinition: VariantDefinition = {
  id: "astro-content",
  framework: "astro",
  displayName: "Astro Content Site",
  color: blue,
  operations: [
    {
      kind: "command",
      description: "Creating Astro content site project",
      command:
        "pnpm dlx create-astro@latest TARGET_DIR --template basics --yes INSTALL_FLAG GIT_FLAG",
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing Astro content integrations",
      packages: [
        "@astrojs/mdx",
        "@astrojs/sitemap",
        "remark-gfm",
        "rehype-slug",
        "rehype-autolink-headings",
      ],
      workingDir: "target",
    },
    {
      kind: "install-packages",
      description: "Installing development dependencies",
      packages: ["prettier", "prettier-plugin-astro"],
      dev: true,
      workingDir: "target",
    },
  ],
  augment(context: ProjectContext) {
    createAstroContentFiles(context.root);
  },
};

export default astroContentVariantDefinition;
