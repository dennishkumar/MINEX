import type { Node, Prediction } from '../supabase'

const RISK_BAR_COLORS: Record<string, string> = {
  safe: '#10b981',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

export function PredictionPanel({
  predictions,
  nodes,
}: {
  predictions: Prediction[]
  nodes: Node[]
}) {
  if (predictions.length === 0) {
    return <div className="empty-state">No predictions computed yet. Waiting for sensor data...</div>
  }

  const nodeLabel = (nodeId: string) => {
    const n = nodes.find((nd) => nd.node_id === nodeId)
    return n ? n.label : nodeId
  }

  return (
    <div className="scroll-list">
      {predictions.map((p) => (
        <div key={p.id} className={`prediction-item ${p.risk_level}`}>
          <div className="prediction-top">
            <span className="prediction-node">{nodeLabel(p.node_id)}</span>
            <span className={`prediction-badge ${p.risk_level}`}>{p.risk_level}</span>
          </div>
          <div className="prediction-summary">{p.summary}</div>
          <div className="prediction-meta">
            <span>Risk Score: {p.risk_score.toFixed(0)}/100</span>
            <span>Confidence: {p.confidence.toFixed(0)}%</span>
          </div>
          <div className="risk-bar">
            <div
              className="risk-bar-fill"
              style={{
                width: `${p.risk_score}%`,
                background: RISK_BAR_COLORS[p.risk_level],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
