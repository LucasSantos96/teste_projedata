import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getSuggestions } from '../../services/productionService'
import type { ProductionSummary } from '../../types/production'

interface ProductionState extends ProductionSummary {
  loading: boolean
  error: string | null
}

const initialState: ProductionState = {
  suggestions: [],
  grandTotalValue: 0,
  totalProductsAnalyzed: 0,
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

  return 'Unable to load production suggestions right now. Please try again.'
}

export const fetchProductionSuggestions = createAsyncThunk<
  ProductionSummary,
  void,
  { rejectValue: string }
>('production/fetchProductionSuggestions', async (_, { rejectWithValue }) => {
  try {
    return await getSuggestions()
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionSuggestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductionSuggestions.fulfilled, (state, action) => {
        state.loading = false
        state.suggestions = action.payload.suggestions
        state.grandTotalValue = action.payload.grandTotalValue
        state.totalProductsAnalyzed = action.payload.totalProductsAnalyzed
      })
      .addCase(fetchProductionSuggestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unable to load production suggestions right now. Please try again.'
      })
  },
})

export const productionReducer = productionSlice.reducer
