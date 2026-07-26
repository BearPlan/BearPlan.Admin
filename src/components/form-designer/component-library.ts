import type { ComponentLibraryItem, PropertyConfig } from '@/typings/form-designer';

/**
 * 生成唯一组件ID
 */
export const generateComponentId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Element Plus 组件库配置
 */
export const ALL_COMPONENTS: ComponentLibraryItem[] = [
  // 表单组件
  {
    id: 'ElInput',
    label: '输入框',
    type: 'ElInput',
    icon: 'mdi:form-textbox',
    category: 'form',
    description: '基础的文本输入框',
    isFormItem: true,
    defaultAttrs: {
      placeholder: '请输入内容',
      clearable: true,
      size: 'default'
    },
    defaultItemAttrs: {
      label: '输入框',
      prop: 'input',
      required: false
    },
    defaultSlots: {}
  },
  {
    id: 'ElSelect',
    label: '选择器',
    type: 'ElSelect',
    icon: 'mdi:form-select',
    category: 'form',
    description: '下拉选择器',
    isFormItem: true,
    defaultAttrs: {
      placeholder: '请选择',
      clearable: true,
      filterable: false
    },
    defaultItemAttrs: {
      label: '选择器',
      prop: 'select',
      required: false
    },
    defaultSlots: {}
  },
  {
    id: 'ElDatePicker',
    label: '日期选择器',
    type: 'ElDatePicker',
    icon: 'mdi:calendar',
    category: 'form',
    description: '日期时间选择器',
    isFormItem: true,
    defaultAttrs: {
      type: 'date',
      placeholder: '选择日期',
      clearable: true,
      format: 'YYYY-MM-DD'
    },
    defaultItemAttrs: {
      label: '日期',
      prop: 'date',
      required: false
    },
    defaultSlots: {}
  },
  {
    id: 'ElSwitch',
    label: '开关',
    type: 'ElSwitch',
    icon: 'mdi:toggle-switch',
    category: 'form',
    description: '开关选择器',
    isFormItem: true,
    defaultAttrs: {
      activeText: '开启',
      inactiveText: '关闭'
    },
    defaultItemAttrs: {
      label: '开关',
      prop: 'switch',
      required: false
    },
    defaultSlots: {}
  },
  {
    id: 'ElRadioGroup',
    label: '单选框组',
    type: 'ElRadioGroup',
    icon: 'mdi:radiobox-marked',
    category: 'form',
    description: '单选框组合',
    isFormItem: true,
    defaultAttrs: {
      size: 'default'
    },
    defaultItemAttrs: {
      label: '单选框',
      prop: 'radio',
      required: false
    },
    defaultSlots: {}
  },
  // 布局组件
  {
    id: 'ElRow',
    label: '行布局',
    type: 'ElRow',
    icon: 'mdi:view-column',
    category: 'layout',
    description: '栅格布局行',
    isContainer: true,
    defaultAttrs: {
      gutter: 20
    },
    defaultSlots: {
      default: []
    }
  },
  {
    id: 'ElCol',
    label: '列布局',
    type: 'ElCol',
    icon: 'mdi:view-grid',
    category: 'layout',
    description: '栅格布局列',
    isContainer: true,
    defaultAttrs: {
      span: 12
    },
    defaultSlots: {
      default: []
    }
  },
  {
    id: 'ElCard',
    label: '卡片',
    type: 'ElCard',
    icon: 'mdi:card',
    category: 'layout',
    description: '卡片容器',
    isContainer: true,
    defaultAttrs: {
      header: '卡片标题',
      shadow: 'hover'
    },
    defaultSlots: {
      default: []
    }
  },
  {
    id: 'ElTabs',
    label: '标签页',
    type: 'ElTabs',
    icon: 'mdi:tab',
    category: 'layout',
    description: '标签页容器',
    isContainer: true,
    defaultAttrs: {
      type: 'card',
      tabPosition: 'top'
    },
    defaultSlots: {
      default: [
        {
          id: generateComponentId(),
          type: 'ElTabPane',
          attrs: { label: '标签页 1', name: 'tab1' },
          slots: { default: [] },
          style: {},
          events: {},
          itemAttrs: {}
        }
      ]
    }
  },
  {
    id: 'ElCollapse',
    label: '折叠面板',
    type: 'ElCollapse',
    icon: 'mdi:chevron-down',
    category: 'layout',
    description: '折叠式容器',
    isContainer: true,
    defaultAttrs: {
      accordion: false
    },
    defaultSlots: {
      default: [
        {
          id: generateComponentId(),
          type: 'ElCollapseItem',
          attrs: { title: '折叠项 1', name: '1' },
          slots: { default: [] },
          style: {},
          events: {},
          itemAttrs: {}
        }
      ]
    }
  },
  // 基础组件
  {
    id: 'ElButton',
    label: '按钮',
    type: 'ElButton',
    icon: 'mdi:button-cursor',
    category: 'others',
    description: '基础按钮',
    defaultAttrs: {
      type: 'primary',
      size: 'default'
    },
    defaultSlots: {}
  },
  {
    id: 'ElText',
    label: '文本',
    type: 'ElText',
    icon: 'mdi:format-text',
    category: 'others',
    description: '文本显示',
    defaultAttrs: {
      type: 'primary'
    },
    defaultSlots: {}
  }
];

