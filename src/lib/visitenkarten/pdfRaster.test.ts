import { describe, expect, it } from 'vitest'
import { baueRasterPdf } from './pdfRaster'

const dec = new TextDecoder('latin1')

describe('baueRasterPdf', () => {
  it('schreibt ein PDF 1.4 mit zwei Bildseiten, gültiger xref-Tabelle und Trim-Box', () => {
    const pdf = baueRasterPdf(
      [
        { bytes: new Uint8Array([1, 2, 3]), w: 2, h: 1, filter: 'DCTDecode' },
        { bytes: new Uint8Array([4, 5]), w: 1, h: 1, filter: 'FlateDecode' },
      ],
      91,
      61,
      3,
    )
    const text = dec.decode(pdf)
    expect(text.startsWith('%PDF-1.4\n')).toBe(true)
    expect(text.endsWith('%%EOF\n')).toBe(true)
    expect(text).toContain('/MediaBox [0 0 257.95 172.91]')
    expect(text).toContain('/BleedBox [0 0 257.95 172.91]')
    expect(text).toContain('/TrimBox [8.50 8.50 249.45 164.41]')
    expect(text).toContain('/Count 2')
    expect(text).toContain('/Filter /DCTDecode /Length 3')
    expect(text).toContain('/Filter /FlateDecode /Length 2')

    const xrefStart = Number(text.match(/startxref\n(\d+)\n/)?.[1])
    expect(dec.decode(pdf.slice(xrefStart, xrefStart + 4))).toBe('xref')
    const eintraege = [...dec.decode(pdf.slice(xrefStart)).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]))
    expect(eintraege).toHaveLength(8) // Catalog, Pages, 2 × (Page, Contents, Image)
    eintraege.forEach((offset, i) => {
      expect(dec.decode(pdf.slice(offset, offset + 12)).startsWith(`${i + 1} 0 obj`)).toBe(true)
    })
  })
})
