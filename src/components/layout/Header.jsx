import React, { useState, useEffect } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Menu,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { MockApi } from '../../services/mockApi'

export function Header({ onMobileMenuToggle }) {
  const [settings, setSettings] = useState({ simulateErrors: false })
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    MockApi.getSettings().then(setSettings)
  }, [])

  const handleToggleErrorSim = async () => {
    const nextVal = !settings.simulateErrors
    const updated = await MockApi.updateSettings({ simulateErrors: nextVal })
    setSettings(updated)
    // Dispatch custom event to notify active queries if needed
    window.dispatchEvent(new CustomEvent('billcycle:settings-updated'))
  }

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      setResetting(true)
      await MockApi.resetDemoData()
      setResetting(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: Mobile menu toggle + breadcrumb / context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
            B2B Logistics
          </Badge>
          <span className="hidden md:inline text-xs text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-700 hidden md:inline">
            Billing & Revenue Operations
          </span>
        </div>
      </div>

      {/* Right side: Simulation controls + User profile */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Error Simulation */}
        <button
          type="button"
          onClick={handleToggleErrorSim}
          title="Toggle simulated network errors to test error/retry states"
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
            settings.simulateErrors
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {settings.simulateErrors ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>Simulated Errors ON</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Simulate Error</span>
            </>
          )}
        </button>

        {/* Reset Demo Data */}
        <Button
          variant="outline"
          size="xs"
          icon={RotateCcw}
          onClick={handleResetData}
          loading={resetting}
          title="Reset demo data to initial factory state"
        >
          <span className="hidden sm:inline">Reset Demo</span>
        </Button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-2xs">
            FM
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              Finance Ops
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Operations Lead
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
