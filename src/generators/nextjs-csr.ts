import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "nextjs-csr";

const TEMPLATE_FILES: TemplateFile[] = [
  // Config files
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "eslint.config.mjs", destination: "eslint.config.mjs" },
  { source: "next.config.ts", destination: "next.config.ts" },
  { source: ".env.test", destination: ".env.test" },
  { source: ".env.development", destination: ".env.development" },
  { source: ".env.production", destination: ".env.production" },
  { source: ".husky/pre-commit", destination: ".husky/pre-commit" },
  { source: ".husky/_/husky.sh", destination: ".husky/_/husky.sh" },

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

  // Configure package.json with husky and lint-staged
  copyConfigHuskyPackage(root);

  // Copy IE compatibility page
  copyIECompatibilityPage(root);

  // Initialize husky after all files are copied
  initializeHusky(root);
}

function copyConfigHuskyPackage(root: string): void {
  const pkgPath = path.join(root, "package.json");

  try {
    const pkgContent = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    // 添加 prepare 脚本
    if (!pkg.scripts) {
      pkg.scripts = {};
    }
    pkg.scripts.prepare = "husky";

    // 添加 lint-staged 配置
    pkg["lint-staged"] = {
      "**/*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
      "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
    };

    // 添加默认 SEO 配置（用于首页 metadata）
    // 仅当不存在时写入，避免覆盖用户自定义内容
    if (!pkg.seo) {
      pkg.seo = {
        title: "OneFile - 聚合对象存储上传平台",
        description:
          "OneFile 是一个聚合上传平台，支持 OSS、COS、Cloudflare R2、AWS S3、Oracle Object Storage 等多云存储，提供大文件分片上传、断点续传与跨云文件管理。",
        keywords: [
          "OneFile",
          "文件上传",
          "大文件分片上传",
          "对象存储",
          "OSS",
          "COS",
          "R2",
          "S3",
          "Oracle Object Storage",
          "多云存储",
          "聚合上传",
          "云存储管理",
        ],
        og: {
          title: "OneFile - 聚合对象存储上传平台",
          description:
            "支持 OSS、COS、Cloudflare R2、AWS S3、Oracle Object Storage 等多云存储。提供大文件分片上传、断点续传、跨云文件统一管理。",
          image: "https://onefile.h06i.com/pwa-512x512.png",
          url: "https://onefile.h06i.com",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: "OneFile - 聚合对象存储上传平台",
          description:
            "多云对象存储聚合上传，支持 OSS、COS、R2、S3，大文件分片上传与断点续传。",
          image: "https://onefile.h06i.com/pwa-512x512.png",
        },
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "OneFile",
          url: "https://onefile.h06i.com",
          description:
            "OneFile 是一个聚合上传平台，支持 OSS、COS、Cloudflare R2、AWS S3、Oracle Object Storage 等多云存储，提供大文件分片上传、断点续传与跨云文件管理。",
          publisher: {
            "@type": "Organization",
            name: "OneFile",
            logo: {
              "@type": "ImageObject",
              image: "https://onefile.h06i.com/pwa-512x512.png",
            },
          },
        },
      };
    }

    // 写回文件
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    console.log(
      "✅ Updated package.json with husky, lint-staged and SEO configuration"
    );
  } catch (error) {
    console.error("❌ Failed to update package.json:", error);
  }
}

function initializeHusky(root: string): void {
  try {
    console.log("🔧 Initializing Git repository...");
    try {
      execSync("git init", {
        cwd: root,
        stdio: "inherit",
      });
      console.log("✅ Git repository initialized");
    } catch (gitError) {
      console.warn("⚠️ Git init failed or already initialized:", gitError);
    }
    execSync("npx husky install", {
      cwd: root,
      stdio: "inherit",
    });
    // 确保 .husky 目录存在
    const huskyDir = path.join(root, ".husky");
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }

    // 确保 .husky/_/ 目录存在
    const huskyUnderscoreDir = path.join(huskyDir, "_");
    if (!fs.existsSync(huskyUnderscoreDir)) {
      fs.mkdirSync(huskyUnderscoreDir, { recursive: true });
    }

    // 创建 pre-commit 钩子文件
    const preCommitPath = path.join(huskyDir, "pre-commit");
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
    fs.writeFileSync(preCommitPath, preCommitContent);

    // 设置执行权限
    try {
      fs.chmodSync(preCommitPath, 0o755);
    } catch (chmodError) {
      console.warn("⚠️ Could not set execute permission for pre-commit hook");
    }

    console.log("✅ Husky pre-commit hook created successfully");
  } catch (error) {
    console.error("❌ Failed to initialize husky:", error);
  }
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
    console.error(error);
  }

  // Ensure public directory exists
  const publicDir = path.join(root, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "ie.html"), ieHtmlContent);
}
