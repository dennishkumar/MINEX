import type { CollapsedZone } from '../supabase'
import { AlertTriangle } from 'lucide-react'

export function CollapsedZones({ collapsed }: { collapsed: CollapsedZone[] }) {
  if (collapsed.length === 0) {
    return <div className="empty-state">No collapsed zones reported. All clear.</div>
  }

  return (
    <div className="scroll-list">
      {collapsed.map((z) => (
        <div key={z.id} className="collapsed-item">
          <div className="collapsed-icon">
            <AlertTriangle size={18} />
          </div>
          <div className="collapsed-info">
            <div className="collapsed-zone">Zone {z.zone}</div>
            <div className="collapsed-time">
              {z.severity === 'full' ? 'Full collapse' : 'Partial collapse'} ·{' '}
              {new Date(z.collapsed_at).toLocaleString()} · Reported by {z.node_id}
            </div>
            {z.notes && (
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{z.notes}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
