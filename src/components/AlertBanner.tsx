import { AlertTriangle } from 'lucide-react'

export function AlertBanner({
  criticalCount,
  highCount,
}: {
  criticalCount: number
  highCount: number
}) {
  if (criticalCount > 0) {
    return (
      <div className="alert-banner critical">
        <AlertTriangle size={20} />
        <span>
          CRITICAL ALERT: {criticalCount} {criticalCount === 1 ? 'node shows' : 'nodes show'} imminent
          collapse risk. Immediate evacuation recommended for affected zones.
        </span>
      </div>
    )
  }
  return (
    <div className="alert-banner warning">
      <AlertTriangle size={20} />
      <span>
        WARNING: {highCount} {highCount === 1 ? 'node shows' : 'nodes show'} elevated collapse risk.
        Monitor closely and prepare for evacuation.
      </span>
    </div>
  )
}
