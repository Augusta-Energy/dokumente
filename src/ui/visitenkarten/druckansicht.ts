import { BESCHNITT, KARTE } from '../../lib/visitenkarten/typen'
import type { SvgErzeuger } from './exporte'

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Beide Seiten in exakter physischer Größe in einem neuen Fenster; im Druckdialog „Als PDF sichern“ ergibt echte Vektoren.
 *  Die Export-SVGs bringen ihre Schriften selbst mit; Schnittmarken zeigen die Schnittkante. */
export function oeffneDruckansicht(erzeuge: SvgErzeuger, titel: string): void {
  const W = KARTE.breite + 2 * BESCHNITT
  const H = KARTE.hoehe + 2 * BESCHNITT
  const seite = (svg: string) => `<div class="pg">${svg.replace(/^<\?xml[^>]*>\n?/, '')}</div>`
  const vorne = erzeuge('vorderseite', { beschnitt: BESCHNITT, schnittmarken: true })
  const hinten = erzeuge('rueckseite', { beschnitt: BESCHNITT, schnittmarken: true })
  const fenster = window.open('', '_blank')
  if (!fenster) throw new Error('Pop-up wurde blockiert – bitte Pop-ups für diese Seite erlauben.')
  fenster.document.write(
    `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${escHtml(titel)}</title>` +
      `<style>@page{size:${W}mm ${H}mm;margin:0}html,body{margin:0;padding:0}` +
      `.pg{width:${W}mm;height:${H}mm;page-break-after:always;break-after:page;overflow:hidden}` +
      `.pg:last-child{page-break-after:auto;break-after:auto}.pg svg{display:block;width:${W}mm;height:${H}mm}</style></head>` +
      `<body>${seite(vorne)}${seite(hinten)}` +
      `<script>window.addEventListener("load",function(){var f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();f.then(function(){setTimeout(function(){window.print()},250)})})</scr` +
      `ipt>` +
      `</body></html>`,
  )
  fenster.document.close()
}
