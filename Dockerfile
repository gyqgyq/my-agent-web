# syntax=docker/dockerfile:1

# --- 构建阶段 ---
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# 留空则浏览器请求同源 /api，由下方 Nginx 反代到 API_UPSTREAM
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build

# --- 运行阶段 ---
FROM nginx:1.27-alpine

# 反代目标（须含协议，无尾斜杠），例：http://my-agent-api:8000
ENV API_UPSTREAM=http://127.0.0.1:8000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
