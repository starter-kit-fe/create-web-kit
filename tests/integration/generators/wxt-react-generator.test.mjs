import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const distWxtReactGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "wxt-react.js")
).href;

function writeExecutable(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
  fs.chmodSync(filePath, 0o755);
}

function createFakeCommandBinaries(binDir, logPath) {
  const gitPath = path.join(binDir, "git");
  const npxPath = path.join(binDir, "npx");

  writeExecutable(
    gitPath,
    `#!/bin/sh
echo "git $@" >> "${logPath}"
exit 0
`
  );

  writeExecutable(
    npxPath,
    `#!/bin/sh
echo "npx $@" >> "${logPath}"
exit 0
`
  );
}

test("createWxtReactFiles writes entrypoints and prepares git tooling", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-wxt-react-")
  );
  const fakeBinDir = path.join(tempRoot, "fake-bin");
  const commandLogPath = path.join(tempRoot, "commands.log");

  fs.mkdirSync(fakeBinDir, { recursive: true });

  try {
    fs.writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify(
        {
          name: "wxt-react-fixture",
          version: "0.0.0",
          private: true,
          scripts: {
            dev: "wxt",
            build: "wxt build",
          },
        },
        null,
        2
      ) + "\n"
    );

    createFakeCommandBinaries(fakeBinDir, commandLogPath);

    const runner = `
import { createWxtReactFiles } from ${JSON.stringify(distWxtReactGeneratorPath)};
createWxtReactFiles(process.argv[1], { name: "npm", version: "10.0.0" });
`;

    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", runner, tempRoot],
      {
        cwd: process.cwd(),
        encoding: "utf-8",
        env: {
          ...process.env,
          PATH: `${fakeBinDir}:${process.env.PATH ?? ""}`,
        },
      }
    );

    assert.equal(
      result.status,
      0,
      `generator process failed: ${result.stderr || result.stdout}`
    );

    const expectedFiles = [
      ".prettierrc",
      ".env.example",
      "wxt.config.ts",
      "entrypoints/background.ts",
      "entrypoints/content.ts",
      "entrypoints/popup/App.tsx",
      "entrypoints/popup/main.tsx",
      "entrypoints/options/App.tsx",
      "entrypoints/options/main.tsx",
      "src/components/extension-shell.tsx",
      "src/lib/storage.ts",
      "src/styles/ui.css",
    ];

    for (const relativePath of expectedFiles) {
      assert.equal(
        fs.existsSync(path.join(tempRoot, relativePath)),
        true,
        `missing generated file: ${relativePath}`
      );
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "package.json"), "utf-8")
    );
    assert.equal(pkg.scripts.prepare, "husky");
    assert.equal(pkg.scripts.typecheck, "tsc --noEmit");
    assert.equal(pkg.keywords.includes("wxt"), true);
    assert.equal(pkg.keywords.includes("manifest-v3"), true);

    const commandLog = fs.readFileSync(commandLogPath, "utf-8");
    assert.equal(commandLog.includes("git init"), true);
    assert.equal(commandLog.includes("npx husky install"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
