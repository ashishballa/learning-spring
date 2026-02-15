const LOG_ENDPOINT = '/api/frontend-logs';

export function logEvent(action, component, details = '') {
  fetch(LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, component, details, timestamp: new Date().toISOString() }),
  }).catch(() => {});
}
