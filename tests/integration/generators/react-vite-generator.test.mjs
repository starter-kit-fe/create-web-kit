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
createReactViteFiles(process.argv[1], undefined, { noGit: true });
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
      "src/App.tsx",
      "index.html",
      "vite.config.ts",
      "README.md",
      "src/views/home/index.tsx",
      "src/views/about/index.tsx",
      "public/_headers",
      "public/app-update-checker.worker.js",
      "src/components/ui/animated-segmented-tabs.tsx",
      "src/components/ui/sweep-shine.tsx",
      "src/components/cookie-consent-banner.tsx",
      "src/components/update-available-notice.tsx",
      "src/components/providers/app-update-checker.tsx",
      "src/components/providers/route-progress.tsx",
      "src/store/app-update.ts",
      "src/components/theme-toggle.tsx",
      "src/components/providers/theme-provider.tsx",
      "src/hooks/use-theme.ts",
      "src/hooks/use-mobile.ts",
      "src/store/theme.ts",
      "src/index.css",
      "src/layout/index.tsx",
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

    const read = (file) => fs.readFileSync(path.join(projectRoot, file), "utf-8");
    assert.match(read("src/main.tsx"), /BrowserRouter/);
    assert.match(read("src/main.tsx"), /<RouteProgress \/>/);
    assert.match(read("src/index.css"), /#nprogress/);
    assert.doesNotMatch(read("src/main.tsx"), /HashRouter/);
    assert.match(read("src/main.tsx"), /<Provider>/);
    assert.match(read("src/main.tsx"), /<ThemeProvider>/);
    assert.match(read("src/views/home/index.tsx"), /zodResolver\(schema\)/);
    assert.match(read("src/views/home/index.tsx"), /prefers-reduced-motion/);
    assert.match(read("src/views/home/index.tsx"), /media\.revert\(\)/);
    assert.match(read("src/App.tsx"), /path="\/about"/);
    assert.match(read("src/App.tsx"), /from "@\/views\/home"/);
    assert.match(read("src/App.tsx"), /<Route element={<AppLayout \/>}>/);
    assert.match(read("src/layout/index.tsx"), /<Outlet \/>/);
    assert.match(read("src/layout/index.tsx"), /<ThemeToggle \/>/);
    assert.match(read("src/layout/index.tsx"), /<AnimatedSegmentedTabs/);
    assert.match(read("src/layout/index.tsx"), /navigate\(value\)/);
    assert.match(read("src/layout/index.tsx"), /useLocation/);
    assert.match(read("src/layout/index.tsx"), /<AppUpdateChecker \/>/);
    assert.match(read("src/layout/index.tsx"), /<CookieConsentBanner \/>/);
    assert.match(read("src/components/cookie-consent-banner.tsx"), /\/about#cookies/);
    assert.match(read("src/views/about/index.tsx"), /id="cookies"/);
    assert.match(read("src/index.css"), /@keyframes sweep-shine/);
    assert.doesNotMatch(read("src/App.tsx"), /<header|<footer/);
    assert.match(read("public/_headers"), /frame-ancestors 'none'/);
    assert.match(read("src/store/theme.ts"), /atomWithStorage/);
    assert.match(read("src/components/theme-toggle.tsx"), /<Drawer>/);
    assert.match(read("src/components/theme-toggle.tsx"), /<DropdownMenu>/);
    assert.match(read("src/index.css"), /data-layout="centered"/);
    assert.ok(read("src/index.css").startsWith("@import 'tailwindcss';\n"));
    assert.equal(read("src/index.css").split("/* Create Web Kit global styles */").length, 2);
    assert.equal(fs.existsSync(path.join(projectRoot, "src/styles/appearance.css")), false);
    assert.deepEqual(read("src/main.tsx").match(/import "[^\"]+\.css";/g), ['import "@/index.css";']);
    assert.match(read("index.html"), /document\.documentMode/);
    assert.ok(read("index.html").indexOf("document.documentMode") < read("index.html").indexOf('type="module"'));

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
    assert.equal(commandLog.includes("npx husky\n"), true);
    assert.equal(commandLog.includes("husky install"), false);
    assert.doesNotMatch(read(".husky/pre-commit"), /husky\.sh/);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
