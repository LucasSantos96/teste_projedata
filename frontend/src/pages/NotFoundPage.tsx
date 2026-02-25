import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The requested route does not exist in this frontend workspace.
      </p>
      <div className="mt-6 flex justify-center">
        <Button onClick={() => navigate('/products')}>Go to Products</Button>
      </div>
    </section>
  )
}
