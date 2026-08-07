# 智能客服聊天框交付规格

## 用户与目标

- 用户：正在评估企业级 Agent 服务的业务负责人、技术负责人和采购决策者。
- 目标：无需离开页面即可了解能力、场景、实施周期、安全方案和联系渠道，并在知识不足时顺畅转人工。
- 约束：当前站点部署在 GitHub Pages；浏览器端不得保存模型密钥，也不能直接调用需要密钥的模型服务。

## Flow: 站内智能客服咨询

**Trigger:** 用户点击页面右下角“智能客服”按钮。

```text
[打开客服] -> [欢迎语 + 推荐问题] -> [输入或点击问题]
                                      |
                                      v
                              [检索客户知识库]
                                      |
                     +----------------+----------------+
                     |                                 |
               [命中本地知识]                    [命中不足]
                     |                                 |
               [生成有依据回答]              [说明边界 + 转人工]
                     |                                 |
                     +------------> [继续提问 / 关闭]
```

### 状态

| 状态 | 行为 |
| --- | --- |
| 初始 | 欢迎语、服务状态和 4 个推荐问题 |
| 输入 | 1-500 字；空内容不可提交；Enter 发送，Shift+Enter 换行 |
| 加载 | 禁止重复发送，展示“正在检索知识库”状态 |
| 成功 | 展示回答、相关知识主题和转人工入口 |
| 低置信度 | 明确说明没有足够依据，提供邮箱、微信和电话 |
| 网络错误 | 远程模型不可用时自动退回本地知识库回答 |
| 清空 | 清除会话并恢复欢迎状态，不删除知识库 |
| 关闭 | 保留本次页面生命周期内的消息；再次打开恢复 |

## 组件规格

### ChatLauncher

- 固定在右下角，显示对话图标、`智能客服` 和在线状态。
- `aria-expanded` 与聊天框开合状态同步；键盘 Enter/Space 可操作。
- 桌面为图标+文字，窄屏保持稳定尺寸，不遮挡主要联系方式。

### ChatPanel

- `role="dialog"`，包含标题、模型状态、清空与关闭按钮、消息区、推荐问题和输入区。
- 打开后焦点进入输入框；Escape 关闭并将焦点还给 Launcher。
- 新回答通过 `aria-live="polite"` 宣告。
- 桌面宽 380px、高度不超过视口；移动端贴合 16px 页面边距并限制在安全视口内。

### MessageList

- 用户消息靠右，客服消息靠左；不使用气泡装饰堆叠，采用紧凑的信息块和细边框。
- 回答正文允许换行；相关知识以小型主题标签展示。
- 空、加载、成功、错误状态均保持消息区尺寸稳定。

### Composer

- 多行文本框，最大 500 字；发送按钮使用方向箭头图标并提供文字替代。
- 发送期间禁用；内容超限显示计数和错误状态。

## 知识库与模型契约

```typescript
interface KnowledgeEntry {
  id: string;
  title: string;
  category: 'service' | 'scenario' | 'delivery' | 'security' | 'contact';
  keywords: string[];
  questionPatterns: string[];
  answer: string;
  links?: Array<{ label: string; href: string }>;
}

interface ChatProvider {
  id: string;
  generate(input: {
    message: string;
    history: ChatMessage[];
    context: KnowledgeEntry[];
  }): Promise<{ answer: string; sources: string[] }>;
}
```

- `LocalKnowledgeProvider`：默认启用；在浏览器中检索 JSON 知识库并基于命中内容回答。
- `RemoteModelProvider`：仅调用同源 `/api/chat`，由服务端保存供应商密钥、执行鉴权、限流和审计。
- 远程接口不可用或未配置时必须自动退回本地 Provider，不向用户暴露技术错误。

## 视觉规则

- 沿用 `--ink`、`--white`、`--cyan`、`--orange`、`--signal`、`--mono` 和现有 1px 边框系统。
- 面板圆角不超过 8px；不使用渐变、装饰性光球或嵌套卡片。
- 动画 180-220ms；遵循 `prefers-reduced-motion`。
- 层级：聊天框低于 Toast、高于固定页头；焦点环沿用全站 `--signal`。

## 实现目标与验收

- 目标：现有原生 HTML/CSS/JavaScript 静态站点，避免引入框架或运行时依赖。
- 需要文件：`data/customer-knowledge-base.js`、`chatbot.js`、`index.html`、`styles.css`。知识库使用独立数据脚本，以同时支持线上 HTTPS 与本地 `file://` 预览。
- 可在无后端、无模型密钥情况下完整咨询常见问题。
- 模型入口只接受同源服务端代理配置，不把供应商密钥放进浏览器。
- 桌面和 390px 移动端无溢出；键盘开合、发送、关闭和焦点恢复可用。
- 本地知识不足时提供 `hi@xnan.ai`、微信 `SeeYouClaw` 和电话 `176 1143 1021`。
