import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  Clock,
  FileCheck2,
  AlertTriangle,
  Percent,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { MockApi } from '../../services/mockApi'
import { MetricCard } from '../../components/shared/MetricCard'
import { RevenueChart } from './components/RevenueChart'
import { RecentActivityFeed } from './components/RecentActivityFeed'
import { AttentionList } from './components/AttentionList'
import { ErrorState } from '../../components/shared/ErrorState'
import { formatINR } from '../../utils/currencyUtils'
import { Button } from '../../components/ui/Button'

export function OverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await MockApi.getOverviewData()
      setData(res)
    } catch (err) {
      setError(err.message || 'Failed to load billing overview.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  if (error) {
    return (
      <div className="py-8">
        <ErrorState
          title="Billing Overview Unavailable"
          message={error}
          onRetry={loadOverview}
        />
      </div>
    )
  }

  const metrics = data?.metrics || {}

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Billing & Revenue Operations
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Real-time consolidation of logistics shipments, cycle approvals, and invoice realization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/cycles">
            <Button variant="primary" size="sm" icon={Layers} iconRight={ArrowRight}>
              Open Billing Cycles
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Billable Revenue"
          value={formatINR(metrics.totalBillableRevenue, { compact: true })}
          subtitle="Across active cycles & invoices"
          icon={IndianRupee}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          loading={loading}
        />

        <MetricCard
          title="Unbilled Amount"
          value={formatINR(metrics.unbilledAmount, { compact: true })}
          subtitle="Open cycles awaiting closure"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          loading={loading}
        />

        <MetricCard
          title="Outstanding Balance"
          value={formatINR(metrics.outstandingBalance, { compact: true })}
          subtitle="Uncollected invoice receivables"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          loading={loading}
        />

        <MetricCard
          title="Invoices Generated"
          value={loading ? '—' : `${metrics.invoicesGeneratedCount || 0} Invoices`}
          subtitle="Current fiscal year"
          icon={FileCheck2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          loading={loading}
        />

        <MetricCard
          title="Cycle Completion"
          value={loading ? '—' : `${metrics.cycleCompletionRate || 0}%`}
          subtitle={`${metrics.closedCyclesCount || 0} of ${metrics.totalCyclesCount || 0} cycles locked`}
          icon={Percent}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          loading={loading}
        />
      </div>

      {/* Main Charts & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.revenueChartData || []} />
        </div>
        <div className="lg:col-span-1">
          <AttentionList items={data?.attentionList || []} />
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <RecentActivityFeed activities={data?.recentActivity || []} />
      </div>
    </div>
  )
}
