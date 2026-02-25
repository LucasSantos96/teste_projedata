import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProductsPage } from './ProductsPage'
import { renderWithProviders } from '../test/renderWithProviders'

function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

describe('ProductsPage integration', () => {
  it('loads products and renders them sorted by code ascending', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        { id: 10, code: 'PRD-10', name: 'Motor', price: 1200 },
        { id: 1, code: 'PRD-1', name: 'Sensor', price: 90 },
        { id: 2, code: 'PRD-2', name: 'Pump', price: 450 },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithProviders(<ProductsPage />, { route: '/products' })

    expect(await screen.findByText('PRD-1')).toBeInTheDocument()
    expect(screen.getByText('PRD-2')).toBeInTheDocument()
    expect(screen.getByText('PRD-10')).toBeInTheDocument()

    const tableText = screen.getByRole('table').textContent ?? ''
    expect(tableText.indexOf('PRD-1')).toBeLessThan(tableText.indexOf('PRD-2'))
    expect(tableText.indexOf('PRD-2')).toBeLessThan(tableText.indexOf('PRD-10'))
  })

  it('shows an error and retries loading when retry is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ message: 'Temporary API error.' }, { status: 500 }),
      )
      .mockResolvedValueOnce(
        jsonResponse([{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]),
      )
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderWithProviders(<ProductsPage />, { route: '/products' })

    expect(await screen.findByText('Temporary API error.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(await screen.findByText('PRD-001')).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })
})
