import { ColumnTypeEnum } from '@/api/apiEnums';

/**
 * 数据类型 → 默认表单组件映射
 * 后端 ColumnTypeEnum 描述的是字段的数据类型语义，前端需反推合适的 Element Plus 组件来渲染。
 * 修正 src/api/apiEnumEls.ts 里大量映射成 ElInput 的不准问题。
 */
const DEFAULT_COMPONENT: Record<ColumnTypeEnum, string> = {
  [ColumnTypeEnum.文本]: 'ElInput',
  [ColumnTypeEnum.TexTarea文本]: 'ElInput', // 通过 attrs.type=textarea 区分
  [ColumnTypeEnum.富文本]: 'ElInput',
  [ColumnTypeEnum.整数]: 'ElInputNumber',
  [ColumnTypeEnum.小数]: 'ElInputNumber',
  [ColumnTypeEnum.布尔]: 'ElSwitch',
  [ColumnTypeEnum.日期]: 'ElDatePicker',
  [ColumnTypeEnum.时间]: 'ElTimePicker',
  [ColumnTypeEnum.枚举]: 'ElSelect',
  [ColumnTypeEnum.字典]: 'ElSelect',
  [ColumnTypeEnum.颜色]: 'ElColorPicker',
  [ColumnTypeEnum.单图]: 'ElUpload',
  [ColumnTypeEnum.多图]: 'ElUpload',
  [ColumnTypeEnum.文件]: 'ElUpload',
  [ColumnTypeEnum.时间戳转当地日期]: 'ElDatePicker',
  [ColumnTypeEnum.时间戳转当地时间]: 'ElTimePicker',
  [ColumnTypeEnum.自定义]: 'ElInput'
};

/**
 * 画布支持渲染的表单类组件白名单
 * 用于 ConfigPanel 的「组件类型」下拉选项、第一步表格的组件列选项。
 */
export const FORM_COMPONENTS = [
  'ElInput',
  'ElInputNumber',
  'ElSelect',
  'ElSwitch',
  'ElDatePicker',
  'ElTimePicker',
  'ElRadioGroup',
  'ElCheckboxGroup',
  'ElRate',
  'ElColorPicker',
  'ElSlider',
  'ElUpload'
];

/**
 * 根据字段数据类型反推默认 Element Plus 组件名。
 */
export function getDefaultComponent(type: ColumnTypeEnum | string | null | undefined): string {
  if (type === null || type === undefined) return 'ElInput';
  return DEFAULT_COMPONENT[type as ColumnTypeEnum] || 'ElInput';
}
