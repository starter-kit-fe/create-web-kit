import spawn from "cross-spawn";
import type { ProjectContext } from "../context.js";
import type {
  CommandOperation,
  CreateOperation,
  DlxOperation,
  InstallPackagesOperation,
  VariantOperation,
  WorkingDirectory,
} from "../contracts.js";
import { CliError } from "../errors.js";
import { createPackageManagerAdapter } from "../package-manager.js";
import { splitCommand } from "../../utils/command.js";

function getWorkingDirectory(
  context: ProjectContext,
  workingDir: WorkingDirectory = "target"
): string {
  return workingDir === "root" ? context.cwd : context.root;
}

function executeCommandString(
  command: string,
  context: ProjectContext,
  workingDir: WorkingDirectory = "target"
): void {
  const [cmd, ...args] = splitCommand(command);
  const result = spawn.sync(cmd, args, {
    cwd: getWorkingDirectory(context, workingDir),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new CliError(`Failed to execute: ${command}`, {
      exitCode: result.status ?? 1,
    });
  }
}

export function runOperation(
  operation: VariantOperation,
  context: ProjectContext
): void {
  context.logger.step(operation.description);
  const adapter = createPackageManagerAdapter(context.pkgInfo);

  switch (operation.kind) {
    case "command": {
      const command = operation.packageManagerAware === false
        ? operation.command
        : adapter.replaceInCommand(
            operation.command.replace(/TARGET_DIR/g, context.targetDir)
          );
      context.logger.debug(
        `Executing command operation in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir);
      return;
    }
    case "create": {
      const args = [...(operation.args ?? [])];
      if (context.noGit && operation.disableGitArg) {
        args.push(operation.disableGitArg);
      }
      const command = adapter
        .create(operation.packageName, ["TARGET_DIR", ...args])
        .replace(/TARGET_DIR/g, context.targetDir);
      context.logger.debug(
        `Executing create operation in ${operation.workingDir ?? "root"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir ?? "root");
      return;
    }
    case "dlx": {
      const command = adapter
        .dlx(operation.packageName, operation.args)
        .replace(/TARGET_DIR/g, context.targetDir);
      context.logger.debug(
        `Executing dlx operation in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir);
      return;
    }
    case "install-packages": {
      if (context.noInstall) {
        context.logger.warn(
          `Skipping package installation because --no-install is enabled: ${operation.packages.join(", ")}`
        );
        return;
      }
      const command = adapter.add(operation.packages, { dev: operation.dev });
      context.logger.debug(
        `Installing packages in ${operation.workingDir ?? "target"}: ${command}`
      );
      executeCommandString(command, context, operation.workingDir);
      return;
    }
  }
}

export function runCustomCommand(
  customCommand: string,
  context: ProjectContext
): void {
  const command = createPackageManagerAdapter(context.pkgInfo)
    .getFullCustomCommand(customCommand)
    .replace(/TARGET_DIR/g, context.targetDir);
  context.logger.debug(`Executing custom command: ${command}`);
  executeCommandString(command, context, "root");
}
