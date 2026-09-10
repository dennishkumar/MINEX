import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})

export type Node = {
  id: string
  node_id: string
  label: string
  x: number
  y: number
  zone: string
  battery_pct: number
  is_online: boolean
  last_seen: string
  created_at: string
}

export type Reading = {
  id: string
  node_id: string
  accel_x: number
  accel_y: number
  accel_z: number
  gyro_x: number
  gyro_y: number
  gyro_z: number
  vibration: number
  tilt_angle: number
  created_at: string
}

export type Prediction = {
  id: string
  node_id: string
  risk_level: 'safe' | 'moderate' | 'high' | 'critical'
  risk_score: number
  confidence: number
  summary: string
  created_at: string
}

export type CollapsedZone = {
  id: string
  zone: string
  node_id: string
  collapsed_at: string
  severity: 'partial' | 'full'
  notes: string
  created_at: string
}
