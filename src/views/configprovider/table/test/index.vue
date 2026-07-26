<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import MonacoEditor from '@/components/monaco-editor/monaco-editor.vue';

// 默认的 Vue 代码模板
const defaultCode = ref(`<script setup>
import { ref } from 'vue'

const msg = ref('Hello Vue 3!')
<\/script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <p>这是一个在线 Vue 3 代码编辑器示例</p>
    <input v-model="msg" placeholder="输入一些文本">
  </div>
</template>

<style scoped>
h1 {
  color: #42b983;
}
</style>`);

// 编译后的组件 HTML
const compiledComponent = ref('');

// 编译错误信息
const compileError = ref('');

// 组件引用
const previewContainer = ref<HTMLElement | null>(null);

// 编译并预览 Vue 代码
const compileAndPreview = () => {
  try {
    // 清除之前的错误信息
    compileError.value = '';

    // 在实际应用中，这里应该使用 @vue/compiler-sfc 来编译 Vue 代码
    // 为了简化示例，我们直接将代码显示在预览区域
    // 注意：在生产环境中，直接使用 v-html 渲染用户输入的代码可能存在安全风险
    compiledComponent.value = defaultCode.value;
  } catch (error: any) {
    compileError.value = error.message || '编译失败';
  }
};

// 动态渲染 Vue 组件（简化版本）
const renderVueComponent = () => {
  if (previewContainer.value) {
    // 在实际应用中，这里应该使用 Vue 的动态组件功能来渲染编译后的组件
    // 为了简化示例，我们直接显示代码内容
    previewContainer.value.innerHTML = `
      <div>
        <h3>组件预览（简化版）：</h3>
        <pre>${escapeHtml(defaultCode.value)}</pre>
      </div>
    `;
  }
};

// 转义 HTML 特殊字符
const escapeHtml = (unsafe: string) => {
  return unsafe.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '').replace(/'/g, '&#039;');
};

// 监听代码变化
watch(defaultCode, () => {
  compileAndPreview();
  renderVueComponent();
});

// 组件挂载时编译默认代码
onMounted(() => {
  compileAndPreview();
  renderVueComponent();
});
</script>

<template>
  <div class="vue-editor">
    <h1>在线 Vue 3 代码编辑器</h1>
    <div class="editor-container">
      <div class="editor-panel">
        <h2>代码编辑器</h2>
        <MonacoEditor v-model:value="defaultCode" language="vue" height="780px" />
      </div>
      <div class="preview-panel">
        <h2>预览区域</h2>
        <div ref="previewContainer" class="preview-container">
          <!-- 动态渲染的 Vue 组件将显示在这里 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vue-editor {
  padding: 20px;
}

.editor-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.editor-panel,
.preview-panel {
  flex: 1;
}

.editor-panel h2,
.preview-panel h2 {
  margin-bottom: 10px;
}

.preview-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  min-height: 500px;
  background-color: #f9f9f9;
  overflow: auto;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
