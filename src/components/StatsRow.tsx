import type { Node, Prediction } from '../supabase'
import { Radio, ShieldAlert, AlertTriangle, Activity } from 'lucide-react'

export function StatsRow({
  nodes,
  predictions,
  collapsedCount,
}: {
  nodes: Node[]
  predictions: Prediction[]
  collapsedCount: number
}) {
  const onlineCount = nodes.filter((n) => n.is_online).length
  const avgBattery =
    nodes.length > 0
      ? Math.round(nodes.reduce((sum, n) => sum + n.battery_pct, 0) / nodes.length)
      : 0
  const atRisk = predictions.filter(
    (p) => p.risk_level === 'high' || p.risk_level === 'critical',
  ).length

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.12)' }}>
          <Radio size={18} color="#06b6d4" />
        </div>
        <div className="stat-label">Active Nodes</div>
        <div className="stat-value">{onlineCount}</div>
        <div className="stat-sub">{nodes.length} total deployed</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
          <ShieldAlert size={18} color="#f59e0b" />
        </div>
        <div className="stat-label">At Risk</div>
        <div className="stat-value" style={{ color: atRisk > 0 ? '#f59e0b' : 'var(--text)' }}>
          {atRisk}
        </div>
        <div className="stat-sub">high or critical risk</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <AlertTriangle size={18} color="#ef4444" />
        </div>
        <div className="stat-label">Collapsed</div>
        <div className="stat-value" style={{ color: collapsedCount > 0 ? '#ef4444' : 'var(--text)' }}>
          {collapsedCount}
        </div>
        <div className="stat-sub">zones reported</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
          <Activity size={18} color="#10b981" />
        </div>
        <div className="stat-label">Avg Battery</div>
        <div className="stat-value">{avgBattery}%</div>
        <div className="stat-sub">across all nodes</div>
      </div>
    </div>
  )
}
