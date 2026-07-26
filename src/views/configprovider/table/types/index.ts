import ElInputConfig from './el-input-config';
// import ElSelectConfig from './el-select-config';

/** 组件配置类型 */
export type ComponentsConfigType = {
  [key: string]: ComponentApi;
};

/** 所有组件的配置 */
export const componentsConfig: ComponentsConfigType = {
  ElInput: ElInputConfig
  // ElSelect: ElSelectConfig
};

/** 组件选项接口 */
export type ComponentOption = {
  label: string;
  value: string | boolean | number;
};

/** 数据项接口 */
export type DataItem = {
  prop: string;
  label: string;
  component: string;
  placeholder: string;
  options?: ComponentOption[];
  value?: any; // 组件值
};

/** 事件接口 */
export type EventItem = {
  event: string;
  label: string;
  description: string;
};

/** 配置项接口 */
export type Attributes = {
  prop: string;
  description: string;
  component: string;
  placeholder: string;
  options?: ComponentOption[];
};

export type Exposes = {
  slot: string;
  description: string;
  api: ComponentApi;
};

/** 组件配置接口 */
export type ComponentApi = {
  label: string;
  component: string;
  description?: string;
  attributes?: Attributes[];
  data?: DataItem[];
  events?: EventItem[];
  exposes?: Exposes[];
  // 添加动态属性映射，用于存储组件的实际属性值
  attributesMap?: Record<string, any>;
};
