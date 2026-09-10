import { createRequire } from 'node:module'
import { registriereSchriften } from './fonts'

const require = createRequire(import.meta.url)

export function registerFonts(): void {
  registriereSchriften({
    montserrat500: require.resolve('@fontsource/montserrat/files/montserrat-latin-500-normal.woff'),
    montserrat600: require.resolve('@fontsource/montserrat/files/montserrat-latin-600-normal.woff'),
    montserrat700: require.resolve('@fontsource/montserrat/files/montserrat-latin-700-normal.woff'),
    raleway400: require.resolve('@fontsource/raleway/files/raleway-latin-400-normal.woff'),
    raleway500: require.resolve('@fontsource/raleway/files/raleway-latin-500-normal.woff'),
    raleway600: require.resolve('@fontsource/raleway/files/raleway-latin-600-normal.woff'),
  })
}
