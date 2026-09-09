import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../../../dist/templates/react-vite/public/app-update-checker.worker.js", import.meta.url), "utf8");
const tick = () => new Promise((resolve) => setImmediate(resolve));
function response(etag, status = 200, lastModified = null) {
  return { ok: status >= 200 && status < 300, status,
    headers: { get: (key) => key === "etag" ? etag : lastModified },
    body: { cancel: async () => {} },
  };
}
function createWorker(fetcher) {
  const messages = [];
  const requests = [];
  let listener;
  vm.runInNewContext(source, {
    URL, Error,
    self: { addEventListener: (_, callback) => { listener = callback; }, postMessage: (message) => messages.push(message) },
    fetch: (...args) => { requests.push(args); return fetcher(...args); },
  });
  return { messages, requests, send: (url = "https://example.com/app/index.html", extra = {}) => listener({ data: { type: "check", url, ...extra } }) };
}

test("worker compares file validators, normalizes cache-busting URLs, and never advances a changed baseline", async () => {
  let etag = '"v1"';
  const worker = createWorker(async () => response(etag));
  worker.send("https://example.com/app/index.html?t=1#home"); await tick();
  worker.send("https://example.com/app/index.html?t=2#about"); await tick();
  etag = '"v2"';
  worker.send(); await tick();
  worker.send(); await tick();
  assert.deepEqual(worker.messages.map((m) => m.type), ["baseline", "unchanged", "changed", "changed"]);
  assert.equal(worker.requests[0][0], "https://example.com/app/index.html");
  assert.equal(worker.requests[0][1].method, "HEAD");
  assert.equal(worker.requests[0][1].cache, "no-cache");
  assert.equal(worker.requests[0][1].credentials, "same-origin");
  assert.equal(worker.messages[2].previous.etag, '"v1"');
});

test("worker quietly reports missing validators and supports Last-Modified", async () => {
  let modified = null;
  const worker = createWorker(async () => response(null, 200, modified));
  worker.send(); await tick();
  modified = "Mon, 01 Jun 2026 00:00:00 GMT";
  worker.send(); await tick();
  modified = "Tue, 02 Jun 2026 00:00:00 GMT";
  worker.send(); await tick();
  assert.deepEqual(worker.messages.map((m) => m.type), ["unavailable", "baseline", "changed"]);
});

test("worker falls back to GET only for unsupported HEAD and cancels the body", async () => {
  for (const status of [405, 501]) {
    let cancelled = false;
    const worker = createWorker(async (_, options) => options.method === "HEAD" ? response(null, status) : {
      ...response('"v1"'), body: { cancel: async () => { cancelled = true; } },
    });
    worker.send(); await tick();
    assert.deepEqual(worker.requests.map((r) => r[1].method), ["HEAD", "GET"]);
    assert.equal(cancelled, true);
    assert.equal(worker.messages[0].type, "baseline");
  }
  const failed = createWorker(async () => response(null, 500));
  failed.send(); await tick();
  assert.equal(failed.requests.length, 1);
  assert.equal(failed.messages[0].type, "error");
});

test("worker deduplicates in-flight requests, rejects invalid URLs and recovers after network errors", async () => {
  let resolve;
  const worker = createWorker(() => new Promise((done) => { resolve = done; }));
  worker.send("not a URL");
  worker.send(); worker.send();
  assert.equal(worker.requests.length, 1);
  resolve(response('"v1"')); await tick();
  worker.send();
  assert.equal(worker.requests.length, 2);
  resolve(response('"v1"')); await tick();
  let failed = true;
  const retry = createWorker(async () => { if (failed) throw new Error("offline"); return response('"v1"'); });
  retry.send(); await tick(); failed = false;
  retry.send(); await tick();
  assert.deepEqual(retry.messages.map((m) => m.type), ["error", "baseline"]);
});
