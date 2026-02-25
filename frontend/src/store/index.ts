import { configureStore } from '@reduxjs/toolkit'
import { productsReducer } from './products/productsSlice'
import { productionReducer } from './production/productionSlice'
import { rawMaterialsReducer } from './rawMaterials/rawMaterialsSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    rawMaterials: rawMaterialsReducer,
    production: productionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
