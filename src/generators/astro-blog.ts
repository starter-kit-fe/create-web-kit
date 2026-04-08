import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { updatePackageJson } from "../core/operations/files.js";

const TEMPLATE_NAME = "astro-blog";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: ".env.example", destination: ".env.example" },
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  {
    source: "src/content/blog/launch-notes.md",
    destination: "src/content/blog/launch-notes.md",
  },
];

function mergeKeywords(current: unknown, next: string[]): string[] {
  const currentKeywords = Array.isArray(current)
    ? current.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...currentKeywords, ...next])];
}

export function createAstroBlogFiles(root: string): void {
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
        "blog",
        "content",
        "mdx",
        "sitemap",
      ]),
    };
  });
}
