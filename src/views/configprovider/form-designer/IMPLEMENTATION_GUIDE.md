# 表单设计器 - 实现指南

## 第二步：可视化设计器

### 整体布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           表单设计器                                    │
├────────────┬──────────────────────────────────────┬─────────────────────┤
│            │                                      │                     │
│  组件库    │            设计画布                   │    属性面板         │
│            │                                      │                     │
│ ┌────────┐ │  ┌────────────────────────────────┐ │ ┌─────────────────┐ │
│ │ 表单组件│ │  │  ┌──────────────────────────┐  │ │ │  组件: el-input  │ │
│ ├────────┤ │  │  │ [基础字段区域]           │  │ │ ├─────────────────┤ │
│ │input   ├─┼──┼──┼ │ - username (输入框)     │  │ │ │ 属性配置         │ │
│ │select  ├─┼──┼──┼ │ - password (输入框)     │  │ │ │ label: [____]    │ │
│ │date... ├─┼──┼──┼ │ - email (输入框)       │  │ │ │ prop: [____]     │ │
│ ├────────┤ │  │  └──────────────────────────┘  │ │ │ required: [✓]    │ │
│ │ 容器组件│ │  │                              │ │ ├─────────────────┤ │
│ ├────────┤ │  │  ┌──────────────────────────┐  │ │ │ 组件属性         │ │
│ │tabs    ├─┼──┼──┼ │ [拖拽区域]             │  │ │ │ placeholder:     │ │
│ │card    ├─┼──┼──┼ │ ┌────────────────────┐ │  │ │ │ [请输入内容___]  │ │
│ │collapse├─┼──┼──┼ │ │ el-input          │ │  │ │ │ clearable: [✓]   │ │
│ └────────┘ │  │  │ │ │ label: 用户名     │ │  │ │ │ type:            │ │
│            │  │  │ │ └────────────────────┘ │  │ │ │ [text ▼]        │ │
│            │  │  │ └────────────────────────┘ │  │ │ ├─────────────────┤ │
│            │  │                              │  │ │ │ 插槽配置         │ │
│            │  │  ┌──────────────────────────┐  │ │ │ prefix: [____]   │ │
│            │  │  │ el-tabs                 │  │ │ │ suffix: [____]   │ │
│            │  │  │ ├─ Tab1                 │  │ │ ├─────────────────┤ │
│            │  │  │ │  └─ el-input          │  │ │ │ 事件配置         │ │
│            │  │  │ └─ Tab2                 │  │ │ │ @change: [____]  │ │
│            │  │  │    └─ el-input          │  │ │ │ @blur: [____]    │ │
│            │  │  └──────────────────────────┘  │ │ └─────────────────┘ │
│            │                                      │                     │
└────────────┼──────────────────────────────────────┼─────────────────────┘
             │                                      │
           可拖拽                                 动态生成
```

---

## 1. 左侧组件库

### 数据结构

```typescript
// components.ts
import { ComponentMetaMap } from './crawler/element-plus-components'

// 组件分类
export const componentCategories = [
  {
    name: 'form',
    label: '表单组件',
    components: [
      ComponentMetaMap['el-input'],
      ComponentMetaMap['el-select'],
      ComponentMetaMap['el-date-picker'],
      // ...
    ]
  },
  {
    name: 'container',
    label: '容器组件',
    components: [
      ComponentMetaMap['el-tabs'],
      ComponentMetaMap['el-card'],
      ComponentMetaMap['el-collapse'],
    ]
  },
  // ... 其他分类
]

