const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let port = 8080;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = Number(args[i + 1]) || port;
    i++;
  }
}

const rootDir = path.resolve(__dirname);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function safeResolve(reqPath) {
  const urlPath = decodeURIComponent(reqPath.split('?')[0]);
  const normalized = path.normalize(urlPath).replace(/^\\+|^\/+/, '');
  const resolved = path.resolve(rootDir, normalized || 'index.html');
  if (!resolved.startsWith(rootDir)) return null;
  return resolved;
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  let filePath = safeResolve(req.url);
  if (!filePath) return send404(res);

  fs.stat(filePath, (err, stat) => {
    if (err) {
      // try adding .html for pretty URLs
      const withHtml = filePath + '.html';
      fs.stat(withHtml, (err2, stat2) => {
        if (err2) return send404(res);
        streamFile(withHtml, stat2, res);
      });
      return;
    }
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (err3, stat3) => {
        if (err3) return send404(res);
        streamFile(indexPath, stat3, res);
      });
    } else {
      streamFile(filePath, stat, res);
    }
  });
});

function streamFile(filePath, stat, res) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  });
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => send404(res));
  stream.pipe(res);
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server running at http://localhost:${port}/`);
});