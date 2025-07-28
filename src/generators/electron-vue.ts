import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "electron-vue";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "eslint.config.js", destination: ".eslintrc.js" },
];

export function createElectronVueFiles(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
}
