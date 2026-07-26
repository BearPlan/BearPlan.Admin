# BearPlan.Admin

> BearPlan 的前端管理后台，基于 Vue 3 + TypeScript + Element Plus，在 [SoybeanAdmin](https://docs.soybeanjs.cn/) 基座上深度定制，配合 [Alova.js](https://alova.js.org/) 与 [Worma](https://github.com/soybeanjs/worma) 实现与后端 Swagger 的接口自动集成。

## 项目定位

BearPlan.Admin 是 **BearPlan 主仓库的一个 git submodule**——它依赖后端 [BearPlan.Api](https://gitee.com/BearPlan/BearPlan.NET) 提供接口，与后端共享同一套认证（JWT）与权限码。Admin 也可单独 clone 运行（连后端 API 即可），但完整业务联调建议放在主仓库内进行。

```
BearPlan.NET/                    # BearPlan 主仓库
├── BearPlan.Api/                # 后端入口（.NET）
├── BearPlan.Business/           # 业务层
├── BearPlan.Core/               # 通用核心库（submodule）
└── BearPlan.Admin/              # 前端管理后台（submodule，本文）👈
```

## 技术栈

| 类别 | 技术 |
| --- | --- |
| **框架** | Vue 3.5 + TypeScript |
| **构建** | Vite（rolldown-vite）|
| **UI 库** | Element Plus |
| **状态管理** | Pinia |
| **路由** | Vue Router 4（history 模式）+ Elegant Router（文件式路由）|
| **请求层** | [Alova.js](https://alova.js.org/)（基于 Swagger 自动生成，见下方「接口生成」）|
| **样式** | UnoCSS |
| **国际化** | vue-i18n |
| **图表** | ECharts / VisActor |
| **基座** | [SoybeanAdmin](https://docs.soybeanjs.cn/) |

## 开发环境

| 工具 | 最低版本 | 说明 |
| --- | --- | --- |
| **Node.js** | `>= 20.19.0` | 推荐 LTS 版本 |
| **pnpm** | `>= 8.7.0` | 项目用 pnpm workspace，**不可用 npm/yarn** |
| **IDE** | VSCode | 推荐安装 Vue (Volar)、UnoCSS、ESLint 插件 |

验证环境：

```bash
node -v      # 应 >= v20.19.0
pnpm -v      # 应 >= 8.7.0
```

若未安装 pnpm：

```bash
npm install -g pnpm
# 或启用 Node 自带的 corepack
corepack enable
```

## 快速开始

```bash
# 1. 拉取代码（在主仓库内已作为 submodule 引入；也可单独克隆）
git clone https://gitee.com/BearPlan/BearPlan.Admin.git
cd BearPlan.Admin

# 2. 安装依赖（必须用 pnpm）
pnpm install

# 3. 启动开发服务器（默认加载 .env + .env.test）
pnpm dev
```

启动后访问 Vite 输出的本地地址（默认 localhost:9527，以实际输出为准），会自动代理到后端 `http://127.0.0.1:3000`。默认登录账号：`admin / 123456`。

::: tip 后端依赖
Admin 是前后端分离架构，运行前需先启动后端 BearPlan.Api。如后端地址不同，修改 `.env.test` 的 `VITE_SERVICE_BASE_URL` 或对应模式的环境文件即可。后端仓库：<https://gitee.com/BearPlan/BearPlan.NET>
:::

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 开发模式（加载 `.env + .env.test`，连本地后端） |
| `pnpm dev:prod` | 以 prod 环境配置启动开发服务器（连生产后端，慎用） |
| `pnpm build` | 生产构建（产物输出到 `dist/`） |
| `pnpm lint` | ESLint 检查并自动修复 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm gen` | 从后端 Swagger 自动生成前端请求函数与类型（详见下方）|
| `pnpm gen-route` | 重新生成路由声明（基于文件式路由）|
| `pnpm commit` | 交互式生成符合规范的 commit message |
| `pnpm release` | 发布新版本 |

## 接口自动生成（Worma + Alova）

前后端 API 集成的核心：后端 Swagger 变更后，执行一次命令即可同步前端请求层，无需手写。

```bash
pnpm gen        # worma gen：从后端 Swagger 拉取接口定义，生成 Apis 代理与 TypeScript 类型
```

页面层统一用 Alova.js 的 hooks 调用生成的 Apis，由 hook 自管 `loading` / `data` / `error`，不再手动维护 `ref`。

## 环境文件

| 文件 | 作用 |
| --- | --- |
| `.env` | 所有模式共享的基础配置 |
| `.env.test` | `dev` 命令加载（虽叫 test，实为开发默认）|
| `.env.prod` | `dev:prod` 与 `build` 加载 |
| `.env.production` | 生产构建专用 |

## 相关仓库

- **主仓库（后端）**：<https://gitee.com/BearPlan/BearPlan.NET>
- **Admin GitHub**：<https://github.com/BearPlan/BearPlan.Admin>
- **开发文档**：<https://bear.js.org/>
