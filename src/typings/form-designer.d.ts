/**
 * 表单设计器类型定义
 */

/**
 * 组件设计数据接口
 */
export interface ComponentDesignData {
  /** 唯一标识符 */
  id: string;
  /** 组件类型，如 "ElInput", "ElButton" 等 */
  type: string;
  /** 组件属性 */
  attrs: Record<string, any>;
  /** 组件事件 */
  events: Record<string, any>;
  /** 组件插槽 */
  slots: {
    default?: ComponentDesignData[];
    [key: string]: ComponentDesignData[] | string | undefined;
  };
  /** 子组件（容器组件使用） */
  children?: ComponentDesignData[];
  /** 表单项属性（ElFormItem） */
  itemAttrs: {
    /** 字段名，用于表单数据绑定 */
    prop?: string;
    /** 标签文本 */
    label?: string;
    /** 是否必填 */
    required?: boolean;
    /** 标签宽度 */
    labelWidth?: string;
    /** 错误信息 */
    error?: string;
    /** 是否显示错误信息 */
    showMessage?: boolean;
    /** 内联错误信息 */
    inlineMessage?: boolean;
    /** 验证规则 */
    rules?: any[];
    [key: string]: any;
  };
  /** 表单项事件 */
  itemEvents: Record<string, any>;
  /** 表单项插槽 */
  itemSlots: Record<string, any>;
  /** 组件样式 */
  style?: Record<string, any>;
}

/**
 * 表单设计数据接口
 */
export interface FormDesignData {
  /** 表单类型，固定为 "ElForm" */
  type: 'ElForm';
  /** 表单属性 */
  attrs: {
    /** 表单数据对象 */
    model: string;
    /** 验证规则 */
    rules?: Record<string, any>;
    /** 标签宽度 */
    labelWidth?: string;
    /** 标签位置 */
    labelPosition?: 'left' | 'right' | 'top';
    /** 表单尺寸 */
    size?: 'large' | 'default' | 'small';
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否在 rules 属性改变后立即触发一次验证 */
    validateOnRuleChange?: boolean;
    /** 是否隐藏必填字段的标签旁边的红色星号 */
    hideRequiredAsterisk?: boolean;
    /** 是否显示校验错误信息 */
    showMessage?: boolean;
    /** 是否以行内形式展示校验信息 */
    inlineMessage?: boolean;
    /** 是否在输入框中显示校验结果反馈图标 */
    statusIcon?: boolean;
    [key: string]: any;
  };
  /** 表单事件 */
  events?: Record<string, any>;
  /** 表单插槽 */
  slots: {
    /** 默认插槽包含所有表单组件 */
    default: ComponentDesignData[];
    [key: string]: ComponentDesignData[] | any;
  };
  /** 表单暴露的方法 */
  exposes?: {
    /** 对整个表单进行校验的方法 */
    validate?: boolean;
    /** 重置所有字段并移除校验结果 */
    resetFields?: boolean;
    /** 移除表单项的校验结果 */
    clearValidation?: boolean;
    [key: string]: any;
  };
  /** 表单样式 */
  style?: Record<string, any>;
}

/**
 * 组件库项目接口
 */
export interface ComponentLibraryItem {
  /** 唯一标识符 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 组件类型 */
  type: string;
  /** 组件图标 */
  icon?: string;
  /** 组件分类 */
  category: 'form' | 'layout' | 'data' | 'feedback' | 'navigation' | 'others';
  /** 组件描述 */
  description?: string;
  /** 默认属性配置 */
  defaultAttrs: Record<string, any>;
  /** 插槽 */
  defaultSlots: Record<string, any>;
  /** 默认表单项属性 */
  defaultItemAttrs?: Record<string, any>;
  /** 是否为容器组件 */
  isContainer?: boolean;
  /** 是否为表单组件 */
  isFormItem?: boolean;
  /** 组件标签 */
  tags?: string[];
}

/**
 * 属性配置项接口
 */
