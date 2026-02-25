import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from './api'

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

describe('apiRequest', () => {
  it('calls API with default headers and returns parsed JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse([{ id: 1, code: 'PRD-001', name: 'Mouse', price: 149.97 }]))

    vi.stubGlobal('fetch', fetchMock)

    const result = await apiRequest<unknown[]>('/products')
    expect(Array.isArray(result)).toBe(true)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/products',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )

    const options = fetchMock.mock.calls[0][1] as RequestInit
    const headers = options.headers as Headers
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('throws mapped error for non-success HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { message: 'Cannot delete raw material linked to composition.' },
          { status: 409 },
        ),
      ),
    )

    await expect(apiRequest('/raw-materials/1', { method: 'DELETE' })).rejects.toMatchObject({
      status: 409,
      message: 'Cannot delete raw material linked to composition.',
    })
  })

  it('throws connection error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')))

    await expect(apiRequest('/products')).rejects.toMatchObject({
      status: 0,
      message: 'Unable to connect to the server. Please check the API URL.',
    })
  })
})
