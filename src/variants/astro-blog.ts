import colors from "picocolors";
import type { ProjectContext } from "../core/context.js";
import type { VariantDefinition } from "../core/contracts.js";
import { createAstroBlogFiles } from "../generators/astro-blog.js";

const { magenta } = colors;

export const astroBlogVariantDefinition: VariantDefinition = {
  id: "astro-blog",
  framework: "astro",
  displayName: "Astro Blog + Content",
  color: magenta,
  operations: [
    {
      kind: "command",
      description: "Creating Astro blog project",
      command:
        "pnpm dlx create-astro@latest TARGET_DIR --template blog --yes INSTALL_FLAG GIT_FLAG",
      workingDir: "root",
    },
    {
      kind: "install-packages",
      description: "Installing Astro content tooling",
      packages: ["remark-gfm", "rehype-slug", "rehype-autolink-headings"],
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
    createAstroBlogFiles(context.root);
  },
};

export default astroBlogVariantDefinition;
