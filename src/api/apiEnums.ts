/// <summary>
/// CPU 架构
/// 对齐 Node.js process.arch 取值，[Description] 标注的字符串即 process.arch 返回值，
/// 用于和客户端上传的架构字符串互相转换。
/// </summary>
export enum ArchEnum {
  /// <summary>
  /// ARM
  /// </summary>
  Arm = 1,

  /// <summary>
  /// ARM64
  /// </summary>
  Arm64 = 2,

  /// <summary>
  /// IA32（32 位 x86）
  /// </summary>
  Ia32 = 3,

  /// <summary>
  /// 龙芯 64 位
  /// </summary>
  Loong64 = 4,

  /// <summary>
  /// MIPS（大端）
  /// </summary>
  Mips = 5,

  /// <summary>
  /// MIPS（小端）
  /// </summary>
  Mipsel = 6,

  /// <summary>
  /// PowerPC
  /// </summary>
  Ppc = 7,

  /// <summary>
  /// PowerPC 64 位（大端）
  /// </summary>
  Ppc64 = 8,

  /// <summary>
  /// RISC-V 64 位
  /// </summary>
  Riscv64 = 9,

  /// <summary>
  /// System Z（31 位）
  /// </summary>
  S390 = 10,

  /// <summary>
  /// System Z（64 位）
  /// </summary>
  S390x = 11,

  /// <summary>
  /// x64（AMD64 / x86_64）
  /// </summary>
  X64 = 12
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

  富文本 = 50
}

export enum IconTypeEnum {
  iconify = 1,

  local = 2
}

export enum LayoutTypeEnum {
  Base = 1,

  Blank = 2
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
  Query = 3
}

export enum OrderTypeEnum {
  /// <summary>
  /// 正序
  /// </summary>
  asc = 1,

  /// <summary>
  /// 倒序
  /// </summary>
  desc = 2
}

/// <summary>
/// 应用平台
/// 对齐 Node.js process.platform 取值，[Description] 标注的字符串即 process.platform 返回值，
/// 用于和客户端上传的平台字符串互相转换。
/// </summary>
export enum PlatformEnum {
  /// <summary>
  /// IBM AIX
  /// </summary>
  Aix = 1,

  /// <summary>
  /// Android
  /// </summary>
  Android = 2,

  /// <summary>
  /// macOS / Darwin
  /// </summary>
  Darwin = 3,

  /// <summary>
  /// FreeBSD
  /// </summary>
  FreeBSD = 4,

  /// <summary>
  /// Haiku
  /// </summary>
  Haiku = 5,

  /// <summary>
  /// Linux
  /// </summary>
  Linux = 6,

  /// <summary>
  /// OpenBSD
  /// </summary>
  OpenBSD = 7,

  /// <summary>
  /// SunOS / Solaris
  /// </summary>
  SunOS = 8,

  /// <summary>
  /// Windows
  /// </summary>
  Win32 = 9,

  /// <summary>
  /// Cygwin（Windows 上的 POSIX 兼容层）
  /// </summary>
  Cygwin = 10,

  /// <summary>
  /// NetBSD
  /// </summary>
  NetBSD = 11
}

/// <summary>
/// 性别
/// </summary>
export enum SexEnum {
  /// <summary>
  /// 男
  /// </summary>
  Man = 1,

  /// <summary>
  /// 女
  /// </summary>
  Girl = 2
}

/// <summary>
/// 插件版本审批操作类型（记录每次审批动作，支持驳回/重提的完整轨迹）
/// </summary>
export enum UDholdPluginApprovalActionEnum {
  /// <summary>
  /// 提交审核（作者首次提交版本）
  /// </summary>
  Submit = 1,

  /// <summary>
  /// 审核通过
  /// </summary>
  Approve = 2,

  /// <summary>
  /// 审核驳回
  /// </summary>
  Reject = 3,

  /// <summary>
  /// 重新提交（驳回后作者修改再次提交）
  /// </summary>
  Republish = 4
}

/// <summary>
/// 插件市场上下架状态
/// </summary>
export enum UDholdPluginMarketStatusEnum {
  /// <summary>
  /// 下架（不在市场展示，已装用户不受影响）
  /// </summary>
  Offline = -1,

  /// <summary>
  /// 上架（市场可见，允许安装）
  /// </summary>
  Online = 1
}

/// <summary>
/// 插件版本审批状态
/// </summary>
export enum UDholdPluginReviewStatusEnum {
  /// <summary>
  /// 待审核（提交后等待管理员审核）
  /// </summary>
  Pending = 0,

  /// <summary>
  /// 审核通过（允许发布）
  /// </summary>
  Approved = 1,

  /// <summary>
  /// 审核驳回（需作者修改后重新提交）
  /// </summary>
  Rejected = -1
}

/// <summary>
/// 应用版本操作日志类型
/// </summary>
export enum UDholdVersionLogTypeEnum {
  /// <summary>
  /// 检测更新
  /// </summary>
  CheckUpdate = 1,

  /// <summary>
  /// 下载（人工下载完整安装包）
  /// </summary>
  Download = 2,

  /// <summary>
  /// 自动更新（客户端拉取增量更新包）
  /// </summary>
  AutoUpdate = 3
}

export enum VersionEnum {
  Def = 0,

  /// <summary>
  /// Pc端
  /// </summary>
  Pc = 1,

  App = 2,

  Site = 3,

  UDhold = 4,

  Plugin = 5
}

/// <summary>
/// 版本状态
/// </summary>
export enum VersionStatusEnum {
  /// <summary>
  /// 草稿
  /// </summary>
  Draft = 0,

  /// <summary>
  /// 已发布
  /// </summary>
  Published = 1,

  /// <summary>
  /// 已弃用（不再提供下载）
  /// </summary>
  Deprecated = 2,

  /// <summary>
  /// 开发中
  /// </summary>
  Developer = 99
}
