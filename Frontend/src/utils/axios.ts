const baseURL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  'http://localhost:5000/api';

type RequestOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
};

const request = async (path: string, options: RequestOptions = {}) => {
  const url = new URL(path, baseURL.endsWith('/') ? baseURL : `${baseURL}/`);

  Object.entries(options.params || {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    ...options,
    body: options.data === undefined ? undefined : JSON.stringify(options.data),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), { response, data });
  }

  return { data, status: response.status, headers: response.headers };
};

export const api = {
  get: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'GET' }),
  delete: (path: string, options?: RequestOptions) => request(path, { ...options, method: 'DELETE' }),
  post: (path: string, data?: unknown, options?: RequestOptions) => request(path, { ...options, method: 'POST', data }),
  put: (path: string, data?: unknown, options?: RequestOptions) => request(path, { ...options, method: 'PUT', data }),
  patch: (path: string, data?: unknown, options?: RequestOptions) => request(path, { ...options, method: 'PATCH', data }),
};