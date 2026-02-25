import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T, index: number) => string
  emptyState?: ReactNode
  className?: string
}

function getCellValue<T>(row: T, key: keyof T | string): ReactNode {
  const value = row[key as keyof T] as ReactNode

  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return value
}

export function Table<T>({ columns, data, rowKey, emptyState, className = '' }: TableProps<T>) {
  return (
    <div className={['overflow-hidden rounded-lg border border-slate-200 bg-white', className].join(' ')}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                    column.className ?? '',
                  ].join(' ')}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length > 0
              ? data.map((row, index) => (
                  <tr key={rowKey(row, index)} className="hover:bg-slate-50">
                    {columns.map((column) => (
                      <td key={column.header} className={['px-4 py-3 text-slate-700', column.className ?? ''].join(' ')}>
                        {column.render ? column.render(row) : getCellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                    {emptyState ?? 'No data available.'}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
