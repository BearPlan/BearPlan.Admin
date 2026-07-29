// 此文件由 worma.config.ts 的 dynamicEnums 插件按需自动生成，请勿手工编辑。
// 数据来源：后端 /api/Apis/GetByNamesEnumDisplay，反射 [Display(Name)] 特性（缺失回退成员名）。
// 与 apiEnums.ts 同步生成，仅含 swagger 实际引用的枚举。

import {
  ArchEnum,
  ColumnTypeEnum,
  IconTypeEnum,
  LayoutTypeEnum,
  MenuTypeEnum,
  OrderTypeEnum,
  PlatformEnum,
  SexEnum,
  UDholdPluginApprovalActionEnum,
  UDholdPluginMarketStatusEnum,
  UDholdPluginReviewStatusEnum,
  UDholdVersionLogTypeEnum,
  VersionEnum,
  VersionStatusEnum
} from './apiEnums';

export const ArchDisplay: Record<ArchEnum, string> = {
  [ArchEnum.X64]: 'x64',
  [ArchEnum.Arm64]: 'ARM64',
  [ArchEnum.X86]: 'x86'
};

export const IconTypeDisplay: Record<IconTypeEnum, string> = {
  [IconTypeEnum.iconify]: 'iconify',
  [IconTypeEnum.local]: 'local'
};

export const LayoutTypeDisplay: Record<LayoutTypeEnum, string> = {
  [LayoutTypeEnum.Base]: 'layout.base',
  [LayoutTypeEnum.Blank]: 'layout.blank'
};

export const MenuTypeDisplay: Record<MenuTypeEnum, string> = {
  [MenuTypeEnum.Directory]: '目录',
  [MenuTypeEnum.Menu]: '菜单',
  [MenuTypeEnum.Query]: '参数'
};

export const PlatformDisplay: Record<PlatformEnum, string> = {
  [PlatformEnum.Win32]: 'Windows',
  [PlatformEnum.Darwin]: 'macOS',
  [PlatformEnum.Linux]: 'Linux'
};

export const SexDisplay: Record<SexEnum, string> = {
  [SexEnum.Man]: 'Man',
  [SexEnum.Girl]: 'Girl'
};

export const UDholdPluginApprovalActionDisplay: Record<UDholdPluginApprovalActionEnum, string> = {
  [UDholdPluginApprovalActionEnum.Submit]: '提交审核',
  [UDholdPluginApprovalActionEnum.Approve]: '通过',
  [UDholdPluginApprovalActionEnum.Reject]: '驳回',
  [UDholdPluginApprovalActionEnum.Republish]: '重新提交'
};

export const UDholdPluginMarketStatusDisplay: Record<UDholdPluginMarketStatusEnum, string> = {
  [UDholdPluginMarketStatusEnum.Offline]: '下架',
  [UDholdPluginMarketStatusEnum.Online]: '上架'
};

export const UDholdPluginReviewStatusDisplay: Record<UDholdPluginReviewStatusEnum, string> = {
  [UDholdPluginReviewStatusEnum.Pending]: '待审核',
  [UDholdPluginReviewStatusEnum.Approved]: '通过',
  [UDholdPluginReviewStatusEnum.Rejected]: '驳回'
};

export const UDholdVersionLogTypeDisplay: Record<UDholdVersionLogTypeEnum, string> = {
  [UDholdVersionLogTypeEnum.CheckUpdate]: 'CheckUpdate',
  [UDholdVersionLogTypeEnum.Download]: 'Download',
  [UDholdVersionLogTypeEnum.AutoUpdate]: 'AutoUpdate'
};

export const VersionDisplay: Record<VersionEnum, string> = {
  [VersionEnum.Def]: '公共/第三方',
  [VersionEnum.Pc]: 'Web端网站',
  [VersionEnum.App]: '移动端/微信小程序/钉钉/H5',
  [VersionEnum.Site]: '官网',
  [VersionEnum.UDhold]: 'UDhold',
  [VersionEnum.Plugin]: '插件',
  [VersionEnum.WebDav]: '网盘'
};

export const VersionStatusDisplay: Record<VersionStatusEnum, string> = {
  [VersionStatusEnum.Draft]: '草稿',
  [VersionStatusEnum.Developer]: '开发者预览',
  [VersionStatusEnum.Published]: '已发布',
  [VersionStatusEnum.Deprecated]: '已弃用'
};
