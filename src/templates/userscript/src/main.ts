import { unsafeWindow } from "$";
import "./style.css";

declare global {
  interface Window {
    __userscriptReady__?: boolean;
  }
}

const ROOT_ID = "userscript-root";

function ensureRootContainer(): HTMLElement {
  const existingRoot = document.getElementById(ROOT_ID);
  if (existingRoot) {
    return existingRoot;
  }

  const root = document.createElement("section");
  root.id = ROOT_ID;
  root.className = "userscript-panel";
  document.body.appendChild(root);
  return root;
}

function renderPanel(root: HTMLElement): void {
  root.className = "userscript-panel";
  root.innerHTML = `
    <button class="userscript-panel__toggle" type="button">Userscript</button>
    <div class="userscript-panel__body" hidden>
      <p class="userscript-panel__title">Userscript Ready</p>
      <p class="userscript-panel__meta">${window.location.hostname}</p>
      <button class="userscript-panel__action" type="button">打印当前地址</button>
    </div>
  `;

  const toggleButton = root.querySelector<HTMLButtonElement>(
    ".userscript-panel__toggle"
  );
  const body = root.querySelector<HTMLElement>(".userscript-panel__body");
  const actionButton = root.querySelector<HTMLButtonElement>(
    ".userscript-panel__action"
  );

  if (!toggleButton || !body || !actionButton) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const expanded = !root.classList.contains("is-expanded");
    root.classList.toggle("is-expanded", expanded);
    body.hidden = !expanded;
    toggleButton.textContent = expanded ? "收起" : "Userscript";
  });

  actionButton.addEventListener("click", () => {
    console.log("[userscript] current url:", window.location.href);
  });
}

function mountApp(): void {
  if (window.__userscriptReady__) {
    return;
  }

  const root = ensureRootContainer();
  renderPanel(root);
  window.__userscriptReady__ = true;

  try {
    unsafeWindow.__userscriptReady__ = true;
  } catch (error) {
    console.warn("[userscript] unable to expose unsafeWindow flag:", error);
  }

  console.log("[userscript] starter loaded");
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", mountApp, { once: true });
} else {
  mountApp();
}
