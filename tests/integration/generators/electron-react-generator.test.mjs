import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distElectronReactGeneratorPath = pathToFileURL(
  path.join(process.cwd(), "dist", "generators", "electron-react.js")
).href;

const { createElectronReactFiles } = await import(distElectronReactGeneratorPath);

test("createElectronReactFiles writes Electron React augmentation files", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "create-web-kit-electron-react-")
  );

  try {
    fs.writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify(
        {
          name: "electron-react-test",
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "electron-vite dev",
            build: "electron-vite build",
          },
        },
        null,
        2
      )
    );
    createElectronReactFiles(tempRoot);

    const eslintConfigPath = path.join(tempRoot, ".eslintrc.js");
    assert.equal(fs.existsSync(eslintConfigPath), true);

    const eslintConfig = fs.readFileSync(eslintConfigPath, "utf-8");
    assert.equal(eslintConfig.includes("@electron-toolkit/eslint-config-ts"), true);
    assert.equal(eslintConfig.includes("@typescript-eslint/no-unused-vars"), true);

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "package.json"), "utf-8")
    );
    assert.equal(packageJson.scripts.dev, "electron-vite dev");
    assert.equal(packageJson.scripts.build, "electron-vite build");
    assert.equal(packageJson.scripts.format, "prettier --write .");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
