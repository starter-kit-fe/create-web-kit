import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { reactViteVariantDefinition } from "../../../dist/variants/react-vite.js";
import { splitCommand } from "../../../dist/utils/command.js";

const html = fs.readFileSync(new URL("../../../dist/templates/react-vite/index.html", import.meta.url), "utf8");
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function runBootstrap({ ie = false, theme = null, dark = false, blocked = false, framed = false } = {}) {
  const root = { className: "", style: {}, classList: { toggle(name, enabled) { root.className = enabled ? name : ""; } }, setAttribute() {} };
  vm.runInNewContext(bootstrap, {
    document: { documentElement: root, documentMode: ie ? 11 : undefined },
    navigator: { userAgent: ie ? "Trident/7.0" : "Mozilla/5.0" },
    window: { self: 1, top: framed ? 2 : 1, matchMedia: () => ({ matches: dark }) },
    localStorage: { getItem(key) { if (blocked) throw new Error("blocked"); return key === "theme" ? theme : null; } },
  });
  return root;
}

test("IE sees an unsupported-browser message without executing React", () => {
  assert.equal(runBootstrap({ ie: true }).className, "unsupported-browser");
  assert.match(html, /不支持 Internet Explorer/);
  assert.match(html, /\.unsupported-browser #unsupported-browser/);
});

test("mobile Safari defaults and frame fallback are present before React starts", () => {
  assert.equal(runBootstrap({ framed: true }).className, "embedded-browser");
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /touch-action: manipulation/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /format-detection/);
  assert.match(html, /\.embedded-browser body/);
});

test("theme bootstrap restores explicit and system appearance and tolerates blocked storage", () => {
  assert.equal(runBootstrap({ theme: "dark" }).className, "dark");
  assert.equal(runBootstrap({ theme: "light", dark: true }).className, "");
  assert.equal(runBootstrap({ theme: "system", dark: true }).style.colorScheme, "dark");
  assert.doesNotThrow(() => runBootstrap({ blocked: true }));
});

test("React Vite operations install the requested stack and configure shadcn prerequisites", () => {
  const operations = reactViteVariantDefinition.operations;
  const scaffoldArgs = splitCommand(operations[0].command);
  assert.ok(scaffoldArgs.includes("--no-immediate"));
  assert.ok(scaffoldArgs.includes("--no-interactive"));
  const installs = operations.filter((op) => op.kind === "install-packages");
  assert.equal(installs.length, 1);
  const packages = installs.flatMap((op) => [...op.packages, ...(op.devPackages ?? [])]);
  assert.ok(installs[0].devPackages.includes("tailwindcss"));
  assert.ok(installs[0].packages.includes("@tanstack/react-table"));
  assert.ok(operations.every((op) => op.quiet));
  for (const name of ["zod", "react-hook-form", "@hookform/resolvers", "jotai", "gsap", "@gsap/react", "react-router-dom", "@tailwindcss/vite", "@tanstack/react-table", "nprogress", "@types/nprogress"]) {
    assert.ok(packages.includes(name), `missing dependency: ${name}`);
  }
  const prepare = operations.findIndex((op) => op.description === "Configuring Tailwind CSS and import aliases");
  const init = operations.findIndex((op) => op.kind === "dlx" && op.args[0] === "init");
  assert.ok(prepare < init);
  assert.ok(operations[init].args.includes("radix"));
  const add = operations.findIndex((op) => op.kind === "dlx" && op.packageName === "shadcn@latest" && op.args[0] === "add");
  assert.ok(add > init);
  assert.deepEqual(operations[add].args, ["add", "--all", "--yes"]);
  assert.equal(operations[add].workingDir, "target");
  const args = splitCommand(operations[prepare].command);
  assert.deepEqual(args.slice(0, 2), ["node", "-e"]);
  assert.doesNotThrow(() => new vm.Script(args[2]));
  assert.doesNotMatch(args[2], /baseUrl/);
  assert.match(args[2], /"resolveJsonModule": true/);
  assert.equal(args[2].split('"@/*": ["./src/*"]').length - 1, 2);
});
