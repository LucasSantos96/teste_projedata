import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Table } from '../components/ui/Table'
import type { TableColumn } from '../components/ui/Table'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchProducts } from '../store/products/productsSlice'
import {
  clearCompositionFeedback,
  clearCompositionList,
  createComposition,
  deleteComposition,
  fetchCompositionByProduct,
  updateComposition,
} from '../store/composition/compositionSlice'
import { fetchRawMaterials } from '../store/rawMaterials/rawMaterialsSlice'
import type { ProductComposition, ProductCompositionPayload } from '../types/composition'
import type { RawMaterial } from '../types/rawMaterial'

interface CompositionFormState {
  rawMaterialId: string
  requiredQuantity: string
}

interface CompositionFormErrors {
  rawMaterialId?: string
  requiredQuantity?: string
}

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const initialFormState: CompositionFormState = {
  rawMaterialId: '',
  requiredQuantity: '',
}

function toQuantityNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function validateForm(form: CompositionFormState): CompositionFormErrors {
  const errors: CompositionFormErrors = {}
  const quantity = toQuantityNumber(form.requiredQuantity)

  if (!form.rawMaterialId) {
    errors.rawMaterialId = 'Raw material is required.'
  }

  if (!form.requiredQuantity.trim()) {
    errors.requiredQuantity = 'Required quantity is required.'
  } else if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.requiredQuantity = 'Required quantity must be a valid number greater than zero.'
  }

  return errors
}

