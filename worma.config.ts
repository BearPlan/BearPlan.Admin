import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'wormajs';
import type { GeneratorConfig } from 'wormajs';
import { alovaGlobals, swagger } from 'wormajs/plugin';

/**
 * 配置文件所在目录（BearPlan.Admin/）。
 * worma 会用 esbuild 把本文件打包成 alova_tmp_*.cjs 放到 projectPath 下再 require，
 * 故 cjs 的 __dirname 即为项目根（临时文件所在目录）。
 * 不能用 import.meta.url——在 cjs bundle 里它是 undefined；也不能用 process.cwd()，
 * VS Code 扩展宿主进程下 cwd 会被污染成 VS Code 安装目录。
 */
// eslint-disable-next-line no-underscore-dangle
declare const __dirname: string;
const configDir = __dirname;

// 动态 require prettier（esbuild 打包成 cjs 时保持 require 语义，避免 ESM/CJS 互操作问题）
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { format: prettierFormat } = require('prettier') as { format: (src: string, opts: object) => Promise<string> };

/**
 * 用 prettier 格式化 TS 源码（与 worma 生成产物风格一致：单引号、分号、2 空格）。
 * dynamicEnums 在 config 钩子里用 fs.writeFileSync 直接写盘，绕过了 worma 的写盘流程，
 * 故 prettier 不会自动生效——需在此手动格式化，避免后端返回源码的冗余空行、不一致缩进等问题。
 * 格式化失败时回退原内容（不阻断生成，仅在控制台告警）。
 */
async function formatTs(source: string, filePath: string): Promise<string> {
  try {
    return await prettierFormat(source, {
      parser: 'typescript',
      filepath: filePath,
      singleQuote: true,
      semi: true,
      useTabs: false,
      printWidth: 120,
      endOfLine: 'lf'
    });
  } catch (e) {
    console.warn(`[worma] prettier 格式化失败（${path.basename(filePath)}），回退原内容：${(e as Error).message}`);
    return source;
  }
}

/**
 * 动态枚举插件：替代 importType，每次生成时按需同步到三个文件：
 *  - src/api/apiEnums.ts：枚举 TS 类型（供 worma 当 externalTypes 引用）
 *  - src/api/apiEnumsDisplay.ts：枚举 Display 中文映射（供前端运行时渲染文案）
 *  - src/api/apiModels.ts：swagger schema 名字面量联合类型（约束 dynamic-list.vue 等组件的 tableof prop）
 *
 * 按需策略：先读 swagger.json，提取「被 API 实际引用的枚举名」（即在 components.schemas 中
 * 作为 integer enum 出现、且被某个 DTO 通过 $ref 引用的枚举），只把这些名字传给后端
 * /api/Apis/GetByNamesEnums?names=A&names=B... 与 /api/Apis/GetByNamesEnumDisplay?...，
 * 避免同步后端存在但前端用不到的枚举。
 *
 * 双轨机制（枚举）：
 *  - GetByNamesEnums：返回 TS 源码（注释走 XML &lt;summary&gt;），写 apiEnums.ts，供 worma 当 externalTypes 引用；
 *  - GetByNamesEnumDisplay：返回 [Display(Name)] 中文映射，写 apiEnumsDisplay.ts，供前端运行时渲染文案。
 * Display 为中文显示名权威源（XML 注释对部分枚举如 VersionEnum 有缺失或偏差）。
 *
 * schema 名（apiModels.ts）：从同一次 swagger fetch 提取 components.schemas 全部 key，
 * 渲染为字面量联合类型 SchemaName，不依赖后端接口。
 *
 * 同时：设置 externalTypes（让 worma 跳过这些类型的生成，改为引用 ./apiEnums）、
 * 在 globals.d.ts 动态插入 import，彻底免去手动维护 importType({ './apiEnums': [...] }) 列表。
 *
 * config 钩子支持 async（官方 MaybePromise），在其中并行 fetch swagger + 两个后端枚举接口；
 * beforeFileWrite 在每个文件写盘前触发，用于在 globals.d.ts 顶部插入 import 语句。
 *
 * 注意：alova VS Code 扩展会在短时间内高频反复调用 readConfig（每次都会重跑 config 钩子），
 * 故用进程内缓存 + 时间窗口（60s）复用结果，避免重复请求后端触发限流（HTTP 429）。
 */

