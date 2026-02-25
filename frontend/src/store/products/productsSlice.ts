import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { create, list, remove, update } from '../../services/productsService'
import type { Product, ProductPayload } from '../../types/product'

interface UpdateProductPayload {
  id: Product['id']
  payload: ProductPayload
}

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null
  mutationLoading: boolean
  mutationError: string | null
  mutationSuccess: string | null
  deletingId: Product['id'] | null
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  mutationLoading: false,
  mutationError: null,
  mutationSuccess: null,
  deletingId: null,
}

function sortProductsByCodeAscending(products: Product[]): Product[] {
  return [...products].sort((first, second) =>
    first.code.localeCompare(second.code, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await list()
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to load products right now. Please try again.'),
      )
    }
  },
)

export const createProduct = createAsyncThunk<Product, ProductPayload, { rejectValue: string }>(
  'products/createProduct',
  async (payload, { rejectWithValue }) => {
    try {
      return await create(payload)
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to create product right now. Please try again.'),
      )
    }
  },
)

export const updateProduct = createAsyncThunk<Product, UpdateProductPayload, { rejectValue: string }>(
  'products/updateProduct',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await update(id, payload)
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to update product right now. Please try again.'),
      )
    }
  },
)

export const deleteProduct = createAsyncThunk<Product['id'], Product['id'], { rejectValue: string }>(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await remove(id)
      return id
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to delete product right now. Please try again.'),
      )
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsFeedback: (state) => {
      state.mutationError = null
      state.mutationSuccess = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = sortProductsByCodeAscending(action.payload)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unable to load products right now. Please try again.'
      })
      .addCase(createProduct.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortProductsByCodeAscending([action.payload, ...state.items])
        state.mutationSuccess = 'Product created successfully.'
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload ?? 'Unable to create product right now. Please try again.'
      })
      .addCase(updateProduct.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortProductsByCodeAscending(
          state.items.map((item) =>
            String(item.id) === String(action.payload.id) ? action.payload : item,
          ),
        )
        state.mutationSuccess = 'Product updated successfully.'
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload ?? 'Unable to update product right now. Please try again.'
      })
      .addCase(deleteProduct.pending, (state, action) => {
        state.deletingId = action.meta.arg
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deletingId = null
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload))
        state.mutationSuccess = 'Product deleted successfully.'
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deletingId = null
        state.mutationError = action.payload ?? 'Unable to delete product right now. Please try again.'
      })
  },
})

export const { clearProductsFeedback } = productsSlice.actions
export const productsReducer = productsSlice.reducer