export function CompositionPage() {
  const dispatch = useAppDispatch()

  const productsState = useAppSelector((state) => state.products)
  const rawMaterialsState = useAppSelector((state) => state.rawMaterials)
  const compositionState = useAppSelector((state) => state.composition)

  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProductComposition | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ProductComposition | null>(null)
  const [form, setForm] = useState<CompositionFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<CompositionFormErrors>({})

  useEffect(() => {
    void dispatch(fetchProducts())
    void dispatch(fetchRawMaterials())
  }, [dispatch])

  useEffect(() => {
    if (selectedProductId || productsState.items.length === 0) {
      return
    }

    setSelectedProductId(String(productsState.items[0].id))
  }, [productsState.items, selectedProductId])

  useEffect(() => {
    if (!selectedProductId) {
      dispatch(clearCompositionList())
      return
    }

    void dispatch(fetchCompositionByProduct(selectedProductId))
  }, [dispatch, selectedProductId])

  useEffect(() => {
    if (!compositionState.mutationError && !compositionState.mutationSuccess) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch(clearCompositionFeedback())
    }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [compositionState.mutationError, compositionState.mutationSuccess, dispatch])

  const selectedProduct = productsState.items.find(
    (product) => String(product.id) === selectedProductId,
  )

  const availableRawMaterials = useMemo(() => {
    if (!editingItem) {
      const usedRawMaterialIds = new Set(
        compositionState.items.map((item) => String(item.rawMaterialId)),
      )

      return rawMaterialsState.items.filter(
        (rawMaterial) => !usedRawMaterialIds.has(String(rawMaterial.id)),
      )
    }

    return rawMaterialsState.items
  }, [compositionState.items, editingItem, rawMaterialsState.items])

  const handleRetryComposition = () => {
    if (!selectedProductId) {
      return
    }

    void dispatch(fetchCompositionByProduct(selectedProductId))
  }

  const resetForm = () => {
    setForm(initialFormState)
    setFormErrors({})
  }

  const openCreateModal = () => {
    setEditingItem(null)
    resetForm()
    setIsFormModalOpen(true)
  }

  const openEditModal = (item: ProductComposition) => {
    setEditingItem(item)
    setForm({
      rawMaterialId: String(item.rawMaterialId),
      requiredQuantity: String(item.requiredQuantity),
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    if (compositionState.mutationLoading) {
      return
    }

    setIsFormModalOpen(false)
    setEditingItem(null)
    resetForm()
  }

  const openDeleteDialog = (item: ProductComposition) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (compositionState.deletingId !== null) {
      return
    }

    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleChangeField = (field: keyof CompositionFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setFormErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }))
  }

  const resolveRawMaterialId = (rawMaterialId: string): string | number => {
    const foundRawMaterial = rawMaterialsState.items.find(
      (rawMaterial) => String(rawMaterial.id) === rawMaterialId,
    )

    return foundRawMaterial ? foundRawMaterial.id : rawMaterialId
  }

  const handleSubmitForm = async () => {
    if (!selectedProductId) {
      return
    }

    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload: ProductCompositionPayload = {
      rawMaterialId: resolveRawMaterialId(form.rawMaterialId),
      requiredQuantity: toQuantityNumber(form.requiredQuantity),
    }

    try {
      if (editingItem) {
        await dispatch(
          updateComposition({
            productId: selectedProductId,
            compositionId: editingItem.id,
            payload,
          }),
        ).unwrap()
      } else {
        await dispatch(createComposition({ productId: selectedProductId, payload })).unwrap()
      }

      closeFormModal()
    } catch {
      return
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedProductId || !itemToDelete) {
      return
    }

    try {
      await dispatch(
        deleteComposition({
          productId: selectedProductId,
          compositionId: itemToDelete.id,
        }),
      ).unwrap()
      closeDeleteDialog()
    } catch {
      return
    }
  }

  const compositionColumns: TableColumn<ProductComposition>[] = [
    {
      key: 'rawMaterialCode',
      header: 'Raw Material Code',
      className: 'font-medium text-slate-900',
    },
    {
      key: 'rawMaterialName',
      header: 'Raw Material',
    },
    {
      key: 'requiredQuantity',
      header: 'Required Quantity',
      className: 'text-right',
      render: (item) => quantityFormatter.format(item.requiredQuantity),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(item)}
            aria-label={`Edit ${item.rawMaterialName}`}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteDialog(item)}
            aria-label={`Delete ${item.rawMaterialName}`}
            disabled={String(compositionState.deletingId) === String(item.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  const isProductsLoading = productsState.loading
  const isRawMaterialsLoading = rawMaterialsState.loading

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Composition</h1>
        <p className="mt-2 text-sm text-slate-600">
          Associate raw materials to products and manage required quantities for production.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
          <div>
            <label htmlFor="product-select" className="mb-1.5 block text-sm font-medium text-slate-700">
              Select Product
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              disabled={isProductsLoading || productsState.items.length === 0}
            >
              {productsState.items.length === 0 ? (
                <option value="">No products available</option>
              ) : null}
              {productsState.items.map((product) => (
                <option key={product.id} value={String(product.id)}>
                  {product.code} - {product.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            leftIcon={<Plus size={16} aria-hidden="true" />}
            onClick={openCreateModal}
            disabled={!selectedProductId || isRawMaterialsLoading}
          >
            Add Raw Material
          </Button>
        </div>
      </section>

      {productsState.error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">{productsState.error}</p>
            <Button size="sm" variant="danger" onClick={() => void dispatch(fetchProducts())}>
              Retry Products
            </Button>
          </div>
        </section>
      ) : null}

      {rawMaterialsState.error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">{rawMaterialsState.error}</p>
            <Button size="sm" variant="danger" onClick={() => void dispatch(fetchRawMaterials())}>
              Retry Raw Materials
            </Button>
          </div>
        </section>
      ) : null}

      {compositionState.error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">{compositionState.error}</p>
            <Button size="sm" variant="danger" onClick={handleRetryComposition}>
              Retry Composition
            </Button>
          </div>
        </section>
      ) : null}

      {compositionState.mutationError ? (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{compositionState.mutationError}</p>
        </section>
      ) : null}

      {compositionState.mutationSuccess ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-700">{compositionState.mutationSuccess}</p>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Associated Raw Materials</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedProduct
              ? `Managing composition for ${selectedProduct.code} - ${selectedProduct.name}.`
              : 'Select a product to manage composition.'}
          </p>
        </div>

        {compositionState.loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
            Loading composition...
          </div>
        ) : selectedProductId ? (
          <Table
            columns={compositionColumns}
            data={compositionState.items}
            rowKey={(item) => String(item.id)}
            emptyState={
              <EmptyState
                title="No raw materials associated"
                description="Add a raw material to this product composition."
                action={
                  <Button size="sm" onClick={openCreateModal}>
                    Add Raw Material
                  </Button>
                }
              />
            }
          />
        ) : (
          <EmptyState
            title="No product selected"
            description="Select a product above to manage its composition."
          />
        )}
      </section>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingItem ? 'Edit Composition Item' : 'Add Composition Item'}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={closeFormModal} disabled={compositionState.mutationLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForm} isLoading={compositionState.mutationLoading}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="raw-material-select" className="mb-1.5 block text-sm font-medium text-slate-700">
              Raw Material
            </label>
            <select
              id="raw-material-select"
              value={form.rawMaterialId}
              onChange={(event) => handleChangeField('rawMaterialId', event.target.value)}
              className={[
                'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                formErrors.rawMaterialId ? 'border-red-300' : 'border-slate-300',
              ].join(' ')}
            >
              <option value="">Select raw material</option>
              {availableRawMaterials.map((rawMaterial: RawMaterial) => (
                <option key={rawMaterial.id} value={String(rawMaterial.id)}>
                  {rawMaterial.code} - {rawMaterial.name}
                </option>
              ))}
            </select>
            {formErrors.rawMaterialId ? (
              <p className="mt-1 text-xs font-medium text-red-600">{formErrors.rawMaterialId}</p>
            ) : null}
          </div>

          <Input
            label="Required Quantity"
            placeholder="0"
            value={form.requiredQuantity}
            error={formErrors.requiredQuantity}
            onChange={(event) => handleChangeField('requiredQuantity', event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Composition Item"
        description={`Are you sure you want to remove "${itemToDelete?.rawMaterialName ?? 'this item'}" from this product?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={compositionState.deletingId !== null}
        onCancel={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
