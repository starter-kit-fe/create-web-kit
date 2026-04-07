#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import mri from "mri";
import * as prompts from "@clack/prompts";
import colors from "picocolors";

// Import configurations
import { helpMessage } from "./config/help.js";
import { defaultTargetDir } from "./config/constants.js";

// Import types
import type { CliArgs } from "./types/index.js";

// Import utilities
import {
  formatTargetDir,
  isValidPackageName,
  toValidPackageName,
  isEmpty,
  emptyDir,
  pkgFromUserAgent,
} from "./utils/file.js";
import { getFullCustomCommand } from "./utils/package-manager.js";
import {
  isSupportedPackageManager,
  resolvePackageManagerInfo,
} from "./cli/options.js";

import { CliError } from "./core/errors.js";
import {
  getPostSetupNotes,
  runVariant,
  getSuccessCommand,
} from "./core/runner.js";
import { resolveVariantDefinition } from "./core/definition.js";
import type { ProjectContext } from "./core/context.js";
import {
  getVariantsByFrameworkId,
  REGISTRY_FRAMEWORKS,
  REGISTRY_TEMPLATE_IDS,
} from "./registry/index.js";

const argv = mri<CliArgs>(process.argv.slice(2), {
  alias: { h: "help", t: "template", y: "yes" },
  boolean: ["help", "overwrite", "yes", "verbose", "no-git", "no-install"],
  string: ["template", "package-manager"],
});

const cwd = process.cwd();

function createSuccessMessage(
  root: string,
  cwdPath: string,
  command: string,
  notes: string[] = []
): string {
  const lines = ["🎉 Project created successfully!", "", "Next steps:"];
  const cdProjectName = path.relative(cwdPath, root);

  if (root !== cwdPath) {
    lines.push(
      `  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`
    );
  }

  lines.push(`  ${command}`);

  if (notes.length > 0) {
    lines.push("", "Notes:");
    for (const note of notes) {
      lines.push(`  - ${note}`);
    }
  }

  return lines.join("\n");
}

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined;
  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;
  const argYes = argv.yes ?? false;
  const argVerbose = argv.verbose ?? false;
  const argNoInstall = argv["no-install"] ?? false;
  const argNoGit = argv["no-git"] ?? false;
  const argPackageManager = argv["package-manager"];

  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  const detectedPkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  if (argPackageManager && !isSupportedPackageManager(argPackageManager)) {
    throw new CliError(
      `Unsupported package manager "${argPackageManager}". Use one of: npm, pnpm, yarn, bun.`
    );
  }
  const pkgInfo = resolvePackageManagerInfo(argPackageManager, detectedPkgInfo);
  const cancel = () => prompts.cancel("Operation cancelled");

  prompts.intro(colors.bgCyan(colors.black(" create-web-kit ")));

  // 1. Get project name and target dir
  let targetDir = argTargetDir ?? (argYes ? defaultTargetDir : undefined);
  if (!targetDir) {
    const projectName = await prompts.text({
      message: "Project name:",
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
      validate: (value) => {
        return value.length === 0 || formatTargetDir(value).length > 0
          ? undefined
          : "Invalid project name";
      },
    });
    if (prompts.isCancel(projectName)) return cancel();
    targetDir = formatTargetDir(projectName);
  }

  // 2. Handle directory if exist and not empty
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? "yes"
      : argYes
      ? "no"
      : await prompts.select({
          message:
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          options: [
            {
              label: "Cancel operation",
              value: "no",
            },
            {
              label: "Remove existing files and continue",
              value: "yes",
            },
            {
              label: "Ignore files and continue",
              value: "ignore",
            },
          ],
        });
    if (prompts.isCancel(overwrite)) return cancel();
    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      case "no":
        if (argYes) {
          throw new CliError(
            `Target directory "${targetDir}" is not empty. Re-run with --overwrite or choose a different directory.`
          );
        }
        cancel();
        return;
    }
  }

  // 3. Get package name
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    if (argYes) {
      packageName = toValidPackageName(packageName);
    } else {
      const packageNameResult = await prompts.text({
        message: "Package name:",
        defaultValue: toValidPackageName(packageName),
        placeholder: toValidPackageName(packageName),
        validate(dir) {
          if (!isValidPackageName(dir)) {
            return "Invalid package.json name";
          }
        },
      });
      if (prompts.isCancel(packageNameResult)) return cancel();
      packageName = packageNameResult;
    }
  }

  // 4. Choose a framework and variant
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !REGISTRY_TEMPLATE_IDS.includes(argTemplate)) {
    template = undefined;
    hasInvalidArgTemplate = true;
  }

  if (!template) {
    if (argYes) {
      if (hasInvalidArgTemplate) {
        throw new CliError(
          `Invalid template "${argTemplate}". Use --help to see supported template ids.`
        );
      }
      throw new CliError(
        "`--yes` requires `--template` so the CLI can run non-interactively."
      );
    }

    const frameworkId = (await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. Please choose from below: `
        : "Select a framework:",
      options: REGISTRY_FRAMEWORKS.map((framework) => {
        const frameworkColor = framework.color;
        return {
          label: frameworkColor(framework.displayName),
          value: framework.id,
        };
      }),
    })) as string;
    if (prompts.isCancel(frameworkId)) return cancel();

    const variant = (await prompts.select({
      message: "Select a variant:",
      options: getVariantsByFrameworkId(frameworkId).map((variant) => {
        const variantColor = variant.color;
        let hint: string | undefined;

        if (variant.customCommand) {
          hint = getFullCustomCommand(variant.customCommand, pkgInfo).replace(
            / TARGET_DIR$/,
            ""
          );
        } else if (typeof variant.stepCount === "number") {
          hint = `Structured setup: ${variant.stepCount} steps`;
        }

        return {
          label: variantColor(variant.displayName),
          value: variant.id,
          hint,
        };
      }),
    })) as string;
    if (prompts.isCancel(variant)) return cancel();

    template = variant;
  }

  const root = path.join(cwd, targetDir);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const selectedVariant = template
    ? resolveVariantDefinition(template)
    : undefined;

  if (!template || !selectedVariant) {
    throw new CliError("Unable to resolve the selected template.");
  }

  const context: ProjectContext = {
    cwd,
    root,
    targetDir,
    packageName,
    pkgInfo,
    pkgManager,
    noGit: argNoGit,
    noInstall: argNoInstall,
    verbose: argVerbose,
    yes: argYes,
    logger: {
      step: prompts.log.step,
      info: prompts.log.info,
      warn: prompts.log.warn,
      error: prompts.log.error,
      debug(message: string) {
        if (argVerbose) {
          console.log(colors.dim(`[debug] ${message}`));
        }
      },
    },
  };

  context.logger.debug(`Using package manager: ${pkgManager}`);
  context.logger.debug(`Selected template: ${template}`);
  context.logger.debug(`Target directory: ${targetDir}`);
  if (argNoGit) {
    context.logger.debug("Git-specific setup is disabled");
  }
  if (argNoInstall) {
    context.logger.debug("Additional dependency installation is disabled");
  }

  await runVariant(selectedVariant, context);
  prompts.outro(
    createSuccessMessage(
      root,
      cwd,
      getSuccessCommand(context),
      getPostSetupNotes(context)
    )
  );
}

init().catch((e) => {
  if (e instanceof CliError) {
    prompts.log.error(e.message);
    if (e.cause) {
      console.error(e.cause);
    }
    process.exit(e.exitCode);
  }
  console.error(e);
  process.exit(1);
});
