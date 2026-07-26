<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { VueDraggable } from 'vue-draggable-plus';
import { useFormDesignerStore } from '@/store/modules/form-designer';
import MonacoEditor from '@/components/monaco-editor/monaco-editor.vue';
import ComponentRenderer from './component-renderer.vue';
import { generateVueCode } from './code-generator';

defineOptions({
  name: 'DesignCanvas'
});

// Store
const formDesignerStore = useFormDesignerStore();

// 响应式引用
const formRef = ref<FormInstance>();
const exportDialogVisible = ref(false);
const exportContent = ref('');
const exportDialogTitle = ref('');
const exportLanguage = ref('json');

// 计算属性
const formData = computed(() => formDesignerStore.formData);
const selectedComponent = computed(() => formDesignerStore.selectedComponent);
const previewMode = computed(() => formDesignerStore.previewMode);
const componentCount = computed(() => formDesignerStore.getComponentCount());
const formModel = computed(() => formDesignerStore.formModel);
const formRules = computed(() => formDesignerStore.formRules);

// 方法
const togglePreview = () => {
  if (!previewMode.value) {
    // 进入预览模式前，生成表单模型和验证规则
    formDesignerStore.generateFormModel();
    formDesignerStore.generateFormRules();
  }
  formDesignerStore.togglePreviewMode();
};

const selectComponent = (component: any) => {
  formDesignerStore.selectComponent(component);
};

const deleteComponent = (componentId: string) => {
  ElMessageBox.confirm('确定要删除这个组件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      formDesignerStore.removeComponent(componentId);
      ElMessage.success('组件已删除');
    })
    .catch(() => {
      // 取消删除
    });
};

const copyComponent = (componentId: string) => {
  formDesignerStore.copyComponent(componentId);
  ElMessage.success('组件已复制');
};

const moveComponent = (componentId: string, direction: 'up' | 'down') => {
  formDesignerStore.moveComponent(componentId, direction);
};

const handleAddComponent = (evt: any) => {
  // 拖拽添加组件时触发
  console.log('Component added:', evt);
  if (evt.item) {
    // 确保添加的组件被选中
    nextTick(() => {
      const addedComponent = formData.value.slots.default[evt.newIndex];
      if (addedComponent) {
        selectComponent(addedComponent);
      }
    });
  }
};

const handleComponentChange = (evt: any) => {
  // 组件顺序变化时触发
  console.log('Component order changed:', evt);
};

// 导出功能已移至顶部工具栏统一管理
// const exportJson = () => {
//   exportContent.value = formDesignerStore.getFormJSON()
//   exportDialogTitle.value = '导出表单配置 (JSON)'
//   exportLanguage.value = 'json'
//   exportDialogVisible.value = true
// }

// const exportVue = () => {
//   exportContent.value = generateVueCode(formData.value)
//   exportDialogTitle.value = '导出Vue组件代码'
//   exportLanguage.value = 'vue'
//   exportDialogVisible.value = true
// }

const clearCanvas = () => {
  ElMessageBox.confirm('确定要清空整个表单吗？此操作不可恢复。', '清空确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      formDesignerStore.clearForm();
      ElMessage.success('表单已清空');
    })
    .catch(() => {
      // 取消清空
    });
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportContent.value);
    ElMessage.success('已复制到剪贴板');
    exportDialogVisible.value = false;
  } catch (err) {
    ElMessage.error('复制失败，请手动复制');
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    ElMessage.success('表单验证通过！');
    console.log('Form data:', formModel.value);
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入');
  }
};

const handleReset = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  ElMessage.info('表单已重置');
};
</script>

