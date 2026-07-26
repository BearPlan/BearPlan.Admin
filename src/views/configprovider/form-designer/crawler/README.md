# 表单设计器组件元数据生成器

用于从 Element Plus 官网获取组件元数据，生成表单设计器所需的组件配置。

## 目录结构

```
crawler/
├── generate-components.ts       # 组件元数据生成脚本
├── element_plus_crawler.py    # 官网爬虫脚本
├── element-plus-components.ts   # 生成的组件元数据（自动）
├── component-categories.ts      # 生成的组件分类（自动）
├── element_plus_components.json # 爬取的原始数据（爬虫生成）
├── README.md                    # 使用说明文档（本文件）
└── CRAWLER_README.md            # 爬虫工具说明
```

## 两种使用方式

### 方式一：手动维护（当前）

直接在 `generate-components.ts` 中维护组件列表：

```bash
npm run generate:components
```

### 方式二：自动爬取（推荐）

1. 安装 Python 依赖：
```bash
pip install requests beautifulsoup4 lxml
```

2. 运行爬虫爬取官网数据：
```bash
python element_plus_crawler.py
```

3. 生成 TypeScript 文件：
```bash
npm run generate:components
```

## 文件说明

| 文件 | 说明 | 是否自动生成 |
|------|------|-------------|
| `element_plus_crawler.py` | Python 爬虫脚本 | 否 |
| `element_plus_components.json` | 爬取的原始数据 | 是（爬虫生成） |
| `element-plus-components.ts` | TypeScript 类型定义 | 是 |
| `component-categories.ts` | 组件分类数据 | 是 |
| `generate-components.ts` | 生成器脚本 | 否 |

## 组件元数据结构

```typescript
interface AttributeMeta {
  name: string              // 属性名
  description: string       // 属性描述
  type: AttributeType      // 属性类型
  default?: any            // 默认值
  options?: any[]          // 可选值
  required?: boolean       // 是否必填
  editors?: PropertyEditor[]  // 支持的编辑器列表
  editor?: PropertyEditor  // 主编辑器
  editorConfig?: Record<string, any>  // 编辑器配置
}
```

## 属性编辑器类型

| 编辑器 | 说明 | 适用场景 |
|--------|------|----------|
| `input` | 普通输入框 | 字符串类型 |
| `textarea` | 文本域 | 长文本 |
| `input-number` | 数字输入框 | 数字类型 |
| `switch` | 开关 | 布尔类型 |
| `select` | 下拉选择器 | 有固定选项 |
| `color-picker` | 颜色选择器 | 颜色属性 |
| `icon-picker` | 图标选择器 | 图标属性 |
| `code-editor` | 代码编辑器 | 函数等 |
| `object-editor` | 对象编辑器 | 对象类型 |
| `array-editor` | 数组编辑器 | 数组类型 |

## 智能推断规则

- **图标属性**（包含 `icon` 或 `Icon`）→ `icon-picker`
- **颜色属性**（包含 `color` 或 `Color`）→ `color-picker`
- **布尔类型** → `switch`
- **数字类型** → `input-number`
- **函数类型** → `code-editor`
- **有可选值** → `select`
- **默认** → `input`

## 在项目中使用

```typescript
import { ComponentMetaMap, getComponentMeta } from '@/views/configprovider/form-designer/crawler/element-plus-components'

// 获取组件元数据
const inputMeta = getComponentMeta('el-input')

// 获取属性的编辑器
const placeholderEditor = inputMeta.metadata.attributes.find(a => a.name === 'placeholder')?.editor
// 返回: 'input'

// 获取多个编辑器
const colorEditors = inputMeta.metadata.attributes.find(a => a.name === 'color')?.editors
// 返回: ['color-picker', 'input']
```

## 开发建议

1. **优先使用爬虫**：保持与官网同步
2. **手动微调**：在爬取结果基础上手动调整
3. **版本控制**：将生成的文件提交到 Git
4. **定期更新**：官网更新后及时重新爬取

## 依赖要求

- Node.js >= 20.19.0
- Python >= 3.8
- tsx (通过 npm 或 npx)
