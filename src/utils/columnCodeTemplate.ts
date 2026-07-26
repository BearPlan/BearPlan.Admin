/**
 * 表格列配置编辑器的代码模板工具。
 *
 * 列配置以裸 JS 对象字面量 `{...}` 存储（落库 `attrs`、`eval` 反序列化），
 * 但 Monaco TS 诊断要求合法的顶层语句。这里提供「裸对象 ↔ 完整类型声明」的双向转换，
 * 以及注入 TS worker 的精简类型声明（TableColumnCtx / h / VNode / ElTag），
 * 让编辑器对 `Partial<TableColumnCtx<any>>` 做实时类型诊断与字段补全。
 */

/**
 * 注入 Monaco TS worker 的 ambient 类型声明。
 *
 * 精简版：只覆盖列配置常用字段 + formatter/renderHeader 的函数签名，
 * h 声明为返回 VNode 的宽松重载，ElTag 声明为任意组件。
 * 目的是消除「找不到名称」红线并提供基本补全，不追求 props 级严格校验
 * （完整 element-plus/vue 类型链在 worker 沙箱里维护成本高、噪音大）。
 */
export const COLUMN_DTS = `
declare interface VNode {}

declare interface TableColumnCtx<T = any> {
  type?: string;
  label?: string;
  prop?: string;
  width?: string | number;
  minWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  className?: string;
  labelClassName?: string;
  columnKey?: string;
  fixed?: boolean | 'left' | 'right';
  sortable?: boolean | string;
  sortMethod?: (a: T, b: T) => number;
  sortBy?: string | ((row: T, index: number) => string) | string[];
  resizable?: boolean;
  showOverflowTooltip?: boolean | Record<string, any>;
  formatter?: (row: T, column: TableColumnCtx<T>, cellValue: any, index: number) => VNode | string;
  renderHeader?: (data: { column: TableColumnCtx<T>; index: number }) => VNode;
  selectable?: (row: T, index: number) => boolean;
  filterMethod?: (value: string, row: T, column: TableColumnCtx<T>) => void;
  filteredValue?: string[];
  filters?: { text: string; value: string }[];
}

declare const ElTag: any;

declare function h(
  type: any,
  props?: Record<string, any> | null,
  children?: any
): VNode;
`;

/** 完整类型声明中的变量名，包壳/剥壳共用 */
const WRAPPER_NAME = '__col';

/**
 * 把裸对象字面量包成带类型注解的完整声明，供编辑器显示与 TS 诊断。
 *
 * @example
 *   ```ts
 *   wrapColumnCode("{ label: 'x' }")
 *   // => "const __col: Partial<TableColumnCtx<any>> = { label: 'x' }"
 *   ```
 */
export function wrapColumnCode(raw: string): string {
  return `const ${WRAPPER_NAME}: Partial<TableColumnCtx<any>> = ${raw}`;
}

/**
 * 从完整声明中提取裸对象字面量（首个 `{` 到匹配的末 `}`），供存储与 eval 反序列化。
 *
 * 用括号深度匹配，正确处理嵌套大括号、字符串/模板字面量内的括号与转义，
 * 不依赖正则，避免被函数体或字符串里的括号干扰。
 *
 * @example
 *   ```ts
 *   unwrapColumnCode("const __col: Partial<TableColumnCtx<any>> = { label: 'x' }")
 *   // => "{ label: 'x' }"
 *   ```
 */
export function unwrapColumnCode(full: string): string {
  const start = full.indexOf('{');
  if (start === -1) {
    return full;
  }
  let depth = 0;
  // 字符串状态：null=代码区，否则记录进入字符串的引号字符（含模板反引号）
  let inString: '"' | "'" | '`' | null = null;
  let i = start;
  while (i < full.length) {
    const ch = full[i];
    if (inString) {
      if (ch === '\\') {
        i += 2; // 跳过转义字符的下一字符
      } else {
        if (ch === inString) {
          inString = null;
        }
        i += 1;
      }
    } else if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      i += 1;
    } else if (ch === '{') {
      depth += 1;
      i += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return full.slice(start, i + 1);
      }
      i += 1;
    } else {
      i += 1;
    }
  }
  // 括号未闭合，回退原样返回，交由上层校验提示
  return full.slice(start);
}
