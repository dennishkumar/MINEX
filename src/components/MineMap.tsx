import type { Node, Prediction, CollapsedZone, Reading } from '../supabase'

const RISK_COLORS: Record<string, string> = {
  safe: '#10b981',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
}

// Mine tunnel layout — SVG paths forming a tunnel network
const TUNNELS = [
  'M 50 400 L 50 200 L 250 200',
  'M 250 200 L 500 200',
  'M 500 200 L 700 200 L 700 400',
  'M 250 200 L 250 80',
  'M 500 200 L 500 80',
  'M 250 200 L 250 350 L 400 350',
  'M 500 200 L 500 350 L 400 350',
  'M 700 200 L 850 200',
]

export function MineMap({
  nodes,
  collapsed,
  latestReadings,
  riskByNode,
  onSelectNode,
}: {
  nodes: Node[]
  collapsed: CollapsedZone[]
  latestReadings: Record<string, Reading>
  riskByNode: Record<string, string>
  onSelectNode: (node: Node) => void
}) {
  const collapsedZones = new Set(collapsed.map((c) => c.zone))

  return (
    <div className="map-container">
      <svg className="mine-map" viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
        {/* Grid background */}
        <g className="map-grid">
          {Array.from({ length: 18 }, (_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={500} />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={900} y2={i * 50} />
          ))}
        </g>

        {/* Tunnel paths (background + foreground) */}
        <g>
          {TUNNELS.map((d, i) => (
            <path key={`bg${i}`} d={d} className="map-tunnel-bg" />
          ))}
          {TUNNELS.map((d, i) => (
            <path key={`fg${i}`} d={d} className="map-tunnel" />
          ))}
        </g>

        {/* Collapsed zone overlays */}
        {nodes
          .filter((n) => collapsedZones.has(n.zone))
          .map((n) => (
            <circle
              key={`col${n.id}`}
              cx={n.x}
              cy={n.y}
              r={40}
              className="zone-collapsed-overlay"
            />
          ))}

        {/* Nodes */}
        {nodes.map((n) => {
          const reading = latestReadings[n.node_id]
          const vibLevel = reading ? reading.vibration : 0
          const isCollapsed = collapsedZones.has(n.zone)
          const risk = riskByNode[n.node_id] || 'safe'
          const color = isCollapsed
            ? '#dc2626'
            : n.is_online
              ? RISK_COLORS[risk] || '#10b981'
              : '#64748b'

          return (
            <g
              key={n.id}
              className="node-group"
              transform={`translate(${n.x}, ${n.y})`}
              onClick={() => onSelectNode(n)}
            >
              {/* Pulse for active nodes with vibration */}
              {n.is_online && vibLevel > 600 && !isCollapsed && (
                <circle r={10} fill="none" stroke={color} strokeWidth={2} className="node-pulse" />
              )}
              {/* Collapse pulse */}
              {isCollapsed && (
                <circle r={10} fill="none" stroke="#dc2626" strokeWidth={3} className="node-pulse" />
              )}
              <circle r={10} fill={color} className="node-circle" />
              <circle r={4} fill="#0a0e14" />
              <text className="node-label" y={-18}>{n.node_id}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
