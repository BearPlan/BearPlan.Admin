<script setup lang="ts">
import { computed, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { ColumnTypeEnum } from '@/api/apiEnums';
import type { FormComponent } from '@/api/globals';
import {
  ComponentCategories,
  type ComponentCategory,
  type ComponentMeta,
  getComponentsByCategory
} from './crawler/element-plus-components';
import { customComponents } from './custom-components';

defineOptions({ name: 'ComponentPalette' });

const emit = defineEmits<{
  /** 点击组件时触发（与拖拽互补，便于无拖拽场景也能添加） */
  select: [component: FormComponent];
}>();

const searchKeyword = ref('');

/** 单条分类 + 其下组件（原生 + 自定义合并） */
interface PaletteCategory {
  value: ComponentCategory;
  label: string;
  icon: string;
  components: ComponentMeta[];
}

/**
 * 合并原生与自定义组件到分类视图。
 * 自定义组件按其 meta.category 归入对应原生分类，未匹配的分类（如 feedback 为空）会被过滤。
 */
const allCategories = computed<PaletteCategory[]>(() =>
  ComponentCategories.map(cat => ({
    ...cat,
    components: [...getComponentsByCategory(cat.value), ...customComponents.filter(c => c.category === cat.value)]
  })).filter(cat => cat.components.length > 0)
);

/** 按关键字过滤后的分类视图（label / description 模糊匹配） */
const filteredCategories = computed<PaletteCategory[]>(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return allCategories.value;
  return allCategories.value
    .map(cat => ({
      ...cat,
      components: cat.components.filter(
        c => c.label.toLowerCase().includes(keyword) || (c.description?.toLowerCase().includes(keyword) ?? false)
      )
    }))
    .filter(cat => cat.components.length > 0);
});

/** 手风琴模式：一次只展开一个分类，默认展开第一个 */
const activeNames = ref<ComponentCategory>(allCategories.value[0]?.value ?? 'form');

/**
 * 拖拽 clone 回调：把组件元数据转成画布可用的 FormComponent 实例。
 * 关键：attrs.component 存组件名（画布 <component :is> 和 ConfigPanel 都读这个键）。
 */
function cloneToFormComponent(meta: ComponentMeta): FormComponent {
  return {
    label: meta.defaultItemAttrs?.label ?? meta.label,
    prop: generateProp(meta.id),
    type: ColumnTypeEnum.自定义,
    required: meta.defaultItemAttrs?.required ?? false,
    isCustom: !meta.id.startsWith('El'),
    sort: 0,
    isEditDel: false,
    isShow: true,
    slots: null,
    // defaultAttrs 透传给组件；component 是画布定位用的元键，renderAttrs 时会被剔除
    attrs: { component: meta.id, ...(meta.defaultAttrs as Record<string, string>) },
    metadata: null,
    children: meta.isContainer ? [] : null
  };
}

/** 生成唯一 prop：组件id + 随机后缀，避免多次拖入同名组件冲突 */
function generateProp(id: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${id}_${suffix}`;
}

/** 单击组件 → 转成 FormComponent 并 emit（供无拖拽环境使用） */
function handleClick(meta: ComponentMeta) {
  emit('select', cloneToFormComponent(meta));
}
</script>

<template>
  <div class="component-palette h-full flex flex-col bg-[var(--el-bg-color)]">
    <!-- 顶部搜索 -->
    <div class="palette-header flex items-center gap-8px border-b border-[var(--el-border-color-light)] px-8px py-4px">
      <h3 class="palette-title m-0 shrink-0 text-14px font-500">组件库</h3>
      <ElInput v-model="searchKeyword" placeholder="搜索组件" size="small" clearable class="flex-1">
        <template #prefix>
          <SvgIcon icon="mdi:magnify" />
        </template>
      </ElInput>
    </div>

    <!-- 分类折叠列表 -->
    <ElCollapse v-model="activeNames" accordion class="palette-content flex-1 overflow-auto">
      <ElCollapseItem v-for="category in filteredCategories" :key="category.value" :name="category.value">
        <template #title>
          <div class="category-header flex flex-1 items-center gap-8px">
            <SvgIcon :icon="category.icon" class="text-16px" />
            <span class="category-label flex-1 text-13px font-500">{{ category.label }}</span>
            <span class="count-tag text-12px text-[var(--el-text-color-secondary)]">
              {{ category.components.length }}
            </span>
          </div>
        </template>

        <!-- 组件卡片网格：clone 拖出，面板内不排序、不接受拖入 -->
        <VueDraggable
          v-model="category.components"
          :group="{ name: 'form-designer', pull: 'clone', put: false }"
          :sort="false"
          :clone="cloneToFormComponent"
          item-key="id"
          class="component-list grid grid-cols-2 gap-4px p-4px"
        >
          <div
            v-for="component in category.components"
            :key="component.id"
            class="component-item 8px flex flex-col cursor-move items-center border border-[var(--el-border-color)] rounded-4px border-dashed bg-[var(--el-bg-color)] p-4px transition-all duration-200 hover:border-[var(--el-color-primary)] hover:bg-[var(--el-color-primary-light-9)]"
            :title="component.description || component.label"
            @click="handleClick(component)"
          >
            <div class="icon-wrapper mb-2px h-20px w-20px flex items-center justify-center">
              <SvgIcon :icon="component.icon" class="text-16px text-[var(--el-text-color-regular)]" />
            </div>
            <span class="component-label w-full truncate text-center text-12px text-[var(--el-text-color-regular)]">
              {{ component.label }}
            </span>
          </div>
        </VueDraggable>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<style lang="scss" scoped>
.palette-content {
  :deep(.el-collapse) {
    border-top: none;
    border-bottom: none;
  }

  /* 分类头：去灰底，压缩高度，箭头移右侧 */
  :deep(.el-collapse-item__header) {
    height: 28px;
    padding: 0 8px;
    background: transparent;
    border-bottom: 1px solid var(--el-border-color-light);
    font-size: 13px;

    /* 展开时左侧主色竖条标记 */
    border-left: 3px solid transparent;
    transition: border-color 0.2s;

    &.is-active {
      border-left-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    /* 箭头移到右侧（默认在左侧，翻转顺序） */
    .el-collapse-item__arrow {
      order: 2;
      margin: 0 0 0 8px;
    }
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: 1px solid var(--el-border-color-light);
  }

  /* 展开内容区去掉默认 padding，让组件网格自己控制间距 */
  :deep(.el-collapse-item__content) {
    padding: 0;
  }

  .component-list {
    .component-item:hover {
      :deep(.svg-icon) {
        color: var(--el-color-primary);
      }

      .component-label {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
