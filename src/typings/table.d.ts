import type { ConditionalType } from '@/api/sqlSugar';

/**
 * 列表页本地列定义：在 Element Plus 列属性（TableColumnCtx）之外补充的字段。
 * 列的唯一来源是各列表页的 defaultColumns，与后端无配置交互。
 */
export type TableColumn = {
  /** 表头搜索类型（配合 CustomHeader 表头搜索，提交到后端 SearchWhere） */
  searchType?: ConditionalType;
  /** 列设置面板勾选状态（TableColumnSetting） */
  checked?: boolean;
  /** 是否导出 Excel（显式 false 时导出剔除该列） */
  isExcel?: boolean;
};
