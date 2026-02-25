import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'

export function ProductsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [nameError, setNameError] = useState('')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const resetForm = () => {
    setProductCode('')
    setProductName('')
    setNameError('')
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    resetForm()
  }

  const handleSaveDraft = () => {
    if (!productName.trim()) {
      setNameError('Product name is required.')
      return
    }

    setAlertMessage(`Draft "${productName}" saved locally.`)
    closeCreateModal()
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage product records and prepare structure for upcoming CRUD operations.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Coming next: CRUD
        </p>
      </header>

      {alertMessage ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {alertMessage}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Placeholder Content</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(true)}>
              Open Confirm Dialog
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>Open Create Modal</Button>
          </div>
        </div>

        <EmptyState
          title="No products loaded yet"
          description="Product list and filters will be connected in the next development step."
        />
      </section>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create Product Draft"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveDraft}>Save Draft</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Code"
            placeholder="PRD-000"
            value={productCode}
            onChange={(event) => setProductCode(event.target.value)}
          />
          <Input
            label="Product Name"
            placeholder="Industrial Pump"
            value={productName}
            error={nameError}
            onChange={(event) => {
              setProductName(event.target.value)
              if (nameError) {
                setNameError('')
              }
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Clear local placeholder state?"
        description="This action only clears the temporary success message from this page."
        confirmLabel="Clear"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setAlertMessage(null)
          setIsConfirmOpen(false)
        }}
      />
    </div>
  )
}
