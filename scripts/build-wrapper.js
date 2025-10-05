import { execSync } from 'child_process';
import path from 'path';

// Usage: SPA=1 node scripts/build-wrapper.js
// If SPA env var is set (non-empty), run SPA build and generate index.html
// Otherwise run the default react-router build (SSR)

const SPA = process.env.SPA || process.env.npm_config_spa;

try {
  if (SPA) {
    console.log('Running SPA build (react-router build + generate index.html)');
    execSync('npx react-router build', { stdio: 'inherit' });
    execSync('node ./scripts/generate-spa-index.js', { stdio: 'inherit' });
  } else {
    console.log('Running default react-router build (SSR)');
    execSync('npx react-router build', { stdio: 'inherit' });
  }
  console.log('Build finished');
} catch (err) {
  console.error('Build failed', err);
  process.exit(1);
}
