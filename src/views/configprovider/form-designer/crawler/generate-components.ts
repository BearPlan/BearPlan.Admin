/**
 * Element Plus 组件元数据生成器
 * 用于生成表单设计器所需的组件配置
 *
 * 使用方法:
 * npx tsx generate-components.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 类型定义
// ============================================

/** 组件分类 */
type ComponentCategory = 'form' | 'container' | 'layout' | 'display' | 'feedback' | 'common';

/** 属性类型（数组格式） */
type AttributeType = ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'];

/** 属性编辑器类型（使用 Element Plus 组件名） */
type PropertyEditor =
  | 'ElInput' // 普通输入框
  | 'ElInput.Textarea' // 文本域
  | 'ElInputNumber' // 数字输入框
  | 'ElSwitch' // 开关
  | 'ElSelect' // 下拉选择器
  | 'ElColorPicker' // 颜色选择器
  | 'IconPicker' // 图标选择器（自定义组件）
  | 'ElRate' // 评分
  | 'ElSlider' // 滑块
  | 'CodeEditor' // 代码编辑器（自定义组件）
  | 'ObjectEditor' // 对象编辑器（自定义组件）
  | 'ArrayEditor' // 数组编辑器（自定义组件）
  | 'KeyValueEditor' // 键值对编辑器（自定义组件）
  | 'JsonEditor' // JSON 编辑器（自定义组件）
  | 'CustomComponent'; // 自定义组件

/** 组件属性元数据 */
interface AttributeMeta {
  /** 属性名 */
  name: string;
  /** 属性描述 */
  description: string;
  /** 属性类型 */
  type: AttributeType;
  /** 默认值 */
  default?: any;
  /** 可选值（用于 select、radio 等） */
  options?: any[];
  /** 是否必填 */
  required?: boolean;
  /** 属性编辑器组件（支持多个编辑方式） */
  editors?: PropertyEditor[];
  /** 主编辑器（默认使用的编辑器） */
  editor?: PropertyEditor;
  /** 编辑器配置 */
  editorConfig?: Record<string, any>;
}

/** 插槽元数据 */
interface SlotMeta {
  /** 插槽名 */
  name: string;
  /** 插槽描述 */
  description: string;
  /** 作用域插槽参数 */
  params?: string[];
}

/** 事件元数据 */
interface EventMeta {
  /** 事件名 */
  name: string;
  /** 事件描述 */
  description: string;
  /** 事件参数 */
  params?: string;
}

/** 方法元数据 */
interface MethodMeta {
  /** 方法名 */
  name: string;
  /** 方法描述 */
  description: string;
  /** 方法参数 */
  params?: string;
  /** 返回值 */
  returns?: string;
}

/** 组件元数据 */
interface ComponentMeta {
  // ============ 基础信息 ============
  /** 组件唯一标识 */
  id: string;
  /** 显示名称 */
  label: string;
  /** Vue 组件类型 */
  type: string;
  /** 图标（Material Design Icons） */
  icon: string;
  /** 组件分类 */
  category: ComponentCategory;
  /** 组件描述 */
  description?: string;

  // ============ 组件特性标记 ============
  /** 是否为容器组件 */
  isContainer?: boolean;
  /** 是否为表单项组件 */
  isFormItem?: boolean;

  // ============ 默认配置 ============
  /** 组件自身的默认属性 */
  defaultAttrs: Record<string, any>;
  /** FormItem 的默认属性 */
  defaultItemAttrs?: {
    label: string;
    prop: string;
    required?: boolean;
  };
  /** 默认插槽内容 */
  defaultSlots?: Record<string, any>;

  // ============ 元数据 ============
  metadata: {
    /** 组件的完整属性列表 */
    attributes: AttributeMeta[];
    /** 组件支持的插槽 */
    slots: SlotMeta[];
    /** 组件支持的事件 */
    events: EventMeta[];
    /** 组件支持的方法 */
    methods: MethodMeta[];
  };
}

// ============================================
// 属性编辑器智能推断
// ============================================

/**
 * 根据属性元数据推断编辑器组件
 */
function inferEditor(attr: Partial<AttributeMeta>): PropertyEditor {
  // 如果已经指定了编辑器，直接返回
  if (attr.editor) return attr.editor;

  const { name, type, options } = attr;

  // 根据属性名特殊处理
  if (typeof name === 'string') {
    // 图标相关
    if (name.includes('icon') || name.includes('Icon')) {
      return 'IconPicker';
    }
    // 颜色相关
    if (name === 'color' || name.includes('Color')) {
      return 'ElColorPicker';
    }
    // 尺寸
    if (name === 'size' || name === 'inputSize') {
      return 'ElSelect';
    }
    // 样式
    if (name === 'style' || name === 'bodyStyle') {
      return 'ObjectEditor';
    }
    // 类名
    if (
      name === 'class' ||
      name === 'className' ||
      name === 'bodyClass' ||
      name === 'popperClass' ||
      name === 'tooltipClass'
    ) {
      return 'ElInput';
    }
    // 类型
    if (name === 'type' && options) {
      return 'ElSelect';
    }
  }

  // 根据类型推断
  if (!type) return 'ElInput';
  if (type.includes('boolean')) {
    return 'ElSwitch';
  }
  if (type.includes('number')) {
    return 'ElInputNumber';
  }
  if (type.includes('function')) {
    return 'CodeEditor';
  }
  if (type.includes('object')) {
    return 'ObjectEditor';
  }
  if (type.includes('array')) {
    return 'ArrayEditor';
  }

  // 有可选值时用 select
  if (options && options.length > 0) {
    return 'ElSelect';
  }

  // 默认使用 ElInput
  return 'ElInput';
}

/**
 * 智能设置属性编辑器
 */
function smartAttr(
  attr: Partial<AttributeMeta> & { name: string; description: string; type: AttributeType[] }
): AttributeMeta {
  const editor = inferEditor(attr);
  // 同时设置 editors 数组和 editor 单个值
  return { ...attr, editor, editors: attr.editors || [editor] } as AttributeMeta;
}

/**
 * 批量智能设置属性编辑器
 */
function smartAttrs(attrs: Partial<AttributeMeta>[]): AttributeMeta[] {
  return attrs.map(attr =>
    smartAttr({ ...attr, name: attr.name!, description: attr.description!, type: attr.type! })
  );
}

// ============================================
// Element Plus 组件元数据配置
// ============================================

