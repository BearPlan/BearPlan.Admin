<script setup lang="tsx">
import { h, ref, watch } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ElButton } from 'element-plus';
import * as UI from 'element-plus';
import * as monaco from 'monaco-editor';
import { stringifyCode } from '@/utils/stringifyCode';
import { COLUMN_DTS, unwrapColumnCode, wrapColumnCode } from '@/utils/columnCodeTemplate';
import { $t } from '@/locales';
import type { FoldingStrategy, RenderLineHighlight } from '@/components/monaco-editor/monaco-editor-type';

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});
const { label, prop } = defineProps<{
  label: string;
  prop: string;
}>();

const emit = defineEmits<{
  (e: 'apply', code: string): void;
}>();

// code 保持 TableColumnCtx 类型，享受字段补全；通过 stringifyCode 序列化为 JS 源码字符串放入编辑器
const codes: { title: string; code: Partial<TableColumnCtx<any>> }[] = [
  {
    title: '表格格式化',
    code: {
      label: '#',
      prop: '@',
      width: 100,
      formatter: row => {
        return row.isAudit
          ? h(UI.ElTag, { type: 'success' }, { default: () => '是' })
          : h(UI.ElTag, { type: 'danger' }, { default: () => '否' });
      }
    }
  }
];

// 当前展示的模板（仅一项）；'#'/'@' 为 label/prop 占位符，序列化后替换为真实值
const activeCode = ref(codes[0].code);
// 编辑器内容：裸对象包成完整类型声明，供 TS 实时诊断；'#'/'@' 替换为真实 label/prop
const editCode = ref('');

watch(
  visible,
  open => {
    if (open) {
      const raw = stringifyCode(activeCode.value).replaceAll("'#'", `'${label}'`).replaceAll("'@'", `'${prop}'`);
      editCode.value = wrapColumnCode(raw);
    }
  },
  { immediate: true }
);

/** 编辑器挂载：开启 TS 语义诊断并注入列配置类型声明 */
function handleEditorMounted() {
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

/** 确认：剥离外层类型声明，把裸对象代码回填到上层组件代码编辑器 */
function handleApply() {
  emit('apply', unwrapColumnCode(editCode.value));
  visible.value = false;
}
</script>

<template>
  <ElDrawer v-model="visible" title="控件模版" direction="ltr" size="50%">
    <template #default>
      <div v-for="(item, index) in codes" :key="index">
        <h3>{{ item.title }}</h3>
        <MonacoEditor
          v-model:value="editCode"
          language="typescript"
          height="25vh"
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
          @editor-mounted="handleEditorMounted"
        />
        <ElButton type="primary" @click="handleApply">{{ $t('common.confirm') }}</ElButton>
      </div>
    </template>
    <template #footer>
      <div class="flex-auto">
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>
