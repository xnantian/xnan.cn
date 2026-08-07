import { handleChatRequest } from './chat-core.mjs';

export async function handler(event) {
  const parsedEvent = typeof event === 'string' || Buffer.isBuffer(event)
    ? JSON.parse(event.toString())
    : event;
  const rawBody = parsedEvent?.isBase64Encoded
    ? Buffer.from(parsedEvent.body || '', 'base64').toString('utf8')
    : parsedEvent?.body || '';
  const headers = parsedEvent?.headers || {};

  return handleChatRequest({
    method: parsedEvent?.requestContext?.http?.method || parsedEvent?.httpMethod || 'GET',
    path: parsedEvent?.rawPath || parsedEvent?.path || '/',
    headers,
    body: rawBody,
    ip: headers['x-forwarded-for']?.split(',')[0]?.trim()
      || parsedEvent?.requestContext?.http?.sourceIp
      || 'unknown'
  });
}
