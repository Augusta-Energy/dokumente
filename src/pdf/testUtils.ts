/** Zählt die Seitenobjekte (`/Type /Page`, nicht `/Pages`) – pdfkit schreibt sie unkomprimiert. */
export function seitenAnzahl(pdf: Uint8Array): number {
  const text = Buffer.from(pdf).toString('latin1')
  return (text.match(/\/Type\s*\/Page\b/g) ?? []).length
}

export function istPdf(pdf: Uint8Array): boolean {
  return Buffer.from(pdf.subarray(0, 5)).toString('latin1') === '%PDF-'
}