/**
 * 组件属性配置映射
 */
export const COMPONENT_PROPERTY_CONFIGS: Record<string, PropertyConfig[]> = {
  ElInput: [
    { prop: 'placeholder', label: '占位符', type: 'input', defaultValue: '请输入内容' },
    {
      prop: 'type',
      label: '类型',
      type: 'select',
      options: [
        { label: '文本', value: 'text' },
        { label: '密码', value: 'password' },
        { label: '多行文本', value: 'textarea' },
        { label: '数字', value: 'number' }
      ]
    },
    { prop: 'clearable', label: '可清空', type: 'switch', defaultValue: true },
    { prop: 'disabled', label: '禁用', type: 'switch', defaultValue: false },
    { prop: 'readonly', label: '只读', type: 'switch', defaultValue: false },
    { prop: 'maxlength', label: '最大长度', type: 'number', min: 0 },
    { prop: 'showWordLimit', label: '显示字数统计', type: 'switch', defaultValue: false },
    {
      prop: 'rows',
      label: '行数',
      type: 'number',
      min: 1,
      defaultValue: 4,
      dependsOn: [{ prop: 'type', value: 'textarea' }]
    }
  ],
  ElSelect: [
    { prop: 'placeholder', label: '占位符', type: 'input', defaultValue: '请选择' },
    { prop: 'clearable', label: '可清空', type: 'switch', defaultValue: true },
    { prop: 'multiple', label: '多选', type: 'switch', defaultValue: false },
    { prop: 'disabled', label: '禁用', type: 'switch', defaultValue: false },
    { prop: 'filterable', label: '可搜索', type: 'switch', defaultValue: false }
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
    { prop: 'placeholder', label: '占位符', type: 'input', defaultValue: '选择日期' },
    { prop: 'format', label: '显示格式', type: 'input', defaultValue: 'YYYY-MM-DD' },
    { prop: 'clearable', label: '可清空', type: 'switch', defaultValue: true }
  ]
};

/**
 * 创建组件实例
 */
export const createComponentInstance = (libraryItem: ComponentLibraryItem) => {
  const instance = {
    id: generateComponentId(),
    type: libraryItem.type,
    attrs: { ...libraryItem.defaultAttrs },
    events: {},
    slots: libraryItem.isContainer ? libraryItem.defaultSlots || { default: [] } : {},
    itemAttrs: libraryItem.isFormItem ? { ...libraryItem.defaultItemAttrs } : {},
    itemEvents: {},
    itemSlots: {},
    style: {}
  };

  // 确保容器组件有正确的slots结构
  if (libraryItem.isContainer && !instance.slots.default) {
    instance.slots.default = [];
  }

  return instance;
};
