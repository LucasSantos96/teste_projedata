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
  clearProductsFeedback,
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../store/products/productsSlice'
import type { Product, ProductPayload } from '../types/product'
import { formatCurrencyBRL } from '../utils/format'

interface ProductFormState {
  code: string
  name: string
  price: string
}

interface ProductFormErrors {
  code?: string
  name?: string
  price?: string
}

const initialFormState: ProductFormState = {
  code: '',
  name: '',
  price: '',
}

function toPriceNumber(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function buildPayload(form: ProductFormState): ProductPayload {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    price: toPriceNumber(form.price),
  }
}

function validateForm(form: ProductFormState): ProductFormErrors {
  const errors: ProductFormErrors = {}
  const price = toPriceNumber(form.price)

  if (!form.code.trim()) {
    errors.code = 'Product code is required.'
  }

  if (!form.name.trim()) {
    errors.name = 'Product name is required.'
  }

  if (!form.price.trim()) {
    errors.price = 'Price is required.'
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = 'Price must be a valid number greater than or equal to zero.'
  }

  return errors
}

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error, mutationLoading, mutationError, mutationSuccess, deletingId } =
    useAppSelector((state) => state.products)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({})

  useEffect(() => {
    void dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (!mutationError && !mutationSuccess) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch(clearProductsFeedback())
    }, 4000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [dispatch, mutationError, mutationSuccess])

  const handleRetry = () => {
    void dispatch(fetchProducts())
  }

  const resetForm = () => {
    setForm(initialFormState)
    setFormErrors({})
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    resetForm()
    setIsFormModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      code: product.code,
      name: product.name,
      price: String(product.price),
    })
    setFormErrors({})
    setIsFormModalOpen(true)
  }

  const closeFormModal = () => {
    if (mutationLoading) {
      return
    }

    setIsFormModalOpen(false)
    setEditingProduct(null)
    resetForm()
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (deletingId !== null) {
      return
    }

    setIsDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const handleChangeField = (field: keyof ProductFormState, value: string) => {
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
      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, payload })).unwrap()
      } else {
        await dispatch(createProduct(payload)).unwrap()
      }

      closeFormModal()
    } catch {
      return
    }
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) {
      return
    }

    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap()
      closeDeleteDialog()
    } catch {
      return
    }
  }

  const formModalTitle = editingProduct ? 'Edit Product' : 'Create Product'
  const formModalActionLabel = editingProduct ? 'Save Changes' : 'Create Product'
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
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(product)}
            aria-label={`Edit ${product.name}`}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteDialog(product)}
            aria-label={`Delete ${product.name}`}
            disabled={String(deletingId) === String(product.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage product records with create, update, and delete actions.
            </p>
          </div>
          <Button leftIcon={<Plus size={16} aria-hidden="true" />} onClick={openCreateModal}>
            New Product
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
          <h2 className="text-lg font-semibold text-slate-900">Product List</h2>
          <p className="mt-1 text-sm text-slate-500">
            List of registered products with inline actions for editing and deletion.
          </p>
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
                description="Create your first product to populate the list."
                action={
                  <Button size="sm" onClick={openCreateModal}>
                    Create Product
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
            label="Product Code"
            placeholder="PRD-001"
            value={form.code}
            error={formErrors.code}
            onChange={(event) => handleChangeField('code', event.target.value)}
          />
          <Input
            label="Product Name"
            placeholder="Hydraulic Pump"
            value={form.name}
            error={formErrors.name}
            onChange={(event) => handleChangeField('name', event.target.value)}
          />
          <Input
            label="Price"
            placeholder="0.00"
            value={form.price}
            error={formErrors.price}
            onChange={(event) => handleChangeField('price', event.target.value)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name ?? 'this product'}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deletingId !== null}
        onCancel={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
