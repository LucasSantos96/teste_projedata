import { configureStore } from '@reduxjs/toolkit'
import { compositionReducer } from './composition/compositionSlice'
import { productsReducer } from './products/productsSlice'
import { productionReducer } from './production/productionSlice'
import { rawMaterialsReducer } from './rawMaterials/rawMaterialsSlice'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    rawMaterials: rawMaterialsReducer,
    production: productionReducer,
    composition: compositionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
