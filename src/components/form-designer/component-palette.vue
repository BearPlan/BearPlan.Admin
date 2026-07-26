<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { ComponentCategory, ComponentLibraryItem } from '@/typings/form-designer';
import { ALL_COMPONENTS, createComponentInstance } from './component-library';

defineOptions({
  name: 'ComponentPalette'
});

// 响应式数据
const searchKeyword = ref('');
const activeCategory = ref(['form', 'layout', 'data', 'feedback', 'navigation', 'others']);

// 组件分类配置
const categories: ComponentCategory[] = [
  {
    key: 'form',
    label: '表单组件',
    icon: 'mdi:form-select',
    description: '用于表单输入的组件',
    expanded: true
  },
  {
    key: 'layout',
    label: '布局组件',
    icon: 'mdi:view-column',
    description: '页面布局和容器组件'
  },
  {
    key: 'data',
    label: '数据展示',
    icon: 'mdi:table',
    description: '数据展示类组件'
  },
  {
    key: 'feedback',
    label: '反馈组件',
    icon: 'mdi:message-alert',
    description: '用户反馈和提示组件'
  },
  {
    key: 'navigation',
    label: '导航组件',
    icon: 'mdi:navigation',
    description: '页面导航组件'
  },
  {
    key: 'others',
    label: '其他组件',
    icon: 'mdi:widgets',
    description: '其他通用组件'
  }
];

// 计算属性
const filteredCategories = computed(() => {
  return categories
    .map(category => ({
      ...category,
      components: ALL_COMPONENTS.filter(component => {
        const matchCategory = component.category === category.key;
        const matchSearch =
          !searchKeyword.value ||
          component.label.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
          (component.description && component.description.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
          (component.tags && component.tags.some(tag => tag.toLowerCase().includes(searchKeyword.value.toLowerCase())));

        return matchCategory && matchSearch;
      })
    }))
    .filter(category => category.components.length > 0);
});

// 事件定义
const emit = defineEmits<{
  componentSelect: [component: ComponentLibraryItem];
}>();

// 方法
const cloneComponent = (original: ComponentLibraryItem) => {
  const instance = createComponentInstance(original);
  console.log('Cloning component:', original, 'Instance:', instance);
  return instance;
};

const selectComponent = (component: ComponentLibraryItem) => {
  emit('componentSelect', component);
};

// 生命周期
onMounted(() => {
  // 组件挂载后不需要展开操作
});
</script>

<template>
  <div class="component-palette">
    <div class="palette-header flex items-center justify-between">
      <h2 class="palette-title">组件库</h2>
      <ElInput v-model="searchKeyword" placeholder="搜索组件" size="small" clearable class="palette-search w-auto">
        <template #prefix>
          <SvgIcon icon="mdi:magnify" />
        </template>
      </ElInput>
    </div>

    <ElCollapse v-model="activeCategory" class="palette-content">
      <div v-for="category in filteredCategories" :key="category.key" class="component-category">
        <ElCollapseItem :name="category.key">
          <template #title>
            <div class="category-header">
              <span class="category-label">{{ category.label }}</span>
              <ElBadge :value="category.components.length" class="category-badge" type="primary" />
            </div>
          </template>

          <VueDraggable
            v-model="category.components"
            :group="{ name: 'components', pull: 'clone', put: false }"
            :sort="false"
            :clone="cloneComponent"
            item-key="id"
            class="component-list"
          >
            <div
              v-for="component in category.components"
              :key="component.id"
              class="component-item"
              :title="component.description || component.label"
              @click="selectComponent(component)"
            >
              <div class="component-icon-wrapper">
                <SvgIcon :icon="component.icon || 'mdi:cube'" class="component-icon" />
              </div>
              <span class="component-label">{{ component.label }}</span>
            </div>
          </VueDraggable>
        </ElCollapseItem>
      </div>
    </ElCollapse>
  </div>
</template>

<style lang="scss" scoped>
.component-palette {
  height: 100%;
  display: flex;
  justify-self: stretch;
  flex-direction: column;
  background-color: #ffffff;
  .palette-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    .palette-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .palette-search {
      :deep(.el-input__wrapper) {
        border-radius: 4px;
      }
    }
  }

  .palette-content {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    :deep(.el-collapse) {
      border-top: none;
      border-bottom: none;

      .el-collapse-item {
        .el-collapse-item__header {
          padding: 8px 16px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #ebeef5;

          .category-header {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 8px 0;
            line-height: 1;

            .category-label {
              flex: 1;
              font-size: 14px;
              color: #303133;
              font-weight: 500;
            }

            .category-badge {
              :deep(.el-badge__content) {
                background-color: #409eff;
              }
            }
          }
        }

        .el-collapse-item__wrap {
          border-bottom: 1px solid #ebeef5;

          .el-collapse-item__content {
            padding: 8px 8px;
          }
        }

        &:last-child {
          .el-collapse-item__wrap {
            border-bottom: none;
          }
        }
      }
    }

    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;

      .component-item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 16px 8px;
        border: 1px dashed #dcdfe6;
        border-radius: 4px;
        cursor: move;
        transition: all 0.2s;
        background-color: #ffffff;

        &:hover {
          border-color: #409eff;
          background-color: #ecf5ff;
          box-shadow: 0 2px 6px 0 rgba(64, 158, 255, 0.2);

          .component-icon-wrapper {
            .component-icon {
              color: #409eff;
            }
          }

          .component-label {
            color: #409eff;
          }
        }

        .component-icon-wrapper {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;

          .component-icon {
            font-size: 20px;
            color: #606266;
          }
        }

        .component-label {
          font-size: 12px;
          color: #606266;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
      }
    }
  }
}
</style>
