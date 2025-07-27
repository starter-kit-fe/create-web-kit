import type { PkgInfo } from "../types/index.js";

export function getFullCustomCommand(
  customCommand: string,
  pkgInfo?: PkgInfo
): string {
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  return (
    customCommand
      .replace(/^npm create (?:-- )?/, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === "bun") {
          return "bun x create-";
        }
        // pnpm doesn't support the -- syntax
        if (pkgManager === "pnpm") {
          return "pnpm create ";
        }
        // For other package managers, preserve the original format
        return customCommand.startsWith("npm create -- ")
          ? `${pkgManager} create -- `
          : `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace("@latest", () => (isYarn1 ? "" : "@latest"))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === "pnpm") {
          return "pnpm dlx";
        }
        if (pkgManager === "yarn" && !isYarn1) {
          return "yarn dlx";
        }
        if (pkgManager === "bun") {
          return "bun x";
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return "npm exec";
      })
  );
}

export function replacePackageManagerInCommand(
  command: string,
  pkgInfo?: PkgInfo
): string {
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  return (
    command
      // Replace pnpx/npx with appropriate package manager
      .replace(/^pnpx\s/, () => {
        if (pkgManager === "yarn") {
          return isYarn1 ? "npx " : "yarn dlx ";
        }
        if (pkgManager === "bun") {
          return "bunx ";
        }
        if (pkgManager === "npm") {
          return "npx ";
        }
        return "pnpx ";
      })
      // Replace pnpm dlx with appropriate package manager
      .replace(/^pnpm dlx\s/, () => {
        if (pkgManager === "yarn") {
          return isYarn1 ? "npx " : "yarn dlx ";
        }
        if (pkgManager === "bun") {
          return "bunx ";
        }
        if (pkgManager === "npm") {
          return "npx ";
        }
        return "pnpm dlx ";
      })
      // Replace pnpm add with appropriate package manager
      .replace(/^pnpm add\s/, () => {
        if (pkgManager === "yarn") {
          return "yarn add ";
        }
        if (pkgManager === "bun") {
          return "bun add ";
        }
        if (pkgManager === "npm") {
          return "npm install ";
        }
        return "pnpm add ";
      })
      // Replace pnpm create with appropriate package manager
      .replace(/^pnpm create\s/, () => {
        if (pkgManager === "yarn") {
          return "yarn create ";
        }
        if (pkgManager === "bun") {
          return "bun create ";
        }
        if (pkgManager === "npm") {
          return "npm create ";
        }
        return "pnpm create ";
      })
  );
}
