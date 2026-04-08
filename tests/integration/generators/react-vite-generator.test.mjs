import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const distReactViteGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "react-vite.js")
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

function createFixtureProject(projectRoot) {
  fs.mkdirSync(path.join(projectRoot, "src", "assets"), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, "public"), { recursive: true });

  fs.writeFileSync(
    path.join(projectRoot, "package.json"),
    JSON.stringify(
      {
        name: "react-vite-fixture",
        version: "0.0.0",
        private: true,
        scripts: {
          dev: "vite",
          build: "tsc -b && vite build",
        },
      },
      null,
      2
    ) + "\n"
  );

  fs.writeFileSync(path.join(projectRoot, "src", "App.tsx"), "export default null;\n");
  fs.writeFileSync(path.join(projectRoot, "src", "App.css"), ".app {}\n");
  fs.writeFileSync(path.join(projectRoot, "src", "main.tsx"), "console.log('old');\n");
  fs.writeFileSync(path.join(projectRoot, "src", "index.css"), "@import 'tailwindcss';\n");
  fs.writeFileSync(path.join(projectRoot, "src", "assets", "react.svg"), "<svg></svg>\n");
  fs.writeFileSync(path.join(projectRoot, "public", "vite.svg"), "<svg></svg>\n");
}

test("createReactViteFiles rewrites fixture to react-vite starter shape", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-react-vite-")
  );
  const projectRoot = path.join(tempRoot, "fixture");
  const fakeBinDir = path.join(tempRoot, "fake-bin");
  const commandLogPath = path.join(tempRoot, "commands.log");

  fs.mkdirSync(fakeBinDir, { recursive: true });

  try {
    createFixtureProject(projectRoot);
    createFakeCommandBinaries(fakeBinDir, commandLogPath);

    const runner = `
import { createReactViteFiles } from ${JSON.stringify(distReactViteGeneratorPath)};
createReactViteFiles(process.argv[1], { name: "npm", version: "10.0.0" });
`;

    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", runner, projectRoot],
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
      ".env.development",
      ".env.production",
      ".devcontainer/devcontainer.json",
      "src/App.tsx",
      "src/pages/home.tsx",
      "src/components/build-info.tsx",
      "src/components/providers/query-provider.tsx",
      "src/lib/request.ts",
    ];

    for (const relativePath of expectedFiles) {
      assert.equal(
        fs.existsSync(path.join(projectRoot, relativePath)),
        true,
        `missing generated file: ${relativePath}`
      );
    }

    const removedFiles = ["src/App.css", "src/assets/react.svg", "public/vite.svg"];
    for (const relativePath of removedFiles) {
      assert.equal(
        fs.existsSync(path.join(projectRoot, relativePath)),
        false,
        `file should have been removed: ${relativePath}`
      );
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
    );
    assert.equal(pkg.scripts.prepare, "husky");
    assert.equal(pkg.scripts.format, "prettier --write .");
    assert.equal(pkg["lint-staged"]["**/*.{js,jsx,ts,tsx,json,css,md}"][0], "prettier --write");
    assert.equal(pkg.keywords.includes("react"), true);
    assert.equal(pkg.keywords.includes("spa"), true);

    const commandLog = fs.readFileSync(commandLogPath, "utf-8");
    assert.equal(commandLog.includes("git init"), true);
    assert.equal(commandLog.includes("npx husky install"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
