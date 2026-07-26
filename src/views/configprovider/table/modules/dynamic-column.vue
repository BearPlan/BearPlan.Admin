<script setup lang="tsx">
import { computed, ref, watch } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import * as monaco from 'monaco-editor';
import createComponent from '@/utils/createComponent';
import { COLUMN_DTS, unwrapColumnCode, wrapColumnCode } from '@/utils/columnCodeTemplate';
import { parseColumnCode } from '@/utils/parseColumnCode';
import { $t } from '@/locales';
import MonacoEditor from '@/components/monaco-editor/monaco-editor.vue';
import type { FoldingStrategy, RenderLineHighlight } from '@/components/monaco-editor/monaco-editor-type';
import FormatterDrawer from './formatter-drawer.vue';
defineOptions({ name: 'DynamicColumn', inheritAttrs: false });

const { label, prop, attrsCode } = defineProps<{
  label: string;
  prop: string;
  attrsCode: string;
}>();

const visible = defineModel<boolean>('visible', {
  default: false
});
// componentCode 始终存「裸对象字面量」，与 row.attrs 存储格式保持一致；反序列化由 parseColumnCode 处理
const componentCode = ref('');
// 编辑器显示「完整类型声明」，与 componentCode 双向同步（剥壳/包壳）
const editorCode = ref('');
// 旁路标记：程序化同步触发的变更不应再反向回写，避免循环
let syncing = false;
// 组件代码编辑器实例：apply 回填等精细操作直接调用其 API，不走 ref 间接链路
let codeEditor: monaco.editor.IStandaloneCodeEditor | null = null;

watch(
  () => attrsCode,
  () => {
    if (attrsCode) {
      componentCode.value = attrsCode;
    } else {
      componentCode.value = `{
      label: '${label}',
      prop : '${prop}',
        formatter: (row) => {
        }
    }`;
    }
  },
  {
    immediate: true
  }
);

// componentCode（裸对象）→ editorCode（完整声明）
watch(
  componentCode,
  raw => {
    syncing = true;
    editorCode.value = wrapColumnCode(raw);
  },
  { immediate: true }
);

const emit = defineEmits(['change']);
// 提交和关闭
const handleSubmit = () => {
  try {
    parseColumnCode(componentCode.value);
    emit('change', componentCode.value);
    visible.value = false;
  } catch (error) {
    window.$message?.error(`解析错误:${error},修改过后再保存`);
  }
};
const handleClose = () => {
  visible.value = false;
};
const dataStr = ref(`[{
  "date": "2016-05-03",
  "name": "Tom",
  "address": "No. 189, Grove St, Los Angeles"
}]`);

const tableData = computed(() => {
  try {
    // 将字符串解析为对象
    // 使用 JSON.parse 更安全'
    let data = JSON.parse(dataStr.value);
    if (prop) {
      data = data.map((item: any) => {
        return {
          ...item,
          [prop]: item[prop]
        };
      });
    }

    return data;
  } catch (error) {
    console.error('解析数据时出错:', error);
    return [];
  }
});
const columns = computed(() => {
  let col: Array<Partial<TableColumnCtx<any>>> = [
    {
      label: '日期',
      prop: 'date'
    },
    {
      label: '姓名',
      prop: 'name'
    },
    {
      label: '地址',
      prop: 'address'
    }
  ];
  if (componentCode.value) {
    try {
      // 解析组件配置；formatter 等函数体里的 h/UI 由 parseColumnCode 注入执行上下文
      const parseConfig = parseColumnCode(componentCode.value);
      col = [...col, parseConfig];
    } catch (error) {
      console.error('组件代码解析失败:', error);
    }
  }
  return col;
});

watch(
  () => prop,
  () => {
    dataStr.value = `[{
  "date": "2016-05-03",
  "name": "Tom",
  "address": "No. 189, Grove St, Los Angeles",
  "${prop}": null
}]`;
  },
  { immediate: true }
);

/** 编辑器内容变更：剥离外层声明，把裸对象同步回 componentCode（存储格式不变） */
function handleCodeChange() {
  if (syncing) {
    syncing = false;
    return;
  }
  componentCode.value = unwrapColumnCode(editorCode.value);
}

/** 编辑器挂载：保存实例，开启 TS 语义诊断并注入列配置类型声明 */
function handleEditorMounted(editor: monaco.editor.IStandaloneCodeEditor) {
  codeEditor = editor;
  const ts = monaco.languages.typescript;
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    allowJs: true,
    skipLibCheck: true,
    strict: false
  });
  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
  });
  ts.typescriptDefaults.addExtraLib(COLUMN_DTS, 'file:///table-column.d.ts');
}

