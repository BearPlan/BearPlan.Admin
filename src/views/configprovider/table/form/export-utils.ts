/**
 * 表单设计器导出工具函数
 */

/**
 * 生成Vue组件代码
 */
export const generateVueComponent = (formData: any) => {
  const componentName = 'DynamicForm';
  // 确保获取正确的组件数据，优先使用 slots.default
  const components = formData.slots?.default || formData.children || [];

  // 生成模板
  const template = generateTemplate(components);

  // 生成数据定义
  const dataFields = extractFormFields(components)
    .map(field => `    ${field.prop}: ${JSON.stringify(field.defaultValue || '')}`)
    .join(',\n');

  const vueTemplate = [
    '<template>',
    '  <el-form',
    '    ref="formRef"',
    '    :model="formData"',
    `    label-width="${formData.attrs?.labelWidth || '120px'}"`,
    `    label-position="${formData.attrs?.labelPosition || 'right'}"`,
    `    size="${formData.attrs?.size || 'default'}"`,
    '    class="dynamic-form"',
    '  >',
    template,
    '    ',
    '    <el-form-item>',
    '      <el-button type="primary" @click="handleSubmit">提交</el-button>',
    '      <el-button @click="handleReset">重置</el-button>',
    '    </el-form-item>',
    '  </el-form>',
    '</template>'
  ].join('\n');

  const scriptContent = [
    '<script setup lang="ts">',
    "import { ref, reactive } from 'vue'",
    "import { ElMessage } from 'element-plus'",
    '',
    'defineOptions({',
    `  name: '${componentName}'`,
    '})',
    '',
    '// 表单数据',
    'const formData = reactive({',
    dataFields,
    '})',
    '',
    '// 表单引用',
    'const formRef = ref()',
    '',
    '// 提交表单',
    'const handleSubmit = () => {',
    '  formRef.value?.validate((valid: boolean) => {',
    '    if (valid) {',
    "      console.log('表单数据:', formData)",
    "      ElMessage.success('表单提交成功')",
    '      // 在这里处理表单提交逻辑',
    '    } else {',
    "      ElMessage.error('请检查表单填写')",
    '    }',
    '  })',
    '}',
    '',
    '// 重置表单',
    'const handleReset = () => {',
    '  formRef.value?.resetFields()',
    "  ElMessage.success('表单已重置')",
    '}',
    '</script>'
  ].join('\n');

  const styleContent = [
    '<style scoped>',
    '.dynamic-form {',
    '  max-width: 600px;',
    '  margin: 0 auto;',
    '  padding: 20px;',
    '}',
    '</style>'
  ].join('\n');

  return [vueTemplate, scriptContent, styleContent].join('\n\n');
};

/**
 * 生成HTML模板
 */
export const generateHtmlTemplate = (formData: any) => {
  // 确保获取正确的组件数据，优先使用 slots.default
  const components = formData.slots?.default || formData.children || [];
  const formHtml = generateHtmlFromComponents(components);
  const formDataCode = generateHtmlFormData(components);

  const htmlLines = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>动态表单</title>',
    '  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">',
    '  <script src="https://unpkg.com/vue@next"></script>',
    '  <script src="https://unpkg.com/element-plus"></script>',
    '</head>',
    '<body>',
    '  <div id="app">',
    '    <el-form',
    '      ref="formRef"',
    '      :model="formData"',
    `      label-width="${formData.attrs?.labelWidth || '120px'}"`,
    `      label-position="${formData.attrs?.labelPosition || 'right'}"`,
    `      size="${formData.attrs?.size || 'default'}"`,
    '      style="max-width: 600px; margin: 20px auto; padding: 20px;"',
    '    >',
    formHtml,
    '      ',
    '      <el-form-item>',
    '        <el-button type="primary" @click="handleSubmit">提交</el-button>',
    '        <el-button @click="handleReset">重置</el-button>',
    '      </el-form-item>',
    '    </el-form>',
    '  </div>',
    '',
    '  <script>',
    '    const { createApp, ref, reactive } = Vue',
    '    const { ElMessage } = ElementPlus',
    '',
    '    createApp({',
    '      setup() {',
    '        const formData = reactive({',
    formDataCode,
    '        })',
    '        ',
    '        const formRef = ref()',
    '        ',
    '        const handleSubmit = () => {',
    "          console.log('表单数据:', formData)",
    "          ElMessage.success('表单提交成功')",
    '        }',
    '        ',
    '        const handleReset = () => {',
    '          Object.keys(formData).forEach(key => {',
    "            formData[key] = ''",
    '          })',
    "          ElMessage.success('表单已重置')",
    '        }',
    '        ',
    '        return {',
    '          formData,',
    '          formRef,',
    '          handleSubmit,',
    '          handleReset',
    '        }',
    '      }',
    "    }).use(ElementPlus).mount('#app')",
    '  </script>',
    '</body>',
    '</html>'
  ];

  return htmlLines.join('\n');
};

