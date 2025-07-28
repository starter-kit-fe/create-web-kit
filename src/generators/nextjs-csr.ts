import fs from "node:fs";
import path from "node:path";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "nextjs-csr";

const TEMPLATE_FILES: TemplateFile[] = [
  // Config files
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "eslint.config.js", destination: ".eslintrc.js" },
  { source: "next.config.js", destination: "next.config.js" },

  // Environment files
  { source: ".env", destination: ".env.development" },
  { source: ".env", destination: ".env.production" },
  { source: ".env", destination: ".env.test" },

  // DevContainer
  {
    source: "devcontainer.json",
    destination: ".devcontainer/devcontainer.json",
    isJson: true,
  },

  // App files
  { source: "layout.tsx", destination: "src/app/layout.tsx" },
  { source: "not-found.tsx", destination: "src/app/not-found.tsx" },

  // Components
  { source: "show.tsx", destination: "src/components/show.tsx" },
  { source: "build-info.tsx", destination: "src/components/build-info.tsx" },
  {
    source: "theme-provider.tsx",
    destination: "src/components/providers/theme-provider.tsx",
  },
  {
    source: "query-provider.tsx",
    destination: "src/components/providers/query-provider.tsx",
  },

  // Utils
  { source: "request.ts", destination: "src/utils/request.ts" },
];

export function createNextjsCSRFiles(root: string): void {
  // Copy all template files
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);

  // Copy IE compatibility page from assets
  copyIECompatibilityPage(root);
}

function copyIECompatibilityPage(root: string): void {
  const ieHtmlPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "../assets/html/ie.html"
  );

  let ieHtmlContent = "";
  try {
    ieHtmlContent = fs.readFileSync(ieHtmlPath, "utf-8");
  } catch (error) {
    // Fallback content if file doesn't exist
    ieHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="renderer" content="webkit" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>浏览器兼容性提示</title>
</head>
<body>
    <h1>请升级您的浏览器</h1>
    <p>您正在使用过时的浏览器版本，请升级到现代浏览器以获得更好的体验。</p>
</body>
</html>`;
  }

  // Ensure public directory exists
  const publicDir = path.join(root, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "ie.html"), ieHtmlContent);
}
