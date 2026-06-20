export async function apiFetch(path, options = {}) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const useBackend = import.meta.env.VITE_USE_BACKEND === 'true' || Boolean(apiBaseUrl);

  if (path.startsWith('/api') && !useBackend) {
    throw new Error('Backend API disabled for static deployment');
  }

  const url = apiBaseUrl ? `${apiBaseUrl}${path}` : path;
  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
