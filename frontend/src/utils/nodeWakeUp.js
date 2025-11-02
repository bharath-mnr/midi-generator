/**
 * Silent Node.js wake-up
 * - Runs once per browser session
 * - No UI feedback
 * - Fails silently
 */
const STORAGE_KEY = '_mg_node_woken';

export function wakeNodeSilently(baseUrl = import.meta.env.VITE_NODE_URL || 'http://localhost:5000/api') {
  if (sessionStorage.getItem(STORAGE_KEY)) return; // already done this session

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000); // 8 s timeout

  fetch(`${baseUrl}/health`, { signal: controller.signal, cache: 'no-store' })
    .then((r) => {
      if (r.ok) sessionStorage.setItem(STORAGE_KEY, '1');
    })
    .catch(() => {
      /* ignore – server might be sleeping */
    })
    .finally(() => clearTimeout(t));
}