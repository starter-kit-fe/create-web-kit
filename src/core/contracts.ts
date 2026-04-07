import type { ColorFunc } from "../types/index.js";
import type { ProjectContext } from "./context.js";

export type WorkingDirectory = "root" | "target";

export interface CommandOperation {
  kind: "command";
  description: string;
  command: string;
  workingDir?: WorkingDirectory;
  packageManagerAware?: boolean;
}

export interface CreateOperation {
  kind: "create";
  description: string;
  packageName: string;
  args?: string[];
  disableGitArg?: string;
  workingDir?: WorkingDirectory;
}

export interface DlxOperation {
  kind: "dlx";
  description: string;
  packageName: string;
  args?: string[];
  workingDir?: WorkingDirectory;
}

export interface InstallPackagesOperation {
  kind: "install-packages";
  description: string;
  packages: string[];
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
