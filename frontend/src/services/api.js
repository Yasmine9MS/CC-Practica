const API_URL = ''

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken')
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    cache: options.cache ?? 'no-store',
    headers,
  })

  const data = response.status === 204
    ? null
    : await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      (response.status === 401
        ? 'La sesión no es válida. Inicia sesión de nuevo.'
        : `Error en la petición (${response.status})`)
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return data
}

export function clearSession() {
  localStorage.removeItem('accessToken')
}
