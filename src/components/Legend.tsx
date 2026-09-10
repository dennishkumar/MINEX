import { Radio, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react'

export function Legend() {
  return (
    <div className="legend">
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#10b981' }} />
        <Radio size={12} /> Safe / Online
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#f59e0b' }} />
        <MinusCircle size={12} /> Moderate Risk
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#f97316' }} />
        <AlertTriangle size={12} /> High Risk
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#ef4444' }} />
        <AlertTriangle size={12} /> Critical Risk
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#dc2626', opacity: 0.3 }} />
        <AlertTriangle size={12} /> Collapsed Zone
      </div>
      <div className="legend-item">
        <div className="legend-dot" style={{ background: '#64748b' }} />
        Offline Node
      </div>
    </div>
  )
}
