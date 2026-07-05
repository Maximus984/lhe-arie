import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleMaxAiRequest } from './maxAiApi.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'max-ai-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/max-ai', (req, res) => handleMaxAiRequest(req, res, { env, port: 5173 }));
        },
      },
    ],
  };
})
