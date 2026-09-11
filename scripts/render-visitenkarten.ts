import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SCHRIFTEN_CSS_NODE } from '../src/brand/fonts.svg.node.ts'
import { standardAbsender } from '../src/lib/absender.ts'
import { DESIGNS } from '../src/lib/visitenkarten/designs/index.ts'
import { PERSONEN, personKarte } from '../src/lib/visitenkarten/personen.ts'
import { renderKarte } from '../src/lib/visitenkarten/render.ts'
import { BESCHNITT, FOTO_ID, type Farbwelt, type Foto, type Seite } from '../src/lib/visitenkarten/typen.ts'

/** Schreibt alle 24 Export-SVGs (Beispiel: Niklas mit Foto) und Galerien zur Sichtprüfung nach out/visitenkarten/.
 *  Screenshot: npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1500,1100 --full-page "file://$PWD/out/visitenkarten/galerie-01.html" out/visitenkarten/galerie-01.png */
const person = PERSONEN[0]
const fotoDaten = person.foto
if (!fotoDaten) throw new Error('Beispielperson ohne Foto')
const karte = personKarte(person, standardAbsender)
const foto: Foto = {
  src: `data:image/jpeg;base64,${readFileSync(`public/visitenkarten/team/${fotoDaten.datei}`).toString('base64')}`,
  w: fotoDaten.w,
  h: fotoDaten.h,
  crop: fotoDaten.crop,
}
const ziel = 'out/visitenkarten'
mkdirSync(ziel, { recursive: true })
const farbwelten: Farbwelt[] = ['hell', 'dunkel']
const seiten: Seite[] = ['vorderseite', 'rueckseite']

function kachel(titel: string, svg: string): string {
  return `<figure><figcaption>${titel}</figcaption>${svg.replace(/^<\?xml[^>]*>\n?/, '')}</figure>`
}

/** Einmal pro Galerieseite: das Foto als verstecktes <image>, das die Kacheln per <use> referenzieren –
 *  genau wie die App in der Vorschau. Vermeidet, das ~330 KB große Foto in jeder Kachel einzubetten. */
function fotoDefs(f: Foto): string {
  return `<svg width="0" height="0" style="position:absolute"><defs><image id="${FOTO_ID}" href="${f.src}" width="${f.w}" height="${f.h}"/></defs></svg>`
}

function galerie(kacheln: string[], spalten: number): string {
  return (
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Visitenkarten</title><style>${SCHRIFTEN_CSS_NODE}\n` +
    `body{margin:24px;background:#8d8d8d;font:13px Raleway,sans-serif;color:#fff}.g{display:grid;grid-template-columns:repeat(${spalten},1fr);gap:22px}` +
    `figure{margin:0}figcaption{margin-bottom:6px}svg{width:100%;height:auto;display:block;box-shadow:0 8px 22px rgba(0,0,0,.35)}</style></head>` +
    `<body>${fotoDefs(foto)}<div class="g">${kacheln.join('')}</div></body></html>`
  )
}

const alle: string[] = []
const alleHilfslinien: string[] = []
for (const design of DESIGNS) {
  const proDesign: string[] = []
  for (const farbwelt of farbwelten) {
    for (const seite of seiten) {
      const basis = { karte, firma: standardAbsender.firma, farbwelt, seite, foto }
      const titel = `${design.nr} ${design.titel} · ${farbwelt} · ${seite}`
      // Die exportierte .svg-Datei bettet Foto und Schriften ein (wie ein echter Download); die Galerie-
      // Kacheln laufen dagegen im Vorschau-Modus (Foto per <use>), damit die Seite nicht das Foto dutzendfach einbettet.
      writeFileSync(`${ziel}/${design.nr}-${design.id}-${farbwelt}-${seite}.svg`, renderKarte(design, { ...basis, modus: 'export', beschnitt: 0, schriftenCss: SCHRIFTEN_CSS_NODE }))
      const ohne = kachel(titel, renderKarte(design, { ...basis, modus: 'vorschau', beschnitt: 0 }))
      alle.push(ohne)
      proDesign.push(ohne)
      alleHilfslinien.push(kachel(`${titel} · Hilfslinien`, renderKarte(design, { ...basis, modus: 'vorschau', beschnitt: BESCHNITT, hilfslinien: true })))
    }
  }
  writeFileSync(`${ziel}/galerie-${design.nr}.html`, galerie(proDesign, 2))
}
writeFileSync(`${ziel}/galerie.html`, galerie(alle, 4))
writeFileSync(`${ziel}/galerie-hilfslinien.html`, galerie(alleHilfslinien, 4))
console.log(`${ziel}: ${DESIGNS.length * 4} SVGs, galerie.html, galerie-hilfslinien.html, galerie-01…06.html`)
