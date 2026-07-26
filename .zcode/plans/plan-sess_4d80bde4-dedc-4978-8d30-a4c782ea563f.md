# 表单设计器样式重排计划

## 目标

按项目主流范式（UnoCSS 布局 + EP 主题变量颜色 + scoped scss 仅 `:deep()`）统一四个文件的样式，支持暗色模式，解决头部拥挤问题。

## 核心改动

### 1. index.vue — 头部拆分 + steps 下沉

**当前问题**：`<p>表单设计器</p>` + `<ElSteps style="width:600px">` + `<TableHeaderOperation>` 三者挤在 header 同一行 `justify-between` 里，steps 被挤压；`style="width:600px"` 是内联样式（lint warning）。

**改动**：
- header 只留「标题 + 操作按钮区」（与 dynamic-list.vue 等项目页面一致）
- ElSteps 移到 card body 顶部，独占一行（包一层 `<div class="pb-12px mb-12px border-b border-[var(--el-border-color-light)]">`）
- ElSteps 去掉 `style="width:600px"`，加 `class="max-w-600px"`（消除 lint warning）
- 保留 `:deep(.el-table .info-row)` 样式不动

### 2. designer-canvas.vue — hex 全替换 + 暗色安全

**当前 hex 清单与映射**：

| hex | 行号 | 映射 |
|---|---|---|
| `bg-#f5f7fa` (UnoCSS) | 49 | `bg-[var(--el-bg-color-page)]` |
| `#dcdfe6` (border dashed) | 122 | `var(--el-border-color)` |
| `#fff` (item bg) | 124 | `var(--el-bg-color)` |
| `#909399` (icon/text) | 144, 187 | `var(--el-text-color-secondary)` |
| `#ebeef5` (handle bg) | 146 | `var(--el-fill-color-light)` |
| `#606266` (text) | 149, 166, 198 | `var(--el-text-color-regular)` |
| `#dcdfe6` (handle hover bg) | 150 | `var(--el-fill-color)` |
| `#c0c4cc` (empty icon) | 192 | `var(--el-text-color-placeholder)` |

注：`var(--el-color-primary)` 等已在用，保留。

### 3. component-palette.vue — hex 全替换

**当前 hex 清单与映射**：

| hex | 行号 | 映射 |
|---|---|---|
| `bg-#fff` (UnoCSS) | 94 | `bg-[var(--el-bg-color)]` |
| `border-#ebeef5` (UnoCSS) | 96 | `border-[var(--el-border-color-light)]` |
| `border-#dcdfe6` (UnoCSS) | 128 | `border-[var(--el-border-color)]` |
| `bg-#fff` (UnoCSS) | 128 | `bg-[var(--el-bg-color)]` |
| `text-#606266` (UnoCSS) | 133, 135 | `text-[var(--el-text-color-regular)]` |
| `#f5f7fa` (scss) | 154 | `var(--el-fill-color-light)` |
| `#ebeef5` (scss) | 155, 159 | `var(--el-border-color-light)` |

注：`hover:border-[var(--el-color-primary)]` 等已在用，保留。

### 4. config-panel.vue — 少量 hex 替换

| hex | 行号 | 映射 |
|---|---|---|
| `#606266` (section-title color) | 221 | `var(--el-text-color-regular)` |
| `#ebeef5` (section-title border) | 222 | `var(--el-border-color-light)` |

## 不改动

- 三个文件的功能逻辑、props、emits、数据流不变
- `src/components/form-designer/` 下其他未接入的旧文件不动
- `crawler/*` 不动
- 第一步表格的列配置、VueDraggable 行为不动

## 验证

1. **typecheck**：`pnpm typecheck`，本次改动文件 0 错误
2. **lint**：`pnpm lint`（只看本次 4 个文件），0 错误；原本 index.vue 的 `style="width:600px"` warning 应消失
3. **人工暗色验证**：切换主题抽屉到 dark 模式，确认画布/面板/卡片背景跟随变深（关键：原 `#fff` 改 `var(--el-bg-color)` 后暗色下应变深色）

## 风险

- UnoCSS 里 `bg-[var(--el-bg-color)]` 这种任意值写法需 transformer 支持（项目已启用 `transformerDirectives`，确认可用，component-palette.vue:128 已有先例 `hover:bg-[var(--el-color-primary-light-9)]`）。
- steps 下沉后，card body 高度计算可能变化（原 `h-[calc(100%-20px)]` 是针对表格区）；下沉后 steps 占一行，表格/画布区高度需相应调整，用 flex 布局让剩余空间自适应。