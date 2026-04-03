import { unsafeWindow } from "$";
import { createApp } from "vue";
import App from "./App.vue";

declare global {
  interface Window {
    __userscriptReady__?: boolean;
  }
}

const ROOT_ID = "userscript-root";

function mountApp(): void {
  if (window.__userscriptReady__) {
    return;
  }

  window.__userscriptReady__ = true;

  const existingRoot = document.getElementById(ROOT_ID);
  if (existingRoot) {
    createApp(App).mount(existingRoot);
    return;
  }

  const root = document.createElement("div");
  root.id = ROOT_ID;
  document.body.appendChild(root);

  try {
    unsafeWindow.__userscriptReady__ = true;
  } catch (error) {
    console.warn("[userscript] unable to expose unsafeWindow flag:", error);
  }

  createApp(App).mount(root);
  console.log("[userscript] starter loaded");
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", mountApp, { once: true });
} else {
  mountApp();
}
