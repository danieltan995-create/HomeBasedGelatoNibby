import { preview } from 'astro';
import { fileURLToPath } from 'node:url';

// Use Astro's public API: the CLI auto-detaches in AI-agent environments,
// which prevents Playwright from owning the server's lifecycle on Windows.
const server = await preview({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { host: '127.0.0.1', port: 4322 },
});

let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await server.stop();
  process.exit(0);
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);