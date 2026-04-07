import type { PkgInfo } from "../types/index.js";
import { createPackageManagerAdapter } from "../core/package-manager.js";

export function getFullCustomCommand(
  customCommand: string,
  pkgInfo?: PkgInfo
): string {
  return createPackageManagerAdapter(pkgInfo).getFullCustomCommand(customCommand);
}

export function replacePackageManagerInCommand(
  command: string,
  pkgInfo?: PkgInfo
): string {
  return createPackageManagerAdapter(pkgInfo).replaceInCommand(command);
}

export function getExecCommand(command: string, pkgInfo?: PkgInfo): string {
  return createPackageManagerAdapter(pkgInfo).exec(command);
}
