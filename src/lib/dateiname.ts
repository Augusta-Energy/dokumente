const UMSCHRIFT: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss' }

export function slug(text: string): string {
  const umschrieben = text.replace(/[äöüÄÖÜß]/g, (z) => UMSCHRIFT[z] ?? z)
  const ohneAkzente = umschrieben.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const s = ohneAkzente.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return s === '' ? 'Dokument' : s
}

export function pdfDateiname(dokument: 'Energie-Vergleich' | 'Vollmacht', name: string, datumIso: string): string {
  return `Augusta-Energy_${dokument}_${slug(name)}_${datumIso}.pdf`
}
