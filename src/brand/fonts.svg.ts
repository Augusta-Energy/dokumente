/** @font-face-Regeln mit eingebetteten woff2-Daten – für Export-SVGs und die Druckansicht der Visitenkarten. */
export type SchriftDaten = {
  montserrat500: string
  montserrat600: string
  montserrat700: string
  raleway400: string
  raleway500: string
  raleway600: string
}

function face(familie: string, gewicht: number, src: string): string {
  return `@font-face{font-family:'${familie}';font-style:normal;font-weight:${gewicht};src:url(${src}) format('woff2');}`
}

export function schriftenCss(q: SchriftDaten): string {
  return [
    face('Montserrat', 500, q.montserrat500),
    face('Montserrat', 600, q.montserrat600),
    face('Montserrat', 700, q.montserrat700),
    face('Raleway', 400, q.raleway400),
    face('Raleway', 500, q.raleway500),
    face('Raleway', 600, q.raleway600),
  ].join('\n')
}
