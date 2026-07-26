# 表单设计器 - 技术知识库

## 项目概述

基于 Vue 3 + TypeScript + Element Plus 的可视化表单设计器，支持拖拽式表单构建、动态属性配置和嵌套组件支持。

---

## 功能需求分析

### 第一步：基础字段配置

**功能描述**
- 从后端获取可用字段列表
- 用户选择需要的字段（添加/删除）
- 保存选中字段作为设计器的"基础字段池"

**技术实现**
开发者自己实现

**可行性**: ✅ **完全可行**

---

### 第二步：可视化设计器

#### 2.1 左侧：组件面板

**功能描述**
- 展示可拖拽的组件库
- 包括 Element Plus 原生组件 + 自定义业务组件
- 分类展示（输入类、选择类、展示类、布局类等）

**技术实现**
```vue
<!-- 左侧组件面板结构 -->
<div class="component-panel">
  <div v-for="category in componentCategories" :key="category.name">
    <h3>{{ category.label }}</h3>
    <div class="component-list">
      <div
        v-for="comp in category.components"
        :key="comp.type"
        draggable="true"
        @dragstart="handleDragStart(comp)"
      >
        <component :is="comp.icon" />
        <span>{{ comp.label }}</span>
      </div>
    </div>
  </div>
</div>
```

**可行性**: ✅ **完全可行**

---

#### 2.2 中间：画布区域

**功能描述**
- 渲染基础字段列表（初始已有字段）
- 支持从左侧拖拽新组件到画布
- **关键：支持嵌套/子节点结构**（如 Tab、Card、Grid 等容器组件）

**技术实现**

**方案 A：递归组件渲染（推荐）**
```vue
<!-- FormCanvas.vue -->
<template>
  <div class="form-canvas">
    <Draggable
      v-model="formItems"
      group="form-components"
      @change="handleChange"
    >
      <template #item="{ element: item }">
        <div class="form-item-wrapper">
          <!-- 容器类型组件：递归渲染子节点 -->
          <component
            :is="getComponent(item.type)"
            v-if="item.isContainer"
            v-bind="item.props"
          >
            <FormCanvas
              v-model="item.children"
              :nested-level="nestedLevel + 1"
            />
          </component>

          <!-- 普通组件 -->
          <component
            :is="getComponent(item.type)"
            v-else
            v-bind="item.props"
          />
        </div>
      </template>
    </Draggable>
  </div>
</template>
```

**方案 B：Tree 数据结构 + 平铺渲染**
```typescript
// 将树形结构拍平为列表，通过 parentId 关联
interface FlattenedItem {
  id: string
  parentId: string | null
  type: string
  props: Record<string, any>
  sort: number
}
```

**可行性**: ✅ **可行，递归方案更优**

---

#### 2.3 右侧：属性配置面板

**功能描述**
- 点击画布中的组件，显示其属性配置
- 支持动态表单（根据组件类型生成不同的配置项）
- 支持属性、插槽、事件的配置
- **关键：支持动态 DOM（h 函数/TSX）渲染某些配置项**

**技术实现**

**属性配置数据结构**
```typescript
interface PropertySchema {
  // 基础属性
  field: string
  label: string
  type: 'input' | 'select' | 'switch' | 'number' | 'color' | 'custom'

  // 自定义渲染（动态 DOM）
  render?: (context: PropertyRenderContext) => VNode | VNode[]

  // 配置项
  options?: Array<{ label: string; value: any }>
  defaultValue?: any
  required?: boolean
  validator?: (value: any) => boolean
}
```

**动态属性渲染示例**
```typescript
// 组件属性配置定义
const componentPropertySchemas: Record<string, PropertySchema[]> = {
  'el-input': [
    { field: 'placeholder', label: '占位符', type: 'input' },
    { field: 'clearable', label: '可清空', type: 'switch' },
    { field: 'maxlength', label: '最大长度', type: 'number' },
    {
      field: 'prefixIcon',
      label: '前缀图标',
      type: 'custom',
      render: (ctx) => h(IconSelector, {
        modelValue: ctx.value,
        'onUpdate:modelValue': (v) => ctx.onChange(v)
      })
    }
  ],

  'el-tabs': [
    { field: 'type', label: '风格类型', type: 'select', options: [...] },
    {
      field: 'tabs',
      label: '标签页配置',
      type: 'custom',
      render: (ctx) => h(TabsEditor, {
        modelValue: ctx.value,
        'onUpdate:modelValue': (v) => ctx.onChange(v)
      })
    }
  ]
}
```

