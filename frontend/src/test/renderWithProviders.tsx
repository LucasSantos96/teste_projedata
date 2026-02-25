import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { compositionReducer } from '../store/composition/compositionSlice'
import { productsReducer } from '../store/products/productsSlice'
import { productionReducer } from '../store/production/productionSlice'
import { rawMaterialsReducer } from '../store/rawMaterials/rawMaterialsSlice'

export function createTestStore() {
  return configureStore({
    reducer: {
      products: productsReducer,
      rawMaterials: rawMaterialsReducer,
      production: productionReducer,
      composition: compositionReducer,
    },
  })
}

interface RenderOptions {
  route?: string
}

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const { route = '/' } = options
  const store = createTestStore()

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  }
}
