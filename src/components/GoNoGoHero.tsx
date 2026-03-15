import type { FlightStatus } from '../types'

const statusConfig: Record<FlightStatus, { label: string; bg: string; border: string; text: string; shadow: string }> = {
  go: {
    label: 'GO',
    bg: 'linear-gradient(135deg, #0d2818 0%, #0a1a0a 100%)',
    border: 'rgba(0, 255, 102, 0.25)',
    text: '#00ff66',
    shadow: '0 0 30px rgba(0, 255, 102, 0.12), inset 0 1px 0 rgba(0, 255, 102, 0.05)',
  },
  caution: {
    label: 'CAUTION',
    bg: 'linear-gradient(135deg, #2d2200 0%, #1a1400 100%)',
    border: 'rgba(255, 170, 0, 0.25)',
    text: '#ffaa00',
    shadow: '0 0 30px rgba(255, 170, 0, 0.12), inset 0 1px 0 rgba(255, 170, 0, 0.05)',
  },
  'no-go': {
    label: 'NO-GO',
    bg: 'linear-gradient(135deg, #2d0a0a 0%, #1a0505 100%)',
    border: 'rgba(255, 68, 68, 0.25)',
    text: '#ff4444',
    shadow: '0 0 30px rgba(255, 68, 68, 0.12), inset 0 1px 0 rgba(255, 68, 68, 0.05)',
  },
}

interface GoNoGoHeroProps {
  status: FlightStatus
  reasons: string[]
  loading: boolean
}

export function GoNoGoHero({ status, reasons, loading }: GoNoGoHeroProps) {
  const config = statusConfig[loading ? 'go' : status]

  return (
    <div
      className="mx-3 mt-3 rounded-lg p-4 text-center"
      style={{
        background: loading ? 'linear-gradient(135deg, #171f2e 0%, #0f1420 100%)' : config.bg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: loading ? '#2a3f5f' : config.border,
        boxShadow: loading ? 'none' : config.shadow,
        transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="text-xs tracking-[0.2em] mb-1"
        style={{
          color: loading ? '#6b8aaa' : config.text,
          opacity: 0.5,
          transition: 'color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        STATUS
      </div>
      <div
        className="text-5xl font-bold tracking-wider"
        style={{
          color: loading ? '#6b8aaa' : config.text,
          transition: 'color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {loading ? (
          <span className="animate-pulse">---</span>
        ) : (
          config.label
        )}
      </div>
      <div
        className="text-xs mt-1"
        style={{
          color: loading ? '#6b8aaa' : config.text,
          opacity: 0.5,
          transition: 'color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {loading
          ? 'Checking conditions...'
          : reasons.length > 0
            ? reasons.join(' \u2022 ')
            : 'All clear for flight'}
      </div>
    </div>
  )
}
