import { useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProductionSuggestions } from '../store/production/productionSlice'
import type { ProductionSuggestion } from '../types/production'
import { formatCurrencyBRL } from '../utils/format'

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const productionColumns: TableColumn<ProductionSuggestion>[] = [
  {
    key: 'productName',
    header: 'Product',
    render: (suggestion) => (
      <div>
        <p className="font-medium text-slate-900">{suggestion.productName}</p>
        <p className="text-xs text-slate-500">{suggestion.productCode}</p>
      </div>
    ),
  },
  {
    key: 'productPrice',
    header: 'Price',
    className: 'text-right',
    render: (suggestion) => formatCurrencyBRL(suggestion.productPrice),
  },
  {
    key: 'producibleQuantity',
    header: 'Producible Qty',
    className: 'text-right',
    render: (suggestion) => quantityFormatter.format(suggestion.producibleQuantity),
  },
  {
    key: 'totalValue',
    header: 'Total Value',
    className: 'text-right font-semibold text-slate-900',
    render: (suggestion) => formatCurrencyBRL(suggestion.totalValue),
  },
]

export function ProductionPage() {
  const dispatch = useAppDispatch()
  const { suggestions, grandTotalValue, totalProductsAnalyzed, loading, error } = useAppSelector(
    (state) => state.production,
  )

  useEffect(() => {
    void dispatch(fetchProductionSuggestions())
  }, [dispatch])

  const handleRetry = () => {
    void dispatch(fetchProductionSuggestions())
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Production</h1>
        <p className="mt-2 text-sm text-slate-600">
          Production suggestions loaded through Redux with summary and table views.
        </p>
      </header>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button size="sm" variant="danger" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Production Suggestions</h2>
            <p className="mt-1 text-sm text-slate-500">Backend response with producible quantity and value.</p>
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              Loading production suggestions...
            </div>
          ) : (
            <Table
              columns={productionColumns}
              data={suggestions}
              rowKey={(item, index) => `${item.productId}-${index}`}
              emptyState={
                <EmptyState
                  title="No production suggestions available"
                  description="No records were returned by the production suggestions endpoint."
                />
              }
            />
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Grand Total Value</h2>
            {loading ? (
              <p className="mt-3 text-sm text-slate-500">Loading summary...</p>
            ) : (
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {formatCurrencyBRL(grandTotalValue)}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">Total value based on current production suggestions.</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Products Analyzed</h3>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {loading ? '-' : totalProductsAnalyzed || suggestions.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">Total products analyzed by the backend rules.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
