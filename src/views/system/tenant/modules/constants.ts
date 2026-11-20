/**
 * SqlSugar.DbType 枚举常用项，供列表标签与库隔离表单下拉共用。
 * 数值以后端引用的 SqlSugar DbType 枚举定义为准，超出列表的值展示原始数值。
 */
export const dbTypeOptions = [
  { value: 0, label: 'MySql' },
  { value: 1, label: 'SqlServer' },
  { value: 2, label: 'Sqlite' },
  { value: 3, label: 'Oracle' },
  { value: 4, label: 'PostgreSQL' },
  { value: 5, label: 'Dm' }
] as const;
