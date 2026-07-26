<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'IconPicker'
});

// Props
interface Props {
  modelValue?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false
});

// Events
const emit = defineEmits<{
  change: [icon: string];
  'update:modelValue': [icon: string];
}>();

// 响应式数据
const popoverVisible = ref(false);
const searchKeyword = ref('');
const activeCategory = ref('common');
const selectedIcon = ref(props.modelValue);

// 图标分类
const iconCategories = [
  {
    key: 'common',
    label: '常用',
    icons: [
      'mdi:home',
      'mdi:user',
      'mdi:settings',
      'mdi:heart',
      'mdi:star',
      'mdi:bell',
      'mdi:email',
      'mdi:phone',
      'mdi:calendar',
      'mdi:clock',
      'mdi:map-marker',
      'mdi:camera'
    ]
  },
  {
    key: 'action',
    label: '操作',
    icons: [
      'mdi:plus',
      'mdi:minus',
      'mdi:close',
      'mdi:check',
      'mdi:arrow-left',
      'mdi:arrow-right',
      'mdi:arrow-up',
      'mdi:arrow-down',
      'mdi:refresh',
      'mdi:search',
      'mdi:filter',
      'mdi:sort'
    ]
  },
  {
    key: 'file',
    label: '文件',
    icons: [
      'mdi:file',
      'mdi:folder',
      'mdi:download',
      'mdi:upload',
      'mdi:image',
      'mdi:video',
      'mdi:music',
      'mdi:file-pdf',
      'mdi:file-word',
      'mdi:file-excel',
      'mdi:file-powerpoint',
      'mdi:archive'
    ]
  },
  {
    key: 'social',
    label: '社交',
    icons: [
      'mdi:userName',
      'mdi:userName-group',
      'mdi:chat',
      'mdi:comment',
      'mdi:share',
      'mdi:like',
      'mdi:thumbs-up',
      'mdi:thumbs-down',
      'mdi:message',
      'mdi:notification',
      'mdi:follow',
      'mdi:unfollow'
    ]
  }
];

// 计算属性
const filteredIcons = computed(() => {
  return (icons: string[]) => {
    if (!searchKeyword.value) return icons;
    return icons.filter(icon => icon.toLowerCase().includes(searchKeyword.value.toLowerCase()));
  };
});

// 方法
const handleShow = () => {
  selectedIcon.value = props.modelValue;
  searchKeyword.value = '';
};

const handleHide = () => {
  popoverVisible.value = false;
};

const selectIcon = (icon: string) => {
  selectedIcon.value = icon;
};

const clearIcon = () => {
  selectedIcon.value = '';
  confirmSelection();
};

const confirmSelection = () => {
  emit('update:modelValue', selectedIcon.value);
  emit('change', selectedIcon.value);
  popoverVisible.value = false;
};
</script>

<template>
  <div class="icon-picker">
    <ElPopover
      :visible="popoverVisible"
      placement="bottom-start"
      :width="400"
      trigger="click"
      @show="handleShow"
      @hide="handleHide"
    >
      <template #reference>
        <ElInput
          :model-value="modelValue"
          placeholder="选择图标"
          readonly
          class="icon-input"
          @click="popoverVisible = !popoverVisible"
        >
          <template #prefix>
            <SvgIcon v-if="modelValue" :icon="modelValue" class="icon-preview" />
            <SvgIcon v-else icon="mdi:emoticon-outline" class="icon-placeholder" />
          </template>
          <template #suffix>
            <SvgIcon icon="mdi:chevron-down" class="dropdown-arrow" :class="{ 'rotate-180': popoverVisible }" />
          </template>
        </ElInput>
      </template>

      <div class="icon-picker-content">
        <div class="picker-header">
          <ElInput v-model="searchKeyword" placeholder="搜索图标..." size="small" clearable>
            <template #prefix>
              <SvgIcon icon="mdi:magnify" />
            </template>
          </ElInput>
        </div>

        <div class="icon-categories">
          <ElTabs v-model="activeCategory" size="small">
            <ElTabPane
              v-for="category in iconCategories"
              :key="category.key"
              :label="category.label"
              :name="category.key"
            >
              <div class="icon-grid">
                <div
                  v-for="icon in filteredIcons(category.icons)"
                  :key="icon"
                  class="icon-item"
                  :class="{ selected: modelValue === icon }"
                  :title="icon"
                  @click="selectIcon(icon)"
                >
                  <SvgIcon :icon="icon" class="icon" />
                </div>
              </div>
            </ElTabPane>
          </ElTabs>
        </div>

        <div class="picker-footer">
          <ElButton size="small" @click="clearIcon">清空</ElButton>
          <ElButton size="small" type="primary" @click="confirmSelection">确定</ElButton>
        </div>
      </div>
    </ElPopover>
  </div>
</template>

<style lang="scss" scoped>
.icon-picker {
  .icon-input {
    :deep(.el-input__wrapper) {
      padding-left: 30px;
    }

    :deep(.el-input__prefix) {
      left: 8px;
    }

    .icon-preview,
    .icon-placeholder {
      font-size: 16px;
    }

    .icon-placeholder {
      color: #909399;
    }

    .dropdown-arrow {
      transition: transform 0.3s ease;
      color: #909399;

      &.rotate-180 {
        transform: rotate(180deg);
      }
    }
  }

  .icon-picker-content {
    .picker-header {
      padding: 12px;
      border-bottom: 1px solid #ebeef5;

      :deep(.el-input) {
        .el-input__wrapper {
          border-radius: 6px;
        }
      }
    }

    .icon-categories {
      :deep(.el-tabs) {
        .el-tabs__header {
          margin: 0;
          padding: 0 12px;

          .el-tabs__nav-wrap {
            padding: 0;
          }

          .el-tabs__item {
            height: 36px;
            line-height: 36px;
            font-size: 14px;
            padding: 0 12px;
          }
        }

        .el-tabs__content {
          max-height: 300px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.5) transparent;
        }
      }

      .icon-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 12px;
        padding: 12px;

        .icon-item {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 40px;
          border: 1px solid #dcdfe6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #ffffff;

          .icon {
            font-size: 20px;
            color: #606266;
          }

          &:hover {
            border-color: #409eff;
            background-color: #ecf5ff;
          }

          &.selected {
            border-color: #409eff;
            background-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);

            .icon {
              color: #ffffff;
            }
          }
        }
      }
    }

    .picker-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-top: 1px solid #ebeef5;

      :deep(.el-button) {
        padding: 6px 16px;
      }
    }
  }
}
</style>