/** Element Plus 组件元数据配置 */
const componentMetaList: ComponentMeta[] = [
  // ==================== 表单输入类组件 ====================
  {
    id: 'el-input',
    label: '输入框',
    type: 'ElInput',
    icon: 'mdi:form-textbox',
    category: 'form',
    description: '基础文本输入框',
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
    metadata: {
      attributes: smartAttrs([
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'text',
          options: ['text', 'textarea', 'password']
        },
        { name: 'modelValue', description: '绑定值', type: ['string', 'number'], default: '' },
        { name: 'placeholder', description: '占位文本', type: ['string'], default: '' },
        { name: 'clearable', description: '是否可清空', type: ['boolean'], default: false },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'readonly', description: '是否只读', type: ['boolean'], default: false },
        { name: 'maxlength', description: '最大长度', type: ['number'], default: undefined },
        { name: 'minlength', description: '最小长度', type: ['number'], default: undefined },
        { name: 'showWordLimit', description: '是否显示字数统计', type: ['boolean'], default: false },
        { name: 'prefixIcon', description: '输入框头部图标', type: ['string'], default: '' },
        { name: 'suffixIcon', description: '输入框尾部图标', type: ['string'], default: '' },
        { name: 'rows', description: '输入框行数（仅 textarea）', type: ['number'], default: 2 },
        { name: 'autosize', description: '自适应内容高度', type: ['boolean', 'object'], default: false },
        { name: 'autocomplete', description: '自动补全', type: ['string'], default: 'off' },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'formatter', description: '格式化函数', type: ['function'], default: undefined },
        { name: 'parser', description: '解析函数', type: ['function'], default: undefined }
      ]),
      slots: [
        { name: 'prefix', description: '输入框头部插槽' },
        { name: 'suffix', description: '输入框尾部插槽' },
        { name: 'prepend', description: '输入框前置内容' },
        { name: 'append', description: '输入框后置内容' }
      ],
      events: [
        { name: 'blur', description: '失去焦点时触发', params: '(event: FocusEvent)' },
        { name: 'focus', description: '获得焦点时触发', params: '(event: FocusEvent)' },
        { name: 'change', description: '值改变时触发', params: '(value: string | number)' },
        { name: 'input', description: '输入值时触发', params: '(value: string | number)' },
        { name: 'clear', description: '点击清空按钮时触发' }
      ],
      methods: [
        { name: 'focus', description: '使输入框获取焦点' },
        { name: 'blur', description: '使输入框失去焦点' },
        { name: 'select', description: '选中输入框中的文本' },
        { name: 'clear', description: '清空输入框' }
      ]
    }
  },
  {
    id: 'el-input-number',
    label: '计数器',
    type: 'ElInputNumber',
    icon: 'mdi:numeric',
    category: 'form',
    description: '数值输入',
    isFormItem: true,
    defaultAttrs: {
      step: 1,
      stepStrictly: false
    },
    defaultItemAttrs: {
      label: '计数器',
      prop: 'inputNumber'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['number'], default: 0 },
        { name: 'min', description: '最小值', type: ['number'], default: '-Infinity' },
        { name: 'max', description: '最大值', type: ['number'], default: 'Infinity' },
        { name: 'step', description: '步长', type: ['number'], default: 1 },
        { name: 'stepStrictly', description: '是否只能输入 step 的倍数', type: ['boolean'], default: false },
        { name: 'precision', description: '数值精度', type: ['number'], default: undefined },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'controls', description: '是否显示控制按钮', type: ['boolean'], default: true },
        {
          name: 'controlsPosition',
          description: '控制按钮位置',
          type: ['string'],
          default: 'right',
          options: ['right', '']
        },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'placeholder', description: '占位符', type: ['string'], default: '' }
      ]),
      slots: [
        { name: 'prefix', description: '前置内容' },
        { name: 'suffix', description: '后置内容' }
      ],
      events: [
        { name: 'change', description: '值改变时触发', params: '(value: number)' },
        { name: 'blur', description: '失去焦点时触发' },
        { name: 'focus', description: '获得焦点时触发' }
      ],
      methods: [
        { name: 'focus', description: '使输入框获取焦点' },
        { name: 'blur', description: '使输入框失去焦点' }
      ]
    }
  },
  {
    id: 'el-select',
    label: '选择器',
    type: 'ElSelect',
    icon: 'mdi:menu-down',
    category: 'form',
    description: '下拉选择',
    isFormItem: true,
    defaultAttrs: {
      placeholder: '请选择',
      clearable: true,
      filterable: false
    },
    defaultItemAttrs: {
      label: '选择器',
      prop: 'select'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['any'], default: '' },
        { name: 'multiple', description: '是否多选', type: ['boolean'], default: false },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'placeholder', description: '占位符', type: ['string'], default: '请选择' },
        { name: 'clearable', description: '是否可清空', type: ['boolean'], default: false },
        { name: 'filterable', description: '是否可筛选', type: ['boolean'], default: false },
        { name: 'allowCreate', description: '是否允许创建新条目', type: ['boolean'], default: false },
        { name: 'remote', description: '是否远程搜索', type: ['boolean'], default: false },
        { name: 'remoteMethod', description: '远程搜索方法', type: ['function'], default: undefined },
        { name: 'loading', description: '是否加载中', type: ['boolean'], default: false },
        { name: 'loadingText', description: '加载中文本', type: ['string'], default: '加载中' },
        { name: 'noMatchText', description: '无匹配文本', type: ['string'], default: '无匹配数据' },
        { name: 'noDataText', description: '无数据文本', type: ['string'], default: '无数据' },
        { name: 'popperClass', description: '下拉框类名', type: ['string'], default: '' },
        { name: 'reserveKeyword', description: '是否保留关键词', type: ['boolean'], default: true },
        { name: 'defaultFirstOption', description: '是否默认选中第一个', type: ['boolean'], default: false },
        { name: 'teleported', description: '是否传送至 body', type: ['boolean'], default: true },
        { name: 'persistent', description: '是否持久化', type: ['boolean'], default: true },
        { name: 'automaticDropdown', description: '对于多选是否自动收起', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'clearIcon', description: '清除图标', type: ['string'], default: 'CircleClose' },
        { name: 'fitInputWidth', description: '下拉框宽度是否与输入框一致', type: ['boolean'], default: false },
        { name: 'suffixIcon', description: '后置图标', type: ['string'], default: 'ArrowUp' },
        { name: 'tagType', description: '标签类型', type: ['string'], default: 'info' },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true }
      ]),
      slots: [
        { name: 'default', description: '选项内容（ElOption）' },
        { name: 'prefix', description: '前缀内容' },
        { name: 'empty', description: '无数据时内容' }
      ],
      events: [
        { name: 'change', description: '值改变时触发', params: '(value: any)' },
        { name: 'visibleChange', description: '下拉框显示/隐藏时触发', params: '(visible: boolean)' },
        { name: 'removeTag', description: '移除标签时触发', params: '(value: any)' },
        { name: 'clear', description: '清空时触发' },
        { name: 'blur', description: '失去焦点时触发' },
        { name: 'focus', description: '获得焦点时触发' }
      ],
      methods: [
        { name: 'focus', description: '使输入框获取焦点' },
        { name: 'blur', description: '使输入框失去焦点' }
      ]
    }
  },
  {
    id: 'el-option',
    label: '选项',
    type: 'ElOption',
    icon: 'mdi:circle-small',
    category: 'form',
    description: '选择器选项',
    isFormItem: false,
    defaultAttrs: {
      label: '选项',
      value: ''
    },
    metadata: {
      attributes: smartAttrs([]),
      slots: [{ name: 'default', description: '自定义内容' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-switch',
    label: '开关',
    type: 'ElSwitch',
    icon: 'mdi:toggle-switch',
    category: 'form',
    description: '开关选择',
    isFormItem: true,
    defaultAttrs: {},
    defaultItemAttrs: {
      label: '开关',
      prop: 'switch'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['boolean', 'string', 'number'], default: false },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'loading', description: '是否加载中', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'width', description: '宽度', type: ['number'], default: 40 },
        { name: 'inlinePrompt', description: '是否显示行内文本', type: ['boolean'], default: false },
        { name: 'activeIcon', description: '打开时图标', type: ['string'], default: '' },
        { name: 'inactiveIcon', description: '关闭时图标', type: ['string'], default: '' },
        { name: 'activeText', description: '打开时文本', type: ['string'], default: '' },
        { name: 'inactiveText', description: '关闭时文本', type: ['string'], default: '' },
        { name: 'activeValue', description: '打开时的值', type: ['boolean', 'string', 'number'], default: true },
        { name: 'inactiveValue', description: '关闭时的值', type: ['boolean', 'string', 'number'], default: false },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true },
        { name: 'beforeChange', description: '切换前的钩子', type: ['function'], default: undefined },
        { name: 'id', description: '原生 id 属性', type: ['string'], default: '' },
        { name: 'loadingIcon', description: '加载中图标', type: ['string'], default: 'Loading' }
      ]),
      slots: [
        { name: 'activeIcon', description: '打开时图标内容' },
        { name: 'inactiveIcon', description: '关闭时图标内容' },
        { name: 'default', description: '自定义内容（行内模式）' }
      ],
      events: [{ name: 'change', description: '状态改变时触发', params: '(value: boolean | string | number)' }],
      methods: []
    }
  },
  {
    id: 'el-slider',
    label: '滑块',
    type: 'ElSlider',
    icon: 'mdi:slide-horizontal',
    category: 'form',
    description: '滑动输入',
    isFormItem: true,
    defaultAttrs: {},
    defaultItemAttrs: {
      label: '滑块',
      prop: 'slider'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['number'], default: 0 },
        { name: 'min', description: '最小值', type: ['number'], default: 0 },
        { name: 'max', description: '最大值', type: ['number'], default: 100 },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'step', description: '步长', type: ['number'], default: 1 },
        { name: 'showInput', description: '是否显示输入框', type: ['boolean'], default: false },
        { name: 'showInputControls', description: '是否显示输入框控制按钮', type: ['boolean'], default: true },
        {
          name: 'inputSize',
          description: '输入框尺寸',
          type: ['string'],
          default: 'small',
          options: ['large', 'default', 'small']
        },
        { name: 'showStops', description: '是否显示间断点', type: ['boolean'], default: false },
        { name: 'showTooltip', description: '是否显示提示', type: ['boolean'], default: true },
        { name: 'formatTooltip', description: '格式化提示', type: ['function'], default: undefined },
        { name: 'range', description: '是否为范围选择', type: ['boolean'], default: false },
        { name: 'vertical', description: '是否垂直模式', type: ['boolean'], default: false },
        { name: 'height', description: '高度（垂直模式）', type: ['string'], default: '' },
        { name: 'label', description: '屏幕阅读器文本', type: ['string'], default: '' },
        { name: 'tooltipClass', description: '提示框类名', type: ['string'], default: '' },
        { name: 'marks', description: '标记', type: ['object'], default: undefined },
        { name: 'strictly', description: '是否只能选择 step 的倍数', type: ['boolean'], default: false }
      ]),
      slots: [],
      events: [
        { name: 'change', description: '值改变时触发', params: '(value: number)' },
        { name: 'input', description: '数据改变时触发', params: '(value: number)' }
      ],
      methods: []
    }
  },
  {
    id: 'el-time-picker',
    label: '时间选择器',
    type: 'ElTimePicker',
    icon: 'mdi:clock-outline',
    category: 'form',
    description: '时间选择',
    isFormItem: true,
    defaultAttrs: {
      placeholder: '请选择时间'
    },
    defaultItemAttrs: {
      label: '时间选择器',
      prop: 'timePicker'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['object'], default: '' },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'editable', description: '是否可输入', type: ['boolean'], default: false },
        { name: 'clearable', description: '是否可清空', type: ['boolean'], default: true },
        { name: 'placeholder', description: '占位符', type: ['string'], default: '请选择时间' },
        { name: 'startPlaceholder', description: '范围选择开始占位符', type: ['string'], default: '开始时间' },
        { name: 'endPlaceholder', description: '范围选择结束占位符', type: ['string'], default: '结束时间' },
        { name: 'isRange', description: '是否为范围选择', type: ['boolean'], default: false },
        { name: 'arrowControl', description: '是否使用箭头控制', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'popperClass', description: '弹出框类名', type: ['string'], default: '' },
        { name: 'rangeSeparator', description: '范围分隔符', type: ['string'], default: '-' },
        { name: 'format', description: '时间格式', type: ['string'], default: 'HH:mm:ss' },
        { name: 'defaultValue', description: '默认值', type: ['object'], default: undefined },
        { name: 'valueFormat', description: '值格式', type: ['string'], default: undefined },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'disabledHours', description: '禁止的小时', type: ['function'], default: undefined },
        { name: 'disabledMinutes', description: '禁止的分钟', type: ['function'], default: undefined },
        { name: 'disabledSeconds', description: '禁止的秒', type: ['function'], default: undefined },
        { name: 'teleported', description: '是否传送至 body', type: ['boolean'], default: false }
      ]),
      slots: [],
      events: [
        { name: 'change', description: '值改变时触发', params: '(value: Date)' },
        { name: 'blur', description: '失去焦点时触发' },
        { name: 'focus', description: '获得焦点时触发' },
        { name: 'visibleChange', description: '显示状态改变时触发', params: '(visible: boolean)' }
      ],
      methods: []
    }
  },
  {
    id: 'el-date-picker',
    label: '日期选择器',
    type: 'ElDatePicker',
    icon: 'mdi:calendar',
    category: 'form',
    description: '日期时间选择',
    isFormItem: true,
    defaultAttrs: {
      type: ['string'],
      placeholder: '请选择日期'
    },
    defaultItemAttrs: {
      label: '日期选择器',
      prop: 'datePicker'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['object'], default: '' },
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'date',
          options: ['year', 'month', 'date', 'dates', 'datetime', 'week', 'datetimerange', 'daterange', 'monthrange']
        },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'editable', description: '是否可输入', type: ['boolean'], default: false },
        { name: 'clearable', description: '是否可清空', type: ['boolean'], default: true },
        { name: 'placeholder', description: '占位符', type: ['string'], default: '请选择日期' },
        { name: 'startPlaceholder', description: '范围选择开始占位符', type: ['string'], default: '开始日期' },
        { name: 'endPlaceholder', description: '范围选择结束占位符', type: ['string'], default: '结束日期' },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'format', description: '显示格式', type: ['string'], default: 'YYYY-MM-DD' },
        { name: 'valueFormat', description: '值格式', type: ['string'], default: undefined },
        { name: 'popperClass', description: '弹出框类名', type: ['string'], default: '' },
        { name: 'rangeSeparator', description: '范围分隔符', type: ['string'], default: '-' },
        { name: 'defaultValue', description: '默认值', type: ['Date', 'Date[]'], default: undefined },
        { name: 'defaultTime', description: '默认时间', type: ['Date', 'Date[]'], default: undefined },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'unlinkPanels', description: '是否取消面板联动', type: ['boolean'], default: false },
        { name: 'prefixIcon', description: '前缀图标', type: ['string'], default: 'Calendar' },
        { name: 'clearIcon', description: '清除图标', type: ['string'], default: 'CircleClose' },
        { name: 'shortcuts', description: '快捷选项', type: ['array'], default: undefined },
        { name: 'disabledDate', description: '禁止日期', type: ['function'], default: undefined },
        { name: 'teleported', description: '是否传送至 body', type: ['boolean'], default: false }
      ]),
      slots: [],
      events: [
        { name: 'change', description: '值改变时触发', params: '(value: Date | Date[])' },
        { name: 'blur', description: '失去焦点时触发' },
        { name: 'focus', description: '获得焦点时触发' },
        { name: 'visibleChange', description: '显示状态改变时触发', params: '(visible: boolean)' },
        { name: 'calendarChange', description: '日历改变时触发', params: '(value: Date[])' }
      ],
      methods: []
    }
  },
  {
    id: 'el-rate',
    label: '评分',
    type: 'ElRate',
    icon: 'mdi:star',
    category: 'form',
    description: '评分组件',
    isFormItem: true,
    defaultAttrs: {
      max: 5,
      allowHalf: false
    },
    defaultItemAttrs: {
      label: '评分',
      prop: 'rate'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['number'], default: 0 },
        { name: 'max', description: '最大分值', type: ['number'], default: 5 },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'allowHalf', description: '是否允许半选', type: ['boolean'], default: false },
        { name: 'lowThreshold', description: '低分阈值', type: ['number'], default: 2 },
        { name: 'highThreshold', description: '高分阈值', type: ['number'], default: 4 },
        { name: 'colors', description: '颜色', type: ['array'], default: () => ['#F7BA2A', '#F7BA2A', '#F7BA2A'] },
        { name: 'voidColor', description: '未选中颜色', type: ['string'], default: '#C6D1DE' },
        { name: 'disabledVoidColor', description: '禁用未选中颜色', type: ['string'], default: '#EFF2F7' },
        {
          name: 'iconClasses',
          description: '图标类名',
          type: ['array'],
          default: () => ['StarFilled', 'StarFilled', 'StarFilled']
        },
        { name: 'voidIconClass', description: '未选中图标', type: ['string'], default: 'StarFilled' },
        { name: 'disabledVoidIconClass', description: '禁用未选中图标', type: ['string'], default: 'StarFilled' },
        { name: 'showScore', description: '是否显示分数', type: ['boolean'], default: false },
        { name: 'scoreTemplate', description: '分数模板', type: ['string'], default: '{value}' },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'clearable', description: '是否可清空', type: ['boolean'], default: false }
      ]),
      slots: [],
      events: [{ name: 'change', description: '分值改变时触发', params: '(value: number)' }],
      methods: []
    }
  },
  {
    id: 'el-color-picker',
    label: '颜色选择器',
    type: 'ElColorPicker',
    icon: 'mdi:palette',
    category: 'form',
    description: '颜色选择',
    isFormItem: true,
    defaultAttrs: {},
    defaultItemAttrs: {
      label: '颜色选择器',
      prop: 'colorPicker'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['string'], default: '' },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'showAlpha', description: '是否支持透明度', type: ['boolean'], default: false },
        { name: 'colorFormat', description: '颜色格式', type: ['string'], default: '' },
        { name: 'popperClass', description: '弹出框类名', type: ['string'], default: '' },
        { name: 'predefine', description: '预定义颜色', type: ['array'], default: undefined },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true },
        { name: 'teleported', description: '是否传送至 body', type: ['boolean'], default: false }
      ]),
      slots: [],
      events: [
        { name: 'change', description: '颜色改变时触发', params: '(value: string)' },
        { name: 'activeChange', description: '激活颜色改变时触发', params: '(value: string)' }
      ],
      methods: []
    }
  },
  {
    id: 'el-upload',
    label: '上传',
    type: 'ElUpload',
    icon: 'mdi:upload',
    category: 'form',
    description: '文件上传',
    isFormItem: true,
    defaultAttrs: {
      action: '#',
      'auto-upload': false
    },
    defaultItemAttrs: {
      label: '上传',
      prop: 'upload'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'action', description: '上传地址', type: ['string'], required: true },
        { name: 'fileList', description: '文件列表', type: ['array'], default: () => [] },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'httpRequest', description: '覆盖默认上传行为', type: ['function'], default: undefined },
        { name: 'name', description: '文件字段名', type: ['string'], default: 'file' },
        { name: 'data', description: '额外数据', type: ['object'], default: undefined },
        { name: 'headers', description: '请求头', type: ['object'], default: undefined },
        { name: 'withCredentials', description: '是否携带 cookie', type: ['boolean'], default: false },
        { name: 'method', description: '请求方法', type: ['string'], default: 'post' },
        { name: 'multiple', description: '是否多选', type: ['boolean'], default: false },
        { name: 'accept', description: '接受文件类型', type: ['string'], default: '' },
        { name: 'drag', description: '是否拖拽上传', type: ['boolean'], default: false },
        { name: 'autoUpload', description: '是否自动上传', type: ['boolean'], default: true },
        { name: 'limit', description: '最大上传数', type: ['number'], default: undefined },
        { name: 'beforeUpload', description: '上传前钩子', type: ['function'], default: undefined },
        { name: 'beforeRemove', description: '移除前钩子', type: ['function'], default: undefined },
        { name: 'onPreview', description: '预览钩子', type: ['function'], default: undefined },
        { name: 'onRemove', description: '移除钩子', type: ['function'], default: undefined },
        { name: 'onSuccess', description: '成功钩子', type: ['function'], default: undefined },
        { name: 'onError', description: '失败钩子', type: ['function'], default: undefined },
        { name: 'onProgress', description: '进度钩子', type: ['function'], default: undefined },
        { name: 'onChange', description: '状态改变钩子', type: ['function'], default: undefined },
        { name: 'showFileList', description: '是否显示文件列表', type: ['boolean'], default: true },
        {
          name: 'listType',
          description: '列表类型',
          type: ['string'],
          default: 'picture',
          options: ['text', 'picture', 'picture-card']
        },
        { name: 'crossorigin', description: 'CORS 设置', type: ['string'], default: '' },
        { name: 'teleported', description: '是否传送至 body', type: ['boolean'], default: false }
      ]),
      slots: [
        { name: 'default', description: '默认内容（触发按钮）' },
        { name: 'trigger', description: '触发内容' },
        { name: 'tip', description: '提示内容' },
        { name: 'file', description: '文件内容', params: ['file'] }
      ],
      events: [],
      methods: [
        { name: 'abort', description: '取消上传' },
        { name: 'submit', description: '手动上传' }
      ]
    }
  },
  {
    id: 'el-radio-group',
    label: '单选框组',
    type: 'ElRadioGroup',
    icon: 'mdi:radiobox-marked',
    category: 'form',
    description: '单选组',
    isFormItem: true,
    defaultAttrs: {},
    defaultItemAttrs: {
      label: '单选框组',
      prop: 'radioGroup'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['any'], default: '' },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'textColor', description: '文本颜色', type: ['string'], default: '' },
        { name: 'fill', description: '填充颜色', type: ['string'], default: '' },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true }
      ]),
      slots: [{ name: 'default', description: '默认内容（ElRadio）' }],
      events: [{ name: 'change', description: '值改变时触发', params: '(value: any)' }],
      methods: []
    }
  },
  {
    id: 'el-radio',
    label: '单选框',
    type: 'ElRadio',
    icon: 'mdi:circle-outline',
    category: 'form',
    description: '单选项',
    isFormItem: false,
    defaultAttrs: {
      label: '选项'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['any'], default: '' },
        { name: 'label', description: '值', type: ['string', 'number', 'boolean'], required: true },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'border', description: '是否边框', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-checkbox-group',
    label: '多选框组',
    type: 'ElCheckboxGroup',
    icon: 'mdi:checkbox-marked',
    category: 'form',
    description: '多选组',
    isFormItem: true,
    defaultAttrs: {},
    defaultItemAttrs: {
      label: '多选框组',
      prop: 'checkboxGroup'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['array'], default: () => [] },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'min', description: '最小选中数', type: ['number'], default: undefined },
        { name: 'max', description: '最大选中数', type: ['number'], default: undefined },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'textColor', description: '文本颜色', type: ['string'], default: '' },
        { name: 'fill', description: '填充颜色', type: ['string'], default: '' },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true }
      ]),
      slots: [{ name: 'default', description: '默认内容（ElCheckbox）' }],
      events: [{ name: 'change', description: '值改变时触发', params: '(value: any[])' }],
      methods: []
    }
  },
  {
    id: 'el-checkbox',
    label: '多选框',
    type: 'ElCheckbox',
    icon: 'mdi:checkbox-blank-outline',
    category: 'form',
    description: '多选项',
    isFormItem: false,
    defaultAttrs: {
      label: '选项'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['boolean', 'string', 'number'], default: false },
        { name: 'label', description: '值', type: ['string', 'number', 'boolean'], default: '' },
        { name: 'trueLabel', description: '选中时的值', type: ['string', 'number'], default: '' },
        { name: 'falseLabel', description: '未选中时的值', type: ['string', 'number'], default: '' },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'border', description: '是否边框', type: ['boolean'], default: false },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'name', description: '原生 name 属性', type: ['string'], default: '' },
        { name: 'checked', description: '是否选中', type: ['boolean'], default: false },
        { name: 'indeterminate', description: '是否半选', type: ['boolean'], default: false },
        { name: 'validateEvent', description: '是否触发表单验证', type: ['boolean'], default: true }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [{ name: 'change', description: '值改变时触发', params: '(value: boolean | string | number)' }],
      methods: []
    }
  },
  {
    id: 'el-button',
    label: '按钮',
    type: 'ElButton',
    icon: 'mdi:gesture-tap-button',
    category: 'common',
    description: '按钮组件',
    isFormItem: false,
    defaultAttrs: {
      type: ['string'],
      size: 'default'
    },
    metadata: {
      attributes: smartAttrs([
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'default',
          options: ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default']
        },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'plain', description: '是否朴素', type: ['boolean'], default: false },
        { name: 'round', description: '是否圆角', type: ['boolean'], default: false },
        { name: 'circle', description: '是否圆形', type: ['boolean'], default: false },
        { name: 'loading', description: '是否加载中', type: ['boolean'], default: false },
        { name: 'loadingIcon', description: '加载图标', type: ['string'], default: 'Loading' },
        { name: 'disabled', description: '是否禁用', type: ['boolean'], default: false },
        { name: 'icon', description: '图标', type: ['string'], default: '' },
        { name: 'autofocus', description: '是否自动聚焦', type: ['boolean'], default: false },
        {
          name: 'nativeType',
          description: '原生类型',
          type: ['string'],
          default: 'button',
          options: ['button', 'submit', 'reset']
        },
        { name: 'autoInsertSpace', description: '是否自动插入空格', type: ['boolean'], default: false },
        { name: 'color', description: '自定义颜色', type: ['string'], default: '' },
        { name: 'dark', description: '是否深色模式', type: ['boolean'], default: false },
        { name: 'link', description: '是否链接按钮', type: ['boolean'], default: false },
        { name: 'bg', description: '背景色', type: ['boolean'], default: false }
      ]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'icon', description: '图标内容' },
        { name: 'loading', description: '加载中内容' }
      ],
      events: [{ name: 'click', description: '点击时触发' }],
      methods: []
    }
  },

  // ==================== 容器类组件 ====================
  {
    id: 'el-tabs',
    label: '标签页',
    type: 'ElTabs',
    icon: 'mdi:tab',
    category: 'container',
    description: '标签页容器',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      type: [''],
      tabPosition: 'top'
    },
    defaultItemAttrs: {},
    defaultSlots: {
      default: 'ElTabPane'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['string', 'number'], default: '' },
        { name: 'type', description: '风格类型', type: ['string'], default: '', options: ['', 'card', 'border-card'] },
        { name: 'closable', description: '是否可关闭', type: ['boolean'], default: false },
        { name: 'addable', description: '是否可添加', type: ['boolean'], default: false },
        { name: 'editable', description: '是否可编辑', type: ['boolean'], default: false },
        {
          name: 'tabPosition',
          description: '位置',
          type: ['string'],
          default: 'top',
          options: ['top', 'right', 'bottom', 'left']
        },
        { name: 'stretch', description: '是否拉伸', type: ['boolean'], default: false },
        { name: 'beforeLeave', description: '离开前的钩子', type: ['function'], default: undefined }
      ]),
      slots: [
        { name: 'default', description: '默认插槽（ElTabPane）' },
        { name: 'leftExtra', description: '左侧额外内容' },
        { name: 'rightExtra', description: '右侧额外内容' }
      ],
      events: [
        { name: 'tabClick', description: '标签点击时触发', params: '(tab: TabsPaneContext, event: Event)' },
        { name: 'tabChange', description: '标签改变时触发', params: '(name: string | number)' },
        { name: 'tabAdd', description: '添加标签时触发' },
        { name: 'tabRemove', description: '移除标签时触发', params: '(name: string | number)' }
      ],
      methods: []
    }
  },
  {
    id: 'el-tab-pane',
    label: '标签面板',
    type: 'ElTabPane',
    icon: 'mdi:rectangle',
    category: 'container',
    description: '标签面板内容',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      label: '标签',
      name: ''
    },
    defaultItemAttrs: {},
    metadata: {
      attributes: smartAttrs([]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'label', description: '标签内容' }
      ],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-collapse',
    label: '折叠面板',
    type: 'ElCollapse',
    icon: 'mdi:arrow-down-drop-circle',
    category: 'container',
    description: '折叠面板容器',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {},
    defaultItemAttrs: {},
    metadata: {
      attributes: smartAttrs([
        { name: 'modelValue', description: '绑定值', type: ['array'], default: () => [] },
        { name: 'accordion', description: '是否手风琴模式', type: ['boolean'], default: false }
      ]),
      slots: [{ name: 'default', description: '默认内容（ElCollapseItem）' }],
      events: [{ name: 'change', description: '值改变时触发', params: '(activeNames: array)' }],
      methods: []
    }
  },
  {
    id: 'el-collapse-item',
    label: '折叠项',
    type: 'ElCollapseItem',
    icon: 'mdi:triangle-small-down',
    category: 'container',
    description: '折叠面板项',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      title: '标题'
    },
    defaultItemAttrs: {},
    metadata: {
      attributes: smartAttrs([]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'title', description: '标题内容' },
        { name: 'icon', description: '图标内容' }
      ],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-card',
    label: '卡片',
    type: 'ElCard',
    icon: 'mdi:card-outline',
    category: 'container',
    description: '卡片容器',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      shadow: 'hover'
    },
    defaultItemAttrs: {},
    metadata: {
      attributes: smartAttrs([
        { name: 'header', description: '标题', type: ['string'], default: '' },
        {
          name: 'shadow',
          description: '阴影',
          type: ['string'],
          default: 'always',
          options: ['always', 'hover', 'never']
        },
        { name: 'bodyStyle', description: '主体样式', type: ['object'], default: undefined },
        { name: 'bodyClass', description: '主体类名', type: ['string'], default: '' }
      ]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'header', description: '标题内容' }
      ],
      events: [],
      methods: []
    }
  },

  // ==================== 展示类组件 ====================
  {
    id: 'el-text',
    label: '文本',
    type: 'ElText',
    icon: 'mdi:format-text',
    category: 'display',
    description: '文本展示',
    isFormItem: false,
    defaultAttrs: {
      type: ['string']
    },
    metadata: {
      attributes: smartAttrs([
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'primary',
          options: ['primary', 'success', 'warning', 'danger', 'info', 'default']
        },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'truncated', description: '是否截断', type: ['boolean'], default: false },
        { name: 'tag', description: '自定义标签', type: ['string'], default: 'span' },
        { name: 'class', description: '类名', type: ['string'], default: '' },
        { name: 'style', description: '样式', type: ['object'], default: undefined }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-tag',
    label: '标签',
    type: 'ElTag',
    icon: 'mdi:tag',
    category: 'display',
    description: '标签展示',
    isFormItem: false,
    defaultAttrs: {
      type: ['string']
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'text', description: '文本', type: ['string'], default: '' },
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'primary',
          options: ['primary', 'success', 'info', 'warning', 'danger']
        },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'effect', description: '主题', type: ['string'], default: 'light', options: ['light', 'dark', 'plain'] },
        { name: 'round', description: '是否圆角', type: ['boolean'], default: false },
        { name: 'closable', description: '是否可关闭', type: ['boolean'], default: false },
        { name: 'disableTransitions', description: '是否禁用渐变动画', type: ['boolean'], default: false },
        { name: 'hit', description: '是否有边框', type: ['boolean'], default: false },
        { name: 'color', description: '背景色', type: ['string'], default: '' }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [{ name: 'close', description: '关闭时触发' }],
      methods: []
    }
  },
  {
    id: 'el-divider',
    label: '分割线',
    type: 'ElDivider',
    icon: 'mdi:minus',
    category: 'display',
    description: '分割线',
    isFormItem: false,
    defaultAttrs: {},
    metadata: {
      attributes: smartAttrs([
        {
          name: 'direction',
          description: '方向',
          type: ['string'],
          default: 'horizontal',
          options: ['horizontal', 'vertical']
        },
        {
          name: 'contentPosition',
          description: '内容位置',
          type: ['string'],
          default: 'center',
          options: ['left', 'center', 'right']
        },
        { name: 'borderStyle', description: '边框样式', type: ['string'], default: 'solid' }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-progress',
    label: '进度条',
    type: 'ElProgress',
    icon: 'mdi:progress-bar',
    category: 'display',
    description: '进度条展示',
    isFormItem: false,
    defaultAttrs: {
      percentage: 0
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'percentage', description: '百分比', type: ['number'], required: true },
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'line',
          options: ['line', 'circle', 'dashboard']
        },
        {
          name: 'status',
          description: '状态',
          type: ['string'],
          default: '',
          options: ['success', 'exception', 'warning']
        },
        { name: 'strokeWidth', description: '宽度', type: ['number'], default: 6 },
        { name: 'textInside', description: '文字内置', type: ['boolean'], default: false },
        { name: 'showText', description: '是否显示文字', type: ['boolean'], default: true },
        { name: 'color', description: '颜色', type: ['string', 'array', 'function'], default: '' },
        { name: 'width', description: '宽度（圆形）', type: ['number'], default: 126 },
        { name: 'format', description: '格式化', type: ['function'], default: undefined },
        { name: 'striped', description: '是否条纹', type: ['boolean'], default: false },
        { name: 'stripedFlow', description: '是否流动条纹', type: ['boolean'], default: false },
        { name: 'duration', description: '持续时间', type: ['number'], default: undefined }
      ]),
      slots: [],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-alert',
    label: '警告',
    type: 'ElAlert',
    icon: 'mdi:alert',
    category: 'display',
    description: '警告提示',
    isFormItem: false,
    defaultAttrs: {
      type: 'info',
      closable: true
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'title', description: '标题', type: ['string'], required: true },
        {
          name: 'type',
          description: '类型',
          type: ['string'],
          default: 'info',
          options: ['success', 'warning', 'info', 'error']
        },
        { name: 'description', description: '描述', type: ['string'], default: '' },
        { name: 'closable', description: '是否可关闭', type: ['boolean'], default: true },
        { name: 'center', description: '是否居中', type: ['boolean'], default: false },
        { name: 'closeText', description: '关闭文本', type: ['string'], default: '' },
        { name: 'showIcon', description: '是否显示图标', type: ['boolean'], default: false },
        { name: 'effect', description: '主题', type: ['string'], default: 'light', options: ['light', 'dark'] }
      ]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'title', description: '标题内容' }
      ],
      events: [{ name: 'close', description: '关闭时触发' }],
      methods: []
    }
  },
  {
    id: 'el-descriptions',
    label: '描述列表',
    type: 'ElDescriptions',
    icon: 'mdi:format-list-bulleted',
    category: 'display',
    description: '描述列表',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      column: 3
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'border', description: '是否边框', type: ['boolean'], default: false },
        { name: 'column', description: '列数', type: ['number'], default: 3 },
        {
          name: 'direction',
          description: '方向',
          type: ['string'],
          default: 'horizontal',
          options: ['horizontal', 'vertical']
        },
        {
          name: 'size',
          description: '尺寸',
          type: ['string'],
          default: 'default',
          options: ['large', 'default', 'small']
        },
        { name: 'title', description: '标题', type: ['string'], default: '' },
        { name: 'extra', description: '额外内容', type: ['string'], default: '' }
      ]),
      slots: [
        { name: 'default', description: '默认内容（ElDescriptionsItem）' },
        { name: 'title', description: '标题内容' },
        { name: 'extra', description: '额外内容' }
      ],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-descriptions-item',
    label: '描述项',
    type: 'ElDescriptionsItem',
    icon: 'mdi:subtitles',
    category: 'display',
    description: '描述列表项',
    isFormItem: false,
    defaultAttrs: {},
    metadata: {
      attributes: smartAttrs([
        { name: 'label', description: '标签', type: ['string'], required: true },
        { name: 'span', description: '跨度', type: ['number'], default: 1 },
        { name: 'width', description: '宽度', type: ['string', 'number'], default: '' },
        { name: 'minWidth', description: '最小宽度', type: ['string', 'number'], default: '' },
        { name: 'align', description: '对齐', type: ['string'], default: 'left', options: ['left', 'center', 'right'] },
        {
          name: 'labelAlign',
          description: '标签对齐',
          type: ['string'],
          default: '',
          options: ['left', 'center', 'right']
        },
        { name: 'className', description: '类名', type: ['string'], default: '' },
        { name: 'labelClassName', description: '标签类名', type: ['string'], default: '' }
      ]),
      slots: [
        { name: 'default', description: '默认内容' },
        { name: 'label', description: '标签内容' }
      ],
      events: [],
      methods: []
    }
  },

  // ==================== 布局类组件 ====================
  {
    id: 'el-row',
    label: '行',
    type: 'ElRow',
    icon: 'mdi:view-agenda',
    category: 'layout',
    description: '布局行',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      gutter: 0
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'gutter', description: '间隔', type: ['number'], default: 0 },
        {
          name: 'justify',
          description: '水平排列',
          type: ['string'],
          default: 'start',
          options: ['start', 'center', 'end', 'space-around', 'space-between', 'space-evenly']
        },
        {
          name: 'align',
          description: '垂直排列',
          type: ['string'],
          default: 'top',
          options: ['top', 'middle', 'bottom']
        },
        { name: 'tag', description: '自定义标签', type: ['string'], default: 'div' }
      ]),
      slots: [{ name: 'default', description: '默认内容（ElCol）' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-col',
    label: '列',
    type: 'ElCol',
    icon: 'mdi:view-column',
    category: 'layout',
    description: '布局列',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      span: 24
    },
    metadata: {
      attributes: smartAttrs([]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [],
      methods: []
    }
  },
  {
    id: 'el-space',
    label: '间距',
    type: 'ElSpace',
    icon: 'mdi:sitemap',
    category: 'layout',
    description: '间距布局',
    isContainer: true,
    isFormItem: false,
    defaultAttrs: {
      direction: 'horizontal'
    },
    metadata: {
      attributes: smartAttrs([
        { name: 'size', description: '尺寸', type: ['string', 'number', 'array'], default: 'small' },
        {
          name: 'direction',
          description: '方向',
          type: ['string'],
          default: 'horizontal',
          options: ['horizontal', 'vertical']
        },
        { name: 'alignment', description: '对齐', type: ['string'], default: 'center' },
        { name: 'class', description: '类名', type: ['string'], default: '' },
        { name: 'style', description: '样式', type: ['object'], default: undefined },
        { name: 'wrap', description: '是否换行', type: ['boolean'], default: false },
        { name: 'fill', description: '是否填充', type: ['boolean'], default: false },
        { name: 'fillRatio', description: '填充比例', type: ['number'], default: undefined }
      ]),
      slots: [{ name: 'default', description: '默认内容' }],
      events: [],
      methods: []
    }
  }
];

