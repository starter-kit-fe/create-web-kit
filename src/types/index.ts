export type ColorFunc = (str: string | number) => string;

export interface PkgInfo {
  name: string;
  version: string;
}

export interface CliArgs {
  template?: string;
  yes?: boolean;
  help?: boolean;
  overwrite?: boolean;
  verbose?: boolean;
  "package-manager"?: string;
  "no-install"?: boolean;
  "no-git"?: boolean;
  _: string[];
}
