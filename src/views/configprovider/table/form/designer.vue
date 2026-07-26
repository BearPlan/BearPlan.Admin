<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useFormDesignerStore } from '@/store/modules/form-designer';
import ComponentPalette from '@/components/form-designer/component-palette.vue';
import DesignCanvas from '@/components/form-designer/design-canvas.vue';
import ConfigPanel from '@/components/form-designer/config-panel.vue';
import MonacoEditor from '@/components/monaco-editor/monaco-editor.vue';
import { generateHtmlTemplate, generateVueComponent } from './export-utils';

defineOptions({
  name: 'FormDesigner'
});

// Store
const formDesignerStore = useFormDesignerStore();

// 响应式数据
const importDialogVisible = ref(false);
const saveDialogVisible = ref(false);
const showExportDialog = ref(false);
const exportType = ref('json');
const exportContent = ref('');
const exportFileName = ref('');
const importContent = ref('');
const showShortcuts = ref(false);

const saveForm = ref({
  name: '',
  description: '',
  category: 'my-forms'
});

// 计算属性
const componentCount = computed(() => formDesignerStore.getComponentCount());
const previewMode = computed(() => formDesignerStore.previewMode);

// 方法
const handleComponentSelect = (component: any) => {
  console.log('Selected component:', component);
};

const togglePreviewMode = () => {
  formDesignerStore.togglePreviewMode();
};

