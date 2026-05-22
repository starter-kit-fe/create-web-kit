import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { runOperation } from "../../../dist/core/operations/command.js";

function writeExecutable(filePath, content) {
  fs.writeFileSync(filePath, content, "utf-8");
  fs.chmodSync(filePath, 0o755);
}

function createContext(tempRoot, projectRoot) {
  return {
    cwd: tempRoot,
    root: projectRoot,
    targetDir: path.relative(tempRoot, projectRoot),
    packageName: path.basename(projectRoot),
    pkgInfo: { name: "pnpm", version: "9.0.0" },
    pkgManager: "pnpm",
    noGit: false,
    noInstall: false,
    verbose: false,
    yes: true,
    logger: {
      step() {},
      info() {},
      warn() {},
      error() {},
      debug() {},
    },
  };
}

test("create operation can run from target parent with target basename", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "create-web-kit-op-"));
  const fakeBinDir = path.join(tempRoot, "bin");
  const projectRoot = path.join(tempRoot, "nested", "app");
  const logPath = path.join(tempRoot, "commands.log");
  const previousPath = process.env.PATH;

  try {
    fs.mkdirSync(fakeBinDir, { recursive: true });
    writeExecutable(
      path.join(fakeBinDir, "pnpm"),
      `#!/bin/sh
printf 'cwd=%s\\nargs=%s\\n' "$(pwd)" "$*" >> "${logPath}"
if [ "$1" = "create" ]; then
  mkdir -p "$3"
  printf '{}\\n' > "$3/package.json"
fi
exit 0
`
    );

    process.env.PATH = `${fakeBinDir}:${process.env.PATH ?? ""}`;

    runOperation(
      {
        kind: "create",
        description: "Creating fixture project",
        packageName: "fixture@latest",
        args: ["--skip"],
        targetArgument: "targetBasename",
        workingDir: "target-parent",
      },
      createContext(tempRoot, projectRoot)
    );

    const commandLog = fs.readFileSync(logPath, "utf-8");
    assert.equal(
      fs.realpathSync(commandLog.match(/^cwd=(.*)$/m)?.[1] ?? ""),
      fs.realpathSync(path.dirname(projectRoot))
    );
    assert.equal(commandLog.includes("args=create fixture@latest app --skip"), true);
    assert.equal(fs.existsSync(path.join(projectRoot, "package.json")), true);
  } finally {
    process.env.PATH = previousPath;
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
