import { farben } from './colors'
import { BAR_POINTS, CHEVRON_POINTS, LEG_POINTS, LOGO_VIEWBOX, MARKE_SCALE, MARKE_VIEWBOX } from './logoGeometry'

type LogoProps = {
  /** Auf dunklem Grund: Ink-Flächen werden cremefarben ausgegeben. */
  light?: boolean
  /** Nur die A-Marke, ohne Wortmarke. */
  markOnly?: boolean
  className?: string
}

function MarkShapes({ base }: { base: string }) {
  return (
    <>
      <polygon points={CHEVRON_POINTS} fill={base} />
      <polygon points={LEG_POINTS} fill={farben.gold} />
      <polygon points={BAR_POINTS} fill={farben.gold} />
    </>
  )
}

export function Logo({ light = false, markOnly = false, className }: LogoProps) {
  const base = light ? farben.cream : farben.ink
  if (markOnly) {
    return (
      <svg viewBox={`0 0 ${MARKE_VIEWBOX.breite} ${MARKE_VIEWBOX.hoehe}`} role="img" aria-label="Augusta Energy" className={className ?? 'h-9 w-auto'}>
        <MarkShapes base={base} />
      </svg>
    )
  }
  return (
    <svg viewBox={`0 0 ${LOGO_VIEWBOX.breite} ${LOGO_VIEWBOX.hoehe}`} role="img" aria-label="Augusta Energy" className={className ?? 'h-9 w-auto'}>
      <g transform={`scale(${MARKE_SCALE})`}>
        <MarkShapes base={base} />
      </g>
      <text className="font-display" x="155" y="50.5" fontSize="45.7" fontWeight="600" textLength="315" lengthAdjust="spacing" fill={base}>
        AUGUSTA
      </text>
      <rect x="163" y="73.3" width="63.7" height="1.4" fill={farben.gold} />
      <text className="font-display" x="312.5" y="81.6" fontSize="22.4" fontWeight="600" textAnchor="middle" textLength="157.5" lengthAdjust="spacing" fill={farben.gold}>
        ENERGY
      </text>
      <rect x="398.3" y="73.3" width="63.7" height="1.4" fill={farben.gold} />
    </svg>
  )
}
