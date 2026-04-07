export interface CliErrorOptions {
  exitCode?: number;
  cause?: unknown;
}

export class CliError extends Error {
  exitCode: number;
  override cause?: unknown;

  constructor(message: string, options?: CliErrorOptions) {
    super(message);
    this.name = "CliError";
    this.exitCode = options?.exitCode ?? 1;
    this.cause = options?.cause;
  }
}
