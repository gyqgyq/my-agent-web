# syntax=docker/dockerfile:1

# --- 构建阶段 ---
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL=https://api.gyq.asia:8443
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN pnpm build

# --- 运行阶段 ---
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve@14.2.4

COPY --from=builder /app/dist ./dist

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["serve", "-s", "dist", "-l", "80", "--no-clipboard"]
