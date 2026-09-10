import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, type Node, type Reading, type Prediction, type CollapsedZone } from './supabase'
import { MineMap } from './components/MineMap'
import { StatsRow } from './components/StatsRow'
import { PredictionPanel } from './components/PredictionPanel'
import { CollapsedZones } from './components/CollapsedZones'
import { NodeDetail } from './components/NodeDetail'
import { AlertBanner } from './components/AlertBanner'
import { Legend } from './components/Legend'
import { Activity, AlertTriangle, Radio, ShieldAlert, Waves } from 'lucide-react'

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [collapsed, setCollapsed] = useState<CollapsedZone[]>([])
  const [readings, setReadings] = useState<Record<string, Reading[]>>({})
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)
  const latestReadings = useRef<Record<string, Reading>>({})

  const fetchAll = useCallback(async () => {
    const [nodesRes, predsRes, collapsedRes] = await Promise.all([
      supabase.from('nodes').select('*').order('node_id'),
      supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('collapsed_zones').select('*').order('collapsed_at', { ascending: false }),
    ])

    if (nodesRes.data) setNodes(nodesRes.data as Node[])
    if (predsRes.data) setPredictions(predsRes.data as Prediction[])
    if (collapsedRes.data) setCollapsed(collapsedRes.data as CollapsedZone[])

    // Fetch recent readings for each node
    if (nodesRes.data) {
      const readingMap: Record<string, Reading[]> = {}
      await Promise.all(
        (nodesRes.data as Node[]).map(async (n) => {
          const r = await supabase
            .from('readings')
            .select('*')
            .eq('node_id', n.node_id)
            .order('created_at', { ascending: false })
            .limit(30)
          if (r.data && r.data.length > 0) {
            readingMap[n.node_id] = r.data as Reading[]
            latestReadings.current[n.node_id] = r.data[0] as Reading
          }
        }),
      )
      setReadings(readingMap)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()

    const nodeChannel = supabase
      .channel('nodes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nodes' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newNode = payload.new as Node
          setNodes((prev) => {
            const idx = prev.findIndex((n) => n.id === newNode.id)
            if (idx >= 0) {
              const copy = [...prev]
              copy[idx] = newNode
              return copy
            }
            return [...prev, newNode]
          })
        }
      })
      .subscribe()

    const predChannel = supabase
      .channel('predictions-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'predictions' }, (payload) => {
        const newPred = payload.new as Prediction
        setPredictions((prev) => {
          const filtered = prev.filter((p) => p.node_id !== newPred.node_id)
          return [newPred, ...filtered].slice(0, 50)
        })
      })
      .subscribe()

    const collapsedChannel = supabase
      .channel('collapsed-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'collapsed_zones' }, (payload) => {
        const newZone = payload.new as CollapsedZone
        setCollapsed((prev) => {
          if (prev.some((z) => z.zone === newZone.zone)) return prev
          return [newZone, ...prev]
        })
      })
      .subscribe()

    const readingChannel = supabase
      .channel('readings-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'readings' }, (payload) => {
        const newReading = payload.new as Reading
        latestReadings.current[newReading.node_id] = newReading
        setReadings((prev) => {
          const existing = prev[newReading.node_id] || []
          const updated = [newReading, ...existing].slice(0, 30)
          return { ...prev, [newReading.node_id]: updated }
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(nodeChannel)
      supabase.removeChannel(predChannel)
      supabase.removeChannel(collapsedChannel)
      supabase.removeChannel(readingChannel)
    }
  }, [fetchAll])

  const criticalPreds = predictions.filter((p) => p.risk_level === 'critical')
  const highPreds = predictions.filter((p) => p.risk_level === 'high')

  const riskByNode: Record<string, string> = {}
  for (const p of predictions) {
    riskByNode[p.node_id] = p.risk_level
  }

  if (loading) {
    return (
      <div className="loading" style={{ height: '100vh' }}>
        <div className="loading-spinner" />
        Connecting to mesh network...
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <Radio size={22} />
          </div>
          <div>
            <div className="header-title">MineGuard</div>
            <div className="header-subtitle">Collapse Prediction &amp; Mesh Monitoring</div>
          </div>
        </div>
        <div className="header-status">
          <div className="status-pill">
            <div className={`status-dot ${nodes.length > 0 ? 'online' : 'offline'}`} />
            {nodes.filter((n) => n.is_online).length} / {nodes.length} nodes online
          </div>
        </div>
      </header>

      <div className="main">
        <div>
          <StatsRow nodes={nodes} predictions={predictions} collapsedCount={collapsed.length} />

          {(criticalPreds.length > 0 || highPreds.length > 0) && (
            <AlertBanner criticalCount={criticalPreds.length} highCount={highPreds.length} />
          )}

          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Waves size={18} className="card-icon" />
                  Mine Tunnel Map — Live Sensor Network
                </div>
              </div>
              <MineMap
                nodes={nodes}
                collapsed={collapsed}
                latestReadings={latestReadings.current}
                riskByNode={riskByNode}
                onSelectNode={setSelectedNode}
              />
              <Legend />
            </div>
          </div>

          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Activity size={18} className="card-icon" />
                  Recent Sensor Activity
                </div>
              </div>
              <RecentActivity readings={readings} nodes={nodes} />
            </div>
          </div>
        </div>

        <div>
          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <ShieldAlert size={18} className="card-icon" />
                  Collapse Predictions
                </div>
              </div>
              <PredictionPanel predictions={predictions} nodes={nodes} />
            </div>
          </div>

          <div className="section">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <AlertTriangle size={18} className="card-icon" />
                  Collapsed Zones
                </div>
              </div>
              <CollapsedZones collapsed={collapsed} />
            </div>
          </div>
        </div>
      </div>

      {selectedNode && (
        <NodeDetail
          node={selectedNode}
          readings={readings[selectedNode.node_id] || []}
          prediction={predictions.find((p) => p.node_id === selectedNode.node_id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

function RecentActivity({
  readings,
  nodes,
}: {
  readings: Record<string, Reading[]>
  nodes: Node[]
}) {
  const onlineNodes = nodes.filter((n) => n.is_online).slice(0, 4)
  if (onlineNodes.length === 0) {
    return <div className="empty-state">No sensor data available yet.</div>
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {onlineNodes.map((n) => {
        const rs = readings[n.node_id] || []
        const latest = rs[0]
        if (!latest) {
          return (
            <div key={n.node_id} className="metric-box">
              <div className="metric-label">{n.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Waiting for data...</div>
            </div>
          )
        }
        return (
          <div key={n.node_id} className="metric-box">
            <div className="metric-label">{n.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vibration</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{latest.vibration.toFixed(0)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tilt</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{latest.tilt_angle.toFixed(1)}°</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Accel Z</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{latest.accel_z.toFixed(2)}</div>
              </div>
            </div>
            <Sparkline readings={rs} />
          </div>
        )
      })}
    </div>
  )
}

function Sparkline({ readings }: { readings: Reading[] }) {
  if (readings.length < 2) return null
  const vals = readings.map((r) => r.vibration).reverse()
  const max = Math.max(...vals, 1)
  const min = Math.min(...vals, 0)
  const range = max - min || 1
  const w = 100
  const h = 30
  const step = w / (vals.length - 1)
  const points = vals.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="1.5" />
    </svg>
  )
}
