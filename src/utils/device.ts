import { localStg } from './storage';

/**
 * 获取设备唯一标识
 * 优先从缓存读取，如果没有则生成新的并缓存
 */
export function getDeviceId(): string {
  let deviceId = localStg.get('deviceId') as string | null;

  if (!deviceId) {
    deviceId = generateDeviceId();
    localStg.set('deviceId', deviceId);
  }

  return deviceId;
}

/**
 * 生成设备唯一标识
 * 使用浏览器指纹 + 时间戳 + 随机数
 */
function generateDeviceId(): string {
  const fingerprint = [];

  // User Agent
  fingerprint.push(navigator.userAgent);

  // 屏幕信息
  fingerprint.push(`${screen.width}x${screen.height}`);
  fingerprint.push(screen.colorDepth.toString());

  // 时区
  fingerprint.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 语言
  fingerprint.push(navigator.language);

  // 平台
  fingerprint.push(navigator.platform);

  // 硬件并发数
  fingerprint.push(navigator.hardwareConcurrency?.toString() || '0');

  // 设备内存 (实验性API)
  // @ts-expect-error - deviceMemory is experimental
  fingerprint.push(navigator.deviceMemory?.toString() || '0');

  // 简单哈希
  const str = fingerprint.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);

  return `${Math.abs(hash).toString(36)}_${timestamp}_${random}`;
}
