import { Font } from '@react-pdf/renderer'

export const SCHRIFT = { display: 'Montserrat', text: 'Raleway' } as const

export type SchriftQuellen = {
  montserrat500: string
  montserrat600: string
  montserrat700: string
  raleway400: string
  raleway500: string
  raleway600: string
}

let registriert = false

/** Registriert Montserrat/Raleway für react-pdf. Idempotent. Silbentrennung ist aus:
 *  react-pdf kennt nur englische Trennregeln, die deutsche Wörter falsch trennen würden. */
export function registriereSchriften(q: SchriftQuellen): void {
  if (registriert) return
  registriert = true
  Font.register({
    family: SCHRIFT.display,
    fonts: [
      { src: q.montserrat500, fontWeight: 500 },
      { src: q.montserrat600, fontWeight: 600 },
      { src: q.montserrat700, fontWeight: 700 },
    ],
  })
  Font.register({
    family: SCHRIFT.text,
    fonts: [
      { src: q.raleway400, fontWeight: 400 },
      { src: q.raleway500, fontWeight: 500 },
      { src: q.raleway600, fontWeight: 600 },
    ],
  })
  Font.registerHyphenationCallback((wort) => [wort])
}
