import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { runOperation } from "../../../dist/core/operations/command.js";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "create-web-batch-"));
  const logs = [];
  const context = { cwd: root, root, targetDir: ".", packageName: "fixture", pkgInfo: { name: "npm" }, pkgManager: "npm", noGit: true, noInstall: false, verbose: false, yes: true,
    logger: Object.fromEntries(["step", "info", "warn", "error", "debug"].map((method) => [method, (message) => logs.push([method, message])])),
  };
  return { root, context, logs };
}

test("mixed dependencies are classified and installed in one command for every package manager", () => {
  const { root, context } = fixture();
  const previousPath = process.env.PATH;
  try {
    const bin = path.join(root, "bin"); fs.mkdirSync(bin);
    for (const pm of ["npm", "pnpm", "yarn", "bun"]) {
      fs.writeFileSync(path.join(bin, pm), '#!/bin/sh\nprintf "%s\\n" "$*" >> commands.log\n', { mode: 0o755 });
      fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ dependencies: { react: "^19.0.0" }, devDependencies: { promoted: "^1.2.0", typescript: "^5.0.0" } }));
      process.env.PATH = `${bin}:${previousPath}`;
      runOperation({ kind: "install-packages", description: "batch", packages: ["react", "jotai", "promoted"], devPackages: ["typescript", "prettier"], quiet: true }, { ...context, pkgManager: pm, pkgInfo: { name: pm } });
      const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
      assert.deepEqual(pkg.dependencies, { react: "^19.0.0", jotai: "latest", promoted: "^1.2.0" });
      assert.deepEqual(pkg.devDependencies, { typescript: "^5.0.0", prettier: "latest" });
    }
    assert.deepEqual(fs.readFileSync(path.join(root, "commands.log"), "utf8").trim().split("\n"), ["install", "install", "install", "install"]);
    fs.rmSync(path.join(root, "commands.log"));
    runOperation({ kind: "install-packages", description: "skip", packages: ["unused"], devPackages: ["unused-dev"], quiet: true }, { ...context, noInstall: true });
    assert.equal(fs.existsSync(path.join(root, "commands.log")), false);
  } finally { process.env.PATH = previousPath; fs.rmSync(root, { recursive: true, force: true }); }
});

test("quiet operations suppress successful child logs, auto-confirm downloads, and expose errors", () => {
  const { root, context, logs } = fixture();
  try {
    fs.writeFileSync(path.join(root, "success.cjs"), 'if(process.env.npm_config_yes !== "true") process.exit(9); console.log("duplicate tool advice");');
    runOperation({ kind: "command", description: "quiet success", command: 'node success.cjs', quiet: true, autoConfirm: true }, context);
    assert.ok(logs.some(([kind, message]) => kind === "info" && message.startsWith("Completed in")));
    assert.ok(logs.every(([, message]) => !message.includes("duplicate tool advice")));
    const runner = `
      import { runOperation } from ${JSON.stringify(new URL("../../../dist/core/operations/command.js", import.meta.url).href)};
      const context = ${JSON.stringify({ ...context, verbose: true })};
      context.logger = Object.fromEntries(["step", "info", "warn", "error", "debug"].map(name => [name, () => {}]));
      runOperation({ kind: "command", description: "verbose", command: "node success.cjs", quiet: true, autoConfirm: true }, context);
    `;
    const verbose = spawnSync(process.execPath, ["--input-type=module", "-e", runner], { encoding: "utf8" });
    assert.equal(verbose.status, 0);
    assert.match(verbose.stdout, /duplicate tool advice/);
    fs.writeFileSync(path.join(root, "failure.cjs"), 'console.log("diagnostic stdout");console.error("diagnostic stderr");process.exit(2);');
    assert.throws(() => runOperation({ kind: "command", description: "failure", command: 'node failure.cjs', quiet: true }, context), (error) => {
      assert.match(error.message, /diagnostic stdout/);
      assert.match(error.message, /diagnostic stderr/);
      return true;
    });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
