import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BODY_BYTES = 1_000_000;

export function loadLocalEnvFiles(root) {
  for (const fileName of ['.env', '.env.local']) {
    const filePath = join(root, fileName);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

      const [rawKey, ...rawValueParts] = trimmed.split('=');
      const key = rawKey.trim();
      if (process.env[key]) continue;

      const rawValue = rawValueParts.join('=').trim();
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
    }
  }
}

function getEnv(env, key) {
  return env?.[key] || process.env[key] || '';
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
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

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function resolveProvider(env, port = 3000) {
  const openAiKey = getEnv(env, 'OPENAI_API_KEY');
  if (openAiKey) {
    return {
      name: 'OpenAI',
      endpoint: getEnv(env, 'OPENAI_BASE_URL') || 'https://api.openai.com/v1/chat/completions',
      apiKey: openAiKey,
      model: getEnv(env, 'OPENAI_MODEL') || 'gpt-4o-mini',
      headers: {},
    };
  }

  const openRouterKey = getEnv(env, 'OPENROUTER_API_KEY');
  if (openRouterKey) {
    return {
      name: 'OpenRouter',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: openRouterKey,
      model: getEnv(env, 'OPENROUTER_MODEL') || 'meta-llama/llama-3.1-8b-instruct',
      headers: {
        'HTTP-Referer': getEnv(env, 'MAX_AI_SITE_URL') || `http://localhost:${port}`,
        'X-Title': getEnv(env, 'MAX_AI_SITE_NAME') || 'Maxx Forge Studio',
      },
    };
  }

  return null;
}

export async function handleMaxAiRequest(req, res, { env = {}, port = 3000 } = {}) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const provider = resolveProvider(env, port);
  if (!provider) {
    sendJson(res, 501, {
      error: 'Max AI cloud brain is not configured. Add OPENAI_API_KEY to .env.local. OpenRouter is still supported with OPENROUTER_API_KEY.',
    });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const userMessage = String(body.message || '').slice(0, 4000);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!userMessage.trim()) {
      sendJson(res, 400, { error: 'Message is required.' });
      return;
    }

    const upstream = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        ...provider.headers,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: [
              'You are Max AI, powered by Aries AI, for Maxx Forge Studio.',
              'Maxx Forge Studio is an imaginary company and a foundry for the impossible.',
              'Speak in concise, cinematic, technical, helpful language.',
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

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: data?.error?.message || `${provider.name} request failed.`,
        provider: provider.name,
      });
      return;
    }

    sendJson(res, 200, {
      text: data?.choices?.[0]?.message?.content || 'Max AI returned an empty signal.',
      provider: provider.name,
      model: provider.model,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Max AI request failed.' });
  }
}
