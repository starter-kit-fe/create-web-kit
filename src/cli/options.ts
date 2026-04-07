import type { PkgInfo } from "../types/index.js";

export const SUPPORTED_PACKAGE_MANAGERS = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
] as const;

export type SupportedPackageManager =
  (typeof SUPPORTED_PACKAGE_MANAGERS)[number];

export function isSupportedPackageManager(
  value: string
): value is SupportedPackageManager {
  return (SUPPORTED_PACKAGE_MANAGERS as readonly string[]).includes(value);
}

export function resolvePackageManagerInfo(
  requestedPackageManager: string | undefined,
  detectedPkgInfo?: PkgInfo
): PkgInfo | undefined {
  if (!requestedPackageManager) {
    return detectedPkgInfo;
  }

  if (detectedPkgInfo?.name === requestedPackageManager) {
    return detectedPkgInfo;
  }

  const fallbackVersion =
    requestedPackageManager === "yarn" ? "4.0.0" : "0.0.0";

  return {
    name: requestedPackageManager,
    version: fallbackVersion,
  };
}
