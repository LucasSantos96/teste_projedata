import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export function Input({
  id,
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={helperId}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
          'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          error ? 'border-red-300' : 'border-slate-300',
          className,
        ].join(' ')}
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
