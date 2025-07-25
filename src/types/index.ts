export type ColorFunc = (str: string | number) => string;

export type Framework = {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
};

export type FrameworkVariant = {
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
  multiStepCommands?: MultiStepCommand[];
};

export type MultiStepCommand = {
  command: string;
  description: string;
  workingDir?: "root" | "target"; // 'root' = current dir, 'target' = project dir
};

export interface PkgInfo {
  name: string;
  version: string;
}

export interface CliArgs {
  template?: string;
  help?: boolean;
  overwrite?: boolean;
  _: string[];
}
