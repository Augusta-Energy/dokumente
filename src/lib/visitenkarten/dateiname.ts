import { slug } from '../dateiname'
import type { Farbwelt, Seite } from './typen'

const SEITE: Record<Seite, string> = { vorderseite: 'Vorderseite', rueckseite: 'Rueckseite' }

export function dateiBasis(design: { nr: string; titel: string }, farbwelt: Farbwelt, name: string): string {
  const wer = name.trim() ? slug(name.trim()) : 'Karte'
  return `Augusta-Energy_Visitenkarte_${design.nr}-${slug(design.titel)}_${farbwelt === 'hell' ? 'Hell' : 'Dunkel'}_${wer}`
}

export function svgDateiname(basis: string, seite: Seite, beschnitt: boolean): string {
  return `${basis}_${SEITE[seite]}${beschnitt ? '_Beschnitt' : ''}.svg`
}

export function pngDateiname(basis: string, seite: Seite, dpi: 300 | 600, beschnitt: boolean): string {
  return `${basis}_${SEITE[seite]}_${dpi}dpi${beschnitt ? '_Beschnitt' : ''}.png`
}

export function pdfDateiname(basis: string, verlustfrei: boolean): string {
  return `${basis}_${verlustfrei ? 'Druck-verlustfrei' : 'Druck'}.pdf`
}
