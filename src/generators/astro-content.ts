import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { updatePackageJson } from "../core/operations/files.js";

const TEMPLATE_NAME = "astro-content";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: ".env.example", destination: ".env.example" },
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "astro.config.mjs", destination: "astro.config.mjs" },
  { source: "src/content/config.ts", destination: "src/content/config.ts" },
  {
    source: "src/content/pages/home.md",
    destination: "src/content/pages/home.md",
  },
  { source: "src/layouts/site-layout.astro", destination: "src/layouts/site-layout.astro" },
  { source: "src/pages/index.astro", destination: "src/pages/index.astro" },
  { source: "src/styles/global.css", destination: "src/styles/global.css" },
];

function mergeKeywords(current: unknown, next: string[]): string[] {
  const currentKeywords = Array.isArray(current)
    ? current.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...currentKeywords, ...next])];
}

export function createAstroContentFiles(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);

  updatePackageJson<Record<string, unknown>>(root, (pkg) => {
    const currentScripts =
      typeof pkg.scripts === "object" && pkg.scripts
        ? (pkg.scripts as Record<string, unknown>)
        : {};

    return {
      ...pkg,
      scripts: {
        ...currentScripts,
        format:
          typeof currentScripts.format === "string"
            ? currentScripts.format
            : "prettier --write .",
      },
      keywords: mergeKeywords(pkg.keywords, [
        "astro",
        "content",
        "marketing-site",
        "mdx",
        "sitemap",
      ]),
    };
  });
}