/**
 * Display 接口返回的单个枚举成员项（与后端 EnumDisplayItem 对齐）。
 */
interface EnumDisplayItem {
  name: string;
  value: number;
  display: string;
}

/**
 * 不在 swagger schema、后端反射接口也未覆盖，但前端大量引用（OrderTypeEnum.asc / getEnumValue 遍历）
 * 的枚举，在此本地定义源码，生成时注入 apiEnums.ts，与后端反射枚举一视同仁。
 * 新增此类枚举时，同步在 displays 里补 Display 映射即可（也可省略，消费方回退到成员名）。
 */
const LOCAL_ENUM_SOURCES: Record<string, string> = {
  // 后端 BearPlan.Core.Enums.OrderTypeEnum：asc=1 正序 / desc=2 倒序，用于表格排序 sortList
  OrderTypeEnum: `export enum OrderTypeEnum {
  /// <summary>正序</summary>
  asc = 1,
  /// <summary>倒序</summary>
  desc = 2,
}`
};

let enumNames: string[] = [];
let enumsCache: {
  enums: Record<string, string>; // 枚举名 -> TS 源码（写 apiEnums.ts）
  displays: Record<string, EnumDisplayItem[]>; // 枚举名 -> Display 映射（写 apiEnumsDisplay.ts）
  schemaNames: string[]; // swagger 全部 schema 名（写 apiModels.ts）
  at: number;
} | null = null;
const ENUMS_CACHE_TTL = 60_000; // 枚举缓存有效期（毫秒）

/**
 * 从 swagger.json 中提取被 API 实际引用的枚举名。
 *
 * Swashbuckle 默认（未配置 JsonStringEnumConverter/DescribeAllEnumsAsStrings）把 C# 枚举
 * 导出为 integer schema：components.schemas 下 schema 名 = C# 类型名，含 type:"integer" + enum:[...]。
 * 被 DTO 引用时用 $ref:"#/components/schemas/<名字>" 引用。
 *
 * 返回两类：
 *  - candidate：swagger 中所有 integer+enum 的 schema 名（候选全集）
 *  - referenced：被某 DTO 的 properties 通过 $ref 引用、且属于 candidate 的枚举名（按需子集）
 */
function extractReferencedEnumNames(swagger: any): { candidate: string[]; referenced: string[] } {
  const schemas = swagger?.components?.schemas;
  if (!schemas || typeof schemas !== 'object') {
    return { candidate: [], referenced: [] };
  }

  // 候选集合：type=integer 且有 enum 字段的 schema
  const candidateSet = new Set<string>();
  for (const [name, schema] of Object.entries<any>(schemas)) {
    if (schema?.type === 'integer' && Array.isArray(schema.enum)) {
      candidateSet.add(name);
    }
  }

  // 被引用集合：遍历所有 schema 的 properties，收集指向枚举的 $ref
  const referencedSet = new Set<string>();
  const collectRef = ($ref: string) => {
    // 形如 "#/components/schemas/ArchEnum"
    const m = /^#\/components\/schemas\/(.+)$/.exec($ref ?? '');
    if (m && candidateSet.has(m[1])) {
      referencedSet.add(m[1]);
    }
  };
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.$ref === 'string') {
      collectRef(node.$ref);
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === 'object') walk(v);
    }
  };
  for (const schema of Object.values<any>(schemas)) {
    if (schema?.properties) walk(schema.properties);
    // allOf/oneOf/anyOf 内部也可能引用枚举
    walk(schema);
  }

  return {
    candidate: Array.from(candidateSet).sort(),
    referenced: Array.from(referencedSet).sort()
  };
}

