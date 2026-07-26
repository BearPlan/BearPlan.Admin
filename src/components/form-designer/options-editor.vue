<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ComponentDesignData } from '@/typings/form-designer';

defineOptions({
  name: 'OptionsEditor'
});

// Props
interface Props {
  component: ComponentDesignData;
}

const props = defineProps<Props>();

// Events
const emit = defineEmits<{
  update: [options: Array<{ label: string; value: any }>];
}>();

// 响应式数据
const importDialogVisible = ref(false);
const importText = ref('');

// 计算属性
const options = computed({
  get() {
    return props.component.attrs.options || [];
  },
  set(value) {
    updateOptions();
  }
});

// 方法
const addOption = () => {
  const newOptions = [...options.value];
  newOptions.push({
    label: `选项${newOptions.length + 1}`,
    value: `option${newOptions.length + 1}`
  });
  emit('update', newOptions);
};

const removeOption = (index: number) => {
  const newOptions = [...options.value];
  newOptions.splice(index, 1);
  emit('update', newOptions);
};

const moveOption = (index: number, direction: 'up' | 'down') => {
  const newOptions = [...options.value];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex >= 0 && targetIndex < newOptions.length) {
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    emit('update', newOptions);
  }
};

const updateOptions = () => {
  emit('update', [...options.value]);
};

const clearOptions = () => {
  ElMessageBox.confirm('确定要清空所有选项吗？', '清空确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      emit('update', []);
      ElMessage.success('选项已清空');
    })
    .catch(() => {
      // 取消清空
    });
};

const importFromText = () => {
  importText.value = '';
  importDialogVisible.value = true;
};

const confirmImport = () => {
  try {
    const lines = importText.value
      .trim()
      .split('\n')
      .filter(line => line.trim());
    const newOptions: Array<{ label: string; value: any }> = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      let label: string;
      let value: string;

      if (trimmedLine.includes('|')) {
        [label, value] = trimmedLine.split('|', 2);
      } else if (trimmedLine.includes('=')) {
        [label, value] = trimmedLine.split('=', 2);
      } else {
        label = trimmedLine;
        value = trimmedLine;
      }

      if (label && value) {
        newOptions.push({
          label: label.trim(),
          value: value.trim()
        });
      }
    });

    if (newOptions.length > 0) {
      emit('update', newOptions);
      ElMessage.success(`成功导入 ${newOptions.length} 个选项`);
      importDialogVisible.value = false;
    } else {
      ElMessage.error('未找到有效的选项数据');
    }
  } catch (error) {
    ElMessage.error('导入格式错误，请检查数据格式');
  }
};
</script>

<template>
  <div class="options-editor">
    <div class="options-header">
      <span class="header-title">选项配置</span>
      <ElButton size="small" type="primary" @click="addOption">
        <SvgIcon icon="mdi:plus" class="mr-1" />
        添加选项
      </ElButton>
    </div>

    <div class="options-list">
      <div v-for="(option, index) in options" :key="index" class="option-item">
        <div class="option-controls">
          <ElInput v-model="option.label" placeholder="选项标签" size="small" @input="updateOptions" />

          <ElInput v-model="option.value" placeholder="选项值" size="small" @input="updateOptions" />

          <div class="option-actions">
            <ElButton size="small" type="danger" text @click="removeOption(index)">
              <SvgIcon icon="mdi:delete" />
            </ElButton>

            <ElButton size="small" type="primary" text :disabled="index === 0" @click="moveOption(index, 'up')">
              <SvgIcon icon="mdi:arrow-up" />
            </ElButton>

            <ElButton
              size="small"
              type="primary"
              text
              :disabled="index === options.length - 1"
              @click="moveOption(index, 'down')"
            >
              <SvgIcon icon="mdi:arrow-down" />
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <div v-if="options.length === 0" class="empty-options">
      <ElEmpty description="暂无选项，点击上方按钮添加" :image-size="60" />
    </div>

    <div class="options-actions">
      <ElButton size="small" @click="importFromText">
        <SvgIcon icon="mdi:import" class="mr-1" />
        批量导入
      </ElButton>

      <ElButton size="small" :disabled="options.length === 0" @click="clearOptions">
        <SvgIcon icon="mdi:delete-sweep" class="mr-1" />
        清空选项
      </ElButton>
    </div>

    <!-- 批量导入对话框 -->
    <ElDialog v-model="importDialogVisible" title="批量导入选项" width="50%">
      <div class="import-content">
        <ElAlert title="导入格式说明" type="info" :closable="false" class="mb-4">
          <p>每行一个选项，格式：标签|值 或 标签=值</p>
          <p>示例：</p>
          <p>选项1|value1</p>
          <p>选项2=value2</p>
        </ElAlert>

        <ElInput v-model="importText" type="textarea" :rows="8" placeholder="请输入选项数据..." />
      </div>

      <template #footer>
        <ElButton @click="importDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!importText.trim()" @click="confirmImport">确认导入</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.options-editor {
  .options-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    :deep(.el-button) {
      padding: 6px 12px;
    }
  }

  .options-list {
    margin-bottom: 16px;

    .option-item {
      margin-bottom: 12px;

      .option-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;

        :deep(.el-input) {
          flex: 1;

          .el-input__wrapper {
            padding: 0 12px;
          }

          .el-input__inner {
            height: 32px;
            line-height: 32px;
          }
        }

        .option-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;

          :deep(.el-button) {
            padding: 4px;
            margin: 0;

            &:not(.is-disabled):hover {
              background-color: #f5f7fa;
            }
          }
        }
      }
    }
  }

  .empty-options {
    :deep(.el-empty) {
      padding: 24px 0;
    }
  }

  .options-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    :deep(.el-button) {
      padding: 6px 12px;
    }
  }

  // 导入对话框样式
  .import-content {
    :deep(.el-alert) {
      margin-bottom: 16px;
    }

    :deep(.el-textarea) {
      .el-textarea__inner {
        font-family: monospace;
      }
    }
  }
}
</style>