// ============================================
// 生成函数
// ============================================

function generateTypescriptTypes(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * Element Plus 组件元数据类型定义');
  lines.push(' * 自动生成，请勿手动修改');
  lines.push(' *');
  lines.push(' * @generate-command: npx tsx src/views/form-designer/crawler/generate-components.ts');
  lines.push(` * @generate-time: ${new Date().toISOString()}`);
  lines.push(' */');
  lines.push('');
  lines.push('// ============================================');
  lines.push('// 类型定义');
  lines.push('// ============================================');
  lines.push('');
  lines.push('/** 组件分类 */');
  lines.push('export type ComponentCategory =');
  lines.push("  | 'form'        // 表单输入类组件");
  lines.push("  | 'container'   // 容器类组件");
  lines.push("  | 'layout'      // 布局类组件");
  lines.push("  | 'display'     // 展示类组件");
  lines.push("  | 'feedback'    // 反馈类组件");
  lines.push("  | 'common'      // 通用组件");
  lines.push('');
  lines.push('/** 属性类型（数组格式） */');
  lines.push("export type AttributeType = ['string', 'number', 'boolean', 'array', 'object', 'function', 'any']");
  lines.push('');
  lines.push('/** 属性编辑器类型（使用 Element Plus 组件名） */');
  lines.push('export type PropertyEditor =');
  lines.push("  | 'ElInput'            // 普通输入框");
  lines.push("  | 'ElInput.Textarea'   // 文本域");
  lines.push("  | 'ElInputNumber'      // 数字输入框");
  lines.push("  | 'ElSwitch'           // 开关");
  lines.push("  | 'ElSelect'           // 下拉选择器");
  lines.push("  | 'ElColorPicker'      // 颜色选择器");
  lines.push("  | 'IconPicker'         // 图标选择器（自定义组件）");
  lines.push("  | 'ElRate'             // 评分");
  lines.push("  | 'ElSlider'           // 滑块");
  lines.push("  | 'CodeEditor'         // 代码编辑器（自定义组件）");
  lines.push("  | 'ObjectEditor'       // 对象编辑器（自定义组件）");
  lines.push("  | 'ArrayEditor'        // 数组编辑器（自定义组件）");
  lines.push("  | 'KeyValueEditor'     // 键值对编辑器（自定义组件）");
  lines.push("  | 'JsonEditor'         // JSON 编辑器（自定义组件）");
  lines.push("  | 'CustomComponent';   // 自定义组件");
  lines.push('');
  lines.push('/** 组件属性元数据 */');
  lines.push('export interface AttributeMeta {');
  lines.push('  /** 属性名 */');
  lines.push('  name: string');
  lines.push('  /** 属性描述 */');
  lines.push('  description: string');
  lines.push('  /** 属性类型 */');
  lines.push('  type: AttributeType');
  lines.push('  /** 默认值 */');
  lines.push('  default?: any');
  lines.push('  /** 可选值 */');
  lines.push('  options?: any[]');
  lines.push('  /** 是否必填 */');
  lines.push('  required?: boolean');
  lines.push('  /** 属性编辑器组件（支持多个编辑方式） */');
  lines.push('  editors?: PropertyEditor[]');
  lines.push('  /** 主编辑器（默认使用的编辑器） */');
  lines.push('  editor?: PropertyEditor');
  lines.push('  /** 编辑器配置 */');
  lines.push('  editorConfig?: Record<string, any>');
  lines.push('}');
  lines.push('');
  lines.push('/** 插槽元数据 */');
  lines.push('export interface SlotMeta {');
  lines.push('  /** 插槽名 */');
  lines.push('  name: string');
  lines.push('  /** 插槽描述 */');
  lines.push('  description: string');
  lines.push('  /** 作用域插槽参数 */');
  lines.push('  params?: string[]');
  lines.push('}');
  lines.push('');
  lines.push('/** 事件元数据 */');
  lines.push('export interface EventMeta {');
  lines.push('  /** 事件名 */');
  lines.push('  name: string');
  lines.push('  /** 事件描述 */');
  lines.push('  description: string');
  lines.push('  /** 事件参数 */');
  lines.push('  params?: string');
  lines.push('}');
  lines.push('');
  lines.push('/** 方法元数据 */');
  lines.push('export interface MethodMeta {');
  lines.push('  /** 方法名 */');
  lines.push('  name: string');
  lines.push('  /** 方法描述 */');
  lines.push('  description: string');
  lines.push('  /** 方法参数 */');
  lines.push('  params?: string');
  lines.push('  /** 返回值 */');
  lines.push('  returns?: string');
  lines.push('}');
  lines.push('');
  lines.push('/** 组件元数据 */');
  lines.push('export interface ComponentMeta {');
  lines.push('  // ============ 基础信息 ============');
  lines.push('  /** 组件唯一标识 */');
  lines.push('  id: string');
  lines.push('  /** 显示名称 */');
  lines.push('  label: string');
  lines.push('  /** Vue 组件类型 */');
  lines.push('  type: string');
  lines.push('  /** 图标 */');
  lines.push('  icon: string');
  lines.push('  /** 组件分类 */');
  lines.push('  category: ComponentCategory');
  lines.push('  /** 组件描述 */');
  lines.push('  description?: string');
  lines.push('');
  lines.push('  // ============ 组件特性标记 ============');
  lines.push('  /** 是否为容器组件 */');
  lines.push('  isContainer?: boolean');
  lines.push('  /** 是否为表单项组件 */');
  lines.push('  isFormItem?: boolean');
  lines.push('');
  lines.push('  // ============ 默认配置 ============');
  lines.push('  /** 组件自身的默认属性 */');
  lines.push('  defaultAttrs: Record<string, any>');
  lines.push('  /** FormItem 的默认属性 */');
  lines.push('  defaultItemAttrs?: {');
  lines.push('    label: string');
  lines.push('    prop: string');
  lines.push('    required?: boolean');
  lines.push('  }');
  lines.push('  /** 默认插槽内容 */');
  lines.push('  defaultSlots?: Record<string, any>');
  lines.push('');
  lines.push('  // ============ 元数据 ============');
  lines.push('  metadata: {');
  lines.push('    /** 组件的完整属性列表 */');
  lines.push('    attributes: AttributeMeta[]');
  lines.push('    /** 组件支持的插槽 */');
  lines.push('    slots: SlotMeta[]');
  lines.push('    /** 组件支持的事件 */');
  lines.push('    events: EventMeta[]');
  lines.push('    /** 组件支持的方法 */');
  lines.push('    methods: MethodMeta[]');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('// ============================================');
  lines.push('// 组件元数据映射');
  lines.push('// ============================================');
  lines.push('');
  lines.push('/** 组件元数据映射表 */');
  lines.push('export const ComponentMetaMap: Record<string, ComponentMeta> = {');

  for (const comp of componentMetaList) {
    lines.push(`  '${comp.id}': ${JSON.stringify(comp, null, 2).split('\n').join('\n  ')},`);
    lines.push('');
  }

  lines.push('}');
  lines.push('');
  lines.push('// ============================================');
  lines.push('// 辅助函数');
  lines.push('// ============================================');
  lines.push('');
  lines.push('/** 根据组件 ID 获取元数据 */');
  lines.push('export function getComponentMeta(id: string): ComponentMeta | undefined {');
  lines.push('  return ComponentMetaMap[id]');
  lines.push('}');
  lines.push('');
  lines.push('/** 根据分类获取组件列表 */');
  lines.push('export function getComponentsByCategory(category: ComponentCategory): ComponentMeta[] {');
  lines.push('  return Object.values(ComponentMetaMap).filter(c => c.category === category)');
  lines.push('}');
  lines.push('');
  lines.push('/** 获取所有容器组件 */');
  lines.push('export function getContainerComponents(): ComponentMeta[] {');
  lines.push('  return Object.values(ComponentMetaMap).filter(c => c.isContainer === true)');
  lines.push('}');
  lines.push('');
  lines.push('/** 获取所有表单组件 */');
  lines.push('export function getFormComponents(): ComponentMeta[] {');
  lines.push("  return Object.values(ComponentMetaMap).filter(c => c.category === 'form')");
  lines.push('}');
  lines.push('');
  lines.push('/** 判断是否为容器组件 */');
  lines.push('export function isContainerComponent(id: string): boolean {');
  lines.push('  return ComponentMetaMap[id]?.isContainer === true');
  lines.push('}');
  lines.push('');
  lines.push('/** 组件分类列表 */');
  lines.push('export const ComponentCategories: {');
  lines.push('  value: ComponentCategory');
  lines.push('  label: string');
  lines.push('  icon: string');
  lines.push('}[] = [');
  lines.push("  { value: 'form', label: '表单输入', icon: 'mdi:form-select' },");
  lines.push("  { value: 'container', label: '容器组件', icon: 'mdi:folder-open' },");
  lines.push("  { value: 'layout', label: '布局组件', icon: 'mdi:view-dashboard' },");
  lines.push("  { value: 'display', label: '展示组件', icon: 'mdi:eye' },");
  lines.push("  { value: 'feedback', label: '反馈组件', icon: 'mdi:alert-circle' },");
  lines.push("  { value: 'common', label: '通用组件', icon: 'mdi:application' },");
  lines.push(']');

  return lines.join('\n');
}

