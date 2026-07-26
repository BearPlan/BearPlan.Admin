<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useMemoize } from '@vueuse/core';
import { VueDraggable } from 'vue-draggable-plus';
import type { ComponentDesignData } from '@/typings/form-designer';

defineOptions({
  name: 'ComponentRenderer'
});

interface Props {
  component: ComponentDesignData;
  selected?: boolean;
  previewMode?: boolean;
  formModel?: Record<string, any>;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  previewMode: false,
  formModel: () => ({}),
  canMoveUp: true,
  canMoveDown: true
});

const emit = defineEmits<{
  select: [component: ComponentDesignData];
  delete: [componentId: string];
  copy: [componentId: string];
  move: [componentId: string, direction: 'up' | 'down'];
}>();

// 响应式数据
const selectedComponentId = ref<string | null>(null);

// 计算属性
const { component, selected, previewMode, formModel } = toRefs(props);

const isContainer = computed(() => {
  if (!component.value) return false;
  const containerTypes = [
    'ElRow',
    'ElCol',
    'ElCard',
    'ElTabs',
    'ElTabPane',
    'ElCollapse',
    'ElCollapseItem',
    'ElSpace',
    'ElDivider'
  ];
  return containerTypes.includes(component.value.type);
});

const isFormItem = computed(() => {
  if (!component.value) return false;
  const formItemTypes = [
    'ElInput',
    'ElSelect',
    'ElDatePicker',
    'ElSwitch',
    'ElRadioGroup',
    'ElCheckboxGroup',
    'ElInputNumber',
    'ElSlider',
    'ElRate',
    'ElColorPicker',
    'ElUpload'
  ];
  return formItemTypes.includes(component.value.type);
});

const isEmpty = computed(() => {
  if (!isContainer.value || !component.value) return false;
  const defaultSlot = getSlotDefault();
  return !defaultSlot || defaultSlot.length === 0;
});

const mergedAttrs = computed(() => {
  if (!component.value) return {};
  const attrs = { ...component.value.attrs };

  if (component.value.style && Object.keys(component.value.style).length > 0) {
    attrs.style = component.value.style;
  }

  return attrs;
});

const formModelValue = computed({
  get() {
    if (!component.value) return '';
    const prop = (component.value.itemAttrs || {}).prop;
    return prop ? formModel.value[prop] || '' : '';
  },
  set(value) {
    if (!component.value) return;
    const prop = (component.value.itemAttrs || {}).prop;
    if (prop && formModel.value) {
      formModel.value[prop] = value;
    }
  }
});

// 方法
const getComponentType = (type: string) => {
  const componentMap: Record<string, string> = {
    ElInput: 'ElInput',
    ElButton: 'ElButton',
    ElSelect: 'ElSelect',
    ElOption: 'ElOption',
    ElDatePicker: 'ElDatePicker',
    ElSwitch: 'ElSwitch',
    ElRadioGroup: 'ElRadioGroup',
    ElRadio: 'ElRadio',
    ElCheckboxGroup: 'ElCheckboxGroup',
    ElCheckbox: 'ElCheckbox',
    ElInputNumber: 'ElInputNumber',
    ElRow: 'ElRow',
    ElCol: 'ElCol',
    ElCard: 'ElCard',
    ElText: 'ElText',
    ElLink: 'ElLink'
  };

  return componentMap[type] || type;
};

const getSlotDefault = useMemoize(() => {
  if (!component.value || !component.value.slots) return [];
  return component.value.slots.default || [];
});

const getDefaultContent = () => {
  if (!component.value) return '';
  const contentMap: Record<string, string> = {
    ElButton: (component.value.attrs || {}).text || '按钮',
    ElText: (component.value.attrs || {}).text || '文本内容',
    ElLink: (component.value.attrs || {}).text || '链接'
  };

  return contentMap[component.value.type] || '';
};

const getSelectOptions = useMemoize(() => {
  if (!component.value || !component.value.attrs) return [];
  return component.value.attrs.options || [];
});

const getRadioOptions = useMemoize(() => {
  if (!component.value || !component.value.attrs) return [];
  return (
    component.value.attrs.options || [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2' }
    ]
  );
});

const getCheckboxOptions = useMemoize(() => {
  if (!component.value || !component.value.attrs) return [];
  return (
    component.value.attrs.options || [
      { label: '选项1', value: '1' },
      { label: '选项2', value: '2' }
    ]
  );
});

const handleSelect = () => {
  if (!previewMode.value && component.value) {
    emit('select', component.value);
  }
};

const handleDelete = () => {
  if (component.value) {
    emit('delete', component.value.id);
  }
};

const handleCopy = () => {
  if (component.value) {
    emit('copy', component.value.id);
  }
};

const handleMoveUp = () => {
  if (component.value) {
    emit('move', component.value.id, 'up');
  }
};

const handleMoveDown = () => {
  if (component.value) {
    emit('move', component.value.id, 'down');
  }
};

const handleChildSelect = (childComponent: ComponentDesignData) => {
  selectedComponentId.value = childComponent.id;
  emit('select', childComponent);
};

