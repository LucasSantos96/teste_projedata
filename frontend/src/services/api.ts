interface ApiErrorData {
  status: number
  message: string
}

export type ApiError = Error & ApiErrorData

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function buildApiError(status: number, message: string): ApiError {
  const error = new Error(message) as ApiError
  error.status = status
  error.message = message
  return error
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const data = payload as Record<string, unknown>
  const directMessage = data.message
  const nestedError = data.error

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage
  }

  if (typeof nestedError === 'string' && nestedError.trim()) {
    return nestedError
  }

  return undefined
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${API_BASE_URL}${normalizedPath}`
  const headers = new Headers(options.headers)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch {
    throw buildApiError(0, 'Unable to connect to the server. Please check the API URL.')
  }

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '')

  if (!response.ok) {
    const messageFromBody =
      typeof payload === 'string' ? payload : extractErrorMessage(payload)
    const message = messageFromBody || `Request failed with status ${response.status}.`
    throw buildApiError(response.status, message)
  }

  return payload as T
}
