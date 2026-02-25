import { EmptyState } from '../components/ui/EmptyState'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'

interface ProductionRow {
  product: string
  quantity: string
  status: string
}

const productionColumns: TableColumn<ProductionRow>[] = [
  { key: 'product', header: 'Product' },
  { key: 'quantity', header: 'Planned Quantity' },
  { key: 'status', header: 'Status' },
]

export function ProductionPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Production</h1>
        <p className="mt-2 text-sm text-slate-600">
          Prepare production planning view with responsive placeholders for list and summary blocks.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Coming next: CRUD
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Production Table Placeholder</h2>
            <p className="mt-1 text-sm text-slate-500">
              This area will host feasibility rows and scheduling actions.
            </p>
          </div>

          <Table
            columns={productionColumns}
            data={[]}
            rowKey={(_, index) => `production-row-${index}`}
            emptyState={
              <EmptyState
                title="No production plans yet"
                description="Rows will appear here after CRUD and API integration."
              />
            }
          />
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">Summary Cards Placeholder</h2>
            <p className="mt-1 text-sm text-slate-500">
              KPI cards will be loaded with real feasibility indicators.
            </p>
            <div className="mt-4">
              <EmptyState
                title="No summary data"
                description="Summary blocks will be connected to production services."
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next Scope</h3>
            <p className="mt-2 text-sm text-slate-700">
              Create, edit, and schedule production plans with stock constraints.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
