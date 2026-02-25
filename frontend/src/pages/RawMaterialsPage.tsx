import { useState } from 'react'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'

export function RawMaterialsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Raw Materials</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track inventory inputs and standardize the base structure before CRUD integration.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Coming next: CRUD
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 max-w-md">
          <Input
            label="Search materials"
            placeholder="Type code or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            hint="Search is a placeholder for now."
          />
        </div>

        <EmptyState
          title="No raw materials to show"
          description="Material listing and stock actions will be added in the next CRUD step."
        />
      </section>
    </div>
  )
}