/**
 * 生成模板代码
 */
const generateTemplate = (components: any[], indent: string = '    ') => {
  return components
    .map(comp => {
      const { type, attrs = {}, itemAttrs = {}, slots = {} } = comp;

      // 对于表单项组件，使用 el-form-item 包裹
      if (itemAttrs.prop) {
        const formItemProps = Object.entries(itemAttrs)
          .filter(([key]) => key !== 'prop')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const componentProps = Object.entries(attrs)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return `${key}="${value}"`;
            }
            return `:${key}="${JSON.stringify(value)}"`;
          })
          .join(' ');

        const componentTag = getElementTagName(type);

        if (type === 'ElSelect' && attrs.options) {
          const options = attrs.options
            .map((opt: any) => `${indent}      <el-option label="${opt.label}" value="${opt.value}" />`)
            .join('\n');

          return [
            `${indent}<el-form-item ${formItemProps}>`,
            `${indent}  <${componentTag} v-model="formData.${itemAttrs.prop}" ${componentProps}>`,
            options,
            `${indent}  </${componentTag}>`,
            `${indent}</el-form-item>`
          ].join('\n');
        }

        return [
          `${indent}<el-form-item ${formItemProps}>`,
          `${indent}  <${componentTag} v-model="formData.${itemAttrs.prop}" ${componentProps} />`,
          `${indent}</el-form-item>`
        ].join('\n');
      }

      // 对于容器组件，递归处理子组件
      const childComponents = slots.default || comp.children || [];
      if (childComponents && childComponents.length > 0) {
        const componentProps = Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const componentTag = getElementTagName(type);
        const childrenTemplate = generateTemplate(childComponents, `${indent}  `);

        return [`${indent}<${componentTag} ${componentProps}>`, childrenTemplate, `${indent}</${componentTag}>`].join(
          '\n'
        );
      }

      // 普通组件
      const componentProps = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      const componentTag = getElementTagName(type);
      const content = attrs.text || '';

      if (content) {
        return `${indent}<${componentTag} ${componentProps}>${content}</${componentTag}>`;
      }

      return `${indent}<${componentTag} ${componentProps} />`;
    })
    .join('\n');
};

/**
 * 获取Element Plus组件标签名
 */
const getElementTagName = (componentType: string) => {
  const tagMap: Record<string, string> = {
    ElInput: 'el-input',
    ElButton: 'el-button',
    ElSelect: 'el-select',
    ElOption: 'el-option',
    ElDatePicker: 'el-date-picker',
    ElSwitch: 'el-switch',
    ElRadioGroup: 'el-radio-group',
    ElRadio: 'el-radio',
    ElCheckboxGroup: 'el-checkbox-group',
    ElCheckbox: 'el-checkbox',
    ElInputNumber: 'el-input-number',
    ElRow: 'el-row',
    ElCol: 'el-col',
    ElCard: 'el-card',
    ElText: 'el-text',
    ElLink: 'el-link'
  };

  return tagMap[componentType] || componentType.toLowerCase();
};

/**
 * 生成HTML表单组件
 */
const generateHtmlFromComponents = (components: any[], indent: string = '      ') => {
  return components
    .map(comp => {
      const { type, attrs = {}, itemAttrs = {} } = comp;

      if (itemAttrs.prop) {
        const formItemProps = Object.entries(itemAttrs)
          .filter(([key]) => key !== 'prop')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const componentProps = Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');

        const componentTag = getElementTagName(type);

        return [
          `${indent}<el-form-item ${formItemProps}>`,
          `${indent}  <${componentTag} v-model="formData.${itemAttrs.prop}" ${componentProps}></${componentTag}>`,
          `${indent}</el-form-item>`
        ].join('\n');
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');
};

/**
 * 生成HTML表单数据
 */
const generateHtmlFormData = (components: any[]) => {
  return extractFormFields(components)
    .map(field => `          ${field.prop}: ${JSON.stringify(field.defaultValue || '')}`)
    .join(',\n');
};

/**
 * 提取表单字段信息
 */
const extractFormFields = (components: any[]): Array<{ prop: string; defaultValue: any }> => {
  const fields: Array<{ prop: string; defaultValue: any }> = [];

  const extract = (comps: any[]) => {
    comps.forEach(comp => {
      if (comp.itemAttrs?.prop) {
        fields.push({
          prop: comp.itemAttrs.prop,
          defaultValue: comp.attrs?.defaultValue || ''
        });
      }

      // 递归处理子组件
      const children = comp.slots?.default || comp.children || [];
      if (children.length > 0) {
        extract(children);
      }
    });
  };

  extract(components);
  return fields;
};
