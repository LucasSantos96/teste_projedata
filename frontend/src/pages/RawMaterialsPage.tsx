import { useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchRawMaterials } from '../store/rawMaterials/rawMaterialsSlice'
import type { RawMaterial } from '../types/rawMaterial'

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const rawMaterialColumns: TableColumn<RawMaterial>[] = [
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
    key: 'stockQuantity',
    header: 'Stock',
    className: 'text-right',
    render: (rawMaterial) => quantityFormatter.format(rawMaterial.stockQuantity),
  },
]

export function RawMaterialsPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector((state) => state.rawMaterials)

  useEffect(() => {
    void dispatch(fetchRawMaterials())
  }, [dispatch])

  const handleRetry = () => {
    void dispatch(fetchRawMaterials())
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Raw Materials</h1>
        <p className="mt-2 text-sm text-slate-600">
          Raw materials loaded from API and managed through Redux global state.
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
          <h2 className="text-lg font-semibold text-slate-900">Material List</h2>
          <p className="mt-1 text-sm text-slate-500">Code, name and stock quantity from backend endpoint.</p>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Loading raw materials...
          </div>
        ) : (
          <Table
            columns={rawMaterialColumns}
            data={items}
            rowKey={(item) => String(item.id)}
            emptyState={
              <EmptyState
                title="No raw materials available"
                description="No records were returned by the raw materials endpoint."
              />
            }
          />
        )}
      </section>
    </div>
  )
}
