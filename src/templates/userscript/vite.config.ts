import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey from "vite-plugin-monkey";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Userscript Starter",
        namespace: "http://tampermonkey.net/",
        version: packageJson.version,
        description:
          "Userscript starter powered by Vite + vite-plugin-monkey + TypeScript.",
        author: "create-web-kit",
        match: ["*://*/*"],
        grant: ["unsafeWindow"],
        "run-at": "document-start",
      },
      build: {
        fileName: "userscript.user.js",
        metaFileName: true,
      },
    }),
  ],
});