function handleCleanAndClose() {
  componentCode.value = '';
  visible.value = false;
}

/**
 * 例子确认回填：直接用编辑器实例 API 操作（绕过 componentCode→watch→editorCode 间接链路）。
 * setValue 触发的 change 由 syncing 拦截，避免反向覆盖；componentCode 同步保持存储一致。
 */
function applyExampleCode(raw: string) {
  if (!codeEditor) {
    componentCode.value = raw;
    return;
  }
  syncing = true;
  const full = wrapColumnCode(raw);
  codeEditor.setValue(full);
  // 定位到 formatter 函数体（若有），便于用户继续编辑；找不到则定位首行
  const match = full.match(/\bformatter\b/);
  if (match) {
    const pos = full.indexOf(match[0]);
    const lineNumber = full.slice(0, pos).split('\n').length;
    codeEditor.setPosition({ lineNumber, column: 1 });
    codeEditor.revealLineInCenter(lineNumber);
  }
  codeEditor.focus();
  // 同步存储（裸对象）；watch 会重设 syncing 并刷新 editorCode，但 editor 内容已是 full，不会重复 setValue
  componentCode.value = raw;
}

// 打开弹窗
const openDialog = async () => {
  const { on, unmount } = await createComponent(FormatterDrawer, { visible: true, label, prop });

  // 例子确认后回填到组件代码编辑器（裸对象，经 watch 自动包壳到 editorCode）
  on('apply', code => {
    applyExampleCode(code);
  });
  on('update:visible', res => {
    if (!res) {
      unmount();
    }
  });
};
</script>

<template>
  <ElDialog v-model="visible" :title="$t('插槽编辑')" :append-to-body="true" class="dynamic-component-dialog w-1400px">
    <ElRow :gutter="24">
      <!-- 左侧预览 -->
      <ElCol :span="12">
        <ElCard header="组件预览" shadow="hover" class="preview-card">
          <ElTable :data="tableData" border>
            <ElTableColumn v-for="(col, index) in columns" :key="index" v-bind="col" />
          </ElTable>

          测试数据
          <div class="code-container mt-4">
            <MonacoEditor
              ref="dataRef"
              v-model:value="dataStr"
              language="json"
              height="350px"
              :options="{
                automaticLayout: true,
                foldingStrategy: 'indentation' as FoldingStrategy,
                renderLineHighlight: 'all' as RenderLineHighlight,
                selectOnLineNumbers: true,
                minimap: { enabled: false },
                readOnly: false,
                fontSize: 14,
                scrollBeyondLastLine: false,
                overviewRulerBorder: false
              }"
            />
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧配置 -->
      <ElCol :span="12">
        <ElCard :header="'组件代码-' + label + '-' + prop" shadow="hover" class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span>组件代码-{{ label }}-{{ prop }}</span>
              <ElButton type="primary" @click="openDialog">查看例子</ElButton>
            </div>
          </template>
          <MonacoEditor
            ref="codeRef"
            v-model:value="editorCode"
            language="typescript"
            height="50vh"
            :options="{
                automaticLayout: true,
                foldingStrategy: 'indentation' as FoldingStrategy,
                renderLineHighlight: 'all' as RenderLineHighlight,
                selectOnLineNumbers: true,
                minimap: { enabled: false },
                readOnly: false,
                fontSize: 14,
                scrollBeyondLastLine: false,
                overviewRulerBorder: false
              }"
            @change="handleCodeChange"
            @editor-mounted="handleEditorMounted"
          />
        </ElCard>
      </ElCol>
    </ElRow>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="handleCleanAndClose">{{ $t('common.cleanAndClose') }}</ElButton>
        <ElButton @click="handleClose">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.dynamic-component-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.preview-card {
  display: flex;
  flex-direction: column;

  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    padding: 20px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    background-color: #f8f9fa;
    margin-bottom: 20px;
  }

  .code-container {
    position: relative;
    padding: 0;
    border-radius: 4px;
    background-color: #1e1e1e;
    overflow: hidden;
    /* 占据剩余空间，让 Monaco Editor 高度自适应 */
    flex: 1 1 0;
  }
}

.attributes-form-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.attributes-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.el-form-item) {
    margin-bottom: 15px;
    width: 100%;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 4px;
  }
}

.attribute-input-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .el-button {
    flex-shrink: 0;
  }
}
</style>
