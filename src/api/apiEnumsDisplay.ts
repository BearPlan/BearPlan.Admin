// 此文件由 worma.config.ts 的 dynamicEnums 插件按需自动生成，请勿手工编辑。
// 数据来源：后端 /api/Apis/GetByNamesEnumDisplay，反射 [Display(Name)] 特性（缺失回退成员名）。
// 与 apiEnums.ts 同步生成，仅含 swagger 实际引用的枚举。

import {
  ColumnTypeEnum,
  IconTypeEnum,
  LayoutTypeEnum,
  MenuTypeEnum,
  OrderTypeEnum,
  SexEnum,
  VersionEnum
} from './apiEnums';

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

export const SexDisplay: Record<SexEnum, string> = {
  [SexEnum.Man]: 'Man',
  [SexEnum.Girl]: 'Girl'
};

export const VersionDisplay: Record<VersionEnum, string> = {
  [VersionEnum.Def]: '公共/第三方',
  [VersionEnum.Pc]: 'Web端网站',
  [VersionEnum.App]: '移动端/微信小程序/钉钉/H5',
  [VersionEnum.Site]: '官网',
  [VersionEnum.Plugin]: '插件',
  [VersionEnum.WebDav]: '网盘',
  [VersionEnum.DevPlugin]: '开发者插件'
};
