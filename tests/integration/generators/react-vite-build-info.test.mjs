import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const template = (file) => fs.readFileSync(new URL(`../../../dist/templates/react-vite/${file}`, import.meta.url), "utf8");
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

test("BuildInfo prints styled metadata once and puts other variables in a collapsed table", () => {
  const env = {
    VITE_BUILD_TIME: "2026-01-02T03:04:05.000Z",
    MODE: "production",
    VITE_API_BASE_URL: "/api",
  };
  const calls = [];
  const context = {
    exports: {},
    env,
    console: Object.fromEntries(["log", "groupCollapsed", "table", "groupEnd"].map((method) => [method, (...args) => calls.push([method, ...args])])),
    require(name) {
      if (name === "react") return { useEffect: (effect) => { effect(); effect(); } };
      if (name === "../../package.json") return { name: "fixture", version: "1.2.3" };
      if (name === "date-fns") return {
        parseISO: (value) => { assert.equal(value, env.VITE_BUILD_TIME); return new Date(value); },
        format: (value, pattern) => {
          assert.equal(value.toISOString(), env.VITE_BUILD_TIME);
          assert.equal(pattern, "yyyy-MM-dd HH:mm:ss xxx");
          return "2026-01-02 11:04:05 +08:00";
        },
      };
      return { jsx() {}, jsxs() {} };
    },
  };
  vm.runInNewContext(transpile(template("src/components/build-info.tsx").replaceAll("import.meta.env", "env")), context);
  context.exports.BuildInfo();
  context.exports.BuildInfo();
  assert.deepEqual(calls.map(([method]) => method), ["log", "log", "groupCollapsed", "table", "groupEnd"]);
  assert.equal(calls[0][1], "%c fixture %c 1.2.3 %c ");
  assert.match(calls[0][2], /background:#20232a/);
  assert.match(calls[0][3], /background:#61dafb/);
  assert.equal(calls[1][1], "%c build time %c 2026-01-02 11:04:05 +08:00 %c ");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[3][1])), [
    { key: "MODE", value: "production" },
    { key: "VITE_API_BASE_URL", value: "/api" },
  ]);
});

function loadConfig() {
  const context = {
    exports: {},
    URL,
    require(name) {
      if (name === "vite") return {
        defineConfig: (config) => config,
      };
      if (name === "node:url") return { fileURLToPath: (url) => url.pathname, URL };
      return { default: () => ({}) };
    },
  };
  vm.runInNewContext(transpile(template("vite.config.ts").replaceAll("import.meta.url", '"file:///fixture/vite.config.ts"')), context);
  return context.exports.default({ mode: "development" });
}

test("Vite injects only the build timestamp and defaults to a local strict-port server", () => {
  const start = Date.now();
  const config = loadConfig();
  const timestamp = Date.parse(JSON.parse(config.define["import.meta.env.VITE_BUILD_TIME"]));
  assert.ok(timestamp >= start && timestamp <= Date.now());
  assert.deepEqual(Object.keys(config.define), ["import.meta.env.VITE_BUILD_TIME"]);
  assert.equal(config.resolve.alias["@"], "/fixture/src");
  assert.equal(config.server.host, "127.0.0.1");
  assert.equal(config.server.port, 5173);
  assert.equal(config.server.strictPort, true);
  assert.equal(config.server.open, false);
  assert.doesNotMatch(template("vite.config.ts"), /loadEnv|DEV_HOST|DEV_PORT|DEV_PROXY_TARGET/);
});

test("development proxy and anti-framing headers have fixed defaults", () => {
  const config = loadConfig();
  assert.equal(config.server.proxy["/api"].target, "http://localhost:3000");
  assert.equal(config.server.proxy["/api"].changeOrigin, true);
  assert.equal(config.server.proxy["/api"].rewrite, undefined);
  for (const server of [config.server, config.preview]) {
    assert.equal(server.headers["Content-Security-Policy"], "frame-ancestors 'none'");
    assert.equal(server.headers["X-Frame-Options"], "DENY");
  }
});
