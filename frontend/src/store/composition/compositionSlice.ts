import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { create, listByProduct, remove, update } from '../../services/compositionService'
import type { ProductComposition, ProductCompositionPayload } from '../../types/composition'

interface CreateCompositionPayload {
  productId: string | number
  payload: ProductCompositionPayload
}

interface UpdateCompositionPayload {
  productId: string | number
  compositionId: string | number
  payload: ProductCompositionPayload
}

interface DeleteCompositionPayload {
  productId: string | number
  compositionId: string | number
}

interface CompositionState {
  items: ProductComposition[]
  currentProductId: string | number | null
  loading: boolean
  error: string | null
  mutationLoading: boolean
  mutationError: string | null
  mutationSuccess: string | null
  deletingId: string | number | null
}

const initialState: CompositionState = {
  items: [],
  currentProductId: null,
  loading: false,
  error: null,
  mutationLoading: false,
  mutationError: null,
  mutationSuccess: null,
  deletingId: null,
}

function sortCompositionByRawMaterialCode(items: ProductComposition[]): ProductComposition[] {
  return [...items].sort((first, second) =>
    first.rawMaterialCode.localeCompare(second.rawMaterialCode, undefined, {
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

export const fetchCompositionByProduct = createAsyncThunk<
  ProductComposition[],
  string | number,
  { rejectValue: string }
>('composition/fetchByProduct', async (productId, { rejectWithValue }) => {
  try {
    return await listByProduct(productId)
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to load product composition right now. Please try again.'),
    )
  }
})

export const createComposition = createAsyncThunk<
  ProductComposition,
  CreateCompositionPayload,
  { rejectValue: string }
>('composition/create', async ({ productId, payload }, { rejectWithValue }) => {
  try {
    return await create(productId, payload)
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to create composition item right now. Please try again.'),
    )
  }
})

export const updateComposition = createAsyncThunk<
  ProductComposition,
  UpdateCompositionPayload,
  { rejectValue: string }
>('composition/update', async ({ productId, compositionId, payload }, { rejectWithValue }) => {
  try {
    return await update(productId, compositionId, payload)
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to update composition item right now. Please try again.'),
    )
  }
})

export const deleteComposition = createAsyncThunk<
  string | number,
  DeleteCompositionPayload,
  { rejectValue: string }
>('composition/delete', async ({ productId, compositionId }, { rejectWithValue }) => {
  try {
    await remove(productId, compositionId)
    return compositionId
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to delete composition item right now. Please try again.'),
    )
  }
})

const compositionSlice = createSlice({
  name: 'composition',
  initialState,
  reducers: {
    clearCompositionFeedback: (state) => {
      state.mutationError = null
      state.mutationSuccess = null
    },
    clearCompositionList: (state) => {
      state.items = []
      state.currentProductId = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompositionByProduct.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.currentProductId = action.meta.arg
      })
      .addCase(fetchCompositionByProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items = sortCompositionByRawMaterialCode(action.payload)
      })
      .addCase(fetchCompositionByProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unable to load product composition right now. Please try again.'
      })
      .addCase(createComposition.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(createComposition.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortCompositionByRawMaterialCode([action.payload, ...state.items])
        state.mutationSuccess = 'Composition item created successfully.'
      })
      .addCase(createComposition.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError =
          action.payload ?? 'Unable to create composition item right now. Please try again.'
      })
      .addCase(updateComposition.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(updateComposition.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortCompositionByRawMaterialCode(
          state.items.map((item) =>
            String(item.id) === String(action.payload.id) ? action.payload : item,
          ),
        )
        state.mutationSuccess = 'Composition item updated successfully.'
      })
      .addCase(updateComposition.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError =
          action.payload ?? 'Unable to update composition item right now. Please try again.'
      })
      .addCase(deleteComposition.pending, (state, action) => {
        state.deletingId = action.meta.arg.compositionId
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(deleteComposition.fulfilled, (state, action) => {
        state.deletingId = null
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload))
        state.mutationSuccess = 'Composition item deleted successfully.'
      })
      .addCase(deleteComposition.rejected, (state, action) => {
        state.deletingId = null
        state.mutationError =
          action.payload ?? 'Unable to delete composition item right now. Please try again.'
      })
  },
})

export const { clearCompositionFeedback, clearCompositionList } = compositionSlice.actions
export const compositionReducer = compositionSlice.reducer
