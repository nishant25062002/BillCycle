import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  Receipt,
  Users,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const NAVIGATION_ITEMS = [
  {
    name: 'Overview',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Billing Cycles',
    to: '/cycles',
    icon: Layers,
    badge: 'Core',
  },
  {
    name: 'Invoices',
    to: '/invoices',
    icon: Receipt,
  },
  {
    name: 'Customers',
    to: '/customers',
    icon: Users,
  },
]

export function Sidebar({ collapsed, onToggleCollapse }) {
  return (
    <aside
      className={cn(
        'relative hidden lg:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-200 select-none z-20',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs font-bold text-base">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                Bill<span className="text-indigo-600">Cycle</span>
              </span>
              <span className="text-xs text-slate-600 font-medium tracking-tight mt-0.5">
                RevOps SaaS
              </span>
            </div>
          )}
        </NavLink>

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors',
            collapsed && 'hidden'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-100">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Operations
          </div>
        )}
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900 font-medium',
                  collapsed && 'justify-center px-2'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-colors',
                      isActive
                        ? 'text-indigo-600'
                        : 'text-slate-500 group-hover:text-slate-800'
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded bg-indigo-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!collapsed ? (
          <div className="rounded-lg bg-white p-3 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Standalone Mode</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              Client-side mock engine with local persistence.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Online Standalone" />
          </div>
        )}
      </div>
    </aside>
  )
}
