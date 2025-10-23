import http from 'node:http';
import { handlerLocal } from './api/permiso.js';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJson(res, status, payload) {
  setCors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Simple router: GET /?permiso=... or POST with { permisos: [...] }
  const url = new URL(req.url ?? '/', 'http://localhost:3000');
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const bodyStr = Buffer.concat(buffers).toString() || null;

  if (method === 'GET') {
    const permiso = url.searchParams.get('permiso');
    const { status, body } = await handlerLocal({ method, query: { permiso } });
    sendJson(res, status, body);
    return;
  }

  if (method === 'POST') {
    let body = null;
    try {
      body = JSON.parse(bodyStr || '{}');
    } catch {
      sendJson(res, 400, { error: 'JSON invalido' });
      return;
    }
    const { status, body: resp } = await handlerLocal({ method, body });
    sendJson(res, status, resp);
    return;
  }

  sendJson(res, 405, { error: 'Metodo no permitido' });
});

server.listen(3000, () => console.log('Local dev on http://localhost:3000'));