<template>
  <div class="design-canvas">
    <!-- 画布区域 -->
    <div class="canvas-area" :class="{ 'preview-mode': previewMode }">
      <!-- 预览模式 -->
      <div v-if="previewMode" class="preview-container">
        <ElCard class="preview-card" shadow="never">
          <ElForm
            ref="formRef"
            :model="formModel"
            :rules="formRules"
            v-bind="formData.attrs"
            label-width="100px"
            class="form-preview"
          >
            <ComponentRenderer
              v-for="component in formData.slots.default"
              :key="component.id"
              :component="component"
              :preview-mode="true"
              :form-model="formModel"
            />

            <ElFormItem class="form-actions">
              <ElButton type="primary" @click="handleSubmit">提交</ElButton>
              <ElButton @click="handleReset">重置</ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </div>

      <!-- 设计模式 -->
      <div v-else class="design-container">
        <ElCard class="design-card" shadow="never">
          <!-- 拖拽容器 -->
          <VueDraggable
            v-model="formData.slots.default"
            class="drag-container"
            :class="{ 'drag-container-empty': formData.slots.default.length === 0 }"
            :group="{ name: 'components', pull: true, put: true }"
            :animation="200"
            item-key="id"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
            @add="handleAddComponent"
            @change="handleComponentChange"
          >
            <ComponentRenderer
              v-for="component in formData.slots.default"
              :key="component.id"
              :component="component"
              :selected="selectedComponent?.id === component.id"
              @select="selectComponent"
              @delete="deleteComponent"
              @copy="copyComponent"
              @move="moveComponent"
            />
          </VueDraggable>

          <!-- 空状态提示 -->
          <div v-if="formData.slots.default.length === 0" class="empty-canvas">
            <div class="empty-content">
              <SvgIcon icon="mdi:drag" class="empty-icon" />
              <h3 class="empty-title">从左侧拖拽组件到此处开始设计</h3>
              <p class="empty-description">您可以拖拽表单组件、布局组件等来构建您的表单</p>
            </div>
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 导出对话框 -->
    <ElDialog v-model="exportDialogVisible" :title="exportDialogTitle" width="60%" :close-on-click-modal="false">
      <MonacoEditor
        v-model="exportContent"
        :language="exportLanguage"
        :readonly="true"
        height="400px"
        class="export-editor"
      />

      <template #footer>
        <ElButton @click="exportDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="copyToClipboard">
          <SvgIcon icon="mdi:content-copy" class="mr-1" />
          复制到剪贴板
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.design-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;

  .canvas-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #ebeef5;
    border-radius: 6px 6px 0 0;

    .component-count-tag {
      :deep(.el-tag__content) {
        font-size: 14px;
      }
    }

    .toolbar-right {
      :deep(.el-button) {
        padding: 6px 12px;
      }
    }
  }

  .canvas-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;

    &.preview-mode {
      padding: 24px;
      background-color: #ffffff;
    }

    .preview-container,
    .design-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .preview-card,
      .design-card {
        flex: 1;
        overflow: hidden;
        border: none;
        border-radius: 0 0 6px 6px;
        box-shadow: none;

        :deep(.el-card__body) {
          flex: 1;
          padding: 24px;
          overflow: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.5) transparent;
        }
      }

      .drag-container {
        min-height: 100%;
        transition: all 0.3s;
        padding: 16px;
        background-color: #ffffff;
        border-radius: 6px;

        &.drag-container-empty {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          background-color: #fafafa;
          border: 1px dashed #dcdfe6;
        }
      }

      .form-preview {
        max-width: 800px;
        margin: 0 auto;
        width: 100%;

        :deep(.el-form-item) {
          margin-bottom: 24px;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 32px;

          :deep(.el-form-item__content) {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          :deep(.el-button) {
            margin: 0 12px;
          }
        }
      }
    }

    .empty-canvas {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      padding: 32px;

      .empty-content {
        text-align: center;
        color: #909399;

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: #c0c4cc;
        }

        .empty-title {
          margin: 0 0 12px;
          font-size: 16px;
          color: #606266;
        }

        .empty-description {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  // 导出对话框样式
  .export-editor {
    border: 1px solid #dcdfe6;
    border-radius: 6px;
  }
}
</style>
