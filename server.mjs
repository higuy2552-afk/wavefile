/**
 * Zero-dependency static server for the "Wave Hrang Petrole" dossier site.
 *
 * - Serves ./public on 0.0.0.0:$PORT (default 3000) so the Manus Preview proxy can reach it.
 * - No absolute URLs derived from the request Host are ever emitted (Preview is proxied).
 * - Never sends X-Frame-Options / frame-ancestors, so the cross-site Preview iframe works.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./public', import.meta.url)));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const HEADERS_BASE = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  // Allow embedding in the Manus Preview iframe and same-origin asset reads.
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; '),
};

function send(res, code, type, body, extra = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : String(body);
  res.writeHead(code, {
    ...HEADERS_BASE,
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(payload),
    ...extra,
  });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'text/plain; charset=utf-8', 'Method Not Allowed');
      return;
    }

    const rawUrl = req.url || '/';
    const qIndex = rawUrl.indexOf('?');
    let pathname = decodeURIComponent(qIndex === -1 ? rawUrl : rawUrl.slice(0, qIndex));

    if (pathname === '/health' || pathname === '/healthz') {
      send(res, 200, 'application/json; charset=utf-8', '{"ok":true}');
      return;
    }

    if (pathname.endsWith('/')) pathname += 'index.html';

    const filePath = normalize(join(ROOT, pathname));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      send(res, 403, 'text/plain; charset=utf-8', 'Forbidden');
      return;
    }

    let info;
    try {
      info = await stat(filePath);
    } catch {
      send(res, 404, 'text/html; charset=utf-8',
        '<!doctype html><meta charset="utf-8"><title>404</title>' +
        '<body style="background:#06120c;color:#b6ff3c;font-family:monospace;padding:3rem">' +
        '<h1>404 // SIGNAL LOST</h1><p>ไม่พบไฟล์ที่ร้องขอ: ' +
        pathname.replace(/[<>&]/g, '') + '</p></body>');
      return;
    }

    const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const body = await readFile(target);
    const type = MIME[extname(target).toLowerCase()] || 'application/octet-stream';
    const isHtml = type.startsWith('text/html');

    send(res, 200, type, body, {
      'Cache-Control': isHtml ? 'no-store' : 'no-cache',
    });
  } catch (err) {
    send(res, 500, 'text/plain; charset=utf-8', 'Internal error: ' + (err && err.message));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[wavefile] serving ${ROOT} at http://${HOST}:${PORT}`);
});
