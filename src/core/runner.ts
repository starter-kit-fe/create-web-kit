import type { ProjectContext } from "./context.js";
import type { VariantDefinition } from "./contracts.js";
import { runOperation, runCustomCommand } from "./operations/command.js";

export async function runVariant(
  variant: VariantDefinition,
  context: ProjectContext
): Promise<void> {
  context.logger.step(`Setting up ${variant.displayName} project...`);

  if (variant.operations) {
    for (const operation of variant.operations) {
      runOperation(operation, context);
    }
  }

  if (variant.customCommand) {
    runCustomCommand(variant.customCommand, context);
  }

  if (variant.augment) {
    await variant.augment(context);
  }
}

export function getSuccessCommand(context: ProjectContext): string {
  return context.pkgManager === "yarn"
    ? "yarn dev"
    : `${context.pkgManager} run dev`;
}

export function getPostSetupNotes(context: ProjectContext): string[] {
  const notes: string[] = [];

  if (context.noInstall) {
    notes.push(
      "Additional dependency install steps were skipped because --no-install is enabled."
    );
  }

  if (context.noGit) {
    notes.push("Git-specific setup was skipped because --no-git is enabled.");
  }

  return notes;
}
