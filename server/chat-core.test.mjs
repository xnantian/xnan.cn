import assert from 'node:assert/strict';
import test from 'node:test';
import { handleChatRequest } from './chat-core.mjs';

const allowedOrigin = 'https://xnan.cn';

test('returns health information without exposing secrets', async () => {
  const result = await handleChatRequest({
    method: 'GET',
    path: '/health',
    headers: {},
    body: '',
    ip: 'health-test'
  });
  const payload = JSON.parse(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.model, 'gpt-5.6-luna');
  assert.equal('apiKey' in payload, false);
});

test('rejects requests from unknown origins', async () => {
  const result = await handleChatRequest({
    method: 'POST',
    path: '/api/chat',
    headers: { origin: 'https://example.com' },
    body: JSON.stringify({ message: '测试' }),
    ip: 'origin-test'
  });

  assert.equal(result.statusCode, 403);
  assert.equal(result.headers['Access-Control-Allow-Origin'], undefined);
});

test('calls the configured model with sanitized knowledge context', async (context) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.XNAN_OPENAI_API_KEY;
  process.env.XNAN_OPENAI_API_KEY = 'test-only-key';

  context.after(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.XNAN_OPENAI_API_KEY;
    else process.env.XNAN_OPENAI_API_KEY = originalKey;
  });

  let upstreamRequest;
  globalThis.fetch = async (url, options) => {
    upstreamRequest = { url, options, payload: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      choices: [{ message: { content: '这是经过知识库约束的回答。' } }]
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const result = await handleChatRequest({
    method: 'POST',
    path: '/api/chat',
    headers: { origin: allowedOrigin },
    body: JSON.stringify({
      message: '能接入 CRM 吗？',
      history: [{ role: 'user', content: '你好' }],
      context: [{ id: 'integration', title: '系统接入', category: 'service', answer: '支持 CRM。' }]
    }),
    ip: 'model-test'
  });
  const payload = JSON.parse(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(result.headers['Access-Control-Allow-Origin'], allowedOrigin);
  assert.equal(payload.answer, '这是经过知识库约束的回答。');
  assert.deepEqual(payload.sources, ['系统接入']);
  assert.equal(upstreamRequest.url, 'https://sub2api.xnan.ai/v1/chat/completions');
  assert.equal(upstreamRequest.payload.model, 'gpt-5.6-luna');
  assert.match(upstreamRequest.payload.messages[1].content, /支持 CRM/);
  assert.match(upstreamRequest.options.headers.Authorization, /^Bearer /);
});

test('requires a non-empty message', async () => {
  const result = await handleChatRequest({
    method: 'POST',
    path: '/api/chat',
    headers: { origin: allowedOrigin },
    body: JSON.stringify({ message: '  ' }),
    ip: 'message-test'
  });

  assert.equal(result.statusCode, 400);
});
