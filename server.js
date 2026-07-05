import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(root, 'dist');
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.lottie': 'application/zip',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function handleMaxAi(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!process.env.OPENROUTER_API_KEY) {
    sendJson(res, 501, { error: 'Max AI cloud brain is not configured. Add OPENROUTER_API_KEY to .env.local or your shell environment.' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const userMessage = String(body.message || '').slice(0, 4000);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.MAX_AI_SITE_URL || `http://localhost:${port}`,
        'X-Title': process.env.MAX_AI_SITE_NAME || 'Maxx Forge Studio',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          {
            role: 'system',
            content: [
              'You are Max AI, powered by Aries AI, for Maxx Forge Studio.',
              'Maxx Forge Studio is an imaginary company and a foundry for the impossible.',
              'Speak in concise, neon technical, helpful language.',
              'You help visitors understand the studio, Aries AI, music, live events, game development, forms, bookings, and staff escalation.',
              'Never claim a form was submitted unless the app UI submitted it.',
            ].join(' '),
          },
          ...history.map(item => ({
            role: item.from === 'user' ? 'user' : 'assistant',
            content: String(item.text || '').slice(0, 2000),
          })),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.75,
        max_tokens: 700,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: data?.error?.message || 'Max AI provider request failed.' });
      return;
    }

    sendJson(res, 200, { text: data?.choices?.[0]?.message?.content || 'Max AI returned an empty signal.' });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Max AI request failed.' });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);
  const requestedPath = normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(distDir, requestedPath === '/' ? 'index.html' : requestedPath);

  if (!filePath.startsWith(distDir) || !existsSync(filePath)) {
    filePath = join(distDir, 'index.html');
  }

  const ext = extname(filePath);
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  if (req.url?.startsWith('/api/max-ai')) {
    await handleMaxAi(req, res);
    return;
  }

  if (!existsSync(join(distDir, 'index.html'))) {
    const message = 'Build output not found. Run npm run build before npm run start.';
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
    return;
  }

  serveStatic(req, res);
}).listen(port, () => {
  console.log(`Maxx Forge Studio local server listening on http://localhost:${port}`);
});
