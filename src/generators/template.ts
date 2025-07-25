import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prompts from "@clack/prompts";
import { copy } from "../utils/file.js";
import { renameFiles } from "../config/frameworks.js";

export function generateTemplateProject(
  template: string,
  root: string,
  packageName: string,
  pkgManager: string,
  cwd: string
): void {
  fs.mkdirSync(root, { recursive: true });
  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../..",
    `template-${template}`
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = packageName;

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  let doneMessage = "";
  const cdProjectName = path.relative(cwd, root);
  doneMessage += `Done. Now run:\n`;
  if (root !== cwd) {
    doneMessage += `\n  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }`;
  }
  switch (pkgManager) {
    case "yarn":
      doneMessage += "\n  yarn";
      doneMessage += "\n  yarn dev";
      break;
    default:
      doneMessage += `\n  ${pkgManager} install`;
      doneMessage += `\n  ${pkgManager} run dev`;
      break;
  }
  prompts.outro(doneMessage);
}