function generateComponentCategories(): string {
  const categories = new Map<ComponentCategory, ComponentMeta[]>();

  // 初始化分类
  const allCategories: ComponentCategory[] = ['form', 'container', 'layout', 'display', 'feedback', 'common'];
  for (const cat of allCategories) {
    categories.set(cat, []);
  }

  // 按分类分组
  for (const comp of componentMetaList) {
    categories.get(comp.category)?.push(comp);
  }

  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * 组件分类数据');
  lines.push(' * 自动生成，请勿手动修改');
  lines.push(' */');
  lines.push('');
  lines.push("import type { ComponentMeta, ComponentCategory } from './element-plus-components'");
  lines.push('');
  lines.push('/** 组件分类项 */');
  lines.push('export interface ComponentCategoryItem {');
  lines.push('  /** 分类值 */');
  lines.push('  value: ComponentCategory');
  lines.push('  /** 分类名称 */');
  lines.push('  label: string');
  lines.push('  /** 分类图标 */');
  lines.push('  icon: string');
  lines.push('  /** 分类下的组件列表 */');
  lines.push('  components: ComponentMeta[]');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * 组件分类数据');
  lines.push(' */');
  lines.push('export const componentCategories: ComponentCategoryItem[] = [');

  const categoryLabels: Record<ComponentCategory, string> = {
    form: '表单输入',
    container: '容器组件',
    layout: '布局组件',
    display: '展示组件',
    feedback: '反馈组件',
    common: '通用组件'
  };

  const categoryIcons: Record<ComponentCategory, string> = {
    form: 'mdi:form-select',
    container: 'mdi:folder-open',
    layout: 'mdi:view-dashboard',
    display: 'mdi:eye',
    feedback: 'mdi:alert-circle',
    common: 'mdi:application'
  };

  for (const [category, components] of categories.entries()) {
    lines.push('  {');
    lines.push(`    value: '${category}',`);
    lines.push(`    label: '${categoryLabels[category]}',`);
    lines.push(`    icon: '${categoryIcons[category]}',`);
    lines.push('    components: [');
    for (const comp of components) {
      lines.push(`      { id: '${comp.id}', label: '${comp.label}', type: ['${comp.type}'], icon: '${comp.icon}' },`);
    }
    lines.push('    ]');
    lines.push('  },');
  }

  lines.push(']');

  return lines.join('\n');
}

