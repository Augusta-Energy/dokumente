import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { schriftenCss } from './fonts.svg'

const require = createRequire(import.meta.url)
const dataUrl = (paket: string) => `data:font/woff2;base64,${readFileSync(require.resolve(paket)).toString('base64')}`

/** Schriften-CSS für Node-Skripte (Vite-`?inline`-Importe gibt es dort nicht). */
export const SCHRIFTEN_CSS_NODE = schriftenCss({
  montserrat500: dataUrl('@fontsource/montserrat/files/montserrat-latin-500-normal.woff2'),
  montserrat600: dataUrl('@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'),
  montserrat700: dataUrl('@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'),
  raleway400: dataUrl('@fontsource/raleway/files/raleway-latin-400-normal.woff2'),
  raleway500: dataUrl('@fontsource/raleway/files/raleway-latin-500-normal.woff2'),
  raleway600: dataUrl('@fontsource/raleway/files/raleway-latin-600-normal.woff2'),
})
