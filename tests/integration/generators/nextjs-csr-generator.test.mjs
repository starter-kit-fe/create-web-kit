import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const distNextjsCsrGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "nextjs-csr.js")
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
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.mkdirSync(path.join(projectRoot, ".git"), { recursive: true });
  fs.writeFileSync(
    path.join(projectRoot, "package.json"),
    JSON.stringify(
      {
        name: "nextjs-csr-fixture",
        version: "0.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
        },
      },
      null,
      2
    ) + "\n"
  );
}

test("createNextjsCSRFiles copies key files and updates package.json with isolated husky install", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-nextjs-csr-")
  );
  const projectRoot = path.join(tempRoot, "fixture");
  const fakeBinDir = path.join(tempRoot, "fake-bin");
  const commandLogPath = path.join(tempRoot, "commands.log");

  fs.mkdirSync(fakeBinDir, { recursive: true });

  try {
    createFixtureProject(projectRoot);
    createFakeCommandBinaries(fakeBinDir, commandLogPath);

    const runner = `
import { createNextjsCSRFiles } from ${JSON.stringify(
      distNextjsCsrGeneratorPath
    )};
createNextjsCSRFiles(process.argv[1]);
`;

    const result = spawnSync(process.execPath, ["--input-type=module", "-e", runner, projectRoot], {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: {
        ...process.env,
        PATH: `${fakeBinDir}:${process.env.PATH ?? ""}`,
      },
    });

    assert.equal(
      result.status,
      0,
      `generator process failed: ${result.stderr || result.stdout}`
    );

    const expectedFiles = [
      ".prettierrc",
      "eslint.config.mjs",
      "next.config.ts",
      ".env.development",
      ".env.production",
      ".env.stage",
      ".devcontainer/devcontainer.json",
      "scripts/build-stage.mjs",
      "src/app/layout.tsx",
      "src/config/site.ts",
      "src/components/providers/index.tsx",
      "src/lib/request.ts",
      ".husky/pre-commit",
      ".husky/_/husky.sh",
      "public/ie.html",
    ];

    for (const relativePath of expectedFiles) {
      assert.equal(
        fs.existsSync(path.join(projectRoot, relativePath)),
        true,
        `missing generated file: ${relativePath}`
      );
    }

    const ieHtml = fs.readFileSync(path.join(projectRoot, "public", "ie.html"), "utf-8");
    assert.equal(ieHtml.startsWith("<!DOCTYPE html>"), true);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
    );

    assert.equal(pkg.scripts.prepare, "husky");
    assert.equal(
      pkg.scripts["build:stage"],
      "node scripts/build-stage.mjs"
    );
    assert.deepEqual(pkg["lint-staged"], {
      "**/*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
      "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
    });
    assert.equal("seo" in pkg, false);

    const commandLog = fs.readFileSync(commandLogPath, "utf-8");
    assert.equal(commandLog.includes("npx husky install"), true);
    assert.equal(commandLog.includes("git init"), false);

    const preCommit = fs.readFileSync(
      path.join(projectRoot, ".husky", "pre-commit"),
      "utf-8"
    );
    assert.equal(preCommit.includes("npx lint-staged"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("createNextjsCSRFiles skips git-specific setup when noGit is enabled", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-nextjs-csr-no-git-")
  );
  const projectRoot = path.join(tempRoot, "fixture");

  try {
    createFixtureProject(projectRoot);

    const runner = `
import { createNextjsCSRFiles } from ${JSON.stringify(
      distNextjsCsrGeneratorPath
    )};
createNextjsCSRFiles(process.argv[1], undefined, { noGit: true });
`;

    const result = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", runner, projectRoot],
      {
        cwd: process.cwd(),
        encoding: "utf-8",
      }
    );

    assert.equal(
      result.status,
      0,
      `generator process failed: ${result.stderr || result.stdout}`
    );

    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8")
    );

    assert.equal(pkg.scripts.prepare, undefined);
    assert.equal(pkg["lint-staged"], undefined);
    assert.equal(typeof pkg.scripts["build:stage"], "string");
    assert.equal(fs.existsSync(path.join(projectRoot, ".husky")), false);
    assert.equal(fs.existsSync(path.join(projectRoot, "public", "ie.html")), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
