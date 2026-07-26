/**
 * 将值序列化为 JS 字面量源码字符串（可含函数）。
 *
 * 项目里列配置/attrs 长期以"JS 字面量字符串"形态存储，并用 `eval(`(${str})`)` 反序列化。
 * 本函数补齐正向能力：把 TableColumnCtx 等配置对象转成可放入 MonacoEditor 展示、
 * 也能被 eval 还原的代码文本。函数值直接输出其源码（保留箭头函数形态）。
 *
 * @example
 *   ```ts
 *   stringifyCode({ formatter: row => row.x });
 *   // => "{\n  formatter: (row) => row.x\n}"
 *
 *   stringifyCode('a'); // => "'a'"
 *   stringifyCode(100); // => "100"
 *   stringifyCode([1, 2]); // => "[\n  1,\n  2\n]"
 *   ```
 *
 * @param value 待序列化的值
 * @param indentUnit 单层缩进空格数，默认 2
 */
export function stringifyCode(value: unknown, indentUnit = 2): string {
  return serialize(value, 0, indentUnit);
}

/** 递归序列化：currentIndent 为当前缩进层数 */
function serialize(value: unknown, depth: number, indentUnit: number): string {
  // null 单独处理（typeof null === 'object'）
  if (value === null || value === undefined) {
    return String(value);
  }

  switch (typeof value) {
    // 函数直接输出源码，保证 eval 后仍是可调用函数
    case 'function':
      return (value as () => unknown).toString();
    case 'string':
      // 用单引号包裹并转义内部单引号
      return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    case 'symbol':
      return value.toString();
    case 'object': {
      const pad = ' '.repeat(depth * indentUnit);
      const childPad = ' '.repeat((depth + 1) * indentUnit);
      const entries = Array.isArray(value)
        ? value.map(v => serialize(v, depth + 1, indentUnit))
        : Object.entries(value).map(
            ([k, v]) => `${isValidKey(k) ? k : `'${k}'`}: ${serialize(v, depth + 1, indentUnit)}`
          );
      if (entries.length === 0) {
        return Array.isArray(value) ? '[]' : '{}';
      }
      const body = entries.map(item => `${childPad}${item}`).join(',\n');
      const open = Array.isArray(value) ? '[' : '{';
      const close = Array.isArray(value) ? ']' : '}';
      return `${open}\n${body}\n${pad}${close}`;
    }
    default:
      return String(value);
  }
}

/** 标识符是否可直接作为对象键（无需引号） */
function isValidKey(key: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(key);
}
