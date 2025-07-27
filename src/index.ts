#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import mri from "mri";
import * as prompts from "@clack/prompts";
import colors from "picocolors";

// Import configurations
import { helpMessage } from "./config/help.js";
import {
  FRAMEWORKS,
  TEMPLATES,
  defaultTargetDir,
} from "./config/frameworks.js";

// Import types
import type { Framework, FrameworkVariant, CliArgs } from "./types/index.js";

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

// Import generators
import {
  executeMultiStepCommands,
  createProjectFiles,
  generateSuccessMessage,
} from "./generators/project.js";
import { generateTemplateProject } from "./generators/template.js";

const argv = mri<CliArgs>(process.argv.slice(2), {
  alias: { h: "help", t: "template" },
  boolean: ["help", "overwrite"],
  string: ["template"],
});

const cwd = process.cwd();

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined;
  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;

  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const cancel = () => prompts.cancel("Operation cancelled");

  prompts.intro(colors.bgCyan(colors.black(" create-web ")));

  // 1. Get project name and target dir
  let targetDir = argTargetDir;
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
        cancel();
        return;
    }
  }

  // 3. Get package name
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
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

  // 4. Choose a framework and variant
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !TEMPLATES.includes(argTemplate)) {
    template = undefined;
    hasInvalidArgTemplate = true;
  }

  if (!template) {
    const framework = (await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. Please choose from below: `
        : "Select a framework:",
      options: FRAMEWORKS.map((framework) => {
        const frameworkColor = framework.color;
        return {
          label: frameworkColor(framework.display || framework.name),
          value: framework,
        };
      }),
    })) as Framework;
    if (prompts.isCancel(framework)) return cancel();

    const variant = (await prompts.select({
      message: "Select a variant:",
      options: framework.variants.map((variant) => {
        const variantColor = variant.color;
        const command = variant.customCommand
          ? getFullCustomCommand(variant.customCommand, pkgInfo).replace(
              / TARGET_DIR$/,
              ""
            )
          : variant.multiStepCommands
          ? `Multi-step setup: ${variant.multiStepCommands.length} commands`
          : undefined;
        return {
          label: variantColor(variant.display || variant.name),
          value: variant.name,
          hint: command,
        };
      }),
    })) as string;
    if (prompts.isCancel(variant)) return cancel();

    template = variant;
  }

  const root = path.join(cwd, targetDir);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const selectedVariant = FRAMEWORKS.flatMap((f) => f.variants).find(
    (v) => v.name === template
  );

  // Handle multi-step commands
  if (selectedVariant?.multiStepCommands) {
    await executeMultiStepCommands(
      selectedVariant,
      targetDir,
      root,
      cwd,
      pkgInfo
    );
    createProjectFiles(template, root);

    const successMessage = generateSuccessMessage(targetDir, pkgManager);
    prompts.outro(successMessage);
    return;
  }

  // Handle custom commands
  const { customCommand } = selectedVariant ?? {};
  if (customCommand) {
    const fullCustomCommand = getFullCustomCommand(customCommand, pkgInfo);
    const [command, ...args] = fullCustomCommand.split(" ");
    const replacedArgs = args.map((arg) =>
      arg.replace("TARGET_DIR", () => targetDir)
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }

  // Handle template-based projects
  generateTemplateProject(template, root, packageName, pkgManager, cwd);
}

init().catch((e) => {
  console.error(e);
});
