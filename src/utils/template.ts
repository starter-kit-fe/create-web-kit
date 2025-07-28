import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TemplateFile {
  source: string;
  destination: string;
  isJson?: boolean;
}

export function getTemplatePath(template: string): string {
  return path.join(__dirname, "../templates", template);
}

export function readTemplateFile(
  templatePath: string,
  fileName: string
): string {
  const filePath = path.join(templatePath, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

export function copyTemplateFiles(
  templateName: string,
  files: TemplateFile[],
  targetRoot: string
): void {
  const templatePath = getTemplatePath(templateName);

  for (const file of files) {
    try {
      const content = readTemplateFile(templatePath, file.source);
      const targetPath = path.join(targetRoot, file.destination);

      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      if (file.isJson) {
        // Pretty print JSON files
        const jsonContent = JSON.parse(content);
        fs.writeFileSync(targetPath, JSON.stringify(jsonContent, null, 2));
      } else {
        fs.writeFileSync(targetPath, content);
      }
    } catch (error) {
      console.error(`Error copying template file ${file.source}:`, error);
      throw error;
    }
  }
}
