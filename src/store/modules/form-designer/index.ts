import { defineStore } from 'pinia';
import type {
  ComponentDesignData,
  ComponentLibraryItem,
  DataSourceField,
  FormDesignData,
  FormDesignerState,
  PropertyConfig
} from '@/typings/form-designer';
import {
  ALL_COMPONENTS,
  createComponentInstance,
  generateComponentId
} from '@/components/form-designer/component-library';
import { DataSourceComponentGenerator } from '@/components/form-designer/data-source-integration';

/**
 * Default form configuration
 */
const DEFAULT_FORM_DATA: FormDesignData = {
  type: 'ElForm',
  attrs: {
    model: 'formData',
    labelWidth: '120px',
    labelPosition: 'right',
    size: 'default',
    disabled: false,
    validateOnRuleChange: true,
    hideRequiredAsterisk: false,
    showMessage: true,
    inlineMessage: false,
    statusIcon: false
  },
  slots: {
    default: [] // Ensure this is always an array
  },
  exposes: {
    validate: true,
    resetFields: true,
    clearValidation: true
  },
  style: {}
};

/**
 * Component property configurations for different ElementPlus components
 */
const COMPONENT_PROPERTY_CONFIGS: Record<string, PropertyConfig[]> = {
  ElInput: [
    { prop: 'placeholder', label: '占位符', type: 'input' },
    {
      prop: 'type',
      label: '输入框类型',
      type: 'select',
      options: [
        { label: '文本', value: 'text' },
        { label: '密码', value: 'password' },
        { label: '多行文本', value: 'textarea' },
        { label: '数字', value: 'number' }
      ]
    },
    { prop: 'clearable', label: '可清空', type: 'switch' },
    { prop: 'disabled', label: '禁用', type: 'switch' },
    { prop: 'readonly', label: '只读', type: 'switch' },
    { prop: 'maxlength', label: '最大长度', type: 'number' },
    { prop: 'showWordLimit', label: '显示字数统计', type: 'switch' },
    { prop: 'rows', label: '行数', type: 'number', group: 'textarea' }
  ],
  ElButton: [
    {
      prop: 'type',
      label: '按钮类型',
      type: 'select',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' },
        { label: '文本', value: 'text' }
      ]
    },
    {
      prop: 'size',
      label: '尺寸',
      type: 'select',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' }
      ]
    },
    { prop: 'plain', label: '朴素按钮', type: 'switch' },
    { prop: 'round', label: '圆角按钮', type: 'switch' },
    { prop: 'circle', label: '圆形按钮', type: 'switch' },
    { prop: 'disabled', label: '禁用', type: 'switch' },
    { prop: 'loading', label: '加载中', type: 'switch' }
  ],
  ElSelect: [
    { prop: 'placeholder', label: '占位符', type: 'input' },
    { prop: 'clearable', label: '可清空', type: 'switch' },
    { prop: 'multiple', label: '多选', type: 'switch' },
    { prop: 'disabled', label: '禁用', type: 'switch' },
    { prop: 'filterable', label: '可搜索', type: 'switch' },
    { prop: 'allowCreate', label: '允许创建', type: 'switch' },
    { prop: 'multipleLimit', label: '多选数量限制', type: 'number' }
  ],
  ElDatePicker: [
    {
      prop: 'type',
      label: '选择器类型',
      type: 'select',
      options: [
        { label: '日期', value: 'date' },
        { label: '日期时间', value: 'datetime' },
        { label: '日期范围', value: 'daterange' },
        { label: '日期时间范围', value: 'datetimerange' }
      ]
    },
    { prop: 'placeholder', label: '占位符', type: 'input' },
    { prop: 'format', label: '显示格式', type: 'input' },
    { prop: 'valueFormat', label: '值格式', type: 'input' },
    { prop: 'clearable', label: '可清空', type: 'switch' },
    { prop: 'disabled', label: '禁用', type: 'switch' }
  ],
  ElSwitch: [
    { prop: 'activeText', label: '开启文字', type: 'input' },
    { prop: 'inactiveText', label: '关闭文字', type: 'input' },
    { prop: 'activeValue', label: '开启值', type: 'input' },
    { prop: 'inactiveValue', label: '关闭值', type: 'input' },
    { prop: 'disabled', label: '禁用', type: 'switch' }
  ]
};

