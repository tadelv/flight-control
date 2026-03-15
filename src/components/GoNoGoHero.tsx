import type { FlightStatus } from '../types'

const statusConfig: Record<FlightStatus, { label: string; colors: string; glow: string }> = {
  go: {
    label: 'GO',
    colors: 'from-[#0d2818] to-[#0a1a0a] border-hud-green/25 text-hud-green',
    glow: 'shadow-[0_0_30px_rgba(0,255,102,0.15)]',
  },
  caution: {
    label: 'CAUTION',
    colors: 'from-[#2d2200] to-[#1a1400] border-hud-amber/25 text-hud-amber',
    glow: 'shadow-[0_0_30px_rgba(255,170,0,0.15)]',
  },
  'no-go': {
    label: 'NO-GO',
    colors: 'from-[#2d0a0a] to-[#1a0505] border-hud-red/25 text-hud-red',
    glow: 'shadow-[0_0_30px_rgba(255,68,68,0.15)]',
  },
}

interface GoNoGoHeroProps {
  status: FlightStatus
  reasons: string[]
  loading: boolean
}

export function GoNoGoHero({ status, reasons, loading }: GoNoGoHeroProps) {
  if (loading) {
    return (
      <div className="mx-3 mt-3 rounded-lg border border-hud-border bg-gradient-to-br from-hud-panel to-hud-bg p-4 text-center">
        <div className="text-[11px] tracking-[0.2em] text-hud-muted mb-1">STATUS</div>
        <div className="text-2xl text-hud-muted animate-pulse">CHECKING...</div>
      </div>
    )
  }

  const config = statusConfig[status]

  return (
    <div className={`mx-3 mt-3 rounded-lg border bg-gradient-to-br p-4 text-center ${config.colors} ${config.glow}`}>
      <div className="text-[11px] tracking-[0.2em] text-current/50 mb-1">STATUS</div>
      <div className="text-4xl font-bold tracking-wider">{config.label}</div>
      <div className="text-[11px] text-current/50 mt-1">
        {reasons.length > 0
          ? reasons.join(' • ')
          : 'All conditions within limits'}
      </div>
    </div>
  )
}
