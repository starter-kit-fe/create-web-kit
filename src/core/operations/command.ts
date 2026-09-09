import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import type { ProjectContext } from "../context.js";
import type {
  CommandOperation,
  CreateOperation,
  DlxOperation,
  InstallPackagesOperation,
  OperationOutputOptions,
  VariantOperation,
  WorkingDirectory,
} from "../contracts.js";
import { CliError } from "../errors.js";
import { createPackageManagerAdapter } from "../package-manager.js";
import { splitCommand } from "../../utils/command.js";
import { updatePackageJson } from "./files.js";

function getWorkingDirectory(
  context: ProjectContext,
  workingDir: WorkingDirectory = "target"
): string {
  if (workingDir === "root") {
    return context.cwd;
  }
  if (workingDir === "target-parent") {
    return path.dirname(context.root);
  }
  return context.root;
}

function executeCommandString(
  command: string,
  context: ProjectContext,
  workingDir: WorkingDirectory = "target",
  options: OperationOutputOptions = {}
): void {
  const cwd = getWorkingDirectory(context, workingDir);
  if (workingDir === "target-parent") {
    fs.mkdirSync(cwd, { recursive: true });
  }

  const [cmd, ...args] = splitCommand(command);
  const capture = options.quiet && !context.verbose;
  const startedAt = Date.now();
  const result = spawn.sync(cmd, args, {
    cwd,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    env: options.autoConfirm ? { ...process.env, npm_config_yes: "true" } : process.env,
  });

  if (result.status !== 0 || result.error) {
    const details = [result.stdout, result.stderr, result.error?.message].filter(Boolean).join("\n");
    throw new CliError(`Failed to execute: ${command}${details ? `\n${details}` : ""}`, {
      exitCode: result.status || 1,
    });
  }
  if (capture) context.logger.info(`Completed in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
}

function applyOperationPlaceholders(
  command: string,
  context: ProjectContext
): string {
  return command
    .replace(/TARGET_DIR/g, context.targetDir)
    .replace(/TARGET_BASENAME/g, path.basename(context.root))
    .replace(/PACKAGE_MANAGER/g, context.pkgManager)
    .replace(/INSTALL_FLAG/g, context.noInstall ? "" : "--install")
    .replace(/GIT_FLAG/g, context.noGit ? "" : "--git")
    .replace(/GIT_INIT_FLAG/g, context.noGit ? "" : "--gitInit")
    .replace(/\s+/g, " ")
    .trim();
}

export function runOperation(
  operation: VariantOperation,
  context: ProjectContext
): void {
  context.logger.step(operation.description);
  const adapter = createPackageManagerAdapter(context.pkgInfo);

  switch (operation.kind) {
    case "command": {
      const baseCommand = applyOperationPlaceholders(operation.command, context);
      const command = operation.packageManagerAware === false
        ? baseCommand
        : adapter.replaceInCommand(baseCommand);
      context.logger.debug(
        `Executing command operation in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir, operation);
      return;
    }
    case "create": {
      const targetArg =
        operation.targetArgument === "targetBasename"
          ? "TARGET_BASENAME"
          : "TARGET_DIR";
      const args = [...(operation.args ?? [])];
      if (context.noGit && operation.disableGitArg) {
        args.push(operation.disableGitArg);
      }
      const command = applyOperationPlaceholders(
        adapter.create(operation.packageName, [targetArg, ...args]),
        context
      );
      context.logger.debug(
        `Executing create operation in ${operation.workingDir ?? "root"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir ?? "root", operation);
      return;
    }
    case "dlx": {
      const command = applyOperationPlaceholders(
        adapter.dlx(operation.packageName, operation.args),
        context
      );
      context.logger.debug(
        `Executing dlx operation in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir, operation);
      return;
    }
    case "install-packages": {
      if (context.noInstall) {
        context.logger.warn(
          `Skipping package installation because --no-install is enabled: ${operation.packages.join(", ")}`
        );
        return;
      }
      if (operation.devPackages) {
        if (operation.dev) throw new CliError("dev and devPackages cannot be combined");
        updatePackageJson<Record<string, unknown>>(getWorkingDirectory(context, operation.workingDir), (pkg) => {
          const dependencies = { ...(pkg.dependencies as Record<string, string> | undefined) };
          const devDependencies = { ...(pkg.devDependencies as Record<string, string> | undefined) };
          for (const name of operation.packages) {
            dependencies[name] ??= devDependencies[name] ?? "latest";
            delete devDependencies[name];
          }
          for (const name of operation.devPackages ?? []) {
            if (!(name in dependencies)) devDependencies[name] ??= "latest";
          }
          return { ...pkg, dependencies, devDependencies };
        });
      }
      const command = operation.devPackages
        ? adapter.install()
        : adapter.add(operation.packages, { dev: operation.dev });
      context.logger.debug(
        `Installing packages in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir, operation);
      return;
    }
  }
}

export function runCustomCommand(
  customCommand: string,
  context: ProjectContext
): void {
  const command = applyOperationPlaceholders(
    createPackageManagerAdapter(context.pkgInfo).getFullCustomCommand(customCommand),
    context
  );
  context.logger.debug(`Executing custom command: ${command}`);
  executeCommandString(command, context, "root");
}
