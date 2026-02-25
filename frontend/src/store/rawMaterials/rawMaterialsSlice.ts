import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { ApiError } from '../../services/api'
import { create, list, remove, update } from '../../services/rawMaterialsService'
import type { RawMaterial, RawMaterialPayload } from '../../types/rawMaterial'

interface UpdateRawMaterialPayload {
  id: RawMaterial['id']
  payload: RawMaterialPayload
}

interface RawMaterialsState {
  items: RawMaterial[]
  loading: boolean
  error: string | null
  mutationLoading: boolean
  mutationError: string | null
  mutationSuccess: string | null
  deletingId: RawMaterial['id'] | null
}

const initialState: RawMaterialsState = {
  items: [],
  loading: false,
  error: null,
  mutationLoading: false,
  mutationError: null,
  mutationSuccess: null,
  deletingId: null,
}

function sortRawMaterialsByCodeAscending(rawMaterials: RawMaterial[]): RawMaterial[] {
  return [...rawMaterials].sort((first, second) =>
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

function getDeleteErrorMessage(error: unknown): string {
  const defaultMessage = 'Unable to delete raw material right now. Please try again.'

  if (!error || typeof error !== 'object') {
    return defaultMessage
  }

  const apiError = error as Partial<ApiError>
  const status = typeof apiError.status === 'number' ? apiError.status : null
  const message = typeof apiError.message === 'string' ? apiError.message : ''

  if (status === 500 || status === 409) {
    return 'Unable to delete raw material because it is linked to product composition. Remove the associations first.'
  }

  return message.trim() ? message : defaultMessage
}

export const fetchRawMaterials = createAsyncThunk<RawMaterial[], void, { rejectValue: string }>(
  'rawMaterials/fetchRawMaterials',
  async (_, { rejectWithValue }) => {
    try {
      return await list()
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to load raw materials right now. Please try again.'),
      )
    }
  },
)

export const createRawMaterial = createAsyncThunk<
  RawMaterial,
  RawMaterialPayload,
  { rejectValue: string }
>('rawMaterials/createRawMaterial', async (payload, { rejectWithValue }) => {
  try {
    return await create(payload)
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to create raw material right now. Please try again.'),
    )
  }
})

export const updateRawMaterial = createAsyncThunk<
  RawMaterial,
  UpdateRawMaterialPayload,
  { rejectValue: string }
>('rawMaterials/updateRawMaterial', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await update(id, payload)
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, 'Unable to update raw material right now. Please try again.'),
    )
  }
})

export const deleteRawMaterial = createAsyncThunk<
  RawMaterial['id'],
  RawMaterial['id'],
  { rejectValue: string }
>('rawMaterials/deleteRawMaterial', async (id, { rejectWithValue }) => {
  try {
    await remove(id)
    return id
  } catch (error) {
    return rejectWithValue(getDeleteErrorMessage(error))
  }
})

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState,
  reducers: {
    clearRawMaterialsFeedback: (state) => {
      state.mutationError = null
      state.mutationSuccess = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMaterials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.items = sortRawMaterialsByCodeAscending(action.payload)
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unable to load raw materials right now. Please try again.'
      })
      .addCase(createRawMaterial.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(createRawMaterial.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortRawMaterialsByCodeAscending([action.payload, ...state.items])
        state.mutationSuccess = 'Raw material created successfully.'
      })
      .addCase(createRawMaterial.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload ?? 'Unable to create raw material right now. Please try again.'
      })
      .addCase(updateRawMaterial.pending, (state) => {
        state.mutationLoading = true
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = sortRawMaterialsByCodeAscending(
          state.items.map((item) =>
            String(item.id) === String(action.payload.id) ? action.payload : item,
          ),
        )
        state.mutationSuccess = 'Raw material updated successfully.'
      })
      .addCase(updateRawMaterial.rejected, (state, action) => {
        state.mutationLoading = false
        state.mutationError = action.payload ?? 'Unable to update raw material right now. Please try again.'
      })
      .addCase(deleteRawMaterial.pending, (state, action) => {
        state.deletingId = action.meta.arg
        state.mutationError = null
        state.mutationSuccess = null
      })
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.deletingId = null
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload))
        state.mutationSuccess = 'Raw material deleted successfully.'
      })
      .addCase(deleteRawMaterial.rejected, (state, action) => {
        state.deletingId = null
        state.mutationError = action.payload ?? 'Unable to delete raw material right now. Please try again.'
      })
  },
})

export const { clearRawMaterialsFeedback } = rawMaterialsSlice.actions
export const rawMaterialsReducer = rawMaterialsSlice.reducer
