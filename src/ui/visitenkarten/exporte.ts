import { baueRasterPdf, flateBytesVonCanvas, jpegBytesVonCanvas, type PdfSeite } from '../../lib/visitenkarten/pdfRaster'
import { BESCHNITT, KARTE, type Seite } from '../../lib/visitenkarten/typen'

/** Liefert das Export-SVG einer Seite (Schriften und Foto eingebettet). Der Workspace baut den Erzeuger aus renderKarte. */
export type SvgErzeuger = (seite: Seite, o: { beschnitt: number; schnittmarken?: boolean }) => string

export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

function ladeSvgBild(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const bild = new Image()
    bild.onload = () => {
      URL.revokeObjectURL(url)
      resolve(bild)
    }
    bild.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG konnte nicht gerastert werden'))
    }
    bild.src = url
  })
}

/** Rastert eine Seite auf round(mm / 25.4 × dpi) Pixel (300 dpi: 1004 × 650, 600 dpi: 2008 × 1299, mit Beschnitt 2150 × 1441). */
export async function rastern(erzeuge: SvgErzeuger, seite: Seite, dpi: number, beschnitt: number): Promise<HTMLCanvasElement> {
  const wMm = KARTE.breite + 2 * beschnitt
  const hMm = KARTE.hoehe + 2 * beschnitt
  const wPx = Math.round((wMm / 25.4) * dpi)
  const hPx = Math.round((hMm / 25.4) * dpi)
  const bild = await ladeSvgBild(erzeuge(seite, { beschnitt }))
  const canvas = document.createElement('canvas')
  canvas.width = wPx
  canvas.height = hPx
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')
  // Weißer Grund: JPEG kennt kein Alpha (würde auf Schwarz kompositieren) und Flate verwirft den Alphakanal ohnehin.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, wPx, hPx)
  ctx.drawImage(bild, 0, 0, wPx, hPx)
  return canvas
}

export function exportiereSvg(erzeuge: SvgErzeuger, seite: Seite, beschnitt: number, dateiname: string): void {
  downloadBlob(dateiname, new Blob([erzeuge(seite, { beschnitt })], { type: 'image/svg+xml;charset=utf-8' }))
}

export async function exportierePng(erzeuge: SvgErzeuger, seite: Seite, dpi: 300 | 600, beschnitt: number, dateiname: string): Promise<void> {
  const canvas = await rastern(erzeuge, seite, dpi, beschnitt)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
  if (!blob) throw new Error('PNG-Kodierung fehlgeschlagen')
  downloadBlob(dateiname, blob)
}

/** Vorder- und Rückseite mit 3 mm Beschnitt bei 600 dpi: JPEG (Qualität 0.93) oder verlustfrei (Flate). */
export async function exportierePdf(erzeuge: SvgErzeuger, verlustfrei: boolean, dateiname: string): Promise<void> {
  const seiten: PdfSeite[] = []
  for (const seite of ['vorderseite', 'rueckseite'] as const) {
    const canvas = await rastern(erzeuge, seite, 600, BESCHNITT)
    seiten.push(
      verlustfrei
        ? { bytes: await flateBytesVonCanvas(canvas), w: canvas.width, h: canvas.height, filter: 'FlateDecode' }
        : { bytes: jpegBytesVonCanvas(canvas, 0.93), w: canvas.width, h: canvas.height, filter: 'DCTDecode' },
    )
  }
  const pdf = baueRasterPdf(seiten, KARTE.breite + 2 * BESCHNITT, KARTE.hoehe + 2 * BESCHNITT, BESCHNITT)
  downloadBlob(dateiname, new Blob([pdf], { type: 'application/pdf' }))
}
