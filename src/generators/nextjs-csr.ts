import fs from "node:fs";
import path from "node:path";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "nextjs-csr";

const TEMPLATE_FILES: TemplateFile[] = [
  // Config files
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "eslint.config.mjs", destination: "eslint.config.mjs" },
  { source: "next.config.ts", destination: "next.config.ts" },

  // DevContainer
  {
    source: ".devcontainer/devcontainer.json",
    destination: ".devcontainer/devcontainer.json",
    isJson: true,
  },

  // App files
  { source: "src/app/layout.tsx", destination: "src/app/layout.tsx" },
  { source: "src/app/not-found.tsx", destination: "src/app/not-found.tsx" },
  { source: "src/app/error.tsx", destination: "src/app/error.tsx" },

  // Components
  { source: "src/components/show.tsx", destination: "src/components/show.tsx" },
  {
    source: "src/components/build-info.tsx",
    destination: "src/components/build-info.tsx",
  },

  {
    source: "src/components/providers/theme.tsx",
    destination: "src/components/providers/theme.tsx",
  },
  {
    source: "src/components/providers/query.tsx",
    destination: "src/components/providers/query.tsx",
  },
  {
    source: "src/components/providers/index.tsx",
    destination: "src/components/providers/index.tsx",
  },

  // Utils
  { source: "src/lib/request.ts", destination: "src/lib/request.ts" },
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
