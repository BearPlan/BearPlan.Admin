import type { CodeGenerationOptions, ComponentDesignData, FormDesignData } from '@/typings/form-designer';

/**
 * Vue 代码生成器
 */
export class VueCodeGenerator {
  /**
   * 生成完整的 Vue 组件代码
   */
  static generateVueCode(formData: FormDesignData, options: CodeGenerationOptions = {}): string {
    const {
      typescript = true,
      includeStyles = true,
      includeValidation = true,
      codeStyle = 'composition',
      format = true
    } = options;

    const template = this.generateTemplate(formData);
    const script = this.generateScript(formData, { typescript, includeValidation, codeStyle });
    const style = includeStyles ? this.generateStyle() : '';

    const code = `<template>
${template}
</template>

${script}

${style}`;

    return format ? this.formatCode(code) : code;
  }

  /**
   * 生成模板部分
   */
  private static generateTemplate(formData: FormDesignData): string {
    const formAttrs = this.stringifyAttrs(formData.attrs);
    const components = formData.slots.default || [];

    const formContent =
      components.length > 0
        ? components.map(component => this.generateComponentTemplate(component, 2)).join('\n')
        : '    <!-- 暂无表单组件 -->';

    return `  <ElForm${formAttrs ? ` ${formAttrs}` : ''}>
${formContent}

    <ElFormItem class="form-actions">
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      <ElButton @click="handleReset">重置</ElButton>
    </ElFormItem>
  </ElForm>`;
  }

  /**
   * 生成组件模板
   */
  private static generateComponentTemplate(component: ComponentDesignData, indent: number): string {
    const spaces = ' '.repeat(indent);
    const componentAttrs = this.stringifyAttrs(component.attrs);
    const isFormItem = this.isFormItemComponent(component.type);

    if (isFormItem) {
      const itemAttrs = this.stringifyAttrs(component.itemAttrs);
      const vModel = component.itemAttrs.prop ? ` v-model="formData.${component.itemAttrs.prop}"` : '';

      if (this.isSelfClosingComponent(component.type)) {
        return `${spaces}<ElFormItem${itemAttrs ? ` ${itemAttrs}` : ''}>
${spaces}  <${component.type}${componentAttrs ? ` ${componentAttrs}` : ''}${vModel} />
${spaces}</ElFormItem>`;
      }
      const childContent = this.generateChildContent(component, indent + 2);
      return `${spaces}<ElFormItem${itemAttrs ? ` ${itemAttrs}` : ''}>
${spaces}  <${component.type}${componentAttrs ? ` ${componentAttrs}` : ''}${vModel}>
${childContent}
${spaces}  </${component.type}>
${spaces}</ElFormItem>`;
    }
    if (this.isSelfClosingComponent(component.type)) {
      return `${spaces}<${component.type}${componentAttrs ? ` ${componentAttrs}` : ''} />`;
    }
    const childContent = this.generateChildContent(component, indent + 2);
    return `${spaces}<${component.type}${componentAttrs ? ` ${componentAttrs}` : ''}>
${childContent}
${spaces}</${component.type}>`;
  }

  /**
   * 生成子内容
   */
  private static generateChildContent(component: ComponentDesignData, indent: number): string {
    const spaces = ' '.repeat(indent);
    const children: string[] = [];

    // 处理插槽内容
    if (component.slots.default && Array.isArray(component.slots.default)) {
      children.push(...component.slots.default.map(child => this.generateComponentTemplate(child, indent)));
    }

    // 处理子组件
    if (component.children && component.children.length > 0) {
      children.push(...component.children.map(child => this.generateComponentTemplate(child, indent)));
    }

    // 处理特殊组件的选项
    if (component.type === 'ElSelect' && component.attrs.options) {
      const options = component.attrs.options as Array<{ label: string; value: any }>;
      children.push(...options.map(option => `${spaces}<ElOption label="${option.label}" value="${option.value}" />`));
    }

    if (component.type === 'ElRadioGroup' && component.attrs.options) {
      const options = component.attrs.options as Array<{ label: string; value: any }>;
      children.push(...options.map(option => `${spaces}<ElRadio label="${option.value}">${option.label}</ElRadio>`));
    }

    if (component.type === 'ElCheckboxGroup' && component.attrs.options) {
      const options = component.attrs.options as Array<{ label: string; value: any }>;
      children.push(
        ...options.map(option => `${spaces}<ElCheckbox label="${option.value}">${option.label}</ElCheckbox>`)
      );
    }

    // 处理默认文本内容
    if (['ElButton', 'ElText', 'ElLink'].includes(component.type)) {
      const text = component.attrs.text || this.getDefaultText(component.type);
      children.push(`${spaces}${text}`);
    }

    return children.length > 0 ? children.join('\n') : `${spaces}<!-- 暂无内容 -->`;
  }

