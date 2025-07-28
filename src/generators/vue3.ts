import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "vue3";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: "vite.config.ts", destination: "vite.config.ts" },
];

export function createVue3Files(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
}
