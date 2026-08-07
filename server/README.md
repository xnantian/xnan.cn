# xnan Chat Service

该服务为 `xnan.cn` 智能客服提供服务端模型代理，默认调用 `gpt-5.6-luna`。模型密钥只允许通过部署环境变量提供。

## 环境变量

- `XNAN_OPENAI_API_KEY`：必填，中转服务密钥
- `XNAN_OPENAI_BASE_URL`：默认 `https://sub2api.xnan.ai`
- `XNAN_OPENAI_MODEL`：默认 `gpt-5.6-luna`
- `XNAN_ALLOWED_ORIGINS`：默认 `https://xnan.cn,https://www.xnan.cn`
- `XNAN_CHAT_RATE_LIMIT`：单实例每 IP 每分钟请求数，默认 `12`
- `PORT`：独立 Node 服务端口，默认 `8787`

## 本地测试

```bash
cd server
npm test
XNAN_OPENAI_API_KEY='...' npm start
```

## 阿里云函数计算

1. 创建 Node.js 20 HTTP 函数并上传 `server` 目录。
2. Handler 设置为 `fc-handler.handler`。
3. HTTP 触发器使用匿名访问，应用层会校验允许的 Origin 并限流。
4. 在函数配置中添加上述环境变量，密钥只填写在控制台 Secret/环境变量中。
5. 绑定备案子域名 `chat-api.xnan.cn`，开启并强制 HTTPS。
6. 将自定义域名路由 `/api/chat` 和 `/health` 指向该函数。

生产环境不要使用默认 `fcapp.run` 域名。

## 国内服务器 + Nginx

```bash
cd server
npm start
```

建议使用 systemd 或进程管理器保持服务运行，并参考 `nginx/xnan-chat.conf.example` 将 `chat-api.xnan.cn` 反代到 `127.0.0.1:8787`。
