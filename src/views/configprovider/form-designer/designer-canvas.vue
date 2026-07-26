<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { FormComponent } from '@/api/globals';
import { getDefaultComponent } from './component-map';

defineOptions({ name: 'DesignerCanvas' });

const props = defineProps<{
  /** 画布组件列表（完整），与父级 v-model 双向绑定 */
  modelValue: FormComponent[];
  /** 当前选中组件的 prop（用作唯一标识） */
  selectedId?: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormComponent[]];
  select: [component: FormComponent];
}>();

/**
 * VueDraggable 直接 mutate 完整 modelValue（排序、clone 拖入都写回父级）。
 * isShow 过滤交给渲染层：v-for 里用 v-if="item.isShow" 决定是否渲染该项。
 * 这样既支持画布只显示 isShow=true 的组件，又不破坏 VueDraggable 的 DOM-数据同步
 * （避免 watch 回写数组导致 sortable 实例解绑事件的陷阱）。
 * 隐藏项仍在数组里参与排序位置，但视觉上不显示；如需隔离，可让第一步把隐藏项挪到数组末尾。
 */
const list = computed<FormComponent[]>({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});

/**
 * 把 FormComponent.attrs 透传给真实 EP 组件。
 * 关键：剔除 `component` 键——它仅用于画布定位渲染哪个组件，不是 EP 组件的合法 prop。
 * 同时为缺失组件名的旧数据兜底，确保渲染稳定。
 */
function renderAttrs(item: FormComponent): Record<string, any> {
  const source = item.attrs || {};
  const { component: _omit, ...rest } = source;
  return rest;
}

/** 兜底获取组件名：attrs.component 优先，缺失时按数据类型反推 */
function getComponentName(item: FormComponent): string {
  return item.attrs?.component || getDefaultComponent(item.type);
}

function handleClick(item: FormComponent) {
  emit('select', item);
}
</script>

<template>
  <div class="designer-canvas h-full overflow-auto bg-[var(--el-bg-color-page)] p-16px">
    <ElCard shadow="never" class="canvas-card h-full">
      <VueDraggable
        v-model="list"
        :group="{ name: 'form-designer', put: true }"
        :animation="180"
        item-key="prop"
        handle=".drag-handle"
        ghost-class="canvas-ghost"
        chosen-class="canvas-chosen"
        class="canvas-drag-area"
        :class="{ 'is-empty': list.length === 0 }"
      >
        <div
          v-for="(item, index) in list"
          v-show="item.isShow"
          :key="item.prop || index"
          class="canvas-item"
          :class="{ selected: selectedId === item.prop }"
          @click.stop="handleClick(item)"
        >
          <div class="drag-handle" title="拖拽排序">
            <SvgIcon icon="mdi:drag-horizontal-variant" />
          </div>

          <div class="item-content">
            <div class="item-meta">
              <ElTag size="small" type="primary">{{ getComponentName(item) }}</ElTag>
              <span v-if="item.label" class="item-label">{{ item.label }}</span>
            </div>
            <!-- 设计态只展示组件外观，不绑定真实 modelValue，避免设计/运行态数据混淆 -->
            <ElFormItem :label="item.label || ''" :prop="item.prop || ''" :required="item.required">
              <component :is="getComponentName(item)" v-bind="renderAttrs(item)" readonly />
            </ElFormItem>
          </div>
        </div>
      </VueDraggable>

      <div v-if="!list.some(item => item.isShow)" class="canvas-empty">
        <SvgIcon icon="mdi:drag" class="empty-icon" />
        <p class="empty-title">画布为空</p>
        <p class="empty-desc">请先在「基础字段」步骤选择字段，或添加新组件</p>
      </div>
    </ElCard>
  </div>
</template>

<style lang="scss" scoped>
.designer-canvas {
  .canvas-card {
    border: none;
    border-radius: 6px;

    :deep(.el-card__body) {
      height: 100%;
      padding: 16px;
    }
  }

  .canvas-drag-area {
    min-height: 60%;

    &.is-empty {
      display: none;
    }
  }

  .canvas-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    background: var(--el-bg-color);
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &.selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
    }

    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-top: 4px;
      border-radius: 4px;
      color: var(--el-text-color-secondary);
      cursor: move;
      background: var(--el-fill-color-light);

      &:hover {
        color: var(--el-text-color-regular);
        background: var(--el-fill-color);
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .item-label {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  .canvas-ghost {
    opacity: 0.5;
    background: var(--el-color-primary-light-9);
  }

  .canvas-chosen {
    border-color: var(--el-color-primary) !important;
  }

  .canvas-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: var(--el-text-color-secondary);

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      color: var(--el-text-color-placeholder);
    }

    .empty-title {
      margin: 0 0 4px;
      font-size: 16px;
      color: var(--el-text-color-regular);
    }

    .empty-desc {
      margin: 0;
      font-size: 13px;
    }
  }
}
</style>
