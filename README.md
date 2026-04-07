# Create Web Kit

基于官方脚手架命令的前端项目 setup flow CLI。

它要解决的不是“如何再造一个模板仓库”，而是另一个更常见的问题：
我们用官方脚手架把项目创建出来以后，通常还要继续手动补一串几乎重复的工程化步骤，比如装 UI、补 ESLint / Prettier、接 Husky / lint-staged、整理环境变量、放入公共请求封装、补默认目录和配置文件。这些事情本质上往往就是一条条官方命令加少量配置改动，但每次新开项目都要再做一遍。

Create Web Kit 的核心就是把这类高频、重复、可标准化的初始化动作整理成一条可复用的 flow，让常见类型的仓库可以通过一条命令直接落地到“能开始认真开发”的状态。

## 核心原理

Create Web Kit 默认不维护一整套庞大的自定义模板，而是围绕下面这个模型工作：

1. 先调用官方脚手架
   比如 `create-next-app`、`create-vue`、`create-monkey`、`electron-vite`。
2. 再执行该方案对应的增强步骤
   比如安装 UI 库、数据层、工程化依赖，或者执行额外的初始化命令。
3. 最后补少量增量文件和配置
   比如 `.env`、`eslint`、`prettier`、`husky`、默认 providers、请求封装、脚本约定等。
4. 全程适配用户当前包管理器
   自动根据环境尽量使用匹配的包管理器命令。

可以把它理解为：

```text
官方 create 命令
+ 常用依赖安装
+ 常见工程化配置
+ 少量增量模板文件
= 一条可复用的项目搭建 flow
```

这个仓库的价值，不是替代官方，而是把“官方脚手架之后的重复劳动”产品化。

## 为什么不用纯模板

纯模板当然也能解决问题，但它的维护成本通常更高：

- 模板容易和官方最新结构脱节
- 框架升级时，模板要跟着整体迁移
- 很多改动其实只是“追加几条命令 + 覆盖几个配置文件”，没必要维护完整项目骨架

Create Web Kit 更偏向下面这套思路：

- 让官方脚手架继续作为项目初始结构的 source of truth
- 只维护团队真正高频复用的增强步骤
- 只复制必要的增量文件，而不是复制整个项目
- 把“个人经验”沉淀成可执行的 setup flow

## 它适合的场景

- 你经常创建相似类型的新仓库
- 你已经有一套自己反复验证过的工程化默认项
- 你希望尽量贴近官方最新脚手架，但不想每次都手动补配置
- 你想把个人或团队的建仓习惯收敛成统一命令

## 当前支持的 Flow

| Variant | 基于官方命令 | 典型增强内容 |
| --- | --- | --- |
| `nextjs-csr` | `create-next-app` | Shadcn UI、TanStack Query/Table、Prettier、Husky、lint-staged、环境变量、providers、请求封装、构建信息组件等 |
| `nextjs-ssr` | `create-next-app` | Shadcn UI、React Query、NextAuth、Prisma、SSR 环境变量示例 |
| `vue3` | `create-vue` | Pinia、`@vueuse/core`、开发依赖、Vite 配置补充 |
| `electron-react` | `create electron-vite` | React + TypeScript 初始化、常用状态/请求依赖、ESLint 配置补充 |
| `electron-vue` | `create electron-vite` | Vue 3 + TypeScript 初始化、Pinia、`@vueuse/core`、ESLint 配置补充 |
| `userscript` | `create-monkey` | Vanilla TypeScript userscript、`@types/tampermonkey`、Makefile、Vite 默认文件清理、userscript 约定文件 |

其中最重要的不是“支持了哪些框架”，而是每个 variant 都代表一条已经整理好的搭建 flow。

## 使用方法

### 交互式创建

```bash
npx create-web-kit
```

### 指定项目目录

```bash
npx create-web-kit my-project
```

### 直接指定方案

```bash
npx create-web-kit my-project --template nextjs-csr
```

### 非交互模式

```bash
npx create-web-kit my-project --template vue3 --yes
```

### 指定包管理器

```bash
npx create-web-kit my-project --template nextjs-csr --package-manager pnpm
```

### 跳过附加安装

```bash
npx create-web-kit my-project --template userscript --yes --no-install
```

### 跳过 Git 相关设置

