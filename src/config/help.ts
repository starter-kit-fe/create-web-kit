import colors from "picocolors";

const { blue, cyan, green, magenta, redBright, yellow } = colors;

// prettier-ignore
export const helpMessage = `\
Usage: create-starter-kit [OPTION]... [DIRECTORY]

Create a new starter project with various templates.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${cyan      ('nextjs-csr     Next.js CSR + ShadcnUI')}
${blue      ('nextjs-ssr     Next.js SSR + ShadcnUI')}
${green     ('vue3           Vue 3 + TypeScript + Vite')}
${cyan      ('electron-react Electron + React + TS')}
${green     ('electron-vue   Electron + Vue 3 + TS')}`;