const updateSlots = (newSlots: any[]) => {
  if (component.value && component.value.slots) {
    // 更新组件的 slots 数据
    component.value.slots.default = newSlots;

    // 同时更新 store 中的数据
    // 这里可以触发一个事件或调用 store 的方法来同步数据
    console.log('Updated slots for component:', component.value.id, newSlots);
  }
};

// 嵌套拖拽事件处理
const handleNestedAdd = (evt: any) => {
  console.log('Nested add:', evt);
  // 处理嵌套添加逻辑
};

const handleNestedRemove = (evt: any) => {
  console.log('Nested remove:', evt);
  // 处理嵌套移除逻辑
};

const handleNestedChange = (evt: any) => {
  console.log('Nested change:', evt);
  // 处理嵌套变化逻辑
};

// 容器相关方法
const getContainerIcon = () => {
  if (!component.value) return 'mdi:cube-outline';
  const iconMap: Record<string, string> = {
    ElRow: 'mdi:view-column-outline',
    ElCol: 'mdi:view-column',
    ElCard: 'mdi:card-outline',
    ElTabs: 'mdi:tab',
    ElTabPane: 'mdi:tab-plus',
    ElCollapse: 'mdi:chevron-down',
    ElCollapseItem: 'mdi:chevron-right',
    ElSpace: 'mdi:view-grid-outline',
    ElDivider: 'mdi:minus'
  };
  return iconMap[component.value.type] || 'mdi:cube-outline';
};

const getContainerTitle = () => {
  if (!component.value) return '容器';
  const titleMap: Record<string, string> = {
    ElRow: '行容器',
    ElCol: '列容器',
    ElCard: '卡片容器',
    ElTabs: '标签页容器',
    ElTabPane: '标签页',
    ElCollapse: '折叠面板',
    ElCollapseItem: '折叠项',
    ElSpace: '间距容器',
    ElDivider: '分割线'
  };
  return titleMap[component.value.type] || '容器';
};
</script>

