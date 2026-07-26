<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'JsonEditor'
});

// Props
interface Props {
  modelValue?: any;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '请输入JSON数据...',
  rows: 6,
  disabled: false
});

// Events
const emit = defineEmits<{
  change: [value: any];
  'update:modelValue': [value: any];
}>();

// 响应式数据
const displayValue = ref('');
const errorMessage = ref('');

// 计算属性
const isValidJson = computed(() => !errorMessage.value);

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== null && newValue !== undefined) {
      try {
        displayValue.value = JSON.stringify(newValue, null, 2);
        errorMessage.value = '';
      } catch (error) {
        displayValue.value = String(newValue);
        errorMessage.value = 'Invalid JSON format';
      }
    } else {
      displayValue.value = '';
      errorMessage.value = '';
    }
  },
  { immediate: true }
);

// 方法
const handleInput = (value: string) => {
  displayValue.value = value;
  errorMessage.value = '';

  if (!value.trim()) {
    emit('update:modelValue', null);
    emit('change', null);
    return;
  }

  try {
    const parsed = JSON.parse(value);
    emit('update:modelValue', parsed);
    emit('change', parsed);
  } catch (error) {
    errorMessage.value = `JSON 格式错误: ${(error as Error).message}`;
  }
};

const handleBlur = () => {
  if (displayValue.value.trim() && isValidJson.value) {
    formatJson();
  }
};

const formatJson = () => {
  if (!displayValue.value.trim()) return;

  try {
    const parsed = JSON.parse(displayValue.value);
    displayValue.value = JSON.stringify(parsed, null, 2);
    errorMessage.value = '';
    ElMessage.success('JSON 格式化完成');
  } catch (error) {
    errorMessage.value = `格式化失败: ${(error as Error).message}`;
    ElMessage.error('JSON 格式错误，无法格式化');
  }
};

const validateJson = () => {
  if (!displayValue.value.trim()) {
    ElMessage.warning('请输入JSON数据');
    return;
  }

  try {
    JSON.parse(displayValue.value);
    errorMessage.value = '';
    ElMessage.success('JSON 格式正确');
  } catch (error) {
    errorMessage.value = `验证失败: ${(error as Error).message}`;
    ElMessage.error('JSON 格式错误');
  }
};
</script>

<template>
  <div class="json-editor">
    <div class="editor-header">
      <span class="editor-title">JSON 编辑器</span>
      <div class="editor-actions">
        <ElButton size="small" :disabled="!modelValue" @click="formatJson">格式化</ElButton>
        <ElButton size="small" :disabled="!modelValue" @click="validateJson">验证</ElButton>
      </div>
    </div>

    <div class="editor-content">
      <ElInput
        :model-value="displayValue"
        type="textarea"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        class="json-textarea"
        @input="handleInput"
        @blur="handleBlur"
      />

      <div v-if="errorMessage" class="error-message">
        <SvgIcon icon="mdi:alert-circle" class="error-icon" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.json-editor {
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .editor-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .editor-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;

      :deep(.el-button) {
        padding: 4px 12px;
        font-size: 14px;
      }
    }
  }

  .editor-content {
    .json-textarea {
      :deep(.el-textarea__inner) {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        border-radius: 6px;
        background-color: #f5f7fa;

        &:focus {
          background-color: #ffffff;
        }
      }
    }

    .error-message {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 4px;
      padding: 4px 12px;
      background-color: #fef0f0;
      border: 1px solid #fde2e2;
      border-radius: 6px;
      color: #f56c6c;
      font-size: 14px;

      .error-icon {
        margin-right: 4px;
        font-size: 16px;
      }
    }
  }
}
</style>
