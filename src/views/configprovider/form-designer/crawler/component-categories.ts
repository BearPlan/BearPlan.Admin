/**
 * 组件分类数据
 * 自动生成，请勿手动修改
 */

import type { ComponentCategory, ComponentMeta } from './element-plus-components';

/** 组件分类项 */
export interface ComponentCategoryItem {
  /** 分类值 */
  value: ComponentCategory;
  /** 分类名称 */
  label: string;
  /** 分类图标 */
  icon: string;
  /** 分类下的组件列表 */
  components: ComponentMeta[];
}

/**
 * 组件分类数据
 */
export const componentCategories: ComponentCategoryItem[] = [
  {
    value: 'form',
    label: '表单输入',
    icon: 'mdi:form-select',
    components: [
      { id: 'ElInput', label: '输入框', type: 'ElInput', icon: 'mdi:form-textbox' },
      { id: 'ElInputNumber', label: '计数器', type: 'ElInputNumber', icon: 'mdi:numeric' },
      { id: 'ElSelect', label: '选择器', type: 'ElSelect', icon: 'mdi:menu-down' },
      { id: 'ElOption', label: '选项', type: 'ElOption', icon: 'mdi:circle-small' },
      { id: 'ElSwitch', label: '开关', type: 'ElSwitch', icon: 'mdi:toggle-switch' },
      { id: 'ElSlider', label: '滑块', type: 'ElSlider', icon: 'mdi:slide-horizontal' },
      { id: 'ElTimePicker', label: '时间选择器', type: 'ElTimePicker', icon: 'mdi:clock-outline' },
      { id: 'ElDatePicker', label: '日期选择器', type: 'ElDatePicker', icon: 'mdi:calendar' },
      { id: 'ElRate', label: '评分', type: 'ElRate', icon: 'mdi:star' },
      { id: 'ElColorPicker', label: '颜色选择器', type: 'ElColorPicker', icon: 'mdi:palette' },
      { id: 'ElUpload', label: '上传', type: 'ElUpload', icon: 'mdi:upload' },
      { id: 'ElRadioGroup', label: '单选框组', type: 'ElRadioGroup', icon: 'mdi:radiobox-marked' },
      { id: 'ElRadio', label: '单选框', type: 'ElRadio', icon: 'mdi:circle-outline' },
      { id: 'ElCheckboxGroup', label: '多选框组', type: 'ElCheckboxGroup', icon: 'mdi:checkbox-marked' },
      { id: 'ElCheckbox', label: '多选框', type: 'ElCheckbox', icon: 'mdi:checkbox-blank-outline' }
    ]
  },
  {
    value: 'container',
    label: '容器组件',
    icon: 'mdi:folder-open',
    components: [
      { id: 'ElTabs', label: '标签页', type: 'ElTabs', icon: 'mdi:tab' },
      { id: 'ElTabPane', label: '标签面板', type: 'ElTabPane', icon: 'mdi:rectangle' },
      { id: 'ElCollapse', label: '折叠面板', type: 'ElCollapse', icon: 'mdi:arrow-down-drop-circle' },
      { id: 'ElCollapseItem', label: '折叠项', type: 'ElCollapseItem', icon: 'mdi:triangle-small-down' },
      { id: 'ElCard', label: '卡片', type: 'ElCard', icon: 'mdi:card-outline' }
    ]
  },
  {
    value: 'layout',
    label: '布局组件',
    icon: 'mdi:view-dashboard',
    components: [
      { id: 'ElRow', label: '行', type: 'ElRow', icon: 'mdi:view-agenda' },
      { id: 'ElCol', label: '列', type: 'ElCol', icon: 'mdi:view-column' },
      { id: 'ElSpace', label: '间距', type: 'ElSpace', icon: 'mdi:sitemap' }
    ]
  },
  {
    value: 'display',
    label: '展示组件',
    icon: 'mdi:eye',
    components: [
      { id: 'ElText', label: '文本', type: 'ElText', icon: 'mdi:format-text' },
      { id: 'ElTag', label: '标签', type: 'ElTag', icon: 'mdi:tag' },
      { id: 'ElDivider', label: '分割线', type: 'ElDivider', icon: 'mdi:minus' },
      { id: 'ElProgress', label: '进度条', type: 'ElProgress', icon: 'mdi:progress-bar' },
      { id: 'ElAlert', label: '警告', type: 'ElAlert', icon: 'mdi:alert' },
      { id: 'ElDescriptions', label: '描述列表', type: 'ElDescriptions', icon: 'mdi:format-list-bulleted' },
      { id: 'ElDescriptionsItem', label: '描述项', type: 'ElDescriptionsItem', icon: 'mdi:subtitles' }
    ]
  },
  {
    value: 'feedback',
    label: '反馈组件',
    icon: 'mdi:alert-circle',
    components: []
  },
  {
    value: 'common',
    label: '通用组件',
    icon: 'mdi:application',
    components: [{ id: 'ElButton', label: '按钮', type: 'ElButton', icon: 'mdi:gesture-tap-button' }]
  }
];
