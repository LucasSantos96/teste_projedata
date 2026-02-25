import { useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return []
  }

  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (element) => !element.hasAttribute('disabled'),
  )
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useMemo(() => `modal-title-${Math.random().toString(16).slice(2, 10)}`, [])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = getFocusableElements(modalRef.current)
    focusables[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const items = getFocusableElements(modalRef.current)
      if (items.length === 0) {
        return
      }

      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }

      if (event.shiftKey && activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-slate-950/40" />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
