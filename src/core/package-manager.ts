import type { PkgInfo } from "../types/index.js";

export interface InstallPackagesOptions {
  dev?: boolean;
}

export interface PackageManagerAdapter {
  readonly name: string;
  readonly version?: string;
  readonly isYarn1: boolean;
  create(packageName: string, args?: string[]): string;
  dlx(packageName: string, args?: string[]): string;
  add(packages: string[], options?: InstallPackagesOptions): string;
  exec(command: string): string;
  getFullCustomCommand(customCommand: string): string;
  replaceInCommand(command: string): string;
}

function joinCommandSegments(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

export function createPackageManagerAdapter(
  pkgInfo?: PkgInfo
): PackageManagerAdapter {
  const name = pkgInfo?.name ?? "npm";
  const version = pkgInfo?.version;
  const isYarn1 = name === "yarn" && version?.startsWith("1.") === true;

  const create = (packageName: string, args: string[] = []) => {
    if (name === "bun") {
      return joinCommandSegments(["bun", "create", packageName, ...args]);
    }
    if (name === "yarn") {
      return joinCommandSegments(["yarn", "create", packageName, ...args]);
    }
    if (name === "pnpm") {
      return joinCommandSegments(["pnpm", "create", packageName, ...args]);
    }
    return joinCommandSegments(["npm", "create", packageName, ...args]);
  };

  const dlx = (packageName: string, args: string[] = []) => {
    if (name === "bun") {
      return joinCommandSegments(["bunx", packageName, ...args]);
    }
    if (name === "yarn") {
      return isYarn1
        ? joinCommandSegments(["npx", packageName, ...args])
        : joinCommandSegments(["yarn", "dlx", packageName, ...args]);
    }
    if (name === "pnpm") {
      return joinCommandSegments(["pnpm", "dlx", packageName, ...args]);
    }
    return joinCommandSegments(["npx", packageName, ...args]);
  };

  const add = (packages: string[], options?: InstallPackagesOptions) => {
    const devFlag = options?.dev ? "-D" : "";
    if (name === "bun") {
      return joinCommandSegments(["bun", "add", devFlag, ...packages]);
    }
    if (name === "yarn") {
      return joinCommandSegments(["yarn", "add", devFlag, ...packages]);
    }
    if (name === "pnpm") {
      return joinCommandSegments(["pnpm", "add", devFlag, ...packages]);
    }
    return joinCommandSegments(["npm", "install", devFlag, ...packages]);
  };

  const exec = (command: string) => {
    if (name === "pnpm") {
      return `pnpm exec ${command}`;
    }
    if (name === "yarn") {
      return `yarn ${command}`;
    }
    if (name === "bun") {
      return `bunx ${command}`;
    }
    return `npx ${command}`;
  };

  const replaceInCommand = (command: string) =>
    command
      .replace(/^pnpx\s/, () => {
        if (name === "yarn") {
          return isYarn1 ? "npx " : "yarn dlx ";
        }
        if (name === "bun") {
          return "bunx ";
        }
        if (name === "npm") {
          return "npx ";
        }
        return "pnpx ";
      })
      .replace(/^pnpm dlx\s/, () => {
        if (name === "yarn") {
          return isYarn1 ? "npx " : "yarn dlx ";
        }
        if (name === "bun") {
          return "bunx ";
        }
        if (name === "npm") {
          return "npx ";
        }
        return "pnpm dlx ";
      })
      .replace(/^pnpm add\s/, () => {
        if (name === "yarn") {
          return "yarn add ";
        }
        if (name === "bun") {
          return "bun add ";
        }
        if (name === "npm") {
          return "npm install ";
        }
        return "pnpm add ";
      })
      .replace(/^pnpm create\s/, () => {
        if (name === "yarn") {
          return "yarn create ";
        }
        if (name === "bun") {
          return "bun create ";
        }
        if (name === "npm") {
          return "npm create ";
        }
        return "pnpm create ";
      });

  const getFullCustomCommand = (customCommand: string) =>
    customCommand
      .replace(/^npm create (?:-- )?/, () => {
        if (name === "bun") {
          return "bun x create-";
        }
        if (name === "pnpm") {
          return "pnpm create ";
        }
        return customCommand.startsWith("npm create -- ")
          ? `${name} create -- `
          : `${name} create `;
      })
      .replace("@latest", () => (isYarn1 ? "" : "@latest"))
      .replace(/^npm exec/, () => {
        if (name === "pnpm") {
          return "pnpm dlx";
        }
        if (name === "yarn" && !isYarn1) {
          return "yarn dlx";
        }
        if (name === "bun") {
          return "bun x";
        }
        return "npm exec";
      });

  return {
    name,
    version,
    isYarn1,
    create,
    dlx,
    add,
    exec,
    getFullCustomCommand,
    replaceInCommand,
  };
}
