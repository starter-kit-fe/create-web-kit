import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../../../dist/templates/react-vite/src/components/providers/route-progress.tsx", import.meta.url), "utf8");
function createHarness(reducedMotion = false) {
  let key = "initial";
  let ref;
  let hook = 0;
  let nextTimer = 0;
  const effects = [];
  const timers = new Map();
  const calls = [];
  const progress = Object.fromEntries(["configure", "start", "done", "remove"].map((name) => [name, (...args) => calls.push([name, ...args])]));
  const context = {
    exports: {},
    window: {
      matchMedia: () => ({ matches: reducedMotion }),
      setTimeout: (callback) => { timers.set(++nextTimer, callback); return nextTimer; },
      clearTimeout: (id) => timers.delete(id),
    },
    require(name) {
      if (name === "react-router-dom") return { useLocation: () => ({ key }) };
      if (name === "nprogress") return { default: progress };
      return {
        useRef: (value) => ref ??= { current: value },
        useLayoutEffect: (effect, deps) => {
          const index = hook++;
          const previous = effects[index];
          if (previous && deps.every((value, i) => value === previous.deps[i])) return;
          previous?.cleanup?.();
          effects[index] = { deps, cleanup: effect() };
        },
      };
    },
  };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return {
    calls, timers,
    render(nextKey = key) { key = nextKey; hook = 0; context.exports.RouteProgress(); },
    complete() { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach((callback) => callback()); },
    unmount() { effects.forEach((effect) => effect.cleanup?.()); },
  };
}

test("route progress skips initial render, handles route changes and completes", () => {
  const app = createHarness();
  app.render();
  assert.deepEqual(app.calls.map(([name]) => name), ["configure"]);
  assert.equal(app.calls[0][1].showSpinner, false);
  app.render("about");
  assert.equal(app.calls.at(-1)[0], "start");
  assert.equal(app.timers.size, 1);
  app.complete();
  assert.equal(app.calls.at(-1)[0], "done");
  app.render("initial"); // History back uses an earlier location key.
  assert.equal(app.calls.at(-1)[0], "start");
});

test("rapid navigations cancel stale completion timers and unmount removes progress", () => {
  const app = createHarness();
  app.render(); app.render("about"); app.render("home");
  assert.equal(app.timers.size, 1);
  app.render("home");
  assert.equal(app.calls.filter(([name]) => name === "start").length, 2);
  app.unmount();
  assert.equal(app.timers.size, 0);
  assert.deepEqual(app.calls.slice(-2).map(([name]) => name), ["done", "remove"]);
});

test("route progress respects reduced motion", () => {
  const app = createHarness(true);
  app.render();
  assert.equal(app.calls[0][1].trickle, false);
  assert.equal(app.calls[0][1].speed, 0);
});
