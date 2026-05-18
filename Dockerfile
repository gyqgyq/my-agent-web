# syntax=docker/dockerfile:1

# --- 构建阶段 ---
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# 留空则走同源 /api + Nginx 反代；默认直连生产后端
ARG VITE_API_BASE_URL=http://43.143.219.22:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build

# --- 运行阶段 ---
FROM nginx:1.27-alpine

# 反代目标（须含协议，无尾斜杠），例：http://my-agent-api:8000
ENV API_UPSTREAM=http://43.143.219.22:8080

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
