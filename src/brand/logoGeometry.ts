/** Geometrie der A-Marke, aus dem Original-Artwork der Website (Logo.tsx) übernommen.
 *  Bezugsrahmen 307 × 245. CHEVRON = dunkler Winkel, LEG = goldener rechter Schaft, BAR = goldener Querbalken. */
export const MARKE_VIEWBOX = { breite: 307, hoehe: 245 } as const
export const CHEVRON_POINTS = '153.5,0 0,245 47.5,245 153.5,75.8 196,143.5 213,95'
export const LEG_POINTS = '222,109.3 307,245 259.5,245 205,158'
export const BAR_POINTS = '121,168 198.3,168 216,197 105,193'
/** Vollständiges Logo: Marke auf 100 Einheiten Höhe skaliert, Wortmarke rechts daneben. */
export const LOGO_VIEWBOX = { breite: 470, hoehe: 100 } as const
export const MARKE_SCALE = 0.40816