export interface PropertyConfig {
  /** 属性名 */
  prop: string;
  /** 显示标签 */
  label: string;
  /** 编辑器类型 */
  type: 'input' | 'select' | 'switch' | 'number' | 'textarea' | 'color' | 'slider' | 'radio' | 'checkbox';
  /** 默认值 */
  defaultValue?: any;
  /** 选项（用于 select、radio、checkbox） */
  options?: Array<{ label: string; value: any }>;
  /** 属性分组 */
  group?: string;
  /** 是否必填 */
  required?: boolean;
  /** 最小值（用于 number、slider） */
  min?: number;
  /** 最大值（用于 number、slider） */
  max?: number;
  /** 步长（用于 number、slider） */
  step?: number;
  /** 占位符 */
  placeholder?: string;
  /** 提示信息 */
  tooltip?: string;
  /** 是否显示该属性 */
  visible?: boolean | ((formData: FormDesignData, component: ComponentDesignData) => boolean);
  /** 属性依赖条件 */
  dependsOn?: {
    prop: string;
    value: any;
  }[];
}

/**
 * 数据源字段接口
 */
export interface DataSourceField {
  /** 字段名 */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 字段长度 */
  length?: number;
  /** 枚举选项 */
  options?: Array<{ label: string; value: any }>;
  /** 字段描述 */
  description?: string;
}

/**
 * 表单设计器状态接口
 */
export interface FormDesignerState {
  /** 表单数据 */
  formData: FormDesignData;
  /** 组件库 */
  componentLibrary: ComponentLibraryItem[];
  /** 当前选中的组件 */
  selectedComponent: ComponentDesignData | null;
  /** 组件属性配置 */
  propertyConfigs: Record<string, PropertyConfig[]>;
  /** 是否为预览模式 */
  previewMode: boolean;
  /** 表单验证规则 */
  formRules: Record<string, any>;
  /** 表单数据模型 */
  formModel: Record<string, any>;
}

/**
 * 拖拽事件类型
 */
export interface DragEvent {
  /** 拖拽的组件 */
  item: ComponentLibraryItem;
  /** 目标位置索引 */
  targetIndex: number;
  /** 目标容器 */
  targetContainer?: ComponentDesignData;
}

/**
 * 组件操作类型
 */
export type ComponentOperation = 'add' | 'remove' | 'copy' | 'move' | 'update' | 'select';

/**
 * 表单验证规则
 */
export interface FormValidationRule {
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  message?: string;
  /** 触发方式 */
  trigger?: 'blur' | 'change' | 'submit';
  /** 最小长度 */
  min?: number;
  /** 最大长度 */
  max?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void;
  /** 字段类型 */
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'method'
    | 'regexp'
    | 'integer'
    | 'float'
    | 'array'
    | 'object'
    | 'enum'
    | 'date'
    | 'url'
    | 'hex'
    | 'email';
}

/**
 * 代码生成选项
 */
export interface CodeGenerationOptions {
  /** 是否包含 TypeScript 类型 */
  typescript?: boolean;
  /** 是否包含样式 */
  includeStyles?: boolean;
  /** 是否包含验证规则 */
  includeValidation?: boolean;
  /** 代码风格 */
  codeStyle?: 'composition' | 'options';
  /** 是否格式化代码 */
  format?: boolean;
}

/**
 * 表单预览配置
 */
export interface FormPreviewConfig {
  /** 是否显示调试信息 */
  showDebug?: boolean;
  /** 初始数据 */
  initialData?: Record<string, any>;
  /** 是否只读 */
  readonly?: boolean;
  /** 主题 */
  theme?: 'default' | 'dark';
}

/**
 * 组件分类配置
 */
export interface ComponentCategory {
  /** 分类标识 */
  key: 'form' | 'layout' | 'data' | 'feedback' | 'navigation' | 'others';
  /** 分类名称 */
  label: string;
  /** 分类图标 */
  icon?: string;
  /** 分类描述 */
  description?: string;
  /** 是否展开 */
  expanded?: boolean;
}