/**
 * 提取 swagger 中 components.schemas 的全部类型名（按字母序）。
 *
 * 这些名字即 worma 在 globals.d.ts 里生成的 interface 名，用作 dynamic-list.vue 等组件
 * tableof prop 的字面量联合类型，让调用方传错表名时编译报错。
 * 不做语义过滤（不按 DTO/Param/Model 后缀筛），保留全量 schema 供前端按需取用。
 */
function extractSchemaNames(swagger: any): string[] {
  const schemas = swagger?.components?.schemas;
  if (!schemas || typeof schemas !== 'object') {
    return [];
  }
  return Object.keys(schemas).sort();
}

/**
 * 把 schema 名渲染为 apiModels.ts 文件内容：导出字面量联合类型 SchemaName。
 *
 * 纯类型用途（编译后被擦除，无运行时值），不适用于 v-for 下拉枚举。
 * 失败兜底：调用方在拿不到 schema 时，可让 tableof prop 退回 string。
 */
function renderSchemaNameTypescript(schemaNames: string[]): string {
  const header =
    '// 此文件由 worma.config.ts 的 dynamic-enums 插件按需自动生成，请勿手工编辑。\n' +
    '// 数据来源：swagger.json 的 components.schemas 全部类型名。\n' +
    '// 用途：字面量联合类型，用于约束 dynamic-list.vue 等组件的 tableof prop，传错表名时编译报错。\n' +
    '// 注意：纯类型（编译后擦除），不可用于运行时枚举（v-for 下拉）。\n\n';

  if (schemaNames.length === 0) {
    // 兜底：无 schema 时退回 string，避免阻断编译
    return `${header}export type SchemaName = string;\n`;
  }

  // 按行列出，便于 diff 审阅与冲突解决
  const lines = schemaNames.map(name => `  | '${name}'`).join('\n');
  return `${header}export type SchemaName =\n${lines};\n`;
}

/**
 * 从后端返回的 TS 枚举源码中解析出「成员名 -> 数值」映射。
 *
 * 后端 GetByNamesEnums 返回的 enums[枚举名] 是一段完整的 TS 源码（带注释），形如：
 *   export enum VersionEnum {
 *     /// <summary>Pc端</summary>
 *     Pc = 1,
 *     ...
 *   }
 * 这里用正则提取 `成员名 = 数值,` 行，供渲染 Record 时按「枚举成员名」索引 Display。
 * 仅取静态标识符成员（字母_$ 开头），不解析位标志合值（项目枚举未用到）。
 */
function parseEnumMembers(tsSource: string): { name: string; value: number }[] {
  const members: { name: string; value: number }[] = [];
  const re = /^\s*([A-Za-z_$][\w$]*)\s*=\s*(-?\d+)\s*,/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tsSource)) !== null) {
    members.push({ name: m[1], value: Number(m[2]) });
  }
  return members;
}

/**
 * 把 Display 映射渲染为 apiEnumsDisplay.ts 文件内容。
 *
 * 约定：每个枚举导出一个 `Record<Enum, string>`，变量名为「枚举名去掉 Enum 后缀」+ Display。
 *   例如 VersionEnum -> VersionDisplay；ColumnTypeEnum -> ColumnTypeDisplay。
 * Display 值统一用单引号包裹，内部单引号转义为 \'。
 * 只渲染 enums 中存在、且 displays 中也有映射的枚举；displays 缺失的枚举跳过（避免引用未生成成员）。
 */
