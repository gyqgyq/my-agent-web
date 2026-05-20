# 腾讯云 Docker 部署（my-agent-web）

前端为 **Vite 静态资源**，容器内使用 `serve` 提供 SPA。API 地址在 **构建时** 通过 `VITE_API_BASE_URL` 写入静态资源（跨域直连后端，需配置 CORS）。

## 前置条件

- 已部署 **my-agent-sever**（或等价 FastAPI 服务），且 `/api` 前缀可用
- 后端 `CORS_ORIGINS` 包含前端访问域名
- 本机已安装 Docker

## 1. 本地构建与试跑

```bash
# 默认 API 地址（见 Dockerfile ARG）
docker build -t my-agent-web:latest .

# 指定 API 地址构建
docker build -t my-agent-web:latest \
  --build-arg VITE_API_BASE_URL=https://api.example.com .

docker run --rm -p 8080:80 my-agent-web:latest

# 或使用 compose
docker compose up --build
```

浏览器访问：`http://localhost:8001`（compose 默认映射）或 `http://localhost:8080`（上例 `docker run`）

## 2. 推送到腾讯云容器镜像服务（TCR）

```bash
docker login ccr.ccs.tencentyun.com

docker tag my-agent-web:latest ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0

docker push ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0
```

## 3. 在腾讯云上运行

### 3.1 TKE（Kubernetes）

- 工作负载：Deployment，镜像为 TCR 地址
- Service：ClusterIP 或 LoadBalancer，容器端口 **80**
- 构建镜像时已写入 `VITE_API_BASE_URL`；换 API 地址需重新构建镜像

### 3.2 轻量 / CVM / 容器实例

```bash
docker pull ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0

docker run -d --name my-agent-web \
  -p 80:80 \
  --restart unless-stopped \
  ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0
```

若需改 API 地址，在构建阶段传入 `--build-arg VITE_API_BASE_URL=...`，运行时环境变量无法覆盖。

## 4. 健康检查

镜像内置：`GET /` 返回 200。TKE 探针可配置：

- 路径：`/`
- 端口：`80`

## 5. 常见问题

**登录后接口 401 / 跨域**  
确认 `VITE_API_BASE_URL` 与后端 CORS、Cookie 策略一致。

**对话 SSE 中断**  
若前有腾讯云 CLB / CDN，需关闭响应缓冲或增大空闲超时。

**刷新子路由 404**  
`serve -s` 已支持 SPA 回退；若外层还有 CDN，需配置 SPA 回源规则。

**构建后想改 API 地址**  
`VITE_*` 在构建时写入静态资源，必须重新 `docker build` 并部署新镜像。
