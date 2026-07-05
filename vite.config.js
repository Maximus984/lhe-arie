import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

async function handleMaxAi(req, res, env) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.statusCode = 501;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Max AI cloud brain is not configured. Add OPENROUTER_API_KEY to .env.local.' }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const userMessage = String(body.message || '').slice(0, 4000);
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.MAX_AI_SITE_URL || 'http://localhost:5173',
        'X-Title': env.MAX_AI_SITE_NAME || 'Maxx Forge Studio',
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
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
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: data?.error?.message || 'Max AI provider request failed.' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ text: data?.choices?.[0]?.message?.content || 'Max AI returned an empty signal.' }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Max AI request failed.' }));
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'max-ai-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/max-ai', (req, res) => handleMaxAi(req, res, env));
        },
      },
    ],
  };
})
