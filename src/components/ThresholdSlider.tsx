interface ThresholdSliderProps {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

export function ThresholdSlider({ label, description, value, min, max, step, unit, onChange }: ThresholdSliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="bg-hud-panel rounded-md border border-hud-border p-3 mb-2">
      <div className="flex justify-between items-center mb-1">
        <div>
          <div className="text-[11px] text-hud-text tracking-wider">{label}</div>
          <div className="text-[9px] text-hud-muted mt-0.5">{description}</div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-hud-cyan tabular-nums">{value}</span>
          <span className="text-[9px] text-hud-muted">{unit}</span>
        </div>
      </div>
      <div className="relative mt-2.5 mb-1">
        {/* Track background */}
        <div className="h-1 bg-hud-border rounded-full">
          <div
            className="h-full rounded-full transition-[width] duration-100"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #00ff66, #00e5ff)',
            }}
          />
        </div>
        {/* Actual range input — now visible with custom CSS styling */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer"
          aria-label={label}
        />
      </div>
    </div>
  )
}
