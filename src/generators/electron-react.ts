import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "electron-react";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "eslint.config.js", destination: ".eslintrc.js" },
];

export function createElectronReactFiles(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
}
