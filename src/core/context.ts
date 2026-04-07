import type { PkgInfo } from "../types/index.js";

export interface Logger {
  step(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}

export interface ProjectContext {
  cwd: string;
  root: string;
  targetDir: string;
  packageName: string;
  pkgInfo?: PkgInfo;
  pkgManager: string;
  noGit: boolean;
  noInstall: boolean;
  verbose: boolean;
  yes: boolean;
  logger: Logger;
}
