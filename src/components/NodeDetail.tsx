import type { Node, Reading, Prediction } from '../supabase'
import { X, Battery, Activity, Radio } from 'lucide-react'

export function NodeDetail({
  node,
  readings,
  prediction,
  onClose,
}: {
  node: Node
  readings: Reading[]
  prediction?: Prediction
  onClose: () => void
}) {
  const latest = readings[0]

  return (
    <div className="node-detail">
      <div className="node-detail-header">
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{node.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {node.node_id} · Zone {node.zone}
          </div>
        </div>
        <button className="node-detail-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Radio size={14} color={node.is_online ? '#10b981' : '#64748b'} />
          {node.is_online ? 'Online' : 'Offline'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Battery size={14} color={node.battery_pct < 20 ? '#ef4444' : '#10b981'} />
          {node.battery_pct.toFixed(0)}%
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Last seen: {new Date(node.last_seen).toLocaleTimeString()}
        </div>
      </div>

      {prediction && (
        <div
          className={`prediction-item ${prediction.risk_level}`}
          style={{ marginBottom: 12 }}
        >
          <div className="prediction-top">
            <span className="prediction-node">Risk Assessment</span>
            <span className={`prediction-badge ${prediction.risk_level}`}>
              {prediction.risk_level}
            </span>
          </div>
          <div className="prediction-summary">{prediction.summary}</div>
        </div>
      )}

      {latest ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 4 }}>
            <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
            Latest Sensor Readings
          </div>
          <div className="metric-grid">
            <div className="metric-box">
              <div className="metric-label">Vibration</div>
              <div className="metric-value">{latest.vibration.toFixed(0)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Tilt Angle</div>
              <div className="metric-value">{latest.tilt_angle.toFixed(1)}°</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Accel X</div>
              <div className="metric-value">{latest.accel_x.toFixed(2)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Accel Y</div>
              <div className="metric-value">{latest.accel_y.toFixed(2)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Accel Z</div>
              <div className="metric-value">{latest.accel_z.toFixed(2)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-label">Gyro Z</div>
              <div className="metric-value">{latest.gyro_z.toFixed(1)}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">No readings received yet from this node.</div>
      )}
    </div>
  )
}
