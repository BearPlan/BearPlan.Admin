export enum ArchEnum {
  X64 = 0,
  Arm64 = 1,
  X86 = 2,
}

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
  Directory = 1,
  Menu = 2,
  Query = 3,
}

export enum PlatformEnum {
  Win32 = 0,
  Darwin = 1,
  Linux = 2,
}

export enum SexEnum {
  Man = 1,
  Girl = 2,
}

export enum UDholdPluginApprovalActionEnum {
  Submit = 1,
  Approve = 2,
  Reject = 3,
  Republish = 4,
}

export enum UDholdPluginMarketStatusEnum {
  Offline = -1,
  Online = 1,
}

export enum UDholdPluginReviewStatusEnum {
  Pending = 0,
  Approved = 1,
  Rejected = -1,
}

export enum UDholdVersionLogTypeEnum {
  CheckUpdate = 1,
  Download = 2,
  AutoUpdate = 3,
}

export enum VersionEnum {
  Def = 0,
  Pc = 1,
  App = 2,
  Site = 3,
  UDhold = 4,
  Plugin = 5,
  WebDav = 6,
}

export enum VersionStatusEnum {
  Draft = 0,
  Developer = 1,
  Published = 2,
  Deprecated = 3,
}

export enum OrderTypeEnum {
  /// <summary>正序</summary>
  asc = 1,
  /// <summary>倒序</summary>
  desc = 2,
}