function renderDisplayTypescript(enums: Record<string, string>, displays: Record<string, EnumDisplayItem[]>): string {
  const header =
    '// 此文件由 worma.config.ts 的 dynamicEnums 插件按需自动生成，请勿手工编辑。\n' +
    '// 数据来源：后端 /api/Apis/GetByNamesEnumDisplay，反射 [Display(Name)] 特性（缺失回退成员名）。\n' +
    '// 与 apiEnums.ts 同步生成，仅含 swagger 实际引用的枚举。\n\n';

  const sortedEnumNames = Object.keys(enums).sort();
  if (sortedEnumNames.length === 0) {
    return `${header}// 未生成任何 Display 映射。\n`;
  }

  const importLines = `import {\n  ${sortedEnumNames.join(',\n  ')}\n} from './apiEnums';\n\n`;

  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const blocks: string[] = [];
  for (const enumName of sortedEnumNames) {
    const items = displays[enumName];
    const members = parseEnumMembers(enums[enumName]);
    // 无 Display 数据或无成员解析结果：跳过该枚举（不在 apiEnumsDisplay.ts 中出现，消费方按需回退到 apiEnums）
    if (!items || items.length === 0 || members.length === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // 后端 Display item 按 value 索引；同一枚举的成员值唯一
    const valueToDisplay = new Map<number, string>();
    for (const it of items) {
      valueToDisplay.set(it.value, it.display);
    }

    // 变量名：去掉 Enum 后缀 + Display。例如 VersionEnum -> VersionDisplay；MenuTypeEnum -> MenuTypeDisplay
    const varName = `${enumName.replace(/Enum$/, '')}Display`;

    const entries = members
      .map(mem => {
        const display = valueToDisplay.get(mem.value) ?? mem.name;
        return `  [${enumName}.${mem.name}]: '${escape(display)}'`;
      })
      .join(',\n');

    blocks.push(`export const ${varName}: Record<${enumName}, string> = {\n${entries}\n};`);
  }

  return `${header}${importLines}${blocks.join('\n\n')}\n`;
}

/**
 * 清理 worma 模板在 globals.d.ts 中产生的冗余裸 schema 输出。
 *
 * worma 的 alovaGlobals 模板会把 handleApi 设置的内联响应 schema（{ code, data, msg, success } 等）
 * 在合法的 `export interface` 声明之间以内联形式输出，缺少声明关键字和分号，
 * 其中含 `Foo[]` 数组语法会在语句位置触发 TS1011。
 *
 * 这些裸内容都是冗余的无效文本——方法签名用的是 `export interface` 里声明的类型，裸块不被引用。
 * 清理三类裸内容：
 *  1. 有名裸块：标识符 + {...}，且标识符已有 export interface 声明（冗余重复）
 *  2. 无名裸块：行首是 { 的顶层块，前一行不是声明关键字（裸响应 schema）
 *  3. 裸类型表达式行：如 string[]、(MenuTypeEnum)[]
 */
function stripBareSchemaBlocks(content: string): string {
  const lines = content.split('\n');

  // 收集所有 export interface 声明的类型名
  const interfaceNames = new Set<string>();
  for (const line of lines) {
    const m = line.match(/export interface\s+([A-Za-z0-9_]+)/);
    if (m) interfaceNames.add(m[1]);
  }

  // 匹配从 start 行（含 {）开始的 { ... } 块闭合位置
  const findBlockEnd = (start: number): number => {
    let depth = 0;
    for (let end = start; end < lines.length; end += 1) {
      depth += (lines[end].match(/{/g) || []).length;
      depth -= (lines[end].match(/}/g) || []).length;
      if (depth <= 0) return end;
    }
    return start;
  };

  // 标记 [start, end] 区间所有行为待删除
  const linesToDelete = new Set<number>();
  const markRange = (start: number, end: number) => {
    for (let j = start; j <= end; j += 1) linesToDelete.add(j);
  };

  // 判断行首 { 是否属于合法声明内部（前一行是 interface/type/= 开头）
  const isBraceInsideDecl = (i: number): boolean => {
    const prevLine = lines[i - 1] || '';
    const prevTrimmed = prevLine.trim();
    if (/^\s*(export\s+)?(interface|type|declare)\s/.test(prevLine)) return true;
    if (/[=]\s*$/.test(prevLine)) return true;
    // 多行 type 声明：= 在更上面一行，中间是空行
    if (prevTrimmed === '' && i >= 2 && /[=]\s*$/.test(lines[i - 2] || '')) return true;
    return false;
  };

  // 判断是否为裸类型表达式行（如 string[]、(MenuTypeEnum)[]）
  const isBareTypeExpr = (trimmed: string): boolean =>
    /^\w+(\.\w+)*\[\]$/.test(trimmed) || /^\(.*\)\[\]$/.test(trimmed);

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

    // 1) 有名裸块：行首是纯大写标识符、下一行是 {、且已有 export interface 声明
    const isNamedBare =
      /^[A-Z][A-Za-z0-9_]*$/.test(trimmed) && interfaceNames.has(trimmed) && lines[i + 1]?.trim() === '{';
    if (isNamedBare) {
      markRange(i, findBlockEnd(i + 1));
      // eslint-disable-next-line no-continue
      continue;
    }

    // 2) 无名裸块：行首是 { 且不属于合法声明内部
    if (trimmed === '{' && !isBraceInsideDecl(i)) {
      markRange(i, findBlockEnd(i));
    }

    // 3) 裸类型表达式行
    if (isBareTypeExpr(trimmed)) {
      linesToDelete.add(i);
    }
  }

  if (linesToDelete.size === 0) return content;

  const result = lines.filter((_, idx) => !linesToDelete.has(idx));
  console.log(`[worma] globals.d.ts 清理 ${linesToDelete.size} 行冗余裸 schema`);
  return result.join('\n').replace(/\n{3,}/g, '\n\n');
}

