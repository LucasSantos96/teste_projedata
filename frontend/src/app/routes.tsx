import { Navigate, useRoutes } from 'react-router-dom'
import { AppLayout } from '../layout/AppLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductionPage } from '../pages/ProductionPage'
import { ProductsPage } from '../pages/ProductsPage'
import { RawMaterialsPage } from '../pages/RawMaterialsPage'

export function AppRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Navigate to="/products" replace /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'raw-materials', element: <RawMaterialsPage /> },
        { path: 'production', element: <ProductionPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ])
}