  /**
   * 生成脚本部分
   */
  private static generateScript(
    formData: FormDesignData,
    options: { typescript: boolean; includeValidation: boolean; codeStyle: string }
  ): string {
    const { typescript, includeValidation, codeStyle } = options;

    if (codeStyle === 'composition') {
      return this.generateCompositionScript(formData, { typescript, includeValidation });
    }
    return this.generateOptionsScript(formData, { typescript, includeValidation });
  }

  /**
   * 生成 Composition API 脚本
   */
  private static generateCompositionScript(
    formData: FormDesignData,
    options: { typescript: boolean; includeValidation: boolean }
  ): string {
    const { typescript, includeValidation } = options;
    const formFields = this.extractFormFields(formData);
    const validationRules = includeValidation ? this.generateValidationRules(formData) : '';

    const imports = [
      'import { ref, reactive }',
      'import type { FormInstance, FormRules }',
      'import { ElMessage }'
    ].join(" from 'vue'\n");

    const formDataDeclaration = this.generateFormDataDeclaration(formFields, typescript);
    const rulesDeclaration = includeValidation ? this.generateRulesDeclaration(validationRules, typescript) : '';

    return `<script setup${typescript ? ' lang="ts"' : ''}>
${imports}

defineOptions({
  name: 'GeneratedForm'
})

const formRef = ref<FormInstance>()

// 表单数据
${formDataDeclaration}

${rulesDeclaration}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    ElMessage.success('表单验证通过！')
    console.log('Form data:', formData${typescript ? '' : '.value'})

    // TODO: 在这里添加表单提交逻辑

  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入')
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  ElMessage.info('表单已重置')
}
</script>`;
  }

  /**
   * 生成 Options API 脚本
   */
  private static generateOptionsScript(
    formData: FormDesignData,
    options: { typescript: boolean; includeValidation: boolean }
  ): string {
    const { typescript, includeValidation } = options;
    const formFields = this.extractFormFields(formData);
    const validationRules = includeValidation ? this.generateValidationRules(formData) : '';

    return `<script${typescript ? ' lang="ts"' : ''}>
import { ElMessage } from 'element-plus'

export default {
  name: 'GeneratedForm',
  data() {
    return {
      formData: ${JSON.stringify(formFields, null, 6)},
      ${includeValidation ? `rules: ${validationRules},` : ''}
    }
  },
  methods: {
    async handleSubmit() {
      try {
        await this.$refs.formRef.validate()
        ElMessage.success('表单验证通过！')
        console.log('Form data:', this.formData)

        // TODO: 在这里添加表单提交逻辑

      } catch (error) {
        ElMessage.error('表单验证失败，请检查输入')
      }
    },

    handleReset() {
      this.$refs.formRef.resetFields()
      ElMessage.info('表单已重置')
    }
  }
}
</script>`;
  }

  /**
   * 生成样式部分
   */
  private static generateStyle(): string {
    return `<style scoped>
.form-actions {
   mt-6 text-center;
}

.form-actions .el-button {
   mr-3;
}

.form-actions .el-button:last-child {
   mr-0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-form {
     px-4;
  }

  .form-actions {
     mt-4;
  }

  .form-actions .el-button {
     w-full mr-0 mb-2;
  }

  .form-actions .el-button:last-child {
     mb-0;
  }
}
</style>`;
  }

