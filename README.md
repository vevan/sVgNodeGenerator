# SVG Filter 节点编辑器

基于 Vue 3 + BaklavaJS 的可视化 SVG 滤镜编辑器。通过节点图编辑 `<filter>` 内 fe* 元素，实时预览并支持与滤镜代码双向同步。

## 功能

- **节点编辑**：拖拽 fe* 节点（高斯模糊、颜色矩阵、混合、合并等），连线表示数据流，自动生成对应 SVG filter 代码。
- **实时预览**：右侧预览区可自定义 HTML 与选择器，查看滤镜效果。
- **滤镜代码**：只读 / 编辑切换、复制代码、从代码**反向生成节点图**（应用代码）。

## 技术栈

- Vue 3 (Composition API + script setup)
- TypeScript
- Vite
- [BaklavaJS](https://github.com/newcat/baklavajs) 节点编辑器

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview   # 预览构建产物
```

## 项目结构（简要）

- `src/editor/` — 节点注册、持久化、从图生成 markup、从代码应用回图
- `src/nodes/` — 各 fe* 节点定义
- `src/parseFilterMarkup.ts` — 解析 filter 代码为结构化数据
- `src/components/` — 预览、滤镜代码面板、自定义节点等

## License

本项目采用 **GPL-3.0** 许可证。详见 [LICENSE](LICENSE) 文件。
