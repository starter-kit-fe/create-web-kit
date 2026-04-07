import colors from "picocolors";
import { REGISTRY_VARIANTS } from "../registry/index.js";

const { blue, cyan, green, yellow } = colors;

const colorByTemplateId: Record<string, (text: string) => string> = {
  "nextjs-csr": cyan,
  "nextjs-ssr": blue,
  vue3: green,
  "electron-react": cyan,
  "electron-vue": green,
  userscript: yellow,
};

export function createHelpMessage(): string {
  const templatePadding = Math.max(
    ...REGISTRY_VARIANTS.map((variant) => variant.id.length),
    12
  );

  const templateLines = REGISTRY_VARIANTS.map((variant) => {
    const color = colorByTemplateId[variant.id] ?? variant.color;
    return color(
      `${variant.id.padEnd(templatePadding)} ${variant.displayName}`
    );
  }).join("\n");

  return `Usage: create-web-kit [OPTIONS] [DIRECTORY]

Create a new web project with official scaffolds plus integrated tooling.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template
  -y, --yes                  use defaults and skip this CLI's prompts
  --package-manager PM   force one of: npm, pnpm, yarn, bun
      --no-install           skip additional dependency install steps
      --no-git               skip git-specific setup where supported
      --verbose              print extra execution details
      --overwrite            remove existing files in the target directory
  -h, --help                 display this help message

Available templates:
${templateLines}`;
}

export const helpMessage = createHelpMessage();
