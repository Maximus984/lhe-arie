import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMaxAiRequest, loadLocalEnvFiles } from './maxAiApi.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(root, 'dist');
const port = Number(process.env.PORT || 3000);
loadLocalEnvFiles(root);

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
    await handleMaxAiRequest(req, res, { port });
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
