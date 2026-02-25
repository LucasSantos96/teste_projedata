import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearRawMaterialsFeedback,
  createRawMaterial,
  deleteRawMaterial,
  fetchRawMaterials,
  updateRawMaterial,
} from '../store/rawMaterials/rawMaterialsSlice'
import type { RawMaterial, RawMaterialPayload } from '../types/rawMaterial'

interface RawMaterialFormState {
  code: string
  name: string
  stockQuantity: string
}

interface RawMaterialFormErrors {
  code?: string
  name?: string
  stockQuantity?: string
}

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const initialFormState: RawMaterialFormState = {
  code: '',
  name: '',
  stockQuantity: '',
}

function toQuantityNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function buildPayload(form: RawMaterialFormState): RawMaterialPayload {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    stockQuantity: toQuantityNumber(form.stockQuantity),
  }
}

function validateForm(form: RawMaterialFormState): RawMaterialFormErrors {
  const errors: RawMaterialFormErrors = {}
  const quantity = toQuantityNumber(form.stockQuantity)

  if (!form.code.trim()) {
    errors.code = 'Raw material code is required.'
  }

  if (!form.name.trim()) {
    errors.name = 'Raw material name is required.'
  }

  if (!form.stockQuantity.trim()) {
    errors.stockQuantity = 'Stock quantity is required.'
  } else if (!Number.isFinite(quantity) || quantity < 0) {
    errors.stockQuantity = 'Stock quantity must be a valid number greater than or equal to zero.'
  }

  return errors
}

export function RawMaterialsPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error, mutationLoading, mutationError, mutationSuccess, deletingId } =
    useAppSelector((state) => state.rawMaterials)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingRawMaterial, setEditingRawMaterial] = useState<RawMaterial | null>(null)
  const [rawMaterialToDelete, setRawMaterialToDelete] = useState<RawMaterial | null>(null)
  const [form, setForm] = useState<RawMaterialFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<RawMaterialFormErrors>({})

  useEffect(() => {
    void dispatch(fetchRawMaterials())
  }, [dispatch])

  useEffect(() => {
    if (!mutationError && !mutationSuccess) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch(clearRawMaterialsFeedback())
    }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [dispatch, mutationError, mutationSuccess])

  const handleRetry = () => {
    void dispatch(fetchRawMaterials())
  }

  const resetForm = () => {
    setForm(initialFormState)
    setFormErrors({})
  }

  const openCreateModal = () => {
    setEditingRawMaterial(null)
    resetForm()
    setIsFormModalOpen(true)
  }

  const openEditModal = (rawMaterial: RawMaterial) => {
    setEditingRawMaterial(rawMaterial)
    setForm({
      code: rawMaterial.code,
      name: rawMaterial.name,
      stockQuantity: String(rawMaterial.stockQuantity),
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    if (mutationLoading) {
      return
    }

    setIsFormModalOpen(false)
    setEditingRawMaterial(null)
    resetForm()
  }

  const openDeleteDialog = (rawMaterial: RawMaterial) => {
    setRawMaterialToDelete(rawMaterial)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (deletingId !== null) {
      return
    }

    setIsDeleteDialogOpen(false)
    setRawMaterialToDelete(null)
  }

  const handleChangeField = (field: keyof RawMaterialFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setFormErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }))
  }

  const handleSubmitForm = async () => {
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = buildPayload(form)

    try {
      if (editingRawMaterial) {
        await dispatch(updateRawMaterial({ id: editingRawMaterial.id, payload })).unwrap()
      } else {
        await dispatch(createRawMaterial(payload)).unwrap()
      }

      closeFormModal()
    } catch {
      return
    }
  }

  const handleConfirmDelete = async () => {
    if (!rawMaterialToDelete) {
      return
    }

    try {
      await dispatch(deleteRawMaterial(rawMaterialToDelete.id)).unwrap()
      closeDeleteDialog()
    } catch {
      return
    }
  }

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
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (rawMaterial) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(rawMaterial)}
            aria-label={`Edit ${rawMaterial.name}`}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteDialog(rawMaterial)}
            aria-label={`Delete ${rawMaterial.name}`}
            disabled={String(deletingId) === String(rawMaterial.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  const formModalTitle = editingRawMaterial ? 'Edit Raw Material' : 'Create Raw Material'
  const formModalActionLabel = editingRawMaterial ? 'Save Changes' : 'Create Raw Material'

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Raw Materials</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage raw materials with create, update and delete operations integrated with API.
            </p>
          </div>
          <Button leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openCreateModal}>
            New Raw Material
          </Button>
        </div>
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

      {mutationError ? (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{mutationError}</p>
        </section>
      ) : null}

      {mutationSuccess ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{mutationSuccess}</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Raw Material List</h2>
          <p className="mt-1 text-sm text-slate-500">
            List of registered raw materials with inline actions for editing and deletion.
          </p>
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
                description="Create your first raw material to populate the list."
                action={
                  <Button size="sm" onClick={openCreateModal}>
                    Create Raw Material
                  </Button>
                }
              />
            }
          />
        )}
      </section>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={formModalTitle}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={closeFormModal} disabled={mutationLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForm} isLoading={mutationLoading}>
              {formModalActionLabel}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Raw Material Code"
            placeholder="RM-001"
            value={form.code}
            error={formErrors.code}
            onChange={(event) => handleChangeField('code', event.target.value)}
          />
          <Input
            label="Raw Material Name"
            placeholder="Steel Sheet"
            value={form.name}
            error={formErrors.name}
            onChange={(event) => handleChangeField('name', event.target.value)}
          />
          <Input
            label="Stock Quantity"
            placeholder="0"
            value={form.stockQuantity}
            error={formErrors.stockQuantity}
            onChange={(event) => handleChangeField('stockQuantity', event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Raw Material"
        description={`Are you sure you want to delete "${rawMaterialToDelete?.name ?? 'this raw material'}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deletingId !== null}
        onCancel={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
