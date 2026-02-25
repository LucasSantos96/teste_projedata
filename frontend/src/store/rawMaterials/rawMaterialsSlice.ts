import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { list } from '../../services/rawMaterialsService'
import type { RawMaterial } from '../../types/rawMaterial'

interface RawMaterialsState {
  items: RawMaterial[]
  loading: boolean
  error: string | null
}

const initialState: RawMaterialsState = {
  items: [],
  loading: false,
  error: null,
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return 'Unable to load raw materials right now. Please try again.'
}

export const fetchRawMaterials = createAsyncThunk<RawMaterial[], void, { rejectValue: string }>(
  'rawMaterials/fetchRawMaterials',
  async (_, { rejectWithValue }) => {
    try {
      return await list()
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMaterials.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unable to load raw materials right now. Please try again.'
      })
  },
})

export const rawMaterialsReducer = rawMaterialsSlice.reducer
