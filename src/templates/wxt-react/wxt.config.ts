import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "WXT React Starter",
    description: "Browser extension starter with popup, options, and content entrypoints",
    permissions: ["storage", "tabs", "activeTab", "scripting"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "Open WXT Starter",
    },
  },
});
