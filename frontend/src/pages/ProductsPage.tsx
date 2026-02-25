import { useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProducts } from '../store/products/productsSlice'
import type { Product } from '../types/product'
import { formatCurrencyBRL } from '../utils/format'

const productColumns: TableColumn<Product>[] = [
  {
    key: 'code',
    header: 'Code',
    className: 'font-medium text-slate-900',
  },
  {
    key: 'name',
    header: 'Name',
  },
  {
    key: 'price',
    header: 'Price',
    className: 'text-right',
    render: (product) => formatCurrencyBRL(product.price),
  },
]

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.products)

  useEffect(() => {
    void dispatch(fetchProducts())
  }, [dispatch])

  const handleRetry = () => {
    void dispatch(fetchProducts())
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <p className="mt-2 text-sm text-slate-600">
          Products loaded from API with centralized data flow through Redux Toolkit.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Coming next: CRUD
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

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Product List</h2>
          <p className="mt-1 text-sm text-slate-500">Code, name and current price from backend endpoint.</p>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Loading products...
          </div>
        ) : (
          <Table
            columns={productColumns}
            data={items}
            rowKey={(item) => String(item.id)}
            emptyState={
              <EmptyState
                title="No products available"
                description="No records were returned by the products endpoint."
              />
            }
          />
        )}
      </section>
    </div>
  )
}
