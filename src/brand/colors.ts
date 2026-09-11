/** Markenfarben – einzige Quelle für UI (über index.css gespiegelt) und PDF. */
export const farben = {
  ink: '#111315',
  ink800: '#1b1e21',
  ink600: '#43484e',
  muted: '#6d7278',
  gold: '#d5a62e',
  goldDeep: '#b3891f',
  goldSoft: '#e8ca74',
  goldTint: '#faf3dc',
  cream: '#f5f3ee',
  paper: '#fdfcfa',
  line: '#e6e2d8',
  lineDark: '#2a2d31',
} as const

/** „#rrggbb“ → „rgba(r,g,b,a)“ – für Flächen mit Deckkraft (Wasserzeichen). */
export function mitAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}