<template>
  <div v-if="component" class="component-wrapper">
    <!-- 组件操作工具栏 -->
    <div v-if="selected && !previewMode" class="component-toolbar" @click.stop>
      <ElButton size="small" type="primary" link title="复制组件" @click="handleCopy">
        <SvgIcon icon="mdi:content-copy" />
      </ElButton>

      <ElButton size="small" type="primary" link title="上移" :disabled="!canMoveUp" @click="handleMoveUp">
        <SvgIcon icon="mdi:arrow-up" />
      </ElButton>

      <ElButton size="small" type="primary" link title="下移" :disabled="!canMoveDown" @click="handleMoveDown">
        <SvgIcon icon="mdi:arrow-down" />
      </ElButton>

      <ElButton size="small" type="danger" link title="删除组件" @click="handleDelete">
        <SvgIcon icon="mdi:delete" />
      </ElButton>
    </div>

    <!-- 选中状态指示器 -->
    <div v-if="selected && !previewMode" class="selection-indicator">
      <span class="component-type-label">{{ component.type }}</span>
    </div>

    <!-- 容器组件的嵌套拖拽 -->
    <ElCard
      v-if="isContainer"
      class="container-component"
      :class="{
        selected: selected && !previewMode,
        empty: isEmpty
      }"
      shadow="hover"
      @click.stop="handleSelect"
    >
      <!-- 容器标题 -->
      <div v-if="!previewMode" class="container-header">
        <SvgIcon :icon="getContainerIcon()" class="container-icon" />
        <span class="container-title">{{ getContainerTitle() }}</span>
        <ElTag type="info" size="small" class="container-count">{{ getSlotDefault().length }} 项</ElTag>
      </div>

      <!-- 嵌套拖拽区域 -->
      <VueDraggable
        v-if="!previewMode"
        :model-value="getSlotDefault()"
        class="nested-drag-area"
        :class="{ 'drag-area-empty': isEmpty }"
        :group="{
          name: 'nested-components',
          pull: true,
          put: true
        }"
        :animation="200"
        item-key="id"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
        drag-class="sortable-drag"
        handle=".drag-handle"
        @update:model-value="updateSlots"
        @add="handleNestedAdd"
        @remove="handleNestedRemove"
        @change="handleNestedChange"
      >
        <template #item="{ element: child, index }">
          <div class="nested-item">
            <div class="drag-handle">
              <SvgIcon icon="mdi:drag-horizontal-variant" />
            </div>
            <ComponentRenderer
              :key="child.id"
              :component="child"
              :selected="selectedComponentId === child.id"
              :preview-mode="previewMode"
              :form-model="formModel"
              :can-move-up="index > 0"
              :can-move-down="index < getSlotDefault().length - 1"
              @select="handleChildSelect"
              @delete="$emit('delete', $event)"
              @copy="$emit('copy', $event)"
              @move="$emit('move', $event)"
            />
          </div>
        </template>
      </VueDraggable>

      <!-- 预览模式的容器内容 -->
      <div v-else class="container-preview">
        <ComponentRenderer
          v-for="child in getSlotDefault()"
          :key="child.id"
          :component="child"
          :selected="selectedComponentId === child.id"
          :preview-mode="previewMode"
          :form-model="formModel"
          @select="handleChildSelect"
          @delete="$emit('delete', $event)"
          @copy="$emit('copy', $event)"
          @move="$emit('move', $event)"
        />
      </div>

      <!-- 空状态提示 -->
      <div v-if="isEmpty && !previewMode" class="nested-empty-hint">
        <SvgIcon icon="mdi:plus-circle-outline" class="empty-icon" />
        <span class="empty-text">拖拽组件到此容器</span>
      </div>
    </ElCard>

    <!-- 表单项组件 -->
    <ElCard
      v-if="isFormItem && !previewMode"
      class="form-item-card"
      :class="{ selected: selected }"
      shadow="never"
      @click.stop="handleSelect"
    >
      <ElFormItem v-bind="component.itemAttrs || {}" class="form-item-wrapper">
        <component
          :is="getComponentType(component.type)"
          v-bind="mergedAttrs"
          v-model="formModelValue"
          class="rendered-component"
          v-on="component.events || {}"
        >
          <!-- 选项渲染 -->
          <template v-if="component.type === 'ElSelect'">
            <ElOption
              v-for="option in getSelectOptions()"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </template>

          <template v-if="component.type === 'ElRadioGroup'">
            <ElRadio v-for="option in getRadioOptions()" :key="option.value" :label="option.value">
              {{ option.label }}
            </ElRadio>
          </template>

          <template v-if="component.type === 'ElCheckboxGroup'">
            <ElCheckbox v-for="option in getCheckboxOptions()" :key="option.value" :label="option.value">
              {{ option.label }}
            </ElCheckbox>
          </template>
        </component>
      </ElFormItem>
    </ElCard>

    <ElFormItem
      v-else-if="isFormItem && previewMode"
      v-bind="component.itemAttrs || {}"
      class="form-item-wrapper preview-mode"
    >
      <component
        :is="getComponentType(component.type)"
        v-bind="mergedAttrs"
        v-model="formModelValue"
        class="rendered-component"
        v-on="component.events || {}"
      />
    </ElFormItem>
    <!-- 普通组件 -->
    <div v-else class="simple-component" :class="{ selected: selected && !previewMode }" @click.stop="handleSelect">
      <component
        :is="getComponentType(component.type)"
        v-bind="mergedAttrs"
        class="rendered-component"
        v-on="component.events || {}"
      >
        {{ getDefaultContent() }}
      </component>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.component-wrapper {
  position: relative;
  margin-bottom: 16px;

  // 组件操作工具栏
  .component-toolbar {
    position: absolute;
    top: -16px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #409eff;
    border-radius: 4px;
    padding: 2px;
    z-index: 100;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-button) {
      color: #ffffff;
      padding: 4px;
      margin: 0 2px;

      &:hover {
        background-color: #66b1ff;
      }

      &.is-disabled {
        color: #c0c4cc;
        background-color: transparent;
      }
    }
  }

  // 选中状态指示器
  .selection-indicator {
    position: absolute;
    top: -16px;
    left: 8px;
    background-color: #409eff;
    color: #ffffff;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    z-index: 99;
  }

  // 容器组件
  .container-component {
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    margin-bottom: 16px;
    transition: all 0.2s;
    position: relative;

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &.empty {
      min-height: 100px;
    }

    .container-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #ebeef5;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;

      .container-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #606266;
      }

      .container-title {
        flex: 1;
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .container-count {
        :deep(.el-tag__content) {
          font-size: 12px;
        }
      }
    }

    .nested-drag-area {
      min-height: 100px;
      padding: 16px;
      transition: all 0.3s;

      &.drag-area-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 150px;
        border: 1px dashed #dcdfe6;
        border-radius: 4px;
      }

      .nested-item {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;

        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #ebeef5;
          border-radius: 4px;
          margin-right: 4px;
          cursor: move;
          color: #909399;

          &:hover {
            background-color: #dcdfe6;
            color: #606266;
          }
        }
      }
    }

    .container-preview {
      padding: 16px;
    }

    .nested-empty-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 24px;
      color: #909399;

      .empty-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .empty-text {
        font-size: 13px;
      }
    }
  }

  // 表单项组件
  .form-item-card {
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    margin-bottom: 0;
    transition: all 0.2s;

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }

    .form-item-wrapper {
      margin-bottom: 0;

      :deep(.el-form-item__label) {
        font-weight: 500;
      }

      :deep(.el-form-item__content) {
        // 确保内容区域正确显示
      }
    }
  }

  // 普通组件
  .simple-component {
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 0;
    transition: all 0.2s;

    &.selected {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }

  // 预览模式下的表单项
  .form-item-wrapper.preview-mode {
    margin-bottom: 24px;

    :deep(.el-form-item__label) {
      font-weight: 500;
    }
  }

  // 拖拽相关样式
  .sortable-ghost {
    opacity: 0.5;
    background-color: #ecf5ff;
  }

  .sortable-chosen {
    border-color: #409eff !important;
  }

  .sortable-drag {
    opacity: 0.8;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}
</style>
