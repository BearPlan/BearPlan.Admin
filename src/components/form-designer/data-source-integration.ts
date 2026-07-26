import type { ComponentLibraryItem, DataSourceField } from '@/typings/form-designer';
import { generateComponentId } from './component-library';

/**
 * 数据源组件生成器
 */
export class DataSourceComponentGenerator {
  /**
   * 根据数据源字段生成组件库项目
   */
  static generateComponentLibraryFromFields(fields: DataSourceField[]): ComponentLibraryItem[] {
    return fields.map(field => this.createComponentFromField(field));
  }

  /**
   * 根据字段创建组件
   */
  private static createComponentFromField(field: DataSourceField): ComponentLibraryItem {
    const baseConfig = {
      id: `datasource-${field.name}`,
      label: field.label || field.name,
      category: 'form' as const,
      description: field.description,
      isFormItem: true,
      defaultItemAttrs: {
        label: field.label || field.name,
        prop: field.name,
        required: field.required || false
      }
    };

    // 根据字段类型选择合适的组件
    switch (field.type) {
      case 'string':
        return {
          ...baseConfig,
          type: 'ElInput',
          icon: 'mdi:form-textbox',
          defaultAttrs: {
            placeholder: `请输入${field.label || field.name}`,
            clearable: true,
            maxlength: field.length
          }
        };

      case 'number':
        return {
          ...baseConfig,
          type: 'ElInputNumber',
          icon: 'mdi:numeric',
          defaultAttrs: {
            placeholder: `请输入${field.label || field.name}`,
            min: 0,
            precision: 0
          }
        };

      case 'boolean':
        return {
          ...baseConfig,
          type: 'ElSwitch',
          icon: 'mdi:toggle-switch',
          defaultAttrs: {
            activeText: '是',
            inactiveText: '否'
          }
        };

      case 'date':
        return {
          ...baseConfig,
          type: 'ElDatePicker',
          icon: 'mdi:calendar',
          defaultAttrs: {
            type: 'date',
            placeholder: `选择${field.label || field.name}`,
            clearable: true,
            format: 'YYYY-MM-DD'
          }
        };

      case 'array':
        if (field.options && field.options.length > 0) {
          return {
            ...baseConfig,
            type: 'ElSelect',
            icon: 'mdi:form-select',
            defaultAttrs: {
              placeholder: `请选择${field.label || field.name}`,
              clearable: true,
              multiple: true,
              options: field.options
            }
          };
        }
        return {
          ...baseConfig,
          type: 'ElInput',
          icon: 'mdi:form-textbox',
          defaultAttrs: {
            type: 'textarea',
            placeholder: `请输入${field.label || field.name}`,
            rows: 3
          }
        };

      default:
        if (field.options && field.options.length > 0) {
          return {
            ...baseConfig,
            type: 'ElSelect',
            icon: 'mdi:form-select',
            defaultAttrs: {
              placeholder: `请选择${field.label || field.name}`,
              clearable: true,
              options: field.options
            }
          };
        }

        return {
          ...baseConfig,
          type: 'ElInput',
          icon: 'mdi:form-textbox',
          defaultAttrs: {
            placeholder: `请输入${field.label || field.name}`,
            clearable: true
          }
        };
    }
  }
}
