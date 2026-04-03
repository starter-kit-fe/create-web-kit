import fs from "node:fs";
import path from "node:path";
import spawn from "cross-spawn";
import type { PkgInfo } from "../types/index.js";
import { splitCommand } from "../utils/command.js";
import { getExecCommand } from "../utils/package-manager.js";
import { copyTemplateFiles, type TemplateFile } from "../utils/template.js";

const TEMPLATE_NAME = "nextjs-csr";

const TEMPLATE_FILES: TemplateFile[] = [
  // Config files
  { source: "prettier.config.json", destination: ".prettierrc", isJson: true },
  { source: "eslint.config.mjs", destination: "eslint.config.mjs" },
  { source: "next.config.ts", destination: "next.config.ts" },
  { source: ".env.development", destination: ".env.development" },
  { source: ".env.production", destination: ".env.production" },
  { source: ".env.stage", destination: ".env.stage" },
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

export function createNextjsCSRFiles(root: string, pkgInfo?: PkgInfo): void {
  // Copy all template files
  copyTemplateFiles(TEMPLATE_NAME, TEMPLATE_FILES, root);

  // Configure package.json with husky and lint-staged
  copyConfigHuskyPackage(root);

  // Copy IE compatibility page
  copyIECompatibilityPage(root);

  // Initialize husky after all files are copied
  initializeHusky(root, pkgInfo);
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
    if (!pkg.scripts["build:stage"]) {
      pkg.scripts["build:stage"] =
        "NODE_ENV=production sh -c 'set -a; . .env.stage; set +a; next build'";
    }

    // 添加 lint-staged 配置
    pkg["lint-staged"] = {
      "**/*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
      "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
    };

    // 添加默认 SEO 配置（用于首页 metadata）
    // 仅当不存在时写入，避免覆盖用户自定义内容
    if (!pkg.seo) {
      pkg.seo = {
        title: "nextjs-csr",
        description: "nextjs-csr description",
        keywords: ["keywords", "keywords2"],
        og: {
          title: "nextjs-csr",
          description: "nextjs-csr",
          image: "https://nextjs-csr.com/pwa-512x512.png",
          url: "https://nextjs-csr.com",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: "nextjs-csr",
          description: "nextjs-csr",
          image: "https://nextjs-csr.com/pwa-512x512.png",
        },
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "OneFile",
          url: "https://nextjs-csr.com",
          description: "nextjs-csr。",
          publisher: {
            "@type": "Organization",
            name: "OneFile",
            logo: {
              "@type": "ImageObject",
              image: "https://nextjs-csr.com/pwa-512x512.png",
            },
          },
        },
      };
    }

    // 写回文件
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    console.log(
      "✅ Updated package.json with husky, lint-staged and SEO configuration",
    );
  } catch (error) {
    console.error("❌ Failed to update package.json:", error);
  }
}

function initializeHusky(root: string, pkgInfo?: PkgInfo): void {
  try {
    console.log("🔧 Initializing Git repository...");
    try {
      runCommand("git init", root);
      console.log("✅ Git repository initialized");
    } catch (gitError) {
      console.warn("⚠️ Git init failed or already initialized:", gitError);
    }
    runCommand(getExecCommand("husky install", pkgInfo), root);
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

${getExecCommand("lint-staged", pkgInfo)}
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

function runCommand(command: string, cwd: string): void {
  const [cmd, ...args] = splitCommand(command);
  const result = spawn.sync(cmd, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command}`);
  }
}

function copyIECompatibilityPage(root: string): void {
  const ieHtmlPath = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "../assets/html/ie.html",
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
