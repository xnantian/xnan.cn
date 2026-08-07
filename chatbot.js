(function initializeCustomerServiceChat() {
  const knowledgeBase = window.XNAN_CUSTOMER_KB;
  const widget = document.querySelector('[data-chat-widget]');

  if (!knowledgeBase || !widget) return;

  const launcher = widget.querySelector('[data-chat-launcher]');
  const panel = widget.querySelector('[data-chat-panel]');
  const closeButton = widget.querySelector('[data-chat-close]');
  const resetButton = widget.querySelector('[data-chat-reset]');
  const messageList = widget.querySelector('[data-chat-messages]');
  const suggestionList = widget.querySelector('[data-chat-suggestions]');
  const form = widget.querySelector('[data-chat-form]');
  const input = widget.querySelector('[data-chat-input]');
  const submitButton = widget.querySelector('[data-chat-submit]');
  const count = widget.querySelector('[data-chat-count]');
  const modelStatus = widget.querySelector('[data-chat-model-status]');
  const apiEndpoint = document.querySelector('meta[name="xnan-chat-api"]')?.content.trim() || '';
  const history = [];
  let loadingMessage = null;
  let isSending = false;

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '');
  }

  function getBigrams(value) {
    const normalized = normalize(value);
    const grams = new Set();

    for (let index = 0; index < normalized.length - 1; index += 1) {
      grams.add(normalized.slice(index, index + 2));
    }

    return grams;
  }

  class KnowledgeRetriever {
    constructor(entries) {
      this.entries = entries;
    }

    score(query, entry) {
      const normalizedQuery = normalize(query);
      const haystack = normalize([
        entry.title,
        entry.keywords.join(' '),
        entry.questionPatterns.join(' '),
        entry.answer
      ].join(' '));
      let score = 0;

      entry.questionPatterns.forEach((pattern) => {
        const normalizedPattern = normalize(pattern);
        if (normalizedQuery.includes(normalizedPattern)) score += 12;
        else if (normalizedQuery.length >= 4 && normalizedPattern.includes(normalizedQuery)) score += 7;
      });

      entry.keywords.forEach((keyword) => {
        const normalizedKeyword = normalize(keyword);
        if (normalizedQuery.includes(normalizedKeyword)) {
          score += 4 + Math.min(normalizedKeyword.length, 6) * 0.35;
        }
      });

      if (normalizedQuery.includes(normalize(entry.title))) score += 8;

      const queryBigrams = getBigrams(query);
      let overlap = 0;
      queryBigrams.forEach((gram) => {
        if (haystack.includes(gram)) overlap += 1;
      });

      score += Math.min(overlap * 0.3, 3);
      return score;
    }

    search(query, limit = 3) {
      return this.entries
        .map((entry) => ({ entry, score: this.score(query, entry) }))
        .filter((result) => result.score >= 3)
        .sort((left, right) => right.score - left.score)
        .slice(0, limit);
    }
  }

  class LocalKnowledgeProvider {
    constructor() {
      this.id = 'local-knowledge';
    }

    async generate({ message, context }) {
      const compactMessage = normalize(message);
      const isGreeting = /^(hi|hello|你好|您好|在吗|嗨|哈喽)$/.test(compactMessage);

      if (isGreeting) {
        return {
          answer: '你好，我是 xnan 智能客服。你可以问我企业 Agent 能力、系统接入、安全部署、项目交付或报价方式。',
          sources: [],
          links: []
        };
      }

      if (!context.length) {
        return {
          answer: '这个问题暂时没有足够的站内知识作为依据。你可以换一种问法，或联系人工顾问进一步确认。',
          sources: [],
          links: [
            { label: '发送邮件', href: 'mailto:hi@xnan.ai' },
            { label: '查看联系方式', href: '#contact' }
          ]
        };
      }

      const primary = context[0];
      return {
        answer: primary.answer,
        sources: context.slice(0, 2).map((entry) => entry.title),
        links: primary.links || []
      };
    }
  }

  class RemoteModelProvider {
    constructor(endpoint) {
      this.id = 'remote-model';
      this.endpoint = endpoint;
    }

    get configured() {
      return Boolean(this.endpoint);
    }

    async generate({ message, history: chatHistory, context }) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message,
            history: chatHistory.slice(-8),
            context: context.map(({ id, title, category, answer }) => ({ id, title, category, answer }))
          })
        });

        if (!response.ok) throw new Error(`Chat API returned ${response.status}`);

        const payload = await response.json();
        if (!payload || typeof payload.answer !== 'string' || !payload.answer.trim()) {
          throw new Error('Chat API returned an invalid response');
        }

        return {
          answer: payload.answer.trim(),
          sources: Array.isArray(payload.sources) ? payload.sources.slice(0, 3) : [],
          links: context[0]?.links || []
        };
      } finally {
        window.clearTimeout(timeout);
      }
    }
  }

  class ModelRouter {
    constructor(retriever, localProvider, remoteProvider) {
      this.retriever = retriever;
      this.localProvider = localProvider;
      this.remoteProvider = remoteProvider;
    }

    async generate(message, chatHistory) {
      const matches = this.retriever.search(message);
      const context = matches.map((match) => match.entry);

      if (this.remoteProvider.configured) {
        try {
          const result = await this.remoteProvider.generate({ message, history: chatHistory, context });
          return { ...result, mode: 'remote' };
        } catch {
          const fallback = await this.localProvider.generate({ message, history: chatHistory, context });
          return { ...fallback, mode: 'fallback' };
        }
      }

      const result = await this.localProvider.generate({ message, history: chatHistory, context });
      return { ...result, mode: 'local' };
    }
  }

  const retriever = new KnowledgeRetriever(knowledgeBase.entries);
  const modelRouter = new ModelRouter(
    retriever,
    new LocalKnowledgeProvider(),
    new RemoteModelProvider(apiEndpoint)
  );

  function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function isSafeLink(href) {
    return href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:');
  }

  function scrollToLatestMessage() {
    window.requestAnimationFrame(() => {
      messageList.scrollTop = messageList.scrollHeight;
    });
  }

  function renderMessage(role, content, options = {}) {
    const message = document.createElement('article');
    message.className = `chat-message chat-message-${role}`;

    const label = createTextElement(
      'span',
      'chat-message-label',
      role === 'user' ? 'YOU' : 'XNAN SERVICE'
    );
    const body = createTextElement('p', 'chat-message-body', content);
    message.append(label, body);

    if (options.loading) {
      message.classList.add('is-loading');
      body.setAttribute('aria-label', '正在检索知识库');
      body.textContent = '';
      const dots = document.createElement('span');
      dots.className = 'chat-loading-dots';
      dots.setAttribute('aria-hidden', 'true');
      dots.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
      body.appendChild(dots);
    }

    if (options.sources?.length) {
      const sources = document.createElement('div');
      sources.className = 'chat-message-sources';
      options.sources.forEach((source) => {
        sources.appendChild(createTextElement('span', '', source));
      });
      message.appendChild(sources);
    }

    if (options.links?.length) {
      const links = document.createElement('div');
      links.className = 'chat-message-links';
      options.links.filter((link) => isSafeLink(link.href)).forEach((link) => {
        const anchor = createTextElement('a', '', `${link.label} ↗`);
        anchor.href = link.href;
        links.appendChild(anchor);
      });
      message.appendChild(links);
    }

    messageList.appendChild(message);
    scrollToLatestMessage();
    return message;
  }

  function renderWelcome() {
    renderMessage(
      'assistant',
      '你好，我是 xnan 智能客服。我会优先依据站内知识回答，也可以帮你找到合适的人工顾问。'
    );
  }

  function renderSuggestions() {
    suggestionList.replaceChildren();
    knowledgeBase.suggestions.forEach((suggestion) => {
      const button = createTextElement('button', 'chat-suggestion', suggestion);
      button.type = 'button';
      button.addEventListener('click', () => submitMessage(suggestion));
      suggestionList.appendChild(button);
    });
  }

  function updateModelStatus(mode) {
    if (mode === 'remote') modelStatus.textContent = 'MODEL + KNOWLEDGE ONLINE';
    else if (mode === 'fallback') modelStatus.textContent = 'KNOWLEDGE FALLBACK ACTIVE';
    else modelStatus.textContent = 'KNOWLEDGE BASE ONLINE';
  }

  function setSending(sending) {
    isSending = sending;
    input.disabled = sending;
    submitButton.disabled = sending;
    suggestionList.querySelectorAll('button').forEach((button) => {
      button.disabled = sending;
    });
  }

  async function submitMessage(value) {
    const message = String(value || input.value).trim();
    if (!message || isSending) return;

    input.value = '';
    count.textContent = '0 / 500';
    renderMessage('user', message);
    history.push({ role: 'user', content: message });
    setSending(true);
    loadingMessage = renderMessage('assistant', '', { loading: true });

    try {
      const result = await modelRouter.generate(message, history);
      loadingMessage.remove();
      renderMessage('assistant', result.answer, { sources: result.sources, links: result.links });
      history.push({ role: 'assistant', content: result.answer });
      updateModelStatus(result.mode);
    } catch {
      loadingMessage?.remove();
      renderMessage(
        'assistant',
        '当前服务暂时不可用。你可以稍后重试，或通过邮箱联系人工顾问。',
        { links: [{ label: '发送邮件', href: 'mailto:hi@xnan.ai' }] }
      );
      updateModelStatus('fallback');
    } finally {
      loadingMessage = null;
      setSending(false);
      input.focus();
    }
  }

  function setOpen(open, restoreFocus = true) {
    launcher.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    widget.classList.toggle('is-open', open);

    if (open) {
      launcher.classList.remove('has-notification');
      window.requestAnimationFrame(() => input.focus());
    } else if (restoreFocus) {
      launcher.focus();
    }
  }

  function resetConversation() {
    history.length = 0;
    messageList.replaceChildren();
    renderWelcome();
    updateModelStatus(apiEndpoint ? 'remote' : 'local');
    input.focus();
  }

  launcher.addEventListener('click', () => {
    setOpen(launcher.getAttribute('aria-expanded') !== 'true');
  });

  closeButton.addEventListener('click', () => setOpen(false));
  resetButton.addEventListener('click', resetConversation);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitMessage(input.value);
  });

  input.addEventListener('input', () => {
    count.textContent = `${input.value.length} / 500`;
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitMessage(input.value);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  messageList.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) setOpen(false, false);
  });

  renderWelcome();
  renderSuggestions();
  updateModelStatus(apiEndpoint ? 'remote' : 'local');

  window.XNANChat = Object.freeze({
    search: (query) => retriever.search(query).map(({ entry, score }) => ({
      id: entry.id,
      title: entry.title,
      score
    }))
  });
})();