const dynamicEnums = {
  name: 'dynamic-enums',
  // config 钩子：按需拉取后端枚举，写 apiEnums.ts（TS 类型）+ apiEnumsDisplay.ts（Display 中文）+ 设置 externalTypes
  config: async ({ config: cfg }: { config: GeneratorConfig }) => {
    try {
      let enums: Record<string, string>;
      let displays: Record<string, EnumDisplayItem[]>;
      let schemaNames: string[];
      // 命中缓存则复用，避免高频调用重复打后端
      if (enumsCache && Date.now() - enumsCache.at < ENUMS_CACHE_TTL) {
        enums = enumsCache.enums;
        displays = enumsCache.displays;
        schemaNames = enumsCache.schemaNames;
      } else {
        // cfg.input 由 swagger() 平台插件写入，是候选 URL 数组（string[]）或字符串。
        // swagger() 按 OAS3→Swagger2→base 顺序生成候选，本项目非标准路径下前几个会 404，
        // 故逐个尝试取首个成功的（与 worma 内部 fetch 逻辑一致），而非盲取数组首元素。
        const rawInput = cfg.input!;
        const candidates: string[] = Array.isArray(rawInput) ? rawInput : [rawInput];
        const headers = { 'api-version': '1.0' };

        let swagger: any;
        let swaggerUrl = '';
        for (const url of candidates) {
          try {
            const resp = await fetch(url, { headers });
            if (resp.ok) {
              swagger = await resp.json();
              swaggerUrl = url;
              break;
            }
          } catch {
            // 网络错误继续尝试下一个候选
          }
        }
        if (!swagger) {
          throw new Error(`所有 swagger 候选 URL 均不可达：${candidates.join(', ')}`);
        }
        const base = new URL(swaggerUrl).origin;

        // 1) 从已读 swagger 提取被 API 引用的枚举名
        const { candidate, referenced } = extractReferencedEnumNames(swagger);
        // 优先用「被引用」子集；为空时回退到候选全集（避免解析异常导致不同步）
        const names = referenced.length > 0 ? referenced : candidate;
        if (names.length === 0) {
          throw new Error('swagger 中未发现枚举 schema');
        }

        // 提取 swagger 全部 schema 名（供 apiModels.ts，与枚举同步共用同一次 swagger fetch）
        schemaNames = extractSchemaNames(swagger);

        // 2) 并行按需请求两个后端接口：共用同一份 names，版本控制走 header api-version
        const params = new URLSearchParams();
        names.forEach(n => params.append('names', n));
        const qs = params.toString();
        const enumsUrl = `${base}/api/Apis/GetByNamesEnums?${qs}`;
        const displaysUrl = `${base}/api/Apis/GetByNamesEnumDisplay?${qs}`;

        const [enumsResp, displaysResp] = await Promise.all([
          fetch(enumsUrl, { headers }),
          fetch(displaysUrl, { headers })
        ]);
        if (!enumsResp.ok) {
          throw new Error(`GetByNamesEnums HTTP ${enumsResp.status}`);
        }
        if (!displaysResp.ok) {
          throw new Error(`GetByNamesEnumDisplay HTTP ${displaysResp.status}`);
        }

        // 响应被全局包装为 ExcutedResult，真正的字典在 data 字段
        const enumsPayload = (await enumsResp.json()) as { data?: Record<string, string> };
        const displaysPayload = (await displaysResp.json()) as {
          data?: Record<string, EnumDisplayItem[]>;
        };
        enums = enumsPayload.data ?? {};
        displays = displaysPayload.data ?? {};

        // 合并本地定义的枚举源码（不在 swagger / 后端反射覆盖范围内的枚举，如 OrderTypeEnum）
        // 这些枚举前端大量引用，必须进入 apiEnums.ts 与 externalTypes
        for (const [localName, localSrc] of Object.entries(LOCAL_ENUM_SOURCES)) {
          if (!enums[localName]) {
            enums[localName] = localSrc;
          }
        }

        if (Object.keys(enums).length === 0) {
          throw new Error('GetByNamesEnums 返回的 data 为空');
        }

        enumsCache = { enums, displays, schemaNames, at: Date.now() };
        console.log(
          `[worma] apiEnums.ts 已按需同步 ${Object.keys(enums).length} 个枚举` +
            `（swagger 引用 ${referenced.length}/${candidate.length}，本地注入 ${Object.keys(LOCAL_ENUM_SOURCES).length}）；` +
            `apiEnumsDisplay.ts 同步 ${Object.keys(displays).length} 个 Display 映射；` +
            `apiModels.ts 同步 ${schemaNames.length} 个 schema 名`
        );
      }

      // 全量覆盖 apiEnums.ts：后端返回的每个 value 已是完整的 export enum 代码
      // 后端运行在 Windows 上，返回的字符串内含 CRLF；统一归一化为 LF，以符合 .gitattributes（*.ts eol=lf）
      const outputDir = path.resolve(configDir, cfg.output ?? 'src/api');
      const enumsBody = Object.values(enums)
        .map(code => code.replace(/\r\n?/g, '\n'))
        .join('\n\n');
      fs.writeFileSync(path.resolve(outputDir, 'apiEnums.ts'), `${enumsBody}\n`, 'utf8');

      // 全量覆盖 apiEnumsDisplay.ts：把 Display 映射渲染成 Record<Enum, string> 集合
      fs.writeFileSync(
        path.resolve(outputDir, 'apiEnumsDisplay.ts'),
        `${renderDisplayTypescript(enums, displays)}`,
        'utf8'
      );

      // 全量覆盖 apiModels.ts：把 swagger schema 名渲染为字面量联合类型 SchemaName
      fs.writeFileSync(path.resolve(outputDir, 'apiModels.ts'), `${renderSchemaNameTypescript(schemaNames)}`, 'utf8');

      // 设置 externalTypes：让 worma 跳过这些类型的生成，改为引用 ./apiEnums
      enumNames = Object.keys(enums);
      cfg.externalTypes = Array.from(new Set([...(cfg.externalTypes ?? []), ...enumNames]));
    } catch (e) {
      // fetch 失败：跳过动态化，保留旧 apiEnums.ts / apiEnumsDisplay.ts / apiModels.ts；globals.d.ts 的枚举类型由 worma 自动生成兜底
      enumNames = [];
      console.warn(`[worma] 同步枚举失败，跳过枚举动态化：${(e as Error).message}`);
    }
    return cfg;
  },
  // beforeFileWrite：在每个文件写盘前触发（prettier 之前），清理裸类型块 + 注入枚举 import
  beforeFileWrite: ({ filePath, content }: { filePath: string; content: string }) => {
    if (!filePath.endsWith('globals.d.ts')) {
      return content;
    }

    // 1) 清理 worma 模板产生的冗余裸类型块（始终执行，与枚举同步无关）
    let result = stripBareSchemaBlocks(content);

    // 2) 注入枚举 import（与原 importType 行为一致）
    if (enumNames.length > 0) {
      const importLines = `import {\n  ${enumNames.join(',\n  ')}\n} from './apiEnums';`;
      // 插入到头部注释块之后（与 importType 的 insertAfterLeadingBlockComments 等价）
      const match = result.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)+/);
      const insertAt = match ? match[0].length : 0;
      const prefix = result.slice(0, insertAt);
      const suffix = result.slice(insertAt);
      const safePrefix = prefix.endsWith('\n') ? prefix : `${prefix}\n`;
      result = `${safePrefix}${importLines}\n${suffix}`;
    }

    return result;
  }
};