// 添加自定义组件
export const customComponents: ComponentMeta[] = [
  {
    id: 'custom-user-selector',
    label: '用户选择器',
    type: 'UserSelector',
    icon: 'mdi:userName-multiple',
    category: 'form',
    description: '自定义用户选择组件',
    isFormItem: true,
    defaultAttrs: {
      placeholder: '请选择用户',
      multiple: false
    },
    defaultItemAttrs: {
      label: '用户选择器',
      prop: 'userId',
      required: false
    },
    metadata: {
      attributes: [
        { name: 'placeholder', description: '占位文本', type: 'string', default: '' },
        { name: 'multiple', description: '是否多选', type: 'boolean', default: false },
        { name: 'deptId', description: '部门ID', type: 'string', default: '' },
      ],
      slots: [],
      events: [],
      methods: []
    }
  }
]
```

### 组件库面板实现

```vue
<!-- ComponentLibrary.vue -->
<template>
  <div class="component-library">
    <div v-for="category in componentCategories" :key="category.name" class="category">
      <div class="category-header">{{ category.label }}</div>

      <div class="component-list">
        <div
          v-for="comp in category.components"
          :key="comp.id"
          class="component-item"
          draggable="true"
          @dragstart="handleDragStart(comp, $event)"
        >
          <component :is="comp.icon" v-if="isIconComponent(comp.icon)" />
          <span v-else class="icon-placeholder">
            <SvgIcon :icon="comp.icon" />
          </span>
          <span class="component-label">{{ comp.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { componentCategories } from './components'

const emit = defineEmits<{
  dragStart: [component: ComponentMeta, event: DragEvent]
}>()

function handleDragStart(component: ComponentMeta, event: DragEvent) {
  // 设置拖拽数据
  event.dataTransfer?.setData('component-type', component.id)
  event.dataTransfer?.setData('source', 'library')

  emit('dragStart', component, event)
}
</script>

<style scoped lang="scss">
.component-library {
  width: 240px;
  height: 100%;
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;

  .category {
    .category-header {
      padding: 12px;
      font-weight: 600;
      background: var(--el-fill-color-light);
    }

    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 12px;
    }

    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: grab;
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      &:active {
        cursor: grabbing;
      }

      .component-label {
        margin-top: 8px;
        font-size: 12px;
      }
    }
  }
}
</style>
```

---

## 2. 中间设计画布

### 核心组件：递归渲染

```vue
<!-- FormCanvas.vue -->
<template>
  <div
    class="form-canvas"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <!-- 递归渲染组件树 -->
    <template v-for="(item, index) in componentTree" :key="item.id">
      <CanvasNode
        :component="item"
        :selected-id="selectedComponentId"
        @select="handleSelect"
        @update="handleUpdate"
        @delete="handleDelete(index)"
        @insert-child="handleInsertChild($event, index)"
      />
    </template>

    <!-- 空状态提示 -->
    <div v-if="componentTree.length === 0" class="empty-state">
      <el-empty description="从左侧拖拽组件到此处，或添加基础字段">
        <el-button type="primary" @click="$emit('addBaseFields')">添加基础字段</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentInstance } from '../types'
import CanvasNode from './CanvasNode.vue'

const props = defineProps<{
  componentTree: ComponentInstance[]
  selectedComponentId: string | null
}>()

const emit = defineEmits<{
  update: [tree: ComponentInstance[]]
  select: [id: string | null]
  'add-base-fields': []
}>()

function handleDrop(event: DragEvent) {
  const source = event.dataTransfer?.getData('source')
  const componentType = event.dataTransfer?.getData('component-type')

  if (source === 'library' && componentType) {
    // 从组件库拖入
    const newInstance = createComponentInstance(componentType)
    emit('update', [...props.componentTree, newInstance])
  }
}

function handleSelect(id: string) {
  emit('select', id)
}

function handleUpdate(index: number, updated: ComponentInstance) {
  const newTree = [...props.componentTree]
  newTree[index] = updated
  emit('update', newTree)
}

function handleDelete(index: number) {
  const newTree = [...props.componentTree]
  newTree.splice(index, 1)
  emit('update', newTree)
}

function handleInsertChild(child: ComponentInstance, parentIndex: number) {
  // 处理在容器组件中插入子节点
  const parent = props.componentTree[parentIndex]
  if (!parent.children) parent.children = []
  parent.children.push(child)

  const newTree = [...props.componentTree]
  newTree[parentIndex] = { ...parent }
  emit('update', newTree)
}
</script>

