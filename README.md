# Web Kit

一个强大的前端项目脚手架工具，基于官方脚手架命令整合开发者常用配置。

## 核心理念

本工具**不提供预制模板**，而是：

- 🎯 **调用官方脚手架**：使用各框架官网提供的最新安装命令
- 🔧 **智能配置整合**：自动添加开发者常用的工具和配置
- 📦 **一键式设置**：将多个配置步骤合并为一个命令
- 🚀 **始终最新**：确保使用框架的最新稳定版本

## 工作原理

1. **调用官方命令**：如 `create-next-app`、`create-vue` 等官方脚手架
2. **检测项目类型**：分析生成的项目结构和配置
3. **添加开发配置**：自动安装和配置常用的开发工具：
   - ESLint 配置优化
   - 环境变量默认配置
   - 开发依赖包管理
   - 代码格式化工具
4. **智能包管理**：自动检测并使用合适的包管理器

## 支持的框架

| 框架         | 官方命令          | 额外配置                          |
| ------------ | ----------------- | --------------------------------- |
| **Next.js**  | `create-next-app` | ShadcnUI + ESLint 配置 + 环境变量 |
| **Vue 3**    | `create-vue`      | TypeScript + Vite 优化 + 开发工具 |
| **Electron** | 官方模板          | React/Vue 集成 + 构建配置         |

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

## 配置详情

### Next.js 项目增强

基于 `create-next-app` 官方命令，额外添加：

- **ShadcnUI**：现代化 UI 组件库
- **ESLint 规则**：优化的代码检查配置
- **环境变量**：`.env.local` 模板文件
- **TypeScript 配置**：严格模式和路径别名
- **TanStack**：数据获取和表格组件

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

## 为什么选择 Web Kit？

### 🎯 始终最新

- 直接使用官方脚手架，确保框架版本最新
- 无需维护大量模板文件
- 跟随官方更新节奏

### ⚡ 开发效率

- 一个命令完成项目初始化和配置
- 预装开发者常用工具
- 智能检测和配置环境

### � 配置合理

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
# 克隆项目
git clone <repository-url>
cd create-web-kit

# 安装依赖
npm install

# 构建项目
npm run build

# 本地测试
npm start

# 开发模式
npm run dev
```

### 添加新框架支持

1. 在 `src/config/frameworks.ts` 中添加框架配置
2. 实现对应的生成逻辑
3. 添加框架特定的配置增强
4. 更新文档

## License

MIT
