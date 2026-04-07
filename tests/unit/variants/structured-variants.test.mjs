import test from "node:test";
import assert from "node:assert/strict";

import { resolveVariantDefinition } from "../../../dist/core/definition.js";
import { findStructuredVariantDefinition } from "../../../dist/variants/index.js";

test("structured variant registry exposes migrated variants", () => {
  assert.ok(findStructuredVariantDefinition("electron-react"));
  assert.ok(findStructuredVariantDefinition("electron-vue"));
  assert.ok(findStructuredVariantDefinition("nextjs-csr"));
  assert.ok(findStructuredVariantDefinition("nextjs-ssr"));
  assert.ok(findStructuredVariantDefinition("userscript"));
  assert.ok(findStructuredVariantDefinition("vue3"));
});

test("resolveVariantDefinition prefers structured nextjs-csr definition", () => {
  const definition = resolveVariantDefinition("nextjs-csr");

  assert.ok(definition);
  assert.equal(definition.id, "nextjs-csr");
  assert.equal(definition.operations?.[0]?.kind, "create");
  assert.equal(definition.operations?.[1]?.kind, "dlx");
  assert.equal(definition.operations?.[2]?.kind, "install-packages");
});

test("resolveVariantDefinition returns structured nextjs-ssr definition", () => {
  const definition = resolveVariantDefinition("nextjs-ssr");

  assert.ok(definition);
  assert.equal(definition.id, "nextjs-ssr");
  assert.equal(definition.operations?.[0]?.kind, "create");
  assert.equal(definition.operations?.[1]?.kind, "dlx");
  assert.equal(definition.operations?.[2]?.kind, "install-packages");
});

test("resolveVariantDefinition returns structured userscript definition", () => {
  const definition = resolveVariantDefinition("userscript");

  assert.ok(definition);
  assert.equal(definition.id, "userscript");
  assert.equal(definition.operations?.[0]?.kind, "dlx");
  assert.equal(definition.operations?.[1]?.kind, "install-packages");
});

test("resolveVariantDefinition returns structured vue3 definition", () => {
  const definition = resolveVariantDefinition("vue3");

  assert.ok(definition);
  assert.equal(definition.id, "vue3");
  assert.equal(definition.operations?.[0]?.kind, "create");
  assert.equal(definition.operations?.[1]?.kind, "install-packages");
  assert.equal(definition.operations?.[2]?.kind, "install-packages");
});

test("resolveVariantDefinition returns structured electron definitions", () => {
  const reactDefinition = resolveVariantDefinition("electron-react");
  const vueDefinition = resolveVariantDefinition("electron-vue");

  assert.ok(reactDefinition);
  assert.ok(vueDefinition);
  assert.equal(reactDefinition.id, "electron-react");
  assert.equal(vueDefinition.id, "electron-vue");
  assert.equal(reactDefinition.operations?.[0]?.kind, "create");
  assert.equal(vueDefinition.operations?.[0]?.kind, "create");
});
