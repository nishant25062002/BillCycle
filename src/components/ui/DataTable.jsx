import React from 'react'
import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

/**
 * DataTable — shared primitive table shell.
 *
 * Props
 * ─────
 * columns   {Array}   Required. Array of column descriptor objects:
 *   {
 *     key      {string}   Unique key (used as React key)
 *     header   {string}   Column header label
 *     render   {fn}       (row, index) => ReactNode — cell content
 *     className{string?}  Extra <td> className
 *     thClass  {string?}  Extra <th> className
 *     align    {'left'|'center'|'right'}  defaults to 'left'
 *   }
 *
 * data         {Array}     Row data passed to render()
 * keyFn        {fn}        (row) => string|number  row key extractor
 * onRowClick   {fn?}       (row, event) => void — makes rows clickable
 * rowClassName {fn?}       (row) => string — extra per-row className
 * loading      {boolean?}  Show skeleton rows instead of data
 * skeletonRows {number?}   How many skeleton rows to show (default 5)
 * emptyState   {ReactNode?}Content to show when data is empty
 * className    {string?}   Extra className for the outer wrapper
 * tableClassName{string?}  Extra className for the <table>
 * stickyHeader {boolean?}  Add sticky thead (useful for long tables)
 * footer       {ReactNode?}Content rendered below the tbody inside the table
 */
export function DataTable({
  columns = [],
  data = [],
  keyFn,
  onRowClick,
  rowClassName,
  loading = false,
  skeletonRows = 5,
  emptyState,
  className,
  tableClassName,
  stickyHeader = false,
  footer,
}) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  if (loading) {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs',
          className
        )}
      >
        <table className={cn('w-full text-left text-xs', tableClassName)}>
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'py-3 px-4',
                    alignClass[col.align || 'left'],
                    col.thClass
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 px-4">
                    <Skeleton className="h-4 w-full max-w-[140px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!loading && data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className={cn('w-full text-left text-xs text-slate-700', tableClassName)}>
          <thead
            className={cn(
              'bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'py-3 px-4',
                    alignClass[col.align || 'left'],
                    col.thClass
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => {
              const rowKey = keyFn ? keyFn(row) : row.id ?? index
              const isClickable = !!onRowClick
              return (
                <tr
                  key={rowKey}
                  onClick={isClickable ? (e) => onRowClick(row, e) : undefined}
                  className={cn(
                    'transition-colors group',
                    isClickable && 'hover:bg-slate-50/70 cursor-pointer',
                    rowClassName ? rowClassName(row) : undefined
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'py-3.5 px-4',
                        alignClass[col.align || 'left'],
                        col.className
                      )}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>

          {footer && (
            <tfoot className="border-t border-slate-200/80 bg-slate-50/60">
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

