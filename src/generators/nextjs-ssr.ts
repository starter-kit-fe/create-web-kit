import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "nextjs-ssr";

const TEMPLATE_FILES: TemplateFile[] = [
  { source: ".env.local", destination: ".env.local" },
  { source: ".env.local", destination: ".env.example" },
];

export function createNextjsSSRFiles(root: string): void {
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);
}
