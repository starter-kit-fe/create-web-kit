import colors from "picocolors";

const { blue, cyan, green, yellow } = colors;

// prettier-ignore
export const helpMessage = `\
Usage: create-web-kit [OPTIONS] [DIRECTORY]

Create a new web project with official scaffolds plus integrated tooling.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template
      --overwrite            remove existing files in the target directory
  -h, --help                 display this help message

Available templates:
${cyan      ('nextjs-csr     Next.js CSR + ShadcnUI')}
${blue      ('nextjs-ssr     Next.js SSR + ShadcnUI')}
${green     ('vue3           Vue 3 + TypeScript + Vite')}
${cyan      ('electron-react Electron + React + TS')}
${green     ('electron-vue   Electron + Vue 3 + TS')}
${yellow    ('userscript     Userscript + Vanilla TS')}`;
