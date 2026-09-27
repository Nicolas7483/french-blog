// Tiny static server for dist/, used by the QA scripts and Playwright.
// Behaves like the host: /dir/ serves dir/index.html, unknown paths get 404.html with a 404.
// Run directly to serve on a port: node scripts/serve.mjs 4321

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

export function serve(port, root = 'dist') {
  const dir = path.resolve(root);
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dir, url);
    if (!file.startsWith(dir)) file = path.join(dir, '404.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.endsWith('/')) {
        res.writeHead(301, { location: `${url}/` });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
    let status = 200;
    if (!fs.existsSync(file)) {
      status = 404;
      file = path.join(dir, '404.html');
    }
    const type = TYPES[path.extname(file)] ?? 'application/octet-stream';
    res.writeHead(status, {
      'content-type': type,
      'cache-control': url.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.argv[2] || 4321);
  await serve(port);
  console.log(`Serving dist/ on http://localhost:${port}`);
}
