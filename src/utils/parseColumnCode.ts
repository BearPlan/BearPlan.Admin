import { h } from 'vue';
import * as UI from 'element-plus';

/**
 * 列配置代码反序列化：把「裸对象字面量字符串」解析为对象，并向其函数体注入常用标识符。
 *
 * 背景：列配置（TableColumnCtx）以 JS 字面量字符串存储，formatter/renderHeader 等函数体
 * 常引用 h、UI.ElTag 等标识符。直接 eval 依赖词法作用域，打包（tree-shaking/重命名）后
 * 这些标识符在运行时不可见，会抛 ReferenceError。
 *
 * 解法：用 new Function 显式把标识符作为形参注入执行上下文，不依赖打包后的作用域链。
 * 支持的写法：`h(UI.ElTag, ...)`、`h(ElTag, ...)`、`h(ElButton, ...)` 等。
 *
 * @example
 *   ```ts
 *   const col = parseColumnCode(`{ formatter: row => h(UI.ElTag, {}, {}) }`);
 *   // col.formatter(...) 运行时可正常访问 h、UI
 *   ```
 *
 * @param code 裸对象字面量字符串（不含外层括号）
 * @returns 解析后的对象（含可调用的 formatter 等函数）
 */
export function parseColumnCode<T = Record<string, any>>(code: string): T {
  // 注入的标识符：形参名与实参一一对应
  const paramNames = ['h', 'UI', 'ElTag', 'ElButton'];
  const paramValues = [h, UI, UI.ElTag, UI.ElButton];
  // eslint-disable-next-line no-new-func
  const factory = new Function(...paramNames, `return (${code})`);
  return factory(...paramValues);
}