<style scoped lang="scss">
.form-canvas {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--el-bg-color-page);

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
}
</style>
```

### 递归节点组件

```vue
<!-- CanvasNode.vue -->
<template>
  <div
    class="canvas-node"
    :class="{
      'is-selected': isSelected,
      'is-container': isContainer,
      'is-form-item': isFormItem
    }"
    @click.stop="handleClick"
  >
    <!-- 基础字段区域（只读，不可删除） -->
    <div v-if="component.fieldId" class="base-field-badge">
      <el-tag size="small" type="info">基础字段</el-tag>
    </div>

    <!-- 容器组件：特殊渲染 -->
    <template v-if="isContainer">
      <component
        :is="getComponent(component.metaId)"
        v-bind="component.props"
        class="container-wrapper"
      >
        <!-- 容器的子节点递归渲染 -->
        <template
          v-for="(slot, slotName) in component.slots"
          :key="slotName"
          #[slotName]
        >
          <Draggable
            v-model="slot"
            group="canvas-components"
            item-key="id"
            @change="handleSlotChange(slotName, $event)"
          >
            <template #item="{ element: child }">
              <CanvasNode
                :component="child"
                :selected-id="selectedId"
                @select="$emit('select', $event)"
                @update="handleChildUpdate(slotName, $event)"
                @delete="handleChildDelete(slotName, $event)"
              />
            </template>
          </Draggable>
        </template>

        <!-- 默认插槽（children） -->
        <Draggable
          v-model="component.children"
          group="canvas-components"
          item-key="id"
          @change="handleChildrenChange"
          class="container-children"
        >
          <template #item="{ element: child }">
            <CanvasNode
              :component="child"
              :selected-id="selectedId"
              @select="$emit('select', $event)"
              @update="handleChildUpdate('children', $event)"
              @delete="handleChildDelete('children', $event)"
            />
          </template>
        </Draggable>
      </component>
    </template>

    <!-- 表单项组件：包裹 FormItem -->
    <template v-else-if="isFormItem">
      <el-form-item
        :label="component.itemProps?.label"
        :prop="component.itemProps?.prop"
        :required="component.itemProps?.required"
        :style="component.style"
      >
        <component
          :is="getComponent(component.metaId)"
          v-bind="component.props"
        />
      </el-form-item>
    </template>

    <!-- 普通组件：直接渲染 -->
    <template v-else>
      <component
        :is="getComponent(component.metaId)"
        v-bind="component.props"
        :style="component.style"
      />
    </template>

    <!-- 选中状态的操作栏 -->
    <div v-if="isSelected" class="node-actions">
      <el-button-group>
        <el-button size="small" @click.stop="handleCopy">复制</el-button>
        <el-button size="small" type="danger" @click.stop="$emit('delete')">删除</el-button>
      </el-button-group>
    </div>

    <!-- 拖拽插入提示 -->
    <div
      v-if="isContainer && isSelected"
      class="insert-hint"
      @drop.stop="handleInsertDrop"
      @dragover.prevent
    >
      <el-icon><Plus /></el-icon>
      <span>拖拽组件到此处</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable as Draggable } from 'vue-draggable-plus'
import { Plus } from '@element-plus/icons-vue'
import type { ComponentInstance } from '../types'
import { ComponentMetaMap } from '../crawler/element-plus-components'

const props = defineProps<{
  component: ComponentInstance
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
  update: [component: ComponentInstance]
  delete: []
  'insert-child': [component: ComponentInstance]
}>()

const meta = computed(() => ComponentMetaMap[props.component.metaId])
const isContainer = computed(() => meta.value?.isContainer)
const isFormItem = computed(() => meta.value?.isFormItem)
const isSelected = computed(() => props.selectedId === props.component.id)

function handleClick() {
  emit('select', props.component.id)
}

function getComponent(metaId: string) {
  const meta = ComponentMetaMap[metaId]
  if (!meta) return 'div'

  // 动态导入组件
  switch (metaId) {
    case 'el-input': return 'el-input'
    case 'el-select': return 'el-select'
    case 'el-tabs': return 'el-tabs'
    // ... 或者使用组件映射
    default: return meta.type
  }
}