export default defineConfig({
  generator: [
    {
      output: 'src/api',
      type: 'ts',
      defaultRequire: true,
      // 统一响应包装：后端所有接口返回 ExcutedResult { code, data, msg, success }，
      // 在 schema 层把原 responses 包进 data 字段（已在 schema 层声明为 ExcutedResult 的接口跳过）。
      handleApi(apiDescriptor) {
        // _ref 是 OpenAPI 规范中 $ref 的别名，保留原命名
        // eslint-disable-next-line no-underscore-dangle
        if (apiDescriptor?.responses?._ref?.endsWith('ExcutedResult')) {
          return apiDescriptor;
        }

        apiDescriptor.responses = {
          type: 'object',
          properties: {
            code: {
              type: 'string'
            },
            data: apiDescriptor.responses,
            msg: {
              type: 'string'
            },
            success: {
              type: 'boolean'
            }
          },
          required: ['code', 'data', 'msg', 'success']
        };

        // 去掉 operationId 中的控制器信息
        if (apiDescriptor.operationId) {
          const parts = apiDescriptor.url.split('/')[apiDescriptor.url.split('/').length - 1];
          apiDescriptor.operationId = `${parts}`;
        }
        return apiDescriptor;
      },
      plugins: [
        // swagger 平台插件：传入完整 swagger.json 地址，自动写入 config.input（候选 URL 数组）。
        // 注意：本项目 swagger 在非标准路径 /swagger/v4/，swagger() 的标准候选（/openapi.json、
        // /v2/swagger.json 等）会 404，靠最后一个「base 原样」候选命中——接受这点 fallback 开销。
        // 必须排在 dynamicEnums 之前，确保 dynamicEnums 的 config 钩子能读到 swagger 写入的 input。
        swagger('https://bearplan.net/swagger/v1/swagger.json'),
        // 动态枚举插件：config 钩子读 cfg.input（由 swagger 插件写入）拉取后端枚举
        dynamicEnums,
        // aiDoc 插件：生成 AI 可读接口文档（aidocs 目录），不自动安装 skill
        // aiDoc({ installSkill: false }),
        // 模板插件：显式指定全局挂载模式（alovaGlobals），生成 createApis/apiDefinitions/globals.d.ts/index
        alovaGlobals()
      ]
    }
  ]
});
