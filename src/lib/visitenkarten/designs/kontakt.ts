import type { Design } from './design'

export const kontakt: Design = {
  id: 'kontakt',
  nr: '05',
  titel: 'Kontakt-QR',
  beschreibung:
    'Einmal scannen, gespeichert: Der QR-Code auf der Vorderseite trägt die vCard mit Name, Rolle, Nummer, E-Mail und Adresse und wird live aus den Kartendetails codiert. Die Rückseite verlinkt per QR auf Website, WhatsApp oder Instagram.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + 7, b + 7, 6.5).svg
    if (z.hatFoto()) s += z.foto(b + 68.5, b + 5.2, 9.5, { rw: 0.45 })
    s += z.eyebrow(b + 7, b + 25, 1.65, p.akzentText, k.rolle, { maxB: 44 })
    s += z.text(b + 7, b + 31.2, 4.1, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 44 })
    s += z.rect(b + 7, b + 33.3, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39, 3.5, { wertX: b + 16, rechts: b + 52, ohneAdresse: true, wertGroesse: 2.25 }).svg
    s += z.qrPlatte(z.vcardQr(), b + 54, b + 15.5, 24, { stroke: p.linie, sw: 0.3 })
    s += z.eyebrow(b + 66, b + 43.2, 1.3, p.label, 'KONTAKT SPEICHERN', { ls: 0.14, anker: 'middle' })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.qrPlatte(z.linkQr(), b + 33, b + 9.5, 19, { ruhe: 1.7 })
    const ziel = (k.qrLink.trim() || k.web).replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').replace(/\/$/, '')
    s += z.eyebrow(b + 42.5, b + 32.8, 1.7, p.akzentText, ziel, { ls: 0.16, anker: 'middle', maxB: 70 })
    const lw = 34
    s += z.logo(b + (85 - lw) / 2, b + 38.5, lw / 4.7).svg
    return s
  },
}
