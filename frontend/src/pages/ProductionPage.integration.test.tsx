import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProductionPage } from './ProductionPage'
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

describe('ProductionPage integration', () => {
  it('loads suggestions and renders summary values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          suggestions: [
            {
              productId: 1,
              productCode: 'PRD-001',
              productName: 'Mouse Gamer',
              productPrice: 149.97,
              maxProducibleQuantity: 2,
              totalValue: 299.94,
            },
          ],
          grandTotalValue: 299.94,
          totalProductsAnalyzed: 5,
        }),
      ),
    )

    renderWithProviders(<ProductionPage />, { route: '/production' })

    expect(await screen.findByText('Mouse Gamer')).toBeInTheDocument()
    expect(screen.getByText('PRD-001')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getAllByText(/R\$\s?299,94/).length).toBeGreaterThan(0)
  })

  it('renders empty state when no suggestions are returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          suggestions: [],
          grandTotalValue: 0,
          totalProductsAnalyzed: 0,
        }),
      ),
    )

    renderWithProviders(<ProductionPage />, { route: '/production' })

    expect(await screen.findByText('No production suggestions available')).toBeInTheDocument()
  })
})
