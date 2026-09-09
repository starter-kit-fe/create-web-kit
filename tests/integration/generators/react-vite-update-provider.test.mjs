import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../../../dist/templates/react-vite/src/components/providers/app-update-checker.tsx", import.meta.url), "utf8");
function mount(prod = true) {
  const state = { requests: [], available: false, worker: null, cleanup: null, notice: null, replaced: null };
  const documentListeners = new Map();
  const document = { visibilityState: "visible", addEventListener: (name, fn) => documentListeners.set(name, fn), removeEventListener: (name) => documentListeners.delete(name) };
  const context = {
    exports: {}, URL, console, document,
    env: { PROD: prod, BASE_URL: "/app/", VITE_BUILD_TIME: "2026-01-01T00:00:00.000Z" },
    window: { location: { origin: "https://example.com", protocol: "https:", href: "https://example.com/app/about?filter=a#cookies", replace: (url) => { state.replaced = url; } } },
    Worker: class {
      listeners = new Map();
      terminated = false;
      constructor(url) { this.url = url; state.worker = this; }
      addEventListener(name, fn) { this.listeners.set(name, fn); }
      removeEventListener(name) { this.listeners.delete(name); }
      postMessage(message) { state.requests.push(message); }
      terminate() { this.terminated = true; }
    },
    require(name) {
      if (name === "react") return { useEffect: (effect) => { state.cleanup = effect(); } };
      if (name === "jotai") return { useAtom: () => [false, (value) => { state.available = value; }] };
      if (name === "react/jsx-runtime") return { jsx: (_, props) => { state.notice = props; } };
      return {};
    },
  };
  vm.runInNewContext(ts.transpileModule(source.replaceAll("import.meta.env", "env"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  context.exports.AppUpdateChecker();
  return { state, document, documentListeners };
}

test("provider uses a base-aware worker and stable HTML URL, and checks only when visible", () => {
  const { state, document, documentListeners } = mount();
  assert.equal(state.worker.url.pathname, "/app/app-update-checker.worker.js");
  assert.equal(state.requests[0].url, "https://example.com/app/index.html");
  assert.equal(state.requests.length, 1);
  document.visibilityState = "hidden";
  documentListeners.get("visibilitychange")();
  assert.equal(state.requests.length, 1);
  document.visibilityState = "visible";
  documentListeners.get("visibilitychange")();
  assert.equal(state.requests.length, 2);
  state.worker.listeners.get("message")({ data: { type: "baseline" } });
  assert.equal(state.available, false);
  state.worker.listeners.get("message")({ data: { type: "changed" } });
  assert.equal(state.available, true);
  state.notice.onOpenChange(false);
  assert.equal(state.available, false);
  state.notice.onUpdate();
  const updated = new URL(state.replaced);
  assert.equal(updated.pathname, "/app/about");
  assert.equal(updated.searchParams.get("filter"), "a");
  assert.ok(updated.searchParams.get("t"));
  assert.equal(updated.hash, "#cookies");
  state.cleanup();
  assert.equal(state.worker.terminated, true);
  assert.equal(state.worker.listeners.size, 0);
  assert.equal(documentListeners.size, 0);
});

test("provider does not start a worker in development or use polling intervals", () => {
  assert.equal(mount(false).state.worker, null);
  assert.doesNotMatch(source, /setInterval|setTimeout|addEventListener\(["']focus/);
});