function handleCopy() {
  const copied = {
    ...props.component,
    id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  emit('insert-child', copied)
}

function handleInsertDrop(event: DragEvent) {
  const componentType = event.dataTransfer?.getData('component-type')
  if (componentType) {
    const newComponent = createComponentInstance(componentType)
    emit('insert-child', newComponent)
  }
}

function handleChildrenChange(event: any) {
  emit('update', props.component)
}

function handleSlotChange(slotName: string, event: any) {
  emit('update', props.component)
}

function handleChildUpdate(location: string, updated: ComponentInstance[]) {
  // 更新子节点
  if (location === 'children') {
    props.component.children = updated
  } else {
    if (!props.component.slots) props.component.slots = {}
    props.component.slots[location] = updated
  }
  emit('update', { ...props.component })
}

function handleChildDelete(location: string, index: number) {
  if (location === 'children') {
    props.component.children?.splice(index, 1)
  } else {
    props.component.slots?.[location].splice(index, 1)
  }
  emit('update', { ...props.component })
}

function createComponentInstance(metaId: string): ComponentInstance {
  const meta = ComponentMetaMap[metaId]
  if (!meta) throw new Error(`Unknown component: ${metaId}`)

  return {
    id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    metaId: meta.id,
    props: { ...meta.defaultAttrs },
    itemProps: meta.isFormItem ? { ...meta.defaultItemAttrs } : undefined,
    children: meta.isContainer ? [] : undefined,
  }
}
</script>

<style scoped lang="scss">
.canvas-node {
  position: relative;
  margin-bottom: 8px;

  &.is-selected {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }

  &.is-container {
    min-height: 60px;
    padding: 12px;
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .container-children {
    min-height: 40px;
  }

  .node-actions {
    position: absolute;
    top: -12px;
    right: 8px;
    background: white;
    padding: 2px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .insert-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border: 1px dashed var(--el-color-primary);
    border-radius: 4px;
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }

  .base-field-badge {
    position: absolute;
    top: -8px;
    left: 8px;
    z-index: 1;
  }
}
</style>
```

---

## 3. 右侧属性配置面板

### 核心实现：基于元数据动态生成

```vue
<!-- PropertyPanel.vue -->
<template>
  <div class="property-panel">
    <template v-if="selectedMeta">
      <!-- 组件标题 -->
      <div class="panel-header">
        <component :is="selectedMeta.icon" v-if="isIconComponent(selectedMeta.icon)" />
        <span class="component-name">{{ selectedMeta.label }}</span>
        <el-tag size="small" type="info">{{ selectedComponent.metaId }}</el-tag>
      </div>

      <el-divider />

      <!-- FormItem 配置（仅表单组件） -->
      <template v-if="selectedMeta.isFormItem">
        <div class="section-title">表单项配置</div>
        <el-form :model="selectedComponent.itemProps" label-width="80px" size="small">
          <el-form-item label="标签">
            <el-input v-model="selectedComponent.itemProps!.label" />
          </el-form-item>
          <el-form-item label="字段名">
            <el-input v-model="selectedComponent.itemProps!.prop" />
          </el-form-item>
          <el-form-item label="必填">
            <el-switch v-model="selectedComponent.itemProps!.required" />
          </el-form-item>
        </el-form>
        <el-divider />
      </template>

      <!-- 组件属性配置 -->
      <div class="section-title">组件属性</div>
      <el-form :model="selectedComponent.props" label-width="100px" size="small">
        <template v-for="attr in selectedMeta.metadata.attributes" :key="attr.name">
          <!-- 动态属性渲染 -->
          <PropertyField
            :attr="attr"
            :value="selectedComponent.props[attr.name]"
            @update="handleUpdateProp(attr.name, $event)"
          />
        </template>
      </el-form>

      <el-divider />

      <!-- 插槽配置 -->
      <template v-if="selectedMeta.metadata.slots.length > 0">
        <div class="section-title">插槽配置</div>
        <el-form label-width="100px" size="small">
          <el-form-item
            v-for="slot in selectedMeta.metadata.slots"
            :key="slot.name"
            :label="slot.name"
          >
            <el-input
              v-model="selectedComponent.slots![slot.name]"
              :placeholder="slot.description"
            />
          </el-form-item>
        </el-form>
        <el-divider />
      </template>

      <!-- 事件配置 -->
      <template v-if="selectedMeta.metadata.events.length > 0">
        <div class="section-title">事件配置</div>
        <el-form label-width="100px" size="small">
          <el-form-item
            v-for="event in selectedMeta.metadata.events"
            :key="event.name"
            :label="`@${event.name}`"
          >
            <el-input
              v-model="selectedComponent.events![event.name]"
              :placeholder="`处理函数名 (如: handle${capitalize(event.name)})`"
            />
          </el-form-item>
        </el-form>
      </template>

      <!-- 样式配置 -->
      <el-divider />
      <div class="section-title">样式配置</div>
      <StyleEditor v-model="selectedComponent.style" />
    </template>

    <!-- 未选中状态 -->
    <el-empty v-else description="请选择组件" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PropertyField from './PropertyField.vue'
import StyleEditor from './StyleEditor.vue'
import { ComponentMetaMap } from '../crawler/element-plus-components'
import type { ComponentInstance } from '../types'

const props = defineProps<{
  selectedComponent: ComponentInstance | null
}>()

const selectedMeta = computed(() => {
  if (!props.selectedComponent) return null
  return ComponentMetaMap[props.selectedComponent.metaId]
})

function handleUpdateProp(propName: string, value: any) {
  if (props.selectedComponent) {
    props.selectedComponent.props[propName] = value
  }
}

function isIconComponent(icon: string): boolean {
  return icon.startsWith('mdi:') || icon.startsWith('icon-')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped lang="scss">
.property-panel {
  width: 320px;
  height: 100%;
  border-left: 1px solid var(--el-border-color);
  padding: 16px;
  overflow-y: auto;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .component-name {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }
}
</style>
```

### 动态属性字段组件

```vue
<!-- PropertyField.vue -->
<template>
  <el-form-item :label="attr.description || attr.name">
    <!-- 布尔类型：开关 -->
    <el-switch
      v-if="attr.type?.includes('boolean') || attr.name.startsWith('is')"
      :model-value="value"
      @update:model-value="$emit('update', $event)"
    />

    <!-- 数字类型：输入框 -->
    <el-input-number
      v-else-if="attr.type?.includes('number')"
      :model-value="value"
      @update:model-value="$emit('update', $event)"
      :controls-position="'right'"
    />

    <!-- 带选项的：下拉框 -->
    <el-select
      v-else-if="attr.options && attr.options.length > 0"
      :model-value="value"
      @update:model-value="$emit('update', $event)"
    >
      <el-option
        v-for="opt in attr.options"
        :key="opt"
        :label="opt"
        :value="opt"
      />
    </el-select>

    <!-- 颜色类型：颜色选择器 -->
    <el-color-picker
      v-else-if="attr.name?.toLowerCase().includes('color')"
      :model-value="value"
      @update:model-value="$emit('update', $event)"
    />

    <!-- 图标类型：图标选择器 -->
    <IconSelector
      v-else-if="attr.name?.toLowerCase().includes('icon')"
      :model-value="value"
      @update:model-value="$emit('update', $event)"
    />

    <!-- 默认：文本输入框 -->
    <el-input
      v-else
      :model-value="value"
      @update:model-value="$emit('update', $event)"
      :placeholder="attr.description"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import type { AttributeMeta } from '../types'

defineProps<{
  attr: AttributeMeta
  value: any
}>()

defineEmits<{
  update: [value: any]
}>()
</script>
```

### 图标选择器组件

```vue
<!-- IconSelector.vue -->
<template>
  <div class="icon-selector">
    <el-input
      :model-value="modelValue"
      placeholder="选择图标"
      readonly
      @click="dialogVisible = true"
    >
      <template #prefix>
        <SvgIcon v-if="modelValue" :icon="modelValue" />
      </template>
    </el-input>

    <el-dialog v-model="dialogVisible" title="选择图标" width="600px">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索图标..."
        clearable
        style="margin-bottom: 16px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="icon-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ active: modelValue === icon }"
          @click="handleSelect(icon)"
        >
          <SvgIcon :icon="icon" />
          <span class="icon-name">{{ icon }}</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const dialogVisible = ref(false)
const searchKeyword = ref('')
const selectedIcon = ref('')

// Material Design Icons 列表
const mdiIcons = [
  'mdi:userName', 'mdi:home', 'mdi:settings', 'mdi:email',
  // ... 更多图标
]

const filteredIcons = computed(() => {
  if (!searchKeyword.value) return mdiIcons
  return mdiIcons.filter(icon =>
    icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

function handleSelect(icon: string) {
  selectedIcon.value = icon
}

function handleConfirm() {
  emit('update:modelValue', selectedIcon.value)
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-8);
    }

    .icon-name {
      margin-top: 4px;
      font-size: 10px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
```

### 样式编辑器组件

```vue
<!-- StyleEditor.vue -->
<template>
  <div class="style-editor">
    <div
      v-for="(value, key) in styleModel"
      :key="key"
      class="style-row"
    >
      <el-input
        v-model="styleModel[key]"
        :placeholder="getStylePlaceholder(key)"
        size="small"
      >
        <template #prepend>{{ key }}</template>
        <template #append>
          <el-button
            :icon="Delete"
            @click="deleteStyle(key)"
          />
        </template>
      </el-input>
    </div>

    <el-dropdown @command="handleAddStyle">
      <el-button size="small" style="width: 100%">
        <el-icon><Plus /></el-icon>
        添加样式
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="prop in commonStyleProps"
            :key="prop.name"
            :command="prop.name"
          >
            {{ prop.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: Record<string, string> | null | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const styleModel = computed<Record<string, string>>({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
})

const commonStyleProps = [
  { name: 'width', label: '宽度' },
  { name: 'height', label: '高度' },
  { name: 'margin', label: '外边距' },
  { name: 'padding', label: '内边距' },
  { name: 'fontSize', label: '字体大小' },
  { name: 'color', label: '文字颜色' },
  { name: 'backgroundColor', label: '背景颜色' },
  { name: 'border', label: '边框' },
  { name: 'borderRadius', label: '圆角' },
]

function getStylePlaceholder(prop: string): string {
  const map: Record<string, string> = {
    width: '100px / 50%',
    height: '100px',
    margin: '10px',
    padding: '10px',
    fontSize: '14px',
    color: '#333333',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '4px',
  }
  return map[prop] || '输入值'
}

function handleAddStyle(propName: string) {
  styleModel.value[propName] = ''
}

function deleteStyle(key: string) {
  delete styleModel.value[key]
  emit('update:modelValue', { ...styleModel.value })
}
</script>

<style scoped lang="scss">
.style-editor {
  .style-row {
    margin-bottom: 8px;
  }
}
</style>
```

---

## 第三步：完成保存

### 3.1 预览功能

```vue
<!-- PreviewModal.vue -->
<template>
  <el-dialog
    v-model="visible"
    title="表单预览"
    width="800px"
    :fullscreen="isFullscreen"
  >
    <template #header>
      <div class="preview-header">
        <span>表单预览</span>
        <div class="actions">
          <el-button
            :icon="isFullscreen ? ExitFullScreen : FullScreen"
            circle
            @click="isFullscreen = !isFullscreen"
          />
        </div>
      </div>
    </template>

    <!-- 预览区域 -->
    <div class="preview-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <FormRenderer :component-tree="componentTree" />
      </el-form>
    </div>

    <!-- 表单数据 -->
    <el-divider>表单数据</el-divider>
    <el-input
      :model-value="JSON.stringify(formData, null, 2)"
      type="textarea"
      :rows="6"
      readonly
    />

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="handleSubmit">提交表单</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { FullScreen, ExitFullScreen } from '@element-plus/icons-vue'
import FormRenderer from './FormRenderer.vue'
import type { ComponentInstance } from '../types'
import { buildFormRules, buildFormData } from '../utils/form-builder'

const props = defineProps<{
  componentTree: ComponentInstance[]
}>()

const visible = ref(false)
const isFullscreen = ref(false)
const formRef = ref()
const formData = reactive<Record<string, any>>({})
const formRules = ref<Record<string, any>>({})

watch(() => props.componentTree, (tree) => {
  if (tree.length > 0) {
    // 构建表单数据和规则
    Object.assign(formData, buildFormData(tree))
    formRules.value = buildFormRules(tree)
  }
}, { immediate: true })

function handleSubmit() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('表单验证通过！')
      console.log('提交数据：', formData)
    } else {
      ElMessage.error('表单验证失败！')
    }
  })
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .actions {
    display: flex;
    gap: 8px;
  }
}

.preview-content {
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 4px;
}
</style>
```

### 3.2 表单渲染器（只读）

```vue
<!-- FormRenderer.vue -->
<template>
  <div class="form-renderer">
    <template v-for="item in componentTree" :key="item.id">
      <RendererNode :component="item" />
    </template>
  </div>
</template>

<script setup lang="ts">
import RendererNode from './RendererNode.vue'
import type { ComponentInstance } from '../types'

defineProps<{
  componentTree: ComponentInstance[]
}>()
</script>

<!-- RendererNode.vue -->
<template>
  <component
    :is="rendererComponent"
    :component="component"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RendererFormItem from './RendererFormItem.vue'
import RendererContainer from './RendererContainer.vue'
import type { ComponentInstance } from '../types'

const props = defineProps<{
  component: ComponentInstance
}>()

const rendererComponent = computed(() => {
  // 容器组件使用容器渲染器
  if (props.component.children) {
    return RendererContainer
  }
  // 其他组件使用表单项渲染器
  return RendererFormItem
})
</script>
```

### 3.3 导出功能

```vue
<!-- ExportDialog.vue -->
<template>
  <el-dialog v-model="visible" title="导出配置" width="600px">
    <el-radio-group v-model="exportType" style="margin-bottom: 16px">
      <el-radio-button value="json">JSON 配置</el-radio-button>
      <el-radio-button value="code">Vue 代码</el-radio-button>
    </el-radio-group>

    <!-- JSON 导出 -->
    <div v-if="exportType === 'json'" class="export-content">
      <el-input
        :model-value="jsonOutput"
        type="textarea"
        :rows="12"
        readonly
      />
      <el-button type="primary" style="margin-top: 12px" @click="copyJSON">
        复制 JSON
      </el-button>
    </div>

    <!-- Vue 代码导出 -->
    <div v-else class="export-content">
      <el-input
        :model-value="codeOutput"
        type="textarea"
        :rows="12"
        readonly
      />
      <el-button type="primary" style="margin-top: 12px" @click="copyCode">
        复制代码
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ComponentInstance } from '../types'
import { componentInstanceToTableFormItem } from '../types'
import { generateVueCode } from '../utils/code-generator'

const props = defineProps<{
  componentTree: ComponentInstance[]
}>()

const visible = ref(false)
const exportType = ref<'json' | 'code'>('json')

// JSON 输出（后端格式）
const jsonOutput = computed(() => {
  const tableFormItems = props.componentTree.map(componentInstanceToTableFormItem)
  return JSON.stringify(tableFormItems, null, 2)
})

// Vue 代码输出
const codeOutput = computed(() => {
  return generateVueCode(props.componentTree)
})

function copyJSON() {
  navigator.clipboard.writeText(jsonOutput.value)
  ElMessage.success('JSON 已复制到剪贴板')
}

function copyCode() {
  navigator.clipboard.writeText(codeOutput.value)
  ElMessage.success('代码已复制到剪贴板')
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>
```

### 3.4 Vue 代码生成器

```typescript
// utils/code-generator.ts
import type { ComponentInstance } from '../types'
import { ComponentMetaMap } from '../crawler/element-plus-components'

export function generateVueCode(componentTree: ComponentInstance[]): string {
  const template = generateTemplate(componentTree)
  const script = generateScript(componentTree)
  const style = generateStyle()

  return `<template>
${template}
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

${script}
</script>

<style scoped>
${style}
</style>
`
}

function generateTemplate(tree: ComponentInstance[], indent = 2): string {
  const spaces = ' '.repeat(indent)

  return tree.map(item => {
    const meta = ComponentMetaMap[item.metaId]
    if (!meta) return ''

    // 容器组件
    if (item.children && item.children.length > 0) {
      const children = generateTemplate(item.children, indent + 2)
      return `${spaces}<${meta.type} ${generateProps(item.props)}>
${children}
${spaces}</${meta.type}>`
    }

    // 表单项组件
    if (meta.isFormItem && item.itemProps) {
      return `${spaces}<el-form-item label="${item.itemProps.label}" prop="${item.itemProps.prop}"${item.itemProps.required ? ' required' : ''}>
${spaces}  <${meta.type} ${generateProps(item.props)} />
${spaces}</el-form-item>`
    }

    // 普通组件
    return `${spaces}<${meta.type} ${generateProps(item.props)} />`
  }).join('\n')
}

function generateProps(props: Record<string, any>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (value === true) return key
      if (value === false) return `:${key}="false"`
      if (typeof value === 'string') return `${key}="${value}"`
      return `:${key}='${JSON.stringify(value)}'`
    })
    .join(' ')
}

function generateScript(tree: ComponentInstance[]): string {
  const formData = buildFormDataDeclaration(tree)
  const formRules = buildFormRulesDeclaration(tree)

  return `// 表单数据
const formData = reactive<Record<string, any>>({
${formData}
})

// 表单验证规则
const formRules: FormRules = {
${formRules}
}

// 表单引用
const formRef = ref<FormInstance>()

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('表单数据：', formData)
      // TODO: 提交到后端
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}`
}

function generateStyle(): string {
  return `/* 样式可根据需要自定义 */`
}

function buildFormDataDeclaration(tree: ComponentInstance[]): string {
  const props: string[] = []

  function traverse(items: ComponentInstance[]) {
    items.forEach(item => {
      if (item.itemProps?.prop) {
        const meta = ComponentMetaMap[item.metaId]
        const defaultValue = getDefaultValue(item, meta)
        props.push(`  ${item.itemProps.prop}: ${JSON.stringify(defaultValue)}`)
      }
      if (item.children) traverse(item.children)
    })
  }

  traverse(tree)
  return props.join(',\n')
}

function buildFormRulesDeclaration(tree: ComponentInstance[]): string {
  const rules: string[] = []

  function traverse(items: ComponentInstance[]) {
    items.forEach(item => {
      if (item.itemProps?.required && item.itemProps?.prop) {
        rules.push(`  ${item.itemProps.prop}: [{ required: true, message: '请输入${item.itemProps.label}', trigger: 'blur' }]`)
      }
      if (item.children) traverse(item.children)
    })
  }

  traverse(tree)
  return rules.join(',\n')
}

function getDefaultValue(instance: ComponentInstance, meta: any): any {
  if (instance.props.modelValue !== undefined) {
    return instance.props.modelValue
  }

  switch (instance.metaId) {
    case 'el-switch': return false
    case 'el-input-number': return 0
    case 'el-checkbox-group': return []
    case 'el-rate': return 0
    default: return ''
  }
}
```

### 3.5 表单构建工具

```typescript
// utils/form-builder.ts
import type { ComponentInstance } from '../types'
import { ComponentMetaMap } from '../crawler/element-plus-components'

/**
 * 构建表单数据
 */
export function buildFormData(tree: ComponentInstance[]): Record<string, any> {
  const data: Record<string, any> = {}

  function traverse(items: ComponentInstance[]) {
    items.forEach(item => {
      if (item.itemProps?.prop) {
        const meta = ComponentMetaMap[item.metaId]
        data[item.itemProps.prop] = getDefaultValue(item, meta)
      }
      if (item.children) traverse(item.children)
    })
  }

  traverse(tree)
  return data
}

/**
 * 构建表单验证规则
 */
export function buildFormRules(tree: ComponentInstance[]): Record<string, any> {
  const rules: Record<string, any> = {}

  function traverse(items: ComponentInstance[]) {
    items.forEach(item => {
      if (item.itemProps?.required && item.itemProps?.prop) {
        rules[item.itemProps.prop] = [
          { required: true, message: `请输入${item.itemProps.label}`, trigger: 'blur' }
        ]
      }
      if (item.children) traverse(item.children)
    })
  }

  traverse(tree)
  return rules
}

function getDefaultValue(instance: ComponentInstance, meta: any): any {
  if (instance.props.modelValue !== undefined) {
    return instance.props.modelValue
  }

  switch (instance.metaId) {
    case 'el-switch': return false
    case 'el-input-number': return 0
    case 'el-checkbox-group': return []
    case 'el-rate': return 0
    default: return ''
  }
}
```

---

## 完整文件结构

```
src/views/form-designer/
├── index.vue                          # 主入口（三步导航）
├── types/
│   └── index.ts                       # 类型定义
├── crawler/
│   ├── generate_components.py         # 组件元数据生成器
│   ├── element-plus-components.ts     # 组件元数据（生成的）
│   └── README.md
├── Step1_BaseFields.vue              # 第一步：基础字段选择
├── Step2_Designer.vue                 # 第二步：设计器
│   ├── ComponentLibrary.vue          # 左侧组件库
│   ├── FormCanvas.vue                # 中间画布
│   │   └── CanvasNode.vue            # 递归节点
│   └── PropertyPanel.vue             # 右侧属性面板
│       ├── PropertyField.vue         # 动态属性字段
│       ├── IconSelector.vue          # 图标选择器
│       └── StyleEditor.vue           # 样式编辑器
├── Step3_Complete.vue                 # 第三步：完成
│   ├── PreviewModal.vue              # 预览弹窗
│   ├── ExportDialog.vue              # 导出弹窗
│   └── FormRenderer.vue              # 表单渲染器
├── utils/
│   ├── code-generator.ts             # Vue 代码生成
│   └── form-builder.ts               # 表单构建工具
└── components/
    └── SvgIcon.vue                   # SVG 图标组件
```

---

## 依赖安装

```bash
pnpm add vue-draggable-plus @element-plus/icons-vue
```

---

## 开发步骤建议

1. **第一步**：实现基础字段选择界面
2. **第二步**：
   - 实现左侧组件库
   - 实现中间画布的递归渲染
   - 实现右侧属性面板的动态生成
3. **第三步**：
   - 实现预览功能
   - 实现导出 JSON
   - 实现导出 Vue 代码
