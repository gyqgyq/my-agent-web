# my-agent-web

Agent / 对话类 Web 前端，对接 FastAPI 后端（如 `my-agent-sever`），提供账号、作品管理、流式对话等能力。

## 功能概览

| 路由 | 说明 |
|------|------|
| `/login` | 登录 / 注册 |
| `/` | 首页 |
| `/chat` | Agent 流式对话（SSE） |
| `/works` | 作品列表 |
| `/works/:workId` | 作品文档管理 |
| `/about` | 关于 |

未登录访问受保护路由会跳转至 `/login`；Token 过期时自动刷新，失败则登出。

## 技术栈

| 领域 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 + React Compiler |
| 路由 | React Router 7 |
| 客户端状态 | Zustand |
| 服务端状态 | TanStack React Query |
| UI | shadcn/ui（Radix Nova）+ Tailwind CSS 4 |
| 包管理 | pnpm |

## 环境要求

- **Node.js** 20+（推荐 22，与 Docker 构建一致）
- **pnpm** 10+（`corepack enable` 后可用）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制示例并按需修改：

```bash
cp .env.example .env.development
```

| 变量 | 开发 | 生产 |
|------|------|------|
| `VITE_API_BASE_URL` | 留空，走 Vite 代理 | 见 `.env.production` / 构建参数 |

开发时留空 `VITE_API_BASE_URL`，请求走同源 `/api`，由 Vite 代理到本地后端：

```text
浏览器 → http://localhost:3000/api/* → http://localhost:8000/api/*
```

需先启动后端（默认 `8000` 端口）。

### 3. 启动开发服务器

```bash
pnpm dev
```

默认地址：**http://localhost:3000**（部分 Windows 环境默认 5173 被系统保留，已在 `vite.config.ts` 中改为 3000）。

### 4. 其他脚本

```bash
pnpm build    # 类型检查 + 生产构建
pnpm preview  # 预览构建产物
pnpm lint     # ESLint
```

## API 对接说明

前端统一以 `/api` 为路径前缀（如 `/api/account/login`、`/api/agent/chat/stream`）。

### 开发环境

`vite.config.ts` 中配置了代理：

```ts
proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } }
```

### 生产环境（两种方式）

| 方式 | `VITE_API_BASE_URL`（构建时） | `API_UPSTREAM`（容器运行时） | 说明 |
|------|-------------------------------|------------------------------|------|
| **跨域直连** | `https://api.gyq.asia` | 不依赖 | 浏览器直接请求后端，需配置 CORS |
| **同源反代** | 留空 | `http://<后端地址>` | 由 Nginx 将 `/api` 转发到后端 |

当前仓库默认生产后端：`https://api.gyq.asia`（见 `.env.production`、`.env.production.example`）。

> `VITE_*` 在 **构建时** 写入静态资源；`API_UPSTREAM` 仅在「留空 `VITE_API_BASE_URL` + Docker/Nginx」时生效。

## Docker 部署

### 构建与运行

```bash
docker build -t my-agent-web:latest .

docker run -d \
  --name my-agent-web \
  -p 8001:80 \
  my-agent-web:latest
```

浏览器访问：**http://localhost:8000**

### Docker Compose

```bash
docker compose up --build
```

覆盖 API 地址示例：

```bash
VITE_API_BASE_URL=http://your-api:8000 docker compose up --build
# 或同源反代模式
docker compose build --build-arg VITE_API_BASE_URL=
API_UPSTREAM=http://your-api:8000 docker compose up
```

更完整的腾讯云 / TCR 部署步骤见 **[DEPLOY.md](./DEPLOY.md)**。

## 项目结构

```text
src/
├── api/              # 请求封装、类型、业务模块（account / agent / works）
├── components/       # 通用组件与 ui（shadcn）
├── hooks/            # React Query 与流式对话等 hooks
├── pages/            # 页面（login、home、chat、works…）
├── router/           # 路由与鉴权守卫
├── store/            # Zustand（auth、work 等）
├── lib/              # queryClient、工具函数
├── App.tsx
└── main.tsx
nginx/                # 生产 Nginx 模板（/api 反代）
Dockerfile
docker-compose.yml
```

路径别名：`@/*` → `src/*`。

## 常见问题

**`pnpm install` 提示 `approve-builds`**

pnpm 10+ 会拦截未批准的依赖安装脚本。仓库已包含 `pnpm-workspace.yaml`；若仍报错可执行：

```bash
pnpm approve-builds --all
```

**开发服务器 `EACCES` / 5173 端口**

Windows 可能将 5143–5242 划为保留端口，Vite 默认 5173 无法监听。本项目开发端口已设为 **3000**。

**生产改 API 地址后页面仍请求旧地址**

需重新执行 `pnpm build` 或 `docker build`（`VITE_API_BASE_URL` 在构建时固化）。

## 相关文档

- [DEPLOY.md](./DEPLOY.md) — 腾讯云 Docker / TCR 部署详解
- [.env.production.example](./.env.production.example) — 生产环境变量示例

## License

Private project.
