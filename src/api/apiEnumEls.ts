import { MenuTypeEnum } from './apiEnums';

export const MenuTypeEl: Record<MenuTypeEnum, 'warning' | 'danger' | 'primary' | 'info' | 'success'> = {
  [MenuTypeEnum.Directory]: 'primary',
  [MenuTypeEnum.Menu]: 'primary',
  // [MenuTypeEnum.Button]: 'primary',
  [MenuTypeEnum.Query]: 'primary'
};
