# Userscript Starter

这是一个基于 `Vite + vite-plugin-monkey + vanilla TypeScript` 的通用油猴脚本起步项目。

## 默认能力

- 通用页面匹配
- 原生 DOM 悬浮入口面板
- `vite-plugin-monkey` userscript 构建
- TypeScript + `tsc -b` + `@types/tampermonkey`
- 输出 `dist/userscript.user.js` 与 `dist/userscript.meta.js`
- 版本号 `make` 时间戳更新习惯

## 项目结构

- `src/main.ts`
  油猴脚本主入口，直接使用原生 DOM 挂载默认面板
- `src/style.css`
  默认悬浮面板样式
- `vite.config.ts`
  userscript 元数据、入口、输出文件名配置
- `dist/userscript.user.js`
  Tampermonkey 可安装脚本
- `dist/userscript.meta.js`
  更新检查元数据文件

## 本地开发

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run typecheck
```

更新时间版本号：

```bash
make
```

## 安装到 Tampermonkey

构建后，直接导入：

- `dist/userscript.user.js`

如果你后续打算通过 CDN 自动更新，可以在 `vite.config.ts` 里补上：

- `updateURL`
- `downloadURL`

## 建议下一步

- 把业务功能拆到 `src/features/` 和 `src/utils/`
- 按你的业务补充 `GM_getValue` / `GM_setValue`
- 发布前执行 `make deploy`
