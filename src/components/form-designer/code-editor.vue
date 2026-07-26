<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash-es';

defineOptions({
  name: 'CodeEditor'
});

interface Props {
  modelValue?: string;
  language?: string;
  height?: number;
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  height: 200,
  placeholder: '// 在此编写代码...',
  readonly: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

// 响应式数据
const textareaRef = ref<HTMLTextAreaElement>();
const localValue = ref(props.modelValue);
const currentLine = ref(1);
const currentColumn = ref(1);

// 防抖函数
const debouncedEmit = debounce((value: string) => {
  emit('update:modelValue', value);
  emit('change', value);
}, 300);

// 计算属性
const lineCount = computed(() => {
  const lines = localValue.value.split('\n');
  return lines.length;
});

const characterCount = computed(() => {
  return localValue.value.length;
});

// 方法
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  localValue.value = target.value;
  debouncedEmit(localValue.value);
  updateCursorPosition();
};

const handleKeydown = (event: KeyboardEvent) => {
  const textarea = event.target as HTMLTextAreaElement;

  // Tab键处理
  if (event.key === 'Tab') {
    event.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (event.shiftKey) {
      // Shift+Tab 减少缩进
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineText = value.substring(lineStart, end);

      if (lineText.startsWith('  ')) {
        const newValue = value.substring(0, lineStart) + lineText.substring(2) + value.substring(end);
        localValue.value = newValue;
        debouncedEmit(newValue);

        nextTick(() => {
          textarea.selectionStart = Math.max(start - 2, lineStart);
          textarea.selectionEnd = Math.max(end - 2, lineStart);
        });
      }
    } else {
      // Tab 增加缩进
      const newValue = `${value.substring(0, start)}  ${value.substring(end)}`;
      localValue.value = newValue;
      debouncedEmit(newValue);

      nextTick(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      });
    }
  }

  // 自动括号配对
  const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'"
  };

  if (pairs[event.key]) {
    event.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selectedText = value.substring(start, end);

    const newValue = value.substring(0, start) + event.key + selectedText + pairs[event.key] + value.substring(end);

    localValue.value = newValue;
    debouncedEmit(newValue);

    nextTick(() => {
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = end + 1;
    });
  }

  nextTick(() => {
    updateCursorPosition();
  });
};

const updateCursorPosition = () => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const cursorPos = textarea.selectionStart;
  const textBeforeCursor = localValue.value.substring(0, cursorPos);
  const lines = textBeforeCursor.split('\n');

  currentLine.value = lines.length;
  currentColumn.value = lines[lines.length - 1].length + 1;
};

const formatCode = () => {
  // 简单的代码格式化
  try {
    let formatted = localValue.value;

    if (props.language === 'javascript') {
      // 简单的JavaScript格式化
      formatted = formatted
        .replace(/;/g, ';\n')
        .replace(/\{/g, ' {\n')
        .replace(/\}/g, '\n}')
        .replace(/,/g, ',\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/\n\s*\n/g, '\n');
    }

    localValue.value = formatted;
    emit('update:modelValue', formatted);
    ElMessage.success('代码格式化完成');
  } catch (error) {
    ElMessage.error('代码格式化失败');
  }
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(localValue.value);
    ElMessage.success('代码已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 监听props变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== localValue.value) {
      localValue.value = newValue;
    }
  }
);

// 监听textarea点击
watch(textareaRef, textarea => {
  if (textarea) {
    textarea.addEventListener('click', updateCursorPosition);
    textarea.addEventListener('keyup', updateCursorPosition);
  }
});
</script>

<template>
  <div class="code-editor">
    <div class="editor-header">
      <div class="language-info">
        <SvgIcon icon="mdi:code-tags" class="language-icon" />
        <span class="language-label">{{ language.toUpperCase() }}</span>
      </div>
      <div class="editor-actions">
        <ElTooltip content="格式化代码">
          <ElButton size="small" text @click="formatCode">
            <SvgIcon icon="mdi:code-braces" />
          </ElButton>
        </ElTooltip>
        <ElTooltip content="复制代码">
          <ElButton size="small" text @click="copyCode">
            <SvgIcon icon="mdi:content-copy" />
          </ElButton>
        </ElTooltip>
      </div>
    </div>

    <div class="editor-container" :style="{ height: `${height}px` }">
      <textarea
        ref="textareaRef"
        v-model="localValue"
        :placeholder="placeholder"
        class="code-textarea"
        spellcheck="false"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <!-- 行号 -->
      <div class="line-numbers">
        <div v-for="line in lineCount" :key="line" class="line-number">
          {{ line }}
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="editor-status">
      <span class="status-item">行: {{ currentLine }}</span>
      <span class="status-item">列: {{ currentColumn }}</span>
      <span class="status-item">字符: {{ characterCount }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.code-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;

    .language-info {
      display: flex;
      align-items: center;
      justify-content: center;

      .language-icon {
        margin-right: 4px;
        font-size: 13px;
        color: #606266;
      }

      .language-label {
        font-size: 12px;
        font-weight: 500;
        color: #303133;
      }
    }

    .editor-actions {
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-button) {
        padding: 4px;
        margin-left: 4px;

        &:hover {
          background-color: #e4e7ed;
        }
      }
    }
  }

  .editor-container {
    position: relative;
    overflow: hidden;

    .code-textarea {
      width: 100%;
      height: 100%;
      padding: 16px 0 16px 32px;
      border: none;
      outline: none;
      resize: none;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      background-color: #ffffff;
      color: #303133;
      tab-size: 2;

      &:focus {
        background-color: #fdfdfd;
      }

      &::placeholder {
        color: #909399;
      }
    }

    .line-numbers {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 32px;
      padding: 16px 0;
      background-color: #f5f7fa;
      border-right: 1px solid #dcdfe6;
      text-align: right;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #909399;
      overflow: hidden;

      .line-number {
        padding: 0 4px;
      }
    }
  }

  .editor-status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 4px 8px;
    background-color: #f5f7fa;
    border-top: 1px solid #dcdfe6;
    font-size: 12px;
    color: #606266;

    .status-item {
      margin-left: 16px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
}
</style>