/**
 * Form Designer Store
 */
export const useFormDesignerStore = defineStore('formDesigner', {
  state: (): FormDesignerState => ({
    formData: JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)),
    componentLibrary: [...ALL_COMPONENTS],
    selectedComponent: null,
    propertyConfigs: COMPONENT_PROPERTY_CONFIGS,
    previewMode: false,
    formRules: {},
    formModel: {} as Record<string, any>
  }),

  getters: {
    /**
     * Get components by category
     */
    getComponentsByCategory: state => (category: ComponentLibraryItem['category']) => {
      return state.componentLibrary.filter(comp => comp.category === category);
    },

    /**
     * Get component by ID from form data
     */
    getComponentById:
      state =>
      (id: string): ComponentDesignData | null => {
        const findComponent = (components: ComponentDesignData[]): ComponentDesignData | null => {
          for (const comp of components) {
            if (comp.id === id) return comp;

            // Search in slots
            if (comp.slots.default && Array.isArray(comp.slots.default)) {
              const found = findComponent(comp.slots.default);
              if (found) return found;
            }

            // Search in children
            if (comp.children && comp.children.length > 0) {
              const found = findComponent(comp.children);
              if (found) return found;
            }
          }
          return null;
        };

        return findComponent(state.formData.slots.default || []);
      },

    /**
     * Check if component is selected
     */
    isComponentSelected: state => (id: string) => {
      return state.selectedComponent?.id === id;
    },

    /**
     * Get property configuration for component type
     */
    getPropertyConfig: state => (componentType: string) => {
      return state.propertyConfigs[componentType] || [];
    },

    /**
     * Get form JSON representation
     */
    getFormJSON: state => () => {
      return JSON.stringify(state.formData, null, 2);
    },

    /**
     * Get form component count
     */
    getComponentCount: state => () => {
      const countComponents = (components: ComponentDesignData[]): number => {
        let count = 0;
        for (const comp of components) {
          count += 1;
          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            count += countComponents(comp.slots.default);
          }
          if (comp.children && comp.children.length > 0) {
            count += countComponents(comp.children);
          }
        }
        return count;
      };
      return countComponents(state.formData.slots.default || []);
    }
  },

  actions: {
    /**
     * Add component to form
     */
    addComponent(component: ComponentLibraryItem, targetIndex?: number) {
      const newComponent = createComponentInstance(component);

      if (targetIndex !== undefined) {
        this.formData.slots.default?.splice(targetIndex, 0, newComponent);
      } else {
        this.formData.slots.default?.push(newComponent);
      }

      this.selectComponent(newComponent);
    },

    /**
     * Remove component from form
     */
    removeComponent(componentId: string) {
      const removeFromArray = (components: ComponentDesignData[]): boolean => {
        const index = components.findIndex(comp => comp.id === componentId);
        if (index > -1) {
          components.splice(index, 1);
          return true;
        }

        // Search in nested components
        for (const comp of components) {
          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            if (removeFromArray(comp.slots.default)) return true;
          }
          if (comp.children && comp.children.length > 0) {
            if (removeFromArray(comp.children)) return true;
          }
        }

        return false;
      };

      if (removeFromArray(this.formData.slots.default || [])) {
        if (this.selectedComponent?.id === componentId) {
          this.selectedComponent = null;
        }
      }
    },

    /**
     * Update component configuration
     */
    updateComponent(componentId: string, updates: Partial<ComponentDesignData>) {
      const component = this.getComponentById(componentId);
      if (component) {
        Object.assign(component, updates);
      }
    },

    /**
     * Select component
     */
    selectComponent(component: ComponentDesignData | null) {
      this.selectedComponent = component;
    },

    /**
     * Copy component
     */
    copyComponent(componentId: string) {
      const component = this.getComponentById(componentId);
      if (component) {
        const copied = JSON.parse(JSON.stringify(component));
        // Generate new IDs for copied component and all nested components
        const generateNewIds = (comp: ComponentDesignData) => {
          comp.id = generateComponentId();
          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            comp.slots.default.forEach(generateNewIds);
          }
          if (comp.children && comp.children.length > 0) {
            comp.children.forEach(generateNewIds);
          }
        };
        generateNewIds(copied);

        this.formData.slots.default?.push(copied);
        this.selectComponent(copied);
      }
    },

    /**
     * Move component
     */
    moveComponent(componentId: string, direction: 'up' | 'down') {
      const moveInArray = (components: ComponentDesignData[]): boolean => {
        const index = components.findIndex(comp => comp.id === componentId);
        if (index > -1) {
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex >= 0 && newIndex < components.length) {
            const [component] = components.splice(index, 1);
            components.splice(newIndex, 0, component);
            return true;
          }
        }

        // Search in nested components
        for (const comp of components) {
          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            if (moveInArray(comp.slots.default)) return true;
          }
          if (comp.children && comp.children.length > 0) {
            if (moveInArray(comp.children)) return true;
          }
        }

        return false;
      };

      moveInArray(this.formData.slots.default || []);
    },

    /**
     * Update form configuration
     */
    updateFormConfig(config: Partial<FormDesignData['attrs']>) {
      Object.assign(this.formData.attrs, config);
    },

    /**
     * Toggle preview mode
     */
    togglePreviewMode() {
      this.previewMode = !this.previewMode;
      if (this.previewMode) {
        this.selectedComponent = null;
      }
    },

    /**
     * Clear form
     */
    clearForm() {
      this.formData = JSON.parse(JSON.stringify(DEFAULT_FORM_DATA));
      this.selectedComponent = null;
      this.formModel = {} as Record<string, any>;
      this.formRules = {};
    },

    /**
     * Load form from JSON
     */
    loadFormFromJSON(jsonData: string) {
      try {
        const formData = JSON.parse(jsonData);
        this.formData = formData;
        this.selectedComponent = null;
      } catch (error) {
        console.error('Failed to load form from JSON:', error);
        throw new Error('Invalid JSON format');
      }
    },

    /**
     * Add data source fields
     */
    addDataSourceFields(fields: DataSourceField[]) {
      const components = DataSourceComponentGenerator.generateComponentLibraryFromFields(fields);
      this.componentLibrary.push(...components);
    },

    /**
     * Generate form model from current form data
     */
    generateFormModel() {
      const model: Record<string, any> = {};

      const extractFields = (components: ComponentDesignData[]) => {
        components.forEach(comp => {
          if (comp.itemAttrs.prop) {
            model[comp.itemAttrs.prop] = comp.attrs.modelValue || null;
          }

          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            extractFields(comp.slots.default);
          }
          if (comp.children && comp.children.length > 0) {
            extractFields(comp.children);
          }
        });
      };

      extractFields(this.formData.slots.default || []);
      this.formModel = model;
    },

    /**
     * Generate form validation rules
     */
    generateFormRules() {
      const rules: Record<string, any[]> = {};

      const extractRules = (components: ComponentDesignData[]) => {
        components.forEach(comp => {
          if (comp.itemAttrs.prop && comp.itemAttrs.required) {
            rules[comp.itemAttrs.prop] = [
              { required: true, message: `请输入${comp.itemAttrs.label}`, trigger: 'blur' }
            ];
          }

          if (comp.slots.default && Array.isArray(comp.slots.default)) {
            extractRules(comp.slots.default);
          }
          if (comp.children && comp.children.length > 0) {
            extractRules(comp.children);
          }
        });
      };

      extractRules(this.formData.slots.default || []);
      this.formRules = rules;
    },

    /**
     * Update form model
     */
    updateFormModel(model: Record<string, any>) {
      this.formModel = model;
    },

    /**
     * Update form slots
     */
    updateFormSlots(slots: { default: ComponentDesignData[] }) {
      this.formData.slots = slots;
    },

    /**
     * Reset store to initial state
     */
    resetStore() {
      this.$reset();
    }
  }
});