```bash
npx create-web-kit my-project --template nextjs-csr --yes --no-git
```

### 查看帮助

```bash
npx create-web-kit --help
```

### 常见示例

```bash
npx create-web-kit admin-panel --template nextjs-csr
npx create-web-kit content-site --template nextjs-ssr
npx create-web-kit chrome-helper --template userscript
npx create-web-kit landing-page --template vue3 --yes
```

常用参数：

- `--yes`：使用默认值并跳过本 CLI 的交互问题
- `--package-manager <npm|pnpm|yarn|bun>`：强制使用指定包管理器
- `--no-install`：跳过附加依赖安装步骤
- `--no-git`：跳过 Git 相关增强步骤
- `--verbose`：输出更多执行细节
- `--overwrite`：目标目录非空时直接清空继续

## 一个 Variant 实际会做什么

以 `nextjs-csr` 为例，它并不是直接拷贝一个完整项目，而是大致执行下面这类动作：

```bash
create-next-app ...
pnpm dlx shadcn@latest init -y
pnpm add @tanstack/react-table @tanstack/react-query ...
pnpm add -D prettier husky lint-staged ...
复制和补充少量项目文件
更新 package.json 中的脚本和 lint-staged 配置
```

这正是整个仓库的核心思路：把本来散落在笔记、命令历史和个人习惯里的动作，收敛成可重复执行的工程初始化流程。

## 开发

### 项目结构

```text
src/
├── index.ts           # CLI 入口与交互流程
├── cli/               # CLI 参数与交互辅助逻辑
├── config/            # 常量与帮助信息
├── registry/          # 模板/variant 注册表
├── variants/          # 结构化 variant 定义
├── core/              # flow 运行器、命令执行、文件操作、包管理器适配
├── generators/        # 每个 variant 的增量文件与 augment 逻辑
├── templates/         # 被复制到目标项目的模板碎片
├── assets/            # 静态资源
├── utils/             # 通用工具函数
└── types/             # 类型定义
```

### 本地开发

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm start
```

### 测试与验证

```bash
pnpm run typecheck
pnpm run test
pnpm run test:unit
pnpm run test:integration
```

当你修改某个 variant、generator 或模板文件时，除了跑测试，最好再实际执行一次 CLI，确认生成出来的项目结构和脚本都符合预期。

### 发布与版本管理

```bash
pnpm run changeset
pnpm run changeset:status
pnpm run changeset:check
pnpm run changeset:archive
pnpm run release:check
pnpm run release:dry-run
pnpm run release:publish
```

这个仓库已经接入了 Changesets，用来记录发布意图和变更说明，同时保留了当前基于时间戳的 semver 兼容版本策略。

当前仓库仍保留基于时间戳的 `release:version` 版本脚本，因此推荐的发布流程是：

1. 先运行 `pnpm run changeset` 记录本次变更说明
2. 运行 `pnpm run changeset:check` 确认存在待发布 changeset
3. 再运行 `pnpm run release:version` 更新发布版本号
4. 执行 `pnpm run release:dry-run`
5. 确认无误后执行 `pnpm run release:publish`
6. 发布成功后运行 `pnpm run changeset:archive`

如果你更喜欢用 `make`，现在也可以直接使用：

```bash
make ps
make add
make check
make dry
make pub
make ship
```

其中：

- `make ps`：查看当前待发布 changeset 列表
- `make add`：创建一条新的 changeset
- `make check`：执行完整发布前检查
- `make dry`：校验 changeset、更新版本号，再执行 `npm publish --dry-run`
- `make pub`：执行正式发布并自动归档已消费的 changeset
- `make ship`：串行执行发布、提交发布改动并推送 tag

如果你已经习惯旧命令，兼容别名仍然保留，例如：

```bash
make changeset-status
make dry-run
make publish
make release
```

## 如何扩展新的搭建 Flow

1. 在 `src/variants/` 中新增一个结构化 variant definition
2. 在 `src/variants/index.ts` 中导出并注册该 variant
3. 在 `src/generators/` 和 `src/templates/` 中补充增量文件与 augment 逻辑
4. 补对应的 `tests/unit` 或 `tests/integration`
5. 更新 README 和发布说明

新增能力时，优先思考的不是“我要不要再做一个模板”，而是：
这是不是一个可以复用的 setup flow。

## License

MIT
