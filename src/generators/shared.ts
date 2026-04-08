import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import type { PkgInfo } from "../types/index.js";
import { splitCommand } from "../utils/command.js";
import { createPackageManagerAdapter } from "../core/package-manager.js";
import { ensureDirectory } from "../core/operations/files.js";

export interface GeneratorGitOptions {
  noGit?: boolean;
  verbose?: boolean;
  initializeGitIfMissing?: boolean;
}

export function runCommand(command: string, cwd: string): void {
  const [cmd, ...args] = splitCommand(command);
  const result = spawn.sync(cmd, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}

export function ensureGitRepository(
  root: string,
  options: GeneratorGitOptions = {}
): boolean {
  const gitDir = path.join(root, ".git");
  if (fs.existsSync(gitDir)) {
    return true;
  }

  if (!options.initializeGitIfMissing) {
    return false;
  }

  runCommand("git init", root);

  if (options.verbose) {
    console.log("ℹ️ Initialized a new Git repository");
  }

  return true;
}

export function initializeHusky(
  root: string,
  pkgInfo?: PkgInfo,
  options: GeneratorGitOptions = {}
): void {
  try {
    if (options.noGit) {
      if (options.verbose) {
        console.log("ℹ️ Skipping husky setup because --no-git is enabled");
      }
      return;
    }

    if (!ensureGitRepository(root, options)) {
      console.warn("⚠️ Skipping husky install because no Git repository was found");
      return;
    }

    const adapter = createPackageManagerAdapter(pkgInfo);
    runCommand(adapter.exec("husky install"), root);

    const huskyDir = path.join(root, ".husky");
    ensureDirectory(huskyDir);

    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${adapter.exec("lint-staged")}
`;
    fs.writeFileSync(preCommitPath, preCommitContent);

    try {
      fs.chmodSync(preCommitPath, 0o755);
    } catch {
      console.warn("⚠️ Could not set execute permission for pre-commit hook");
    }

    console.log("✅ Husky pre-commit hook created successfully");
  } catch (error) {
    console.error("❌ Failed to initialize husky:", error);
  }
}
