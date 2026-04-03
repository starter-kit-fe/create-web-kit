# Userscript Starter

这是一个基于 `Vite + vite-plugin-monkey + TypeScript` 的通用油猴脚本起步项目。

## 默认能力

- 通用页面匹配
- 组件化悬浮入口
- `vite-plugin-monkey` userscript 构建
- TypeScript + `vue-tsc` + `@types/tampermonkey`
- 输出 `dist/userscript.user.js` 与 `dist/userscript.meta.js`
- 版本号 `make` 时间戳更新习惯

## 项目结构

- `src/main.ts`
  油猴脚本主入口，负责挂载默认面板
- `src/App.vue`
  默认悬浮面板组件
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

- 把业务功能拆到 `src/features/` 和 `src/composables/`
- 按你的业务补充 `GM_getValue` / `GM_setValue`
- 发布前执行 `make deploy`