  /**
   * 提取表单字段
   */
  private static extractFormFields(formData: FormDesignData): Record<string, any> {
    const fields: Record<string, any> = {};

    const extractFromComponents = (components: ComponentDesignData[]) => {
      components.forEach(component => {
        if (component.itemAttrs?.prop) {
          fields[component.itemAttrs.prop] = this.getDefaultValue(component.type, component.attrs);
        }

        // 递归处理子组件
        if (component.slots.default && Array.isArray(component.slots.default)) {
          extractFromComponents(component.slots.default);
        }
        if (component.children && component.children.length > 0) {
          extractFromComponents(component.children);
        }
      });
    };

    extractFromComponents(formData.slots.default || []);
    return fields;
  }

  /**
   * 生成验证规则
   */
  private static generateValidationRules(formData: FormDesignData): string {
    const rules: Record<string, any[]> = {};

    const extractRules = (components: ComponentDesignData[]) => {
      components.forEach(component => {
        const prop = component.itemAttrs?.prop;
        if (prop && component.itemAttrs?.required) {
          rules[prop] = [
            {
              required: true,
              message: `请输入${component.itemAttrs.label || prop}`,
              trigger: this.getTriggerType(component.type)
            }
          ];
        }

        // 递归处理子组件
        if (component.slots.default && Array.isArray(component.slots.default)) {
          extractRules(component.slots.default);
        }
        if (component.children && component.children.length > 0) {
          extractRules(component.children);
        }
      });
    };

    extractRules(formData.slots.default || []);
    return JSON.stringify(rules, null, 2);
  }

  /**
   * 辅助方法
   */
  private static stringifyAttrs(attrs: Record<string, any>): string {
    return Object.entries(attrs)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'boolean') {
          return value ? key : '';
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `:${key}="${JSON.stringify(value)}"`;
      })
      .filter(Boolean)
      .join(' ');
  }

  private static isFormItemComponent(type: string): boolean {
    const formItemTypes = [
      'ElInput',
      'ElSelect',
      'ElDatePicker',
      'ElSwitch',
      'ElRadioGroup',
      'ElCheckboxGroup',
      'ElInputNumber'
    ];
    return formItemTypes.includes(type);
  }

  private static isSelfClosingComponent(type: string): boolean {
    const selfClosingTypes = ['ElInput', 'ElSwitch', 'ElDatePicker', 'ElInputNumber', 'ElOption'];
    return selfClosingTypes.includes(type);
  }

  private static getDefaultText(type: string): string {
    const textMap: Record<string, string> = {
      ElButton: '按钮',
      ElText: '文本内容',
      ElLink: '链接'
    };
    return textMap[type] || '';
  }

  private static getDefaultValue(type: string, attrs: Record<string, any>): any {
    switch (type) {
      case 'ElInput':
        return attrs.type === 'number' ? 0 : '';
      case 'ElInputNumber':
        return 0;
      case 'ElSelect':
        return attrs.multiple ? [] : '';
      case 'ElDatePicker':
        return attrs.type?.includes('range') ? [] : null;
      case 'ElSwitch':
        return false;
      case 'ElRadioGroup':
        return '';
      case 'ElCheckboxGroup':
        return [];
      default:
        return '';
    }
  }

  private static getTriggerType(componentType: string): string {
    switch (componentType) {
      case 'ElSelect':
      case 'ElDatePicker':
      case 'ElSwitch':
      case 'ElRadioGroup':
      case 'ElCheckboxGroup':
        return 'change';
      default:
        return 'blur';
    }
  }

  private static generateFormDataDeclaration(fields: Record<string, any>, typescript: boolean): string {
    if (typescript) {
      return `const formData = reactive(${JSON.stringify(fields, null, 2)})`;
    }
    return `const formData = reactive(${JSON.stringify(fields, null, 2)})`;
  }

  private static generateRulesDeclaration(rules: string, typescript: boolean): string {
    if (typescript) {
      return `// 验证规则
const rules = reactive<FormRules>(${rules})`;
    }
    return `// 验证规则
const rules = reactive(${rules})`;
  }

  private static formatCode(code: string): string {
    // 简单的代码格式化
    return code
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }
}

/**
 * 生成 Vue 代码的便捷函数
 */
export const generateVueCode = (formData: FormDesignData, options?: CodeGenerationOptions): string => {
  return VueCodeGenerator.generateVueCode(formData, options);
};
