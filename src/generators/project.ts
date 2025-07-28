import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import * as prompts from "@clack/prompts";
import type { FrameworkVariant, PkgInfo } from "../types/index.js";
import { replacePackageManagerInCommand } from "../utils/package-manager.js";
import { createNextjsCSRFiles } from "./nextjs-csr.js";
import { createNextjsSSRFiles } from "./nextjs-ssr.js";
import { createVue3Files } from "./vue3.js";
import { createElectronReactFiles } from "./electron-react.js";
import { createElectronVueFiles } from "./electron-vue.js";

export async function executeMultiStepCommands(
  variant: FrameworkVariant,
  targetDir: string,
  root: string,
  cwd: string,
  pkgInfo?: PkgInfo
): Promise<void> {
  if (!variant.multiStepCommands) return;

  prompts.log.step(`Setting up ${variant.display} project...`);

  for (const stepCommand of variant.multiStepCommands) {
    prompts.log.step(stepCommand.description);

    const workingDirectory = stepCommand.workingDir === "target" ? root : cwd;
    let command = stepCommand.command.replace(/TARGET_DIR/g, targetDir);

    // Replace package manager commands with user's preferred package manager
    command = replacePackageManagerInCommand(command, pkgInfo);

    // Parse the command and arguments
    const [cmd, ...args] = command.split(" ");

    try {
      const result = spawn.sync(cmd, args, {
        stdio: "inherit",
        cwd: workingDirectory,
      });

      if (result.status !== 0) {
        prompts.log.error(`Failed to execute: ${command}`);
        process.exit(result.status ?? 1);
      }
    } catch (error) {
      prompts.log.error(`Error executing command: ${command}`);
      console.error(error);
      process.exit(1);
    }
  }
}

export function createProjectFiles(template: string, root: string): void {
  // Add configuration files for specific project types
  if (template === "nextjs-csr") {
    createNextjsCSRFiles(root);
  }

  if (template === "nextjs-ssr") {
    createNextjsSSRFiles(root);
  }

  if (template === "vue3") {
    createVue3Files(root);
  }

  if (template === "electron-react") {
    createElectronReactFiles(root);
  }

  if (template === "electron-vue") {
    createElectronVueFiles(root);
  }
}

export function generateSuccessMessage(
  targetDir: string,
  pkgManager: string
): string {
  return `🎉 Project created successfully!
    
Next steps:
  cd ${targetDir}
  ${pkgManager === "yarn" ? "yarn dev" : `${pkgManager} run dev`}`;
}
