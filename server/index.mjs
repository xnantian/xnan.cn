import http from 'node:http';
import { handleChatRequest } from './chat-core.mjs';

const port = Number.parseInt(process.env.PORT || '8787', 10);

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > 32 * 1024) {
        reject(new Error('REQUEST_TOO_LARGE'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const result = await handleChatRequest({
      method: request.method || 'GET',
      path: new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname,
      headers: request.headers,
      body: await readBody(request),
      ip: request.headers['x-real-ip'] || request.socket.remoteAddress || 'unknown'
    });

    response.writeHead(result.statusCode, result.headers);
    response.end(result.body);
  } catch (error) {
    const statusCode = error.message === 'REQUEST_TOO_LARGE' ? 413 : 500;
    response.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    response.end(JSON.stringify({ error: statusCode === 413 ? 'Request too large' : 'Internal error' }));
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`xnan chat service listening on ${port}`);
});