// ============================================
// 主函数
// ============================================

function main() {
  console.log('🚀 开始生成 Element Plus 组件元数据...\n');

  // 生成 TypeScript 类型文件
  const tsTypes = generateTypescriptTypes();
  const typesFilePath = path.join(__dirname, 'element-plus-components.ts');
  fs.writeFileSync(typesFilePath, tsTypes, 'utf-8');
  console.log(`✅ 已生成: ${typesFilePath}`);

  // 生成组件分类文件
  const categories = generateComponentCategories();
  const categoriesFilePath = path.join(__dirname, 'component-categories.ts');
  fs.writeFileSync(categoriesFilePath, categories, 'utf-8');
  console.log(`✅ 已生成: ${categoriesFilePath}`);

  // 统计信息
  console.log('\n📊 生成统计:');
  console.log(`   - 组件总数: ${componentMetaList.length}`);
  console.log(`   - 表单组件: ${componentMetaList.filter(c => c.category === 'form').length}`);
  console.log(`   - 容器组件: ${componentMetaList.filter(c => c.category === 'container').length}`);
  console.log(`   - 布局组件: ${componentMetaList.filter(c => c.category === 'layout').length}`);
  console.log(`   - 展示组件: ${componentMetaList.filter(c => c.category === 'display').length}`);
  console.log(`   - 反馈组件: ${componentMetaList.filter(c => c.category === 'feedback').length}`);
  console.log(`   - 通用组件: ${componentMetaList.filter(c => c.category === 'common').length}`);

  console.log('\n✨ 生成完成!');
}

// 执行生成
main();
