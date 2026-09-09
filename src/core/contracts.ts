import type { ColorFunc } from "../types/index.js";
import type { ProjectContext } from "./context.js";

export type CreateTargetArgument = "targetDir" | "targetBasename";
export type WorkingDirectory = "root" | "target" | "target-parent";

export interface OperationOutputOptions {
  /** Capture successful child output unless --verbose is enabled. */
  quiet?: boolean;
  /** Suppress package-runner download confirmation for non-interactive steps. */
  autoConfirm?: boolean;
}

export interface CommandOperation extends OperationOutputOptions {
  kind: "command";
  description: string;
  command: string;
  workingDir?: WorkingDirectory;
  packageManagerAware?: boolean;
}

export interface CreateOperation extends OperationOutputOptions {
  kind: "create";
  description: string;
  packageName: string;
  args?: string[];
  targetArgument?: CreateTargetArgument;
  disableGitArg?: string;
  workingDir?: WorkingDirectory;
}

export interface DlxOperation extends OperationOutputOptions {
  kind: "dlx";
  description: string;
  packageName: string;
  args?: string[];
  workingDir?: WorkingDirectory;
}

export interface InstallPackagesOperation extends OperationOutputOptions {
  kind: "install-packages";
  description: string;
  packages: string[];
  /** Batch runtime and development dependencies into one install (unversioned names). */
  devPackages?: string[];
  dev?: boolean;
  workingDir?: WorkingDirectory;
}

export type VariantOperation =
  | CommandOperation
  | CreateOperation
  | DlxOperation
  | InstallPackagesOperation;

export interface FrameworkDefinition {
  id: string;
  displayName: string;
  color: ColorFunc;
}

export interface VariantDefinition {
  id: string;
  framework: string;
  displayName: string;
  color: ColorFunc;
  operations?: VariantOperation[];
  customCommand?: string;
  hint?: string;
  augment?: (context: ProjectContext) => void | Promise<void>;
}
