# 智慧园区

基于 React、TypeScript 和 Vite 的智慧园区前端项目。项目不依赖真实后端，所有业务数据和接口均使用 MSW Mock。

## 产品文档

- [智慧园区管理后台 PRD](./docs/PRD.md)
- [UI 视觉方向效果图](./docs/ui-concepts/README.md)
- [理性蓝完整页面设计稿](./docs/ui-designs/rational-blue/README.md)

## 代码风格与编辑器

项目代码每行最多 100 列，超出时必须按语法层次换行。
行长包含缩进，Tab 按 2 列计算，Unicode 字符各计 1 列。
注释、字符串、模板字符串、正则和 URL 均不豁免。

- JS、TS、JSX、TSX：由 Oxlint 的 `@stylistic/max-len` 检查
- CSS、SCSS、HTML、JSON、JSONC：由 ESLint 复用同一行长规则检查
- Prettier 的 `printWidth: 100` 负责格式化；无法自动拆开的长行仍会报错
- 构建产物、依赖、设计文档和自动生成的 MSW Worker 不参与行长检查

VS Code / Cursor：安装 `.vscode/extensions.json` 推荐的 Oxc、ESLint
和 Prettier 扩展。工作区已配置输入时检查、错误标记、100 列参考线及保存格式化。
参考线和编辑器软换行不会消除行长错误，必须实际修改源代码。

WebStorm / IntelliJ IDEA：安装 Oxc 插件，启用项目的 ESLint 配置。
ESLint 检查范围需包含 CSS、SCSS、HTML、JSON、JSONC；
将 ESLint 检查严重性设为 Error，并启用项目 Prettier 的保存时格式化。
`.editorconfig` 为支持它的编辑器提供统一的缩进和行宽设置。

```sh
pnpm lint          # 检查代码及样式、配置文件，超长行导致非零退出
pnpm lint:code     # 仅运行 Oxlint
pnpm lint:style    # 仅检查样式及配置文件行长
pnpm format        # 格式化项目文件
pnpm format:check  # 检查格式，不写入文件
```

已有文件中的超长行也会报错，不因启用规则而自动批量改写。
