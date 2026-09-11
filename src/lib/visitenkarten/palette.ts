import { farben, mitAlpha } from '../../brand/colors'
import type { Farbwelt } from './typen'

export type Palette = {
  grund: string
  text: string
  textSanft: string
  label: string
  akzent: string
  /** Gold als Textfarbe: auf hellem Grund das tiefere Gold */
  akzentText: string
  linie: string
  /** Platte hinter dem Foto */
  platte: string
  logoBase: string
  /** Kontrastfläche: hell → Ink, dunkel → Gold */
  panel: string
  panelText: string
  panelLogoBase: string
  /** Goldteile der Marke auf der Kontrastfläche */
  panelGold: string
  /** Akzentfarbe auf der Kontrastfläche */
  panelAkzent: string
}

export const PALETTEN: Record<Farbwelt, Palette> = {
  hell: {
    grund: farben.paper,
    text: farben.ink,
    textSanft: farben.ink600,
    label: farben.muted,
    akzent: farben.gold,
    akzentText: farben.goldDeep,
    linie: farben.line,
    platte: farben.line,
    logoBase: farben.ink,
    panel: farben.ink,
    panelText: farben.cream,
    panelLogoBase: farben.cream,
    panelGold: farben.gold,
    panelAkzent: farben.gold,
  },
  dunkel: {
    grund: farben.ink,
    text: farben.cream,
    textSanft: mitAlpha(farben.cream, 0.82),
    label: mitAlpha(farben.cream, 0.55),
    akzent: farben.gold,
    akzentText: farben.gold,
    linie: farben.lineDark,
    platte: farben.ink800,
    logoBase: farben.cream,
    panel: farben.gold,
    panelText: farben.ink,
    panelLogoBase: farben.ink,
    panelGold: farben.cream,
    panelAkzent: farben.ink,
  },
}
