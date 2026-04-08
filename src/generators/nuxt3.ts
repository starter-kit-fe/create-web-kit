import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { updatePackageJson } from "../core/operations/files.js";

const TEMPLATE_NAME = "nuxt3";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "app.vue", destination: "app.vue" },
  { source: "app.config.ts", destination: "app.config.ts" },
  { source: "nuxt.config.ts", destination: "nuxt.config.ts" },
  { source: ".env.example", destination: ".env.example" },
  { source: "assets/css/main.css", destination: "assets/css/main.css" },
  { source: "composables/use-api.ts", destination: "composables/use-api.ts" },
  { source: "pages/index.vue", destination: "pages/index.vue" },
  {
    source: "server/api/health.get.ts",
    destination: "server/api/health.get.ts",
  },
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
];

function mergeKeywords(current: unknown, next: string[]): string[] {
  const currentKeywords = Array.isArray(current)
    ? current.filter((value): value is string => typeof value === "string")
    : [];
  return [...new Set([...currentKeywords, ...next])];
}

export function createNuxt3Files(root: string): void {
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
        typecheck:
          typeof currentScripts.typecheck === "string"
            ? currentScripts.typecheck
            : "nuxt typecheck",
      },
      keywords: mergeKeywords(pkg.keywords, [
        "nuxt",
        "vue",
        "ssr",
        "nuxt-ui",
        "pinia",
      ]),
    };
  });
}
