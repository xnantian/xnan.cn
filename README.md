# xnan.cn

xnan.cn 是面向企业客户的 AI Agent 定制服务官网，介绍 Agent 咨询、定制开发、系统集成、私有化部署与持续运营能力。

## 本地预览

这是一个无构建依赖的静态网站，可直接打开 `index.html`，也可以运行：

```bash
python3 -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 文件结构

- `index.html`：页面内容与结构
- `styles.css`：视觉系统与响应式布局
- `script.js`：导航、首屏视差和复制交互
- `chatbot.js`：知识检索、模型 Provider、消息状态与客服交互
- `data/customer-knowledge-base.js`：可维护的客户知识库内容
- `server/`：阿里云函数计算与 Nginx/Node.js 共用的模型代理
- `assets/`：网站图片资源
- `design/`：视觉方向与设计说明
- `preview/`：桌面与移动端整页预览

## 智能客服

客服默认使用本地知识库回答，因此直接打开 `index.html` 也可以工作。真实模型通过同源后端代理接入，不要在 HTML 或浏览器脚本中放置模型 API Key。

在 `index.html` 中设置接口地址：

```html
<meta name="xnan-chat-api" content="/api/chat" />
```

前端会发送：

```json
{
  "message": "客户问题",
  "history": [{ "role": "user", "content": "..." }],
  "context": [{ "id": "...", "title": "...", "category": "...", "answer": "..." }]
}
```

后端返回：

```json
{
  "answer": "模型回答",
  "sources": ["引用的知识条目"]
}
```

远程接口超时、报错或返回无效内容时，客服会自动回退到本地知识库。

服务端默认使用 `gpt-5.6-luna`，部署和环境变量说明见 `server/README.md`。模型密钥必须通过部署平台的 Secret 或环境变量提供，不能提交到仓库。
