export enum ColumnTypeEnum {
  自定义 = 0,
  整数 = 1,
  文本 = 2,
  枚举 = 3,
  字典 = 4,
  小数 = 5,
  日期 = 6,
  时间 = 7,
  时间戳转当地日期 = 8,
  时间戳转当地时间 = 9,
  单图 = 10,
  多图 = 11,
  文件 = 12,
  布尔 = 13,
  颜色 = 14,
  TexTarea文本 = 15,
  富文本 = 50,
}

export enum IconTypeEnum {
  iconify = 1,
  local = 2,
}

export enum LayoutTypeEnum {
  Base = 1,
  Blank = 2,
}

export enum MenuTypeEnum {
  /// <summary>
  /// 目录
  /// </summary>
  Directory = 1,
  /// <summary>
  /// 菜单
  /// </summary>
  Menu = 2,
  /// <summary>
  /// 参数
  /// </summary>
  Query = 3,
}

/// <summary>
/// 性别
/// </summary>
export enum SexEnum {
  未知 = 0,
  /// <summary>
  /// 男
  /// </summary>
  Man = 1,
  /// <summary>
  /// 女
  /// </summary>
  Girl = 2,
}

export enum VersionEnum {
  Def = 0,
  /// <summary>
  /// Pc端
  /// </summary>
  Pc = 1,
  App = 2,
  Site = 3,
  Plugin = 5,
  WebDav = 6,
  DevPlugin = 7,
}

export enum OrderTypeEnum {
  /// <summary>正序</summary>
  asc = 1,
  /// <summary>倒序</summary>
  desc = 2,
}
