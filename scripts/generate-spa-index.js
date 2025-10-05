import fs from 'fs';
import path from 'path';

const clientDir = path.resolve(process.cwd(), 'build', 'client');
const assetsDir = path.join(clientDir, 'assets');

function findManifest() {
  const manifestPath = path.join(assetsDir, 'manifest-*.js');
  // simple fallback: look for manifest-*.js by scanning files
  const files = fs.readdirSync(assetsDir);
  const manifestFile = files.find(f => f.startsWith('manifest-') && f.endsWith('.js'));
  if (!manifestFile) return null;
  return path.join(assetsDir, manifestFile);
}

function loadManifest(manifestPath) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  // manifest file produced by react-router writes window.__reactRouterManifest=...; we can extract the JSON
  const m = content.match(/window\.__reactRouterManifest\s*=\s*(\{[\s\S]*\})/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (err) {
    return null;
  }
}

function buildHtml(manifest) {
  // manifest.entry.module e.g. /assets/entry.client-XXXX.js
  const entry = manifest?.entry?.module || '/assets/entry.client.js';
  const imports = manifest?.entry?.imports || [];
  const css = manifest?.entry?.css || [];

  // map paths to local files (remove leading /)
  const scripts = [entry, ...imports].map(p => p.replace(/^\//, ''));
  const cssLinks = css.map(p => p.replace(/^\//, ''));

  const lines = [];
  lines.push('<!doctype html>');
  lines.push('<html>');
  lines.push('<head>');
  lines.push('  <meta charset="utf-8">');
  lines.push('  <meta name="viewport" content="width=device-width,initial-scale=1">');
  lines.push('  <title>Agent AI</title>');
  cssLinks.forEach(href => lines.push(`  <link rel="stylesheet" href="/assets/${path.basename(href)}">`));
  lines.push('</head>');
  lines.push('<body>');
  lines.push('  <div id="root"></div>');
  scripts.forEach(src => lines.push(`  <script type="module" src="/assets/${path.basename(src)}"></script>`));
  lines.push('</body>');
  lines.push('</html>');

  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(clientDir)) {
    console.error('Client build directory not found:', clientDir);
    process.exit(1);
  }
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory not found:', assetsDir);
    process.exit(1);
  }

  const manifestPath = findManifest();
  let manifest = null;
  if (manifestPath) {
    manifest = loadManifest(manifestPath);
  }

  const html = buildHtml(manifest || {});
  const outPath = path.join(clientDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Wrote', outPath);
}

main();
