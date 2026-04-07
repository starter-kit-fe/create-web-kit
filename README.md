# Create Web Kit

一个强大的前端项目脚手架工具，基于官方脚手架命令整合开发者常用配置。

## 核心理念

本工具**不维护完整项目模板**，而是：

- 🎯 **调用官方脚手架**：使用各框架官网提供的最新安装命令
- 🔧 **智能配置整合**：自动添加开发者常用的工具和配置
- 📦 **一键式设置**：将多个配置步骤合并为一个命令
- 🚀 **始终最新**：确保使用框架的最新稳定版本

## 工作原理

1. **调用官方命令**：如 `create-next-app`、`create-vue` 等官方脚手架
2. **按变体执行增强步骤**：根据 `nextjs-csr`、`vue3`、`userscript` 等方案执行多步命令
3. **添加开发配置**：自动安装和配置常用的开发工具与增量模板文件：
   - ESLint 配置优化
   - 环境变量默认配置
   - 开发依赖包管理
   - 代码格式化工具
   - DevContainer / Husky / lint-staged 等工程化配置
4. **智能包管理**：自动检测并使用合适的包管理器

## 支持的框架

| 框架         | 官方命令          | 额外配置                          |
| ------------ | ----------------- | --------------------------------- |
| **Next.js**  | `create-next-app` | CSR/SSR 变体 + ShadcnUI + TanStack + 环境变量 |
| **Vue 3**    | `create-vue`      | TypeScript + Vite 优化 + 开发工具 |
| **Electron** | 官方模板          | React/Vue 集成 + 构建配置         |
| **Userscript** | `create-monkey` | 原生 TypeScript 油猴脚本 + vite-plugin-monkey |

## 使用方法

### 交互式创建

```bash
npx create-web-kit
```

### 指定项目名称

```bash
npx create-web-kit my-project
```

### 指定框架类型

```bash
npx create-web-kit my-project --template nextjs-csr
```

### 指定 Userscript 类型

```bash
npx create-web-kit my-script --template userscript
```

## 配置详情

### Next.js 项目增强

基于 `create-next-app` 官方命令，额外添加：

- **ShadcnUI**：现代化 UI 组件库
- **TanStack**：数据获取和表格组件
- **ESLint + Prettier**：包含导入排序与 `prettier-plugin-tailwindcss`
- **环境变量**：CSR 提供 `.env.development` / `.env.production` / `.env.stage`，SSR 提供 `.env.local` / `.env.example`
- **TypeScript 配置**：严格模式和路径别名
- **工程化默认项**：Husky、lint-staged、DevContainer、SEO metadata、请求封装、构建信息输出

### Vue 3 项目增强

基于 `create-vue` 官方命令，额外添加：

- **开发工具**：Vue DevTools 和 Vite 插件
- **TypeScript 配置**：严格类型检查
- **ESLint + Prettier**：代码格式化配置
- **环境变量管理**：开发和生产环境配置

### Electron 项目增强

基于官方 Electron 模板，额外添加：

- **前端框架集成**：React 或 Vue 3 支持
- **构建配置**：开发和打包脚本优化
- **TypeScript 支持**：主进程和渲染进程配置
- **热重载**：开发环境自动刷新

### Userscript 项目增强

基于 `create-monkey` 官方命令，额外添加：

- **vanilla-ts + vite-plugin-monkey**：最轻量的 userscript UI 与元数据打包
- **TypeScript**：默认入口为 `src/main.ts`，并使用 `tsc -b`
- **Tampermonkey 类型**：内置 `@types/tampermonkey`
- **通用默认项**：预置悬浮入口与 userscript 元数据
- **发布习惯**：`Makefile`、`userscript.user.js` / `userscript.meta.js` 输出约定

## 为什么选择 Web Kit？

### 🎯 始终最新

- 直接使用官方脚手架，确保框架版本最新
- 无需维护大量模板文件
- 跟随官方更新节奏

### ⚡ 开发效率

- 一个命令完成项目初始化和配置
- 预装开发者常用工具
- 智能检测和配置环境

### 配置合理

- 基于最佳实践的配置
- 适合团队开发的 ESLint 规则
- 完整的 TypeScript 支持

## 开发

### 项目结构

```
src/
├── index.ts              # 主入口文件
├── config/               # 配置文件
│   ├── frameworks.ts     # 框架配置定义
│   └── help.ts          # 帮助信息
├── generators/          # 生成器
│   ├── project.ts       # 项目生成逻辑
│   └── template.ts      # 模板处理
├── utils/               # 工具函数
│   ├── file.ts          # 文件操作
│   └── package-manager.ts # 包管理器检测
└── types/               # 类型定义
    └── index.ts
```

### 本地开发

```bash
pnpm install
pnpm run build
pnpm start
pnpm run dev

# 轻量验证
node test.mjs
node test-config.mjs
node test-package-manager.mjs
node test-command-parser.mjs
node test-userscript.mjs
node test-ie-html.mjs
```

### 添加新框架支持

1. 在 `src/config/frameworks.ts` 中添加框架配置
2. 在 `src/generators/` 中实现对应的生成逻辑
3. 按需在 `src/templates/<variant>/` 和 `src/assets/` 中补充增量文件
4. 更新文档

## License

MIT