const handleClearCanvas = () => {
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

const handleImport = () => {
  importContent.value = '';
  importDialogVisible.value = true;
};

const handleImportConfirm = () => {
  try {
    const jsonData = importContent.value.trim();
    if (!jsonData) {
      ElMessage.error('请输入有效的JSON数据');
      return;
    }

    // 验证JSON格式
    const formData = JSON.parse(jsonData);

    // 验证必要字段
    if (!formData.type || formData.type !== 'ElForm') {
      ElMessage.error('无效的表单配置格式');
      return;
    }

    // 导入数据
    formDesignerStore.loadFormFromJSON(jsonData);

    ElMessage.success('表单配置导入成功');
    importDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('JSON格式错误，请检查数据格式');
    console.error('Import error:', error);
  }
};

const handleSave = () => {
  saveForm.value.name = '';
  saveForm.value.description = '';
  saveForm.value.category = 'my-forms';
  saveDialogVisible.value = true;
};

const handleExport = () => {
  if (componentCount.value === 0) {
    ElMessage.warning('请先添加组件再导出');
    return;
  }

  showExportDialog.value = true;
  generateExportContent();
};

const handleSaveConfirm = () => {
  if (!saveForm.value.name.trim()) {
    ElMessage.error('请输入表单名称');
    return;
  }

  // 这里可以调用API保存表单
  const formData = {
    ...saveForm.value,
    config: formDesignerStore.formData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('Saving form:', formData);

  // 模拟保存成功
  ElMessage.success('表单保存成功');
  saveDialogVisible.value = false;
};

// 导出相关方法
const generateExportContent = () => {
  const formData = formDesignerStore.formData;

  if (exportType.value === 'json') {
    exportContent.value = JSON.stringify(formData, null, 2);
    exportFileName.value = 'form-config.json';
  } else if (exportType.value === 'vue') {
    exportContent.value = generateVueComponent(formData);
    exportFileName.value = 'FormComponent.vue';
  } else if (exportType.value === 'html') {
    exportContent.value = generateHtmlTemplate(formData);
    exportFileName.value = 'form-template.html';
  }
};

const handleExportConfirm = () => {
  try {
    // 创建下载链接
    const blob = new Blob([exportContent.value], {
      type: exportType.value === 'json' ? 'application/json' : 'text/plain'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName.value;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
    showExportDialog.value = false;
  } catch (error) {
    ElMessage.error('导出失败');
    console.error('Export error:', error);
  }
};

const copyExportContent = async () => {
  try {
    await navigator.clipboard.writeText(exportContent.value);
    ElMessage.success('内容已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  const { ctrlKey, metaKey, key } = event;
  const isCtrl = ctrlKey || metaKey;

  if (isCtrl) {
    switch (key.toLowerCase()) {
      case 's':
        event.preventDefault();
        if (componentCount.value > 0) {
          handleSave();
        }
        break;
      case 'z':
        event.preventDefault();
        ElMessage.info('撤销功能开发中...');
        break;
      case 'y':
        event.preventDefault();
        ElMessage.info('重做功能开发中...');
        break;
      case 'c':
        event.preventDefault();
        if (formDesignerStore.selectedComponent) {
          ElMessage.info('复制功能开发中...');
        }
        break;
      case 'v':
        event.preventDefault();
        ElMessage.info('粘贴功能开发中...');
        break;
      case 'p':
        event.preventDefault();
        formDesignerStore.togglePreviewMode();
        break;
    }
  } else {
    switch (key) {
      case 'Delete':
        if (formDesignerStore.selectedComponent) {
          ElMessageBox.confirm('确定要删除选中的组件吗？', '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              formDesignerStore.removeComponent(formDesignerStore.selectedComponent!.id);
              ElMessage.success('组件已删除');
            })
            .catch(() => {
              // 取消删除
            });
        }
        break;
      case 'F11':
        event.preventDefault();
        ElMessage.info('全屏模式开发中...');
        break;
    }
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="form-designer-container">
    <ElCard class="form-designer-card">
      <template #header>
        <!-- 顶部工具栏 -->
        <div class="form-designer-header">
          <div class="header-left">
            <div class="brand-section">
              <div class="brand-icon">
                <SvgIcon icon="mdi:cube-outline" class="text-2xl text-blue-600" />
              </div>
              <div class="brand-content">
                <h2 class="page-title">表单设计器</h2>
                <span class="page-subtitle">可视化拖拽构建动态表单</span>
              </div>
            </div>
          </div>

          <div class="header-center">
            <ElSteps style="width: 600px" :active="1" finish-status="success">
              <ElStep title="基础字段" />
              <ElStep title="设计器" />
              <ElStep title="完成" />
            </ElSteps>

            <!--
 <div class="status-indicator">
          <div class="status-dot" :class="{ 'active': componentCount > 0 }"></div>
          <span class="status-text">{{ componentCount > 0 ? '设计中' : '空白画布' }}</span>
          <span class="component-count">{{ componentCount }} 个组件</span>
        </div> 
-->
          </div>

          <div class="header-right">
            <div class="action-buttons">
              <ElButton size="small" @click="togglePreviewMode">
                {{ previewMode ? '退出预览' : '预览' }}
              </ElButton>

              <ElDivider direction="vertical" class="mx-2" />

              <ElButton size="small" @click="handleImport">
                <SvgIcon icon="mdi:import" class="mr-1" />
                导入
              </ElButton>

              <ElButton size="small" :disabled="componentCount === 0" @click="handleExport">
                <SvgIcon icon="mdi:export" class="mr-1" />
                导出
              </ElButton>

              <ElDivider direction="vertical" class="mx-2" />

              <ElButton size="small" :disabled="componentCount === 0" type="danger" plain @click="handleClearCanvas">
                <SvgIcon icon="mdi:delete" class="mr-1" />
                清空
              </ElButton>

              <ElDivider direction="vertical" class="mx-2" />

              <ElButton type="primary" size="small" :disabled="componentCount === 0" @click="handleSave">
                <SvgIcon icon="mdi:content-save" class="mr-1" />
                保存
              </ElButton>
            </div>
          </div>
        </div>
      </template>

      <!-- 主体内容区 -->
      <div class="form-designer-body">
        <!-- 左侧组件面板 -->
        <div v-show="!previewMode" class="form-designer-panel form-designer-panel-left">
          <ComponentPalette @component-select="handleComponentSelect" />
        </div>

        <!-- 中间设计画布 -->
        <div class="form-designer-canvas">
          <DesignCanvas />
        </div>

        <!-- 右侧配置面板 -->
        <div v-show="!previewMode" class="form-designer-panel form-designer-panel-right">
          <ConfigPanel />
        </div>
      </div>
    </ElCard>

    <!-- 导入对话框 -->
    <ElDialog v-model="importDialogVisible" title="导入表单配置" width="60%" :close-on-click-modal="false">
      <div class="import-dialog-content">
        <ElAlert title="导入说明" type="info" :closable="false" class="mb-4">
          <p>请粘贴有效的表单配置 JSON 数据，导入后将覆盖当前设计内容。</p>
        </ElAlert>

        <MonacoEditor
          :value="importContent"
          language="json"
          height="300px"
          placeholder="请粘贴JSON配置..."
          class="import-editor"
          @update:value="importContent = $event"
        />
      </div>

      <template #footer>
        <ElButton @click="importDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!importContent.trim()" @click="handleImportConfirm">确认导入</ElButton>
      </template>
    </ElDialog>

    <!-- 保存对话框 -->
    <ElDialog v-model="saveDialogVisible" title="保存表单" width="50%" :close-on-click-modal="false">
      <ElForm :model="saveForm" label-width="80px">
        <ElFormItem label="表单名称" required>
          <ElInput v-model="saveForm.name" placeholder="请输入表单名称" maxlength="50" show-word-limit />
        </ElFormItem>

        <ElFormItem label="表单描述">
          <ElInput
            v-model="saveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入表单描述"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="保存位置">
          <ElSelect v-model="saveForm.category" placeholder="请选择保存位置">
            <ElOption label="我的表单" value="my-forms" />
            <ElOption label="公共表单" value="public-forms" />
            <ElOption label="草稿箱" value="drafts" />
          </ElSelect>
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="saveDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!saveForm.name.trim()" @click="handleSaveConfirm">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 导出对话框 -->
    <ElDialog v-model="showExportDialog" title="导出表单配置" width="70%" :close-on-click-modal="false">
      <div class="export-dialog-content">
        <div class="export-options">
          <ElAlert title="导出说明" type="info" :closable="false" class="mb-4">
            <p>选择导出格式，支持 JSON 配置、Vue 组件和 HTML 模板三种格式。</p>
          </ElAlert>

          <ElRadioGroup v-model="exportType" class="mb-4" @change="generateExportContent">
            <ElRadio label="json">JSON 配置</ElRadio>
            <ElRadio label="vue">Vue 组件</ElRadio>
            <ElRadio label="html">HTML 模板</ElRadio>
          </ElRadioGroup>
        </div>

        <div class="export-content">
          <div class="export-header">
            <span class="export-filename">{{ exportFileName }}</span>
            <div class="export-actions">
              <ElButton size="small" @click="copyExportContent">
                <SvgIcon icon="mdi:content-copy" class="mr-1" />
                复制内容
              </ElButton>
            </div>
          </div>

          <MonacoEditor
            :value="exportContent"
            :language="exportType === 'json' ? 'json' : exportType === 'vue' ? 'vue' : 'html'"
            height="400px"
            :readonly="true"
            class="export-editor"
            @update:value="exportContent = $event"
          />
        </div>
      </div>

      <template #footer>
        <ElButton @click="showExportDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleExportConfirm">
          <SvgIcon icon="mdi:download" class="mr-1" />
          下载文件
        </ElButton>
      </template>
    </ElDialog>

    <!-- 快捷键提示 -->
    <div class="keyboard-shortcuts">
      <ElTooltip content="显示快捷键">
        <ElButton circle size="small" @click="showShortcuts = !showShortcuts">
          <SvgIcon icon="mdi:keyboard" />
        </ElButton>
      </ElTooltip>
    </div>

    <!-- 快捷键面板 -->
    <ElDrawer v-model="showShortcuts" title="快捷键" direction="rtl" size="300px">
      <div class="shortcuts-content">
        <div class="shortcut-group">
          <h4 class="group-title">基础操作</h4>
          <div class="shortcut-item">
            <kbd>Ctrl + S</kbd>
            <span>保存表单</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + Z</kbd>
            <span>撤销操作</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + Y</kbd>
            <span>重做操作</span>
          </div>
          <div class="shortcut-item">
            <kbd>Delete</kbd>
            <span>删除选中组件</span>
          </div>
        </div>

        <div class="shortcut-group">
          <h4 class="group-title">组件操作</h4>
          <div class="shortcut-item">
            <kbd>Ctrl + C</kbd>
            <span>复制组件</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + V</kbd>
            <span>粘贴组件</span>
          </div>
          <div class="shortcut-item">
            <kbd>↑ ↓</kbd>
            <span>上下移动组件</span>
          </div>
        </div>

        <div class="shortcut-group">
          <h4 class="group-title">视图操作</h4>
          <div class="shortcut-item">
            <kbd>Ctrl + P</kbd>
            <span>切换预览模式</span>
          </div>
          <div class="shortcut-item">
            <kbd>F11</kbd>
            <span>全屏模式</span>
          </div>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style lang="scss" scoped>
.form-designer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  background-color: #f5f7fa;

  .form-designer-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    :deep(.el-card__header) {
      padding: 0;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      flex: 1;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }

  .form-designer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #ebeef5;
    background-color: #ffffff;

    .header-left {
      display: flex;
      justify-content: center;
      align-items: center;

      .brand-section {
        display: flex;
        justify-content: center;
        align-items: center;

        .brand-icon {
          margin-right: 12px;
        }

        .brand-content {
          .page-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          .page-subtitle {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .header-center {
    }

    .header-right {
      .action-buttons {
        display: flex;
        justify-content: center;
        align-items: center;

        :deep(.el-button) {
          margin-left: 12px;
        }
      }
    }
  }

  .form-designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;

    .form-designer-panel {
      height: 100%;
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      &.form-designer-panel-left {
        width: 280px;
        border-right: 1px solid #ebeef5;
        z-index: 10;
      }

      &.form-designer-panel-right {
        width: 320px;
        border-left: 1px solid #ebeef5;
        z-index: 10;
      }

      &:deep(.el-card) {
        border: none;
        border-radius: 0;
        height: 100%;
        display: flex;
        flex-direction: column;

        .el-card__body {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }
      }
    }

    .form-designer-canvas {
      flex: 1;
      height: 100%;
      min-width: 400px;
      background-color: #f5f7fa;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 16px;
      box-sizing: border-box;

      &:deep(.el-card) {
        border: none;
        border-radius: 6px;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        .el-card__body {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }
      }
    }
  }

  // 对话框样式
  .import-dialog-content,
  .export-dialog-content {
    .import-editor,
    .export-editor {
      border: 1px solid #dcdfe6;
      border-radius: 6px;
    }

    .export-options {
      margin-bottom: 24px;
    }

    .export-content {
      .export-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .export-filename {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }

  // 快捷键面板
  .keyboard-shortcuts {
    position: absolute;
    bottom: 16px;
    right: 16px;
    z-index: 100;

    :deep(.el-button) {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  .shortcuts-content {
    .shortcut-group {
      margin-bottom: 24px;

      .group-title {
        margin: 0 0 12px;
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }

      .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 14px;

        kbd {
          background-color: #f5f7fa;
          border: 1px solid #dcdfe6;
          border-radius: 6px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 12px;
        }

        span {
          color: #606266;
        }
      }
    }
  }
}

// 预览模式下的样式调整
.form-designer-container.preview-mode {
  .form-designer-panel {
    transform: translateX(-100%);

    &.form-designer-panel-right {
      transform: translateX(100%);
    }
  }

  .form-designer-canvas {
    padding: 24px;

    &:deep(.el-card) {
      box-shadow: none;
      border-radius: 0;
    }
  }
}
</style>
