import type { Messer, Schrift } from './typen'

export const FAMILIE_CSS: Record<Schrift, string> = {
  display: "'Montserrat', Arial, sans-serif",
  text: "'Raleway', Arial, sans-serif",
}

/** Schätzung ohne Browser: Montserrat ist breit (0.68 em je Großbuchstabe), Raleway schmaler. */
export const schaetzeBreite: Messer = (text, groesse, schrift, _gewicht, ls) => {
  const n = text.length
  if (n === 0) return 0
  const gross = text === text.toUpperCase() && /[A-ZÄÖÜ]/.test(text)
  const proEm = schrift === 'display' ? (gross ? 0.68 : 0.6) : 0.52
  return n * groesse * proEm + Math.max(0, n - 1) * groesse * ls
}

/** Echte Breiten über Canvas – erst sinnvoll, wenn document.fonts.ready erfüllt ist. */
export function canvasMesser(): Messer | null {
  if (typeof document === 'undefined') return null
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return null
  return (text, groesse, schrift, gewicht, ls) => {
    if (!text) return 0
    ctx.font = `${gewicht} 100px ${FAMILIE_CSS[schrift]}`
    return (ctx.measureText(text).width / 100) * groesse + Math.max(0, text.length - 1) * groesse * ls
  }
}
