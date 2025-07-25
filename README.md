# Create Starter Kit

一个强大的前端项目脚手架工具，支持多种框架和模板。

## 特性

- 🚀 支持多种主流框架：Next.js、Vue 3、Electron
- 🎨 内置精美 UI 组件库集成
- 📦 智能包管理器检测 (npm, pnpm, yarn, bun)
- 🔧 多步骤自动化项目设置
- 🎯 交互式命令行界面
- 🔒 代码保护和混淆

## 支持的模板

| 模板           | 描述               | 技术栈                          |
| -------------- | ------------------ | ------------------------------- |
| nextjs-csr     | Next.js 客户端渲染 | Next.js + ShadcnUI + TypeScript |
| nextjs-ssr     | Next.js 服务端渲染 | Next.js + ShadcnUI + TypeScript |
| vue3           | Vue 3 现代化开发   | Vue 3 + TypeScript + Vite       |
| electron-react | Electron + React   | Electron + React + TypeScript   |
| electron-vue   | Electron + Vue     | Electron + Vue 3 + TypeScript   |

## Usage

You can use this scaffolding tool in several ways:

### Interactive Mode

```bash
npm create starter-kit
# or
npx create-starter-kit
```

### With Project Name

```bash
npm create starter-kit my-project
# or
npx create-starter-kit my-project
```

### With Template

```bash
npm create starter-kit my-project --template react-ts
# or
npx create-starter-kit my-project -t vue-ts
```

### Help

```bash
npx create-starter-kit --help

```

## Available Templates

### Frontend Templates

- **vanilla** - Vanilla JavaScript
- **vanilla-ts** - Vanilla TypeScript
- **react** - React with JavaScript
- **react-ts** - React with TypeScript
- **vue** - Vue with JavaScript
- **vue-ts** - Vue with TypeScript

### Next.js Templates (Multi-Step Setup)

- **nextjs-csr** - Next.js + CSR + ShadcnUI + TanStack
  - Creates Next.js project with TypeScript and Tailwind
  - Installs and configures ShadcnUI
  - Adds @tanstack/react-table and @tanstack/react-query
  - Sets up ESLint and Prettier configuration
- **nextjs-app** - Next.js App Router (basic setup)

### Vue Templates (Multi-Step Setup)

- **vue** - Vue with JavaScript
- **vue-ts** - Vue with TypeScript
- **nuxt3-full** - Nuxt 3 + UI + State Management
  - Creates Nuxt 3 project with TypeScript
  - Installs @nuxt/ui, @pinia/nuxt, @vueuse/nuxt
  - Sets up development tools and configuration

### Backend Templates

- **node** - Node.js with JavaScript
- **node-ts** - Node.js with TypeScript
- **express** - Express with JavaScript
- **express-ts** - Express with TypeScript
- **express-full** - Express + TypeScript + Full Stack
  - Complete Express setup with TypeScript
  - Includes middleware (cors, helmet, compression)
  - Database ready with Prisma
  - Environment configuration

### Library Templates

- **vite-lib** - Vite Library with JavaScript
- **vite-lib-ts** - Vite Library with TypeScript

## Examples

### Creating a Next.js project with full setup

```bash
npx create-starter-kit my-nextjs-app --template nextjs-csr
```

This will:

1. Create a Next.js project with TypeScript and Tailwind
2. Install and configure ShadcnUI
3. Add TanStack Table and Query libraries
4. Set up ESLint and Prettier
5. Create configuration files

### Creating a Nuxt 3 project

```bash
npx create-starter-kit my-nuxt-app --template nuxt3-full
```

This will:

1. Create a Nuxt 3 project
2. Install UI library and state management
3. Set up development tools
4. Create project structure

### Creating a full-stack Express API

```bash
npx create-starter-kit my-api --template express-full
```

This will:

1. Create an Express project with TypeScript
2. Install essential middleware
3. Set up Prisma for database
4. Create starter API endpoints
5. Configure environment variables

## Features

- 🚀 **Fast** - Quick project setup with modern tooling
- 🎨 **Multiple Templates** - Choose from various frontend and backend templates
- 📦 **Package Manager Agnostic** - Works with npm, yarn, pnpm, and bun
- 🛠️ **TypeScript Support** - First-class TypeScript support
- 📋 **Interactive Prompts** - User-friendly CLI with beautiful prompts
- 🎯 **Modern Tooling** - Uses latest versions of popular tools

## Development

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd create-starter-kit

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm start
```

### Adding New Templates

1. Create a new template directory: `template-{name}`
2. Add template files inside the directory
3. Update the `FRAMEWORKS` array in `src/index.ts`
4. Files starting with `_` will be renamed (e.g., `_gitignore` → `.gitignore`)

### Project Structure

```
src/
├── index.ts              # Main CLI logic
template-react-ts/        # React TypeScript template
├── package.json
├── src/
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── ...
template-node-ts/         # Node.js TypeScript template
├── package.json
├── src/
│   └── index.ts
└── ...
```

## Publishing

```bash
npm run build
npm publish
```

## License

MIT
