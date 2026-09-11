import type { Foto, Person } from '../../lib/visitenkarten/typen'

export function teamFotoUrl(datei: string): string {
  return `${import.meta.env.BASE_URL}visitenkarten/team/${datei}`
}

export function blobAlsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leser = new FileReader()
    leser.onload = () => resolve(String(leser.result))
    leser.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    leser.readAsDataURL(blob)
  })
}

/** Team-Foto aus public/visitenkarten/team/ als data-URL mit dem hinterlegten Gesichtsausschnitt. */
export async function ladeTeamFoto(p: Person): Promise<Foto | null> {
  if (!p.foto) return null
  const antwort = await fetch(teamFotoUrl(p.foto.datei))
  if (!antwort.ok) throw new Error(`Foto konnte nicht geladen werden (${antwort.status})`)
  const src = await blobAlsDataUrl(await antwort.blob())
  return { src, w: p.foto.w, h: p.foto.h, crop: p.foto.crop }
}

/** Eigenes Bild: mittiger quadratischer Ausschnitt. */
export async function ladeEigenesFoto(datei: File): Promise<Foto> {
  const src = await blobAlsDataUrl(datei)
  const bild = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'))
    i.src = src
  })
  const s = Math.min(bild.naturalWidth, bild.naturalHeight)
  return { src, w: bild.naturalWidth, h: bild.naturalHeight, crop: { x: (bild.naturalWidth - s) / 2, y: (bild.naturalHeight - s) / 2, s } }
}
