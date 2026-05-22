import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";
import { updatePackageJson } from "../core/operations/files.js";

const TEMPLATE_NAME = "electron-vue";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "eslint.config.js", destination: ".eslintrc.js" },
];

export function createElectronVueFiles(root: string): void {
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
    };
  });
}
