/**
 * 后端真实地址 origin：必须取原始 env 值——createServiceConfig 在 dev 代理模式下返回代理前缀（/proxy-default，相对路径），
 * new URL 后会落到管理端自身端口，而 /api 未配置代理导致直连 404；同源部署（baseURL 为相对路径）时回退站点 origin
 */
export function getBackendOrigin() {
  return new URL(import.meta.env.VITE_SERVICE_BASE_URL || window.location.origin, window.location.origin).origin;
}

/** 文件流地址：Read 接口返回文件数据流，是系统内查看文件的统一入口（AllowAnonymous，可直接内联打开） */
export function getReadFilePath(id: string | number) {
  return `${getBackendOrigin()}/api/FileRecord/Read/${id}`;
}

/** 后端资源路径转可访问地址：http(s) 绝对地址原样返回，相对路径（/api/...、/uploads/...）拼 origin（dev 代理下相对路径无法直连） */
export function toBackendUrl(path?: string | null) {
  if (!path) {
    return '';
  }
  return /^https?:\/\//i.test(path) ? path : `${getBackendOrigin()}${path}`;
}