**可行性**: ✅ **完全可行**

---

### 第三步：保存与导出

**功能描述**
- 将设计器配置保存为 JSON Schema
- 支持导出为 Vue 组件代码
- 支持预览功能

**技术实现**
```typescript
// 保存的数据结构
interface FormSchema {
  version: string
  baseFields: FieldDefinition[]
  components: ComponentInstance[]
  // 组件实例结构
  // {
  //   id: string
  //   type: string
  //   props: Record<string, any>
  //   children?: ComponentInstance[]
  //   slot?: Record<string, any>
  //   events?: Record<string, string>
  // }
}
```

**可行性**: ✅ **完全可行**

---

## 技术方案选型

### 拖拽库选择

| 库 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| **VueDraggable (SortableJS)** | 功能强大、稳定、支持嵌套 | 文档较旧 | ⭐⭐⭐⭐⭐ |
| vue-draggable-plus | Vue 3 优化版、TypeScript 支持好 | 社区较小 | ⭐⭐⭐⭐ |
| drag-and-drop | 原生 API、轻量 | 功能有限 | ⭐⭐⭐ |

**推荐**: `vue-draggable-plus`

### 动态渲染方案

| 方案 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| **h 函数** | 灵活、性能好、类型推导完整 | 代码可读性稍差 | ⭐⭐⭐⭐⭐ |
| **TSX** | 接近 JSX 语法、可读性好 | 需要额外配置 | ⭐⭐⭐⭐ |
| 动态组件 (`<component>`) | 简单直观 | 灵活性较低 | ⭐⭐⭐ |

**推荐**: 混合使用 - 简单场景用 `<component>`，复杂场景用 `h 函数`

---

## 核心数据结构设计思路

### 1. 基础字段定义
```typescript
interface BaseField {
  id: string
  name: string                 // 字段标识
  label: string                // 显示标签
  type: string                 // 数据类型
  length?: number              // 长度限制
  required?: boolean           // 是否必填
  defaultValue?: any           // 默认值
  // ... 其他属性
}
```

### 2. 组件实例（画布中的节点）
```typescript
interface ComponentInstance {
  id: string                   // 唯一标识
  type: string                 // 组件类型 'el-input', 'custom-user-selector'
  props: Record<string, any>   // 组件属性
  children?: ComponentInstance[]  // 子节点（容器组件）
  slots?: Record<string, any>  // 插槽内容
  events?: Record<string, string> // 事件处理
  fieldId?: string             // 绑定的基础字段ID
}
```

### 3. 组件元数据（左侧面板的组件定义）
```typescript
interface ComponentMeta {
  type: string                 // 组件类型标识
  label: string                // 显示名称
  category: string             // 分类
  icon: Component              // 图标组件
  component: Component         // 实际组件
  isContainer?: boolean        // 是否为容器组件
  defaultProps?: Record<string, any> // 默认属性
  propertySchema: PropertySchema[]    // 属性配置方案
}
```

---

## 关键技术点

### 1. 递归渲染实现
```typescript
// 递归组件需要显式命名
<script setup lang="ts">
// FormCanvas.vue 需要通过文件名实现递归
</script>

<template>
  <div class="canvas">
    <div v-for="item in items" :key="item.id">
      <component
        :is="item.isContainer ? FormContainer : FieldComponent"
        :data="item"
      >
        <template v-if="item.children">
          <FormCanvas :items="item.children" />
        </template>
      </component>
    </div>
  </div>
</template>
```

### 2. 动态属性渲染（h 函数）
```typescript
import { h, resolveComponent } from 'vue'

const renderProperty = (schema: PropertySchema, modelValue: any, onChange: (v: any) => void) => {
  if (schema.render) {
    // 自定义渲染函数
    return schema.render({ value: modelValue, onChange })
  }

  // 内置类型渲染
  switch (schema.type) {
    case 'input':
      return h(resolveComponent('el-input'), {
        modelValue,
        'onUpdate:modelValue': onChange,
        placeholder: schema.label
      })
    case 'switch':
      return h(resolveComponent('el-switch'), {
        modelValue,
        'onUpdate:modelValue': onChange
      })
    // ... 其他类型
  }
}
```

