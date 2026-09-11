/** Minimaler PDF-Writer: je Seite ein Bild (JPEG = DCTDecode, rohes RGB = FlateDecode), MediaBox = BleedBox,
 *  TrimBox um den Beschnitt eingerückt. Port des SAFE-G-Vorbilds; genügt Online-Druckereien. */
export type PdfSeite = { bytes: Uint8Array; w: number; h: number; filter: 'DCTDecode' | 'FlateDecode' }

export function baueRasterPdf(seiten: PdfSeite[], breiteMm: number, hoeheMm: number, beschnittMm: number): Uint8Array<ArrayBuffer> {
  const PT = 72 / 25.4
  const W = breiteMm * PT
  const H = hoeheMm * PT
  const T = beschnittMm * PT
  const fx = (v: number) => v.toFixed(2)
  const enc = new TextEncoder()
  const teile: Uint8Array[] = []
  let offset = 0
  const offsets: number[] = []
  const push = (u8: Uint8Array) => {
    teile.push(u8)
    offset += u8.length
  }
  const pushStr = (s: string) => push(enc.encode(s))
  const beginObj = (n: number) => {
    offsets[n] = offset
    pushStr(`${n} 0 obj\n`)
  }

  // %PDF-1.4 + Binärkommentar, damit Transportwege die Datei als binär behandeln
  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const seitenObj = seiten.map((_, i) => 3 + i * 3)
  beginObj(1)
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  beginObj(2)
  pushStr(`<< /Type /Pages /Kids [${seitenObj.map((n) => `${n} 0 R`).join(' ')}] /Count ${seiten.length} >>\nendobj\n`)

  seiten.forEach((seite, i) => {
    const nSeite = 3 + i * 3
    const nInhalt = nSeite + 1
    const nBild = nSeite + 2
    beginObj(nSeite)
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fx(W)} ${fx(H)}] ` +
        `/BleedBox [0 0 ${fx(W)} ${fx(H)}] /TrimBox [${fx(T)} ${fx(T)} ${fx(W - T)} ${fx(H - T)}] ` +
        `/Resources << /XObject << /Im${i} ${nBild} 0 R >> >> /Contents ${nInhalt} 0 R >>\nendobj\n`,
    )
    const inhalt = `q ${fx(W)} 0 0 ${fx(H)} 0 0 cm /Im${i} Do Q\n`
    beginObj(nInhalt)
    pushStr(`<< /Length ${inhalt.length} >>\nstream\n${inhalt}endstream\nendobj\n`)
    beginObj(nBild)
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${seite.w} /Height ${seite.h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /${seite.filter} /Length ${seite.bytes.length} >>\nstream\n`,
    )
    push(seite.bytes)
    pushStr('\nendstream\nendobj\n')
  })

  const maxObj = 2 + seiten.length * 3
  const xrefStart = offset
  let xref = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`
  for (let n = 1; n <= maxObj; n++) xref += String(offsets[n]).padStart(10, '0') + ' 00000 n \n'
  pushStr(xref)
  pushStr(`trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`)

  const gesamt = new Uint8Array(offset)
  let pos = 0
  for (const t of teile) {
    gesamt.set(t, pos)
    pos += t.length
  }
  return gesamt
}

/** JPEG-Bytes des Canvas (DCTDecode). */
export function jpegBytesVonCanvas(canvas: HTMLCanvasElement, qualitaet: number): Uint8Array<ArrayBuffer> {
  const dataUrl = canvas.toDataURL('image/jpeg', qualitaet)
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Rohes RGB des Canvas, zlib-komprimiert (FlateDecode) – verlustfrei. */
export async function flateBytesVonCanvas(canvas: HTMLCanvasElement): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Dieser Browser unterstützt keine verlustfreie Kompression (CompressionStream) – bitte das 600-dpi-PDF nutzen.')
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')
  const daten = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const rgb = new Uint8Array(canvas.width * canvas.height * 3)
  for (let i = 0, j = 0; i < daten.length; i += 4) {
    rgb[j++] = daten[i]
    rgb[j++] = daten[i + 1]
    rgb[j++] = daten[i + 2]
  }
  const strom = new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(strom).arrayBuffer())
}
