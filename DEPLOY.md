# 腾讯云 Docker 部署（my-agent-web）

前端为 **Vite 静态资源 + Nginx**。生产环境推荐：**构建时 `VITE_API_BASE_URL` 留空**，由容器内 Nginx 将 `/api` 反代到 FastAPI 后端。

## 前置条件

- 已部署 **my-agent-sever**（或等价 FastAPI 服务），监听 `8000`，且 `/api` 前缀可用
- 后端 `CORS_ORIGINS` 包含前端访问域名（若前后端不同域且不走 Nginx 同源反代）
- 本机已安装 Docker

## 1. 本地构建与试跑

```bash
# 构建镜像
docker build -t my-agent-web:latest .

# 仅前端（后端在宿主机 8000 端口）
docker run --rm -p 8080:80 \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  my-agent-web:latest

# 或使用 compose
API_UPSTREAM=http://host.docker.internal:8000 docker compose up --build
```

浏览器访问：`http://localhost:8080`

## 2. 两种 API 对接方式

| 方式 | 构建参数 `VITE_API_BASE_URL` | 运行时 `API_UPSTREAM` | 适用场景 |
|------|------------------------------|------------------------|----------|
| **同源反代（推荐）** | 留空 | 指向后端，如 `http://10.0.1.5:8000` | 前后端同一入口域名，由 Nginx 转发 `/api` |
| **跨域直连** | `https://api.你的域名.com` | 无需反代 | API 独立域名，后端需配置 CORS |

同源反代构建示例：

```bash
docker build -t my-agent-web:latest --build-arg VITE_API_BASE_URL= .
```

跨域构建示例：

```bash
docker build -t my-agent-web:latest \
  --build-arg VITE_API_BASE_URL=https://api.example.com .
```

## 3. 推送到腾讯云容器镜像服务（TCR）

```bash
# 登录（地域、命名空间按控制台为准）
docker login ccr.ccs.tencentyun.com

# 打标签：ccr.ccs.tencentyun.com/<命名空间>/my-agent-web:<版本>
docker tag my-agent-web:latest ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0

docker push ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0
```

## 4. 在腾讯云上运行

### 4.1 TKE（Kubernetes）

- 工作负载：Deployment，镜像为 TCR 地址
- Service：ClusterIP 或 LoadBalancer，容器端口 **80**
- 环境变量：`API_UPSTREAM=http://<后端 Service 名>:8000`（同集群）或内网 IP
- Ingress：域名指向前端 Service；若只用同源反代，**无需**单独暴露 API 公网

### 4.2 轻量 / CVM / 容器实例

```bash
docker pull ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0

docker run -d --name my-agent-web \
  -p 80:80 \
  -e API_UPSTREAM=http://<后端内网IP>:8000 \
  --restart unless-stopped \
  ccr.ccs.tencentyun.com/<namespace>/my-agent-web:1.0.0
```

### 4.3 与后端 compose 同网（示例）

若后端容器名为 `api`、在同一 Docker 网络：

```bash
docker run -d --name my-agent-web \
  --network your_net \
  -p 8080:80 \
  -e API_UPSTREAM=http://api:8000 \
  my-agent-web:latest
```

## 5. 健康检查

镜像内置：`GET /` 返回 200。TKE 探针可配置：

- 路径：`/`
- 端口：`80`

## 6. 常见问题

**登录后接口 401 / 跨域**  
确认浏览器请求的 API 地址与 Cookie/Token 策略一致；跨域时检查后端 `CORS_ORIGINS`。

**对话 SSE 中断**  
Nginx 已关闭 `proxy_buffering` 并延长 `proxy_read_timeout`；若前有腾讯云 CLB，需关闭响应缓冲或增大空闲超时。

**刷新子路由 404**  
已配置 `try_files` 回退到 `index.html`；若外层还有 CDN，需配置 SPA 回源规则。

**构建时改 API 地址**  
`VITE_*` 在 **构建时** 写入静态资源，运行时改环境变量无效（除 `API_UPSTREAM` 反代模式外）。