### 3. 拖拽事件处理
```typescript
import { VueDraggable } from 'vue-draggable-plus'

// 拖拽开始
const handleDragStart = (component: ComponentMeta) => {
  dragSource.value = { type: 'component-panel', data: component }
}

// 放置处理
const handleDrop = (targetIndex: number) => {
  if (dragSource.value?.type === 'component-panel') {
    // 从左侧面板拖入
    const newInstance = createComponentInstance(dragSource.value.data)
    formItems.value.splice(targetIndex, 0, newInstance)
  }
}
```

---

## 实现难点与解决方案

### 难点 1：嵌套组件的数据同步

**问题**: 容器组件（如 Tabs）的子节点修改后，如何正确同步到父组件

**解决方案**
```typescript
// 使用 Vue 3 的 toRef + 自定义事件
const updateChild = (parentId: string, childIndex: number, newData: ComponentInstance) => {
  const parent = findComponentById(formItems.value, parentId)
  if (parent?.children) {
    parent.children[childIndex] = newData
  }
}

// 或者使用 Immer 保证不可变性
import { produce } from 'immer'
formItems.value = produce(formItems.value, draft => {
  const parent = findComponentById(draft, parentId)
  parent.children[childIndex] = newData
})
```

### 难点 2：属性配置的动态表单生成

**问题**: 不同组件有不同的属性配置，如何灵活生成

**解决方案**
```typescript
// 使用配置驱动的属性生成器
const PropertyPanel = {
  props: ['selectedComponent'],
  setup(props) {
    const schemas = computed(() => {
      return componentPropertySchemas[props.selectedComponent?.type] || []
    })

    return () => h('div', { class: 'property-panel' },
      schemas.value.map(schema =>
        renderProperty(schema, props.selectedComponent.props[schema.field], (v) => {
          props.selectedComponent.props[schema.field] = v
        })
      )
    )
  }
}
```

### 难点 3：插槽内容的可视化配置

**问题**: 插槽内容可以是任意组件，如何实现拖拽式配置

**解决方案**
```typescript
// 将插槽视为特殊的子节点区域
interface SlotConfig {
  name: string              // 插槽名
  label: string             // 显示标签
  allowMultiple: boolean    // 是否允许多个
  items: ComponentInstance[] // 插槽内容
}

// 组件实例结构扩展
interface ComponentInstance {
  // ...
  slots?: Record<string, SlotConfig>
}
```

---

## 推荐实现路径

### Phase 1：基础框架（1-2天）
- [ ] 搭建三栏布局
- [ ] 实现基础字段选择功能
- [ ] 完成组件拖拽基础功能

### Phase 2：核心设计器（3-5天）
- [ ] 实现递归组件渲染
- [ ] 完成基础组件库（Input, Select, DatePicker 等）
- [ ] 实现属性配置面板

### Phase 3：高级功能（3-4天）
- [ ] 实现容器组件（Tabs, Card, Collapse）
- [ ] 完成动态属性渲染（h 函数）
- [ ] 实现插槽配置

### Phase 4：保存与导出（1-2天）
- [ ] 实现 JSON Schema 导出
- [ ] 实现预览功能
- [ ] 实现 Vue 代码生成

---

## 依赖库推荐

```json
{
  "dependencies": {
    "vue-draggable-plus": "^0.5.0",    // 拖拽功能
    "@vueuse/core": "^11.0.0",          // Vue 工具库
    "jsoneditor": "^10.0.0",            // JSON 预览编辑（可选）
    "lodash-es": "^4.17.21"             // 工具函数
  },
  "devDependencies": {
    "@types/lodash-es": "^4.17.12"
  }
}
```

---

## 参考资料

- [Vue 3 渲染函数](https://cn.vuejs.org/guide/extras/rendering-function.html)
- [vue-draggable-plus 文档](https://github.com/alfred-skyboard/vue-draggable-plus)
- [Element Plus 组件](https://element-plus.org/zh-CN/)
- [低代码平台设计模式](https://www.lowcodevis.cn/)

---

## 下一步

请提供具体的 TypeScript 数据结构定义，我将基于此进行详细设计和代码实现。
