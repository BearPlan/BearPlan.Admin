declare namespace UI {
  type ThemeColor = 'danger' | 'primary' | 'info' | 'success' | 'warning';

  type DataTableBaseColumn<T> = Partial<import('element-plus').TableColumnCtx<T extends object ? T : never>>;

  type SetTableColumnKey<C, T> = Omit<C, 'prop'> & { prop?: keyof T | (string & {}) };

  type TableColumnWithKey<T> = SetTableColumnKey<DataTableBaseColumn<T>, T>;

  /**
   * the type of table operation
   *
   * - add: add table item
   * - edit: edit table item
   */
  type TableOperateType = 'add' | 'edit';
  type SearchParams = {
    [key: string]: {
      key: string;
      value: string;
      searchType?: import('@/api/sqlSugar').ConditionalType;
    };
  };
  type DataTableConfig = {
    sortList: Record<string, import('@/api/apiEnums').OrderTypeEnum>;
    // sortKey: string;
    // sortOrder: import('@/api/apiEnums').OrderTypeEnum;
  };
}

// ======================================== element-plus ========================================

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const locale: any;
  export default locale;
}

declare module 'element-plus/dist/locale/en.mjs' {
  const locale: any;
  export default locale;
}
