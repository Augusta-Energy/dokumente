# Visitenkarten-Generator – Design

Dritter Reiter der Dokumente-App (`Augusta-Energy/dokumente`): Visitenkarten im Augusta-Energy-Erscheinungsbild, live aus Formulareingaben erzeugt, in sechs Gestaltungen mit je einer hellen und einer dunklen Farbwelt. Vorbild ist der SAFE-G-Visitenkarten-Designer (`Safe-G-Business-Cards/index.html`), dessen Logik für Formate, Beschnitt, QR-Codes, Fotos und Exporte übernommen wird.

## 1. Ziel und Umfang

- Neuer Tab „Visitenkarten“ neben „Energie-Vergleich“ und „Vollmacht“. Gleicher Stack (Vite, React, TypeScript, Tailwind), gleiche Deploy-Pipeline (GitHub Pages).
- Format 85 × 55 mm quer, 3 mm Beschnitt umlaufend (Druckraum 91 × 61 mm), 5 mm Sicherheitsabstand – alle Layouts halten ihn ein.
- 6 Designs × 2 Farbwelten (hell/dunkel) × 2 Seiten = 24 Layouts, alle live aus denselben Kartendetails.
- Kartendetails: Person aus dem Team wählen (Voreinstellung) oder frei eintragen; Foto (Team-Foto oder eigener Upload) zuschaltbar; QR-Codes (vCard und Link) werden live codiert.
- Exporte wie beim Vorbild: SVG (Schriften eingebettet), PNG 300/600 dpi (optional mit 3 mm Beschnitt), Druck-PDF 600 dpi (JPEG, Trim-Box), Druck-PDF verlustfrei (Flate), Druckansicht → Vektor-PDF über den Browser-Druckdialog (exakte physische Größe, Schnittmarken).
- Hilfslinien (Schnittkante rot, Sicherheitsbereich blau) in der Vorschau zuschaltbar.
- Deep-Link `?person=<id>` wählt die Person vor.
- Alles läuft im Browser; nichts wird gesendet.

Nicht im Umfang: Firmenlogo-Upload, freie Farbwahl, weitere Formate (Hochformat, US-Format), ZIP-Sammeldownload, echter Vektor-PDF-Download ohne Druckdialog (siehe Entscheidungen), `?selftest`-Modus des Vorbilds (ersetzt durch Vitest).

## 2. Nutzerfluss und Oberfläche

Reihenfolge auf der Seite (innerhalb des Tabpanels):

1. **Kartendetails** (Panel): Segment-Buttons für die Personen (Niklas, Gabriel, Patrick, Zentrale), darunter Felder Name, Rolle, Telefon, E-Mail, Website, Adresse (leer = ausblenden), QR-Link (Rückseite Design 05) mit drei Schnellwahl-Buttons „Website“, „WhatsApp“, „Instagram“. Optionen: „Foto anzeigen“ (deaktiviert, wenn kein Foto vorliegt), „Eigenes Foto …“ (Datei-Upload, mittiger quadratischer Ausschnitt), „Schnittkante & Sicherheitsbereich anzeigen“, „SVG/PNG mit 3 mm Beschnitt exportieren“, Farbwelt-Umschalter „Hell · Dunkel · Beide“ (Standard: Beide). Eine Änderung eines Feldes hebt die Personen-Auswahl auf (kein Segment aktiv), das Foto bleibt.
2. **Sechs Design-Abschnitte** (01–06): Nummer, Titel, Beschreibung. Pro sichtbarer Farbwelt eine Zeile mit Zeilenlabel („Hell“/„Dunkel“), zwei Vorschauen (Vorderseite, Rückseite; Beschriftung mit „85 × 55 mm“), unter jeder Vorschau die Buttons „SVG“, „PNG 300 dpi“, „PNG 600 dpi“; rechts in der Zeile die Buttons „Druck-PDF 600 dpi“, „Druck-PDF verlustfrei“, „Drucken → Vektor-PDF“. Buttons sind während eines Exports deaktiviert; Fehler erscheinen als Text neben der Zeile (kein `alert`).
3. **Druckdaten & Hinweise**: Endformat, Druck-PDF, Drucken → Vektor-PDF, PNG, SVG, QR-Codes, Fotos, Papierempfehlung, Schriften – Inhalte analog zum Vorbild, auf Augusta übertragen.

Vorschauen sind inline eingefügte SVGs (`dangerouslySetInnerHTML`), skaliert auf die Spaltenbreite, mit Kartenschatten. Die Vorschau folgt den Eingaben mit 150 ms Entprellung.

Die Seite bleibt bei 400 px Breite benutzbar (Vorschauen untereinander, Buttons umbrechen).

## 3. Datenmodell

```ts
type Farbwelt = 'hell' | 'dunkel'
type Seite = 'vorderseite' | 'rueckseite'
type Karte = { name: string; rolle: string; telefon: string; email: string; web: string; adresse: string; qrLink: string }
type FotoCrop = { x: number; y: number; s: number }          // quadratischer Ausschnitt in Quellpixeln
type Foto = { src: string; w: number; h: number; crop: FotoCrop } // src = data-URL
type Person = { id: string; kurz: string; name: string; rolle: string; foto?: { datei: string; w: number; h: number; crop: FotoCrop } }
type VisitenkartenZustand = { personId: string | null; karte: Karte; fotoAnzeigen: boolean; hilfslinien: boolean; beschnittExport: boolean; farbwelt: Farbwelt | 'beide' }
```

- Personen (`src/lib/visitenkarten/personen.ts`): `niklas` (Niklas Trojovsky, Inhaber & Vertriebsleitung, Foto niklas-trojovsky.jpg 898×1200, Crop x 205 y 120 s 520), `gabriel` (Gabriel Stefa, Strom & Gas Experte, gabriel-stefa.jpg 900×1200, Crop 195/110/520), `patrick` (Patrick Seebach, Beratung & Projektleitung, patrick-seebach.jpg 900×1200, Crop 210/110/520), `zentrale` (Name = `absender.firma`, Rolle „Photovoltaik · Wärmepumpen · Strom & Gas“, kein Foto). René Raab ist Finanzierungspartner (Wüstenrot) und bekommt keine Augusta-Karte.
- Beim Laden einer Person: Name/Rolle aus der Person; Telefon, E-Mail, Website, Adresse (`Straße · PLZ Ort`) und QR-Link (`https://<web>`) aus dem aktuellen `Absender` (Panel „Absender“). Damit folgen die Karten den gepflegten Firmendaten.
- Persistenz: `augusta-dokumente:v1:visitenkarte` (Zustand ohne Foto). Fotos werden nicht gespeichert; Team-Fotos werden beim Laden der Person aus `public/visitenkarten/team/` geholt (fetch → data-URL), eigene Fotos leben nur im Speicher.
- Deep-Link: `?person=<id>` beim ersten Rendern gewinnt gegen den gespeicherten Zustand.
- Standard bei leerem Speicher: Person `niklas` geladen.

## 4. Render-Engine (`src/lib/visitenkarten/`)

Reine TypeScript-Funktionen ohne DOM, lauffähig in Vitest und im Node-Skript.

- **Koordinaten in mm.** `KARTE = { breite: 85, hoehe: 55 }`, `BESCHNITT = 3`, `SICHERHEIT = 5`. Jede Seite wird als innerer SVG-String im Raum `(KARTE + 2·b)` gezeichnet; Layouts addieren `b` zu allen Trim-Koordinaten, Hintergründe füllen `0..W`. Zahlen werden auf 3 Nachkommastellen gerundet.
- **Dokumenthülle** `svgDokument(inner, o)`: `<svg width="…mm" height="…mm" viewBox="0 0 W H">`, optional `<style>` mit Schriften-CSS (nur Export), Sättigungsfilter fürs Foto (`feColorMatrix saturate 0.5` – entspricht der Team-Darstellung der Website), Hilfslinien (Trim: `#e11d48` gestrichelt 1.6/1.1, Sicherheitsbereich: `#0284c7` 1/1) und Schnittmarken (grau 0.15, 0.8 mm Abstand) wie beim Vorbild.
- **Zeichner** (`svg.ts`): Klasse mit Kontext (`b`, `W`, `H`, `uid`, Palette `p`, Karte `k`, `dunkel`, Foto, Messer) und Methoden `rect`, `polygon`, `linie`, `kreis`, `text`, `eyebrow`, `logo`, `marke`, `logoGestapelt`, `foto`, `hatFoto`, `qrPlatte`, `vcardQr`, `linkQr`, `kontaktzeilen`. `text` unterstützt Schrift (`display` = Montserrat, `text` = Raleway), Gewicht, Laufweite (em), Anker, Deckkraft, Großschreibung und `maxB` (Maximalbreite: bei Überbreite `textLength`/`lengthAdjust="spacingAndGlyphs"`).
- **Textbreite** (`textbreite.ts`): `Messer = (text, groesse, schrift, gewicht, ls) => mm`. Standard ist eine Schätzung (Montserrat 0.68 em/Zeichen bei Großbuchstaben, sonst 0.6; Raleway 0.52) plus Laufweite. Im Browser liefert `canvasMesser()` echte Breiten über `CanvasRenderingContext2D.measureText`, sobald `document.fonts.ready` erfüllt ist.
- **Logo**: exakt das Website-Logo als verschachteltes SVG (`viewBox 0 0 470 100`; Marke aus `logoGeometry.ts`, Wortmarke „AUGUSTA“ Montserrat 600 mit `textLength 315`, Goldlinien, „ENERGY“ `textLength 157.5`). Breite = 4.7 × Höhe. `marke` zeichnet nur die A-Marke (307 × 245). `logoGestapelt` setzt Marke, „AUGUSTA“ und „— ENERGY —“ zentriert untereinander (wie das runde Logo der Website). Farben pro Aufruf überschreibbar (Grundfarbe, Gold, Deckkraft), damit Wasserzeichen und Panels funktionieren.
- **Foto** `foto(x, y, d)`: Kreis mit Platte, gesättigt reduziertes Bild im Ausschnitt (verschachteltes `<svg viewBox="crop">`), Goldring (0.5 mm). Im Modus `vorschau` referenziert das Bild per `<use href="#vk-foto">` ein einmal in der Seite hinterlegtes `<image id="vk-foto">` (hält das DOM bei 24 Vorschauen klein); im Modus `export` wird das `<image>` mit data-URL eingebettet.
- **QR** (`qr.ts`): `qrcode`-Paket (`QRCode.create`, Fehlerkorrektur M) → `{ n, pfad }` (ein Pfad aus horizontalen Läufen), Cache der letzten 60 Texte. `qrPlatte` setzt den Code auf eine weiße Platte (rx 0.6) mit Ruhezone `max(1.6, 8.5 %)`.
- **vCard** (`vcard.ts`): Version 3.0; `N` (Nachname = letztes Wort), `FN`, `ORG` (Firma), `TITLE`, `TEL;TYPE=CELL` international (`normalisiereTelefon`: `00…` → `+…`, `0…` → `+49…`), `EMAIL`, `URL` (https ergänzt), `ADR;TYPE=WORK` (aus „Straße · PLZ Ort“ geparst, sonst Rohtext), CRLF.
- **Kontaktzeilen**: Reihen `TEL`, `MAIL`, `WEB`, `ADR` nur für gesetzte Werte; Label Montserrat 600, 1.4 mm, Laufweite 0.14 em, Wert Raleway. Optionen: Wert-X, rechter Rand, Adresse ohne Label über die volle Breite, Adresse weglassen.
- **Render** `renderKarte(design, o)`: baut `uid` (`<design>-<farbwelt>-<seite>-<b>[g][t]`), erzeugt den Zeichner, ruft `design.vorderseite(z)`/`design.rueckseite(z)` und verpackt das Ergebnis.

## 5. Farbwelten und Design-Vertrag

Palette (`palette.ts`, Quelle `farben` aus `src/brand/colors.ts`):

| Token | hell | dunkel |
|---|---|---|
| grund | paper #fdfcfa | ink #111315 |
| text | ink | cream #f5f3ee |
| textSanft | ink600 #43484e | rgba(245,243,238,.82) |
| label | muted #6d7278 | rgba(245,243,238,.55) |
| akzent | gold #d5a62e | gold |
| akzentText | goldDeep #b3891f | gold |
| linie | line #e6e2d8 | lineDark #2a2d31 |
| platte | line | ink800 #1b1e21 |
| logoBase | ink | cream |
| panel | ink | gold |
| panelText | cream | ink |
| panelLogoBase | cream | ink |
| panelGold | gold | cream |
| panelAkzent | gold | ink |

Design-Vertrag (`designs/index.ts`): `{ id, nr, titel, beschreibung, vorderseite(z), rueckseite(z) }`; `DESIGNS` ist die geordnete Liste. Jedes Design ist eine Datei `designs/<id>.ts`, liest nur den Zeichner und die Palette, kennt keine Farbwelt außer über `z.dunkel`/`z.p`.

Typografie auf der Karte: Name Montserrat 700 Großbuchstaben (3.7–4.6 mm, Laufweite 0.02 em), Rolle als Eyebrow (Montserrat 600, 1.6–1.7 mm, Laufweite 0.18 em, Gold), Kontaktwerte Raleway 400/500 (2.1–2.35 mm), Labels Montserrat 600 1.4 mm. Goldlinie 0.6–0.8 mm stark als Trenner. Firmentexte: Claim „ENERGIE. EINFACH BESSER GELÖST.“, Leistungszeile „PHOTOVOLTAIK · WÄRMEPUMPEN · STROM · GAS“, Instagram „@augustaenergy“, Website aus den Kartendetails (Großbuchstaben).

## 6. Die sechs Designs

Genaue Koordinaten stehen im Implementierungsplan; hier das Konzept (Vorderseite / Rückseite; beide Farbwelten teilen die Geometrie und unterscheiden sich nur über die Palette, sofern nicht anders gesagt).

1. **01 Klassik** – die redaktionelle Ruhe der Website. Logo oben links, Rolle als Gold-Eyebrow, Name groß, kurze Goldlinie, Kontaktzeilen mit Labels; Foto rund oben rechts. Rückseite: Logo zentriert, Goldlinie, Claim, Leistungszeile, Website.
2. **02 Signatur** – die A-Marke als großes Wasserzeichen, das rechts über die Kante läuft (Chevron sehr dezent, Querbalken in Gold). Vorderseite sonst wie Klassik mit engerem Textblock. Rückseite: gestapeltes Logo (Marke, AUGUSTA, — ENERGY —) mit Leistungszeile.
3. **03 Rahmen** – feine Goldlinie als Rahmen 3.5 mm innerhalb der Schnittkante mit kleinen Goldquadraten in den Ecken, zentrierte Komposition: Marke (oder rundes Foto) oben, Name, Rolle, Goldlinie, Kontakt in zentrierten Zeilen ohne Labels. Rückseite: Rahmen, Logo, Leistungszeile, Claim, Website.
4. **04 Porträt** – großes rundes Foto links (26 mm) mit Goldring; ohne Foto ein Goldring mit der Marke als Monogramm. Rechts Logo klein, Rolle, Name, Kontakt (Adresse ohne Label). Rückseite in der Panel-Farbe (hell: Ink mit hellem Logo, dunkel: Gold mit Ink-Logo), Claim, Website, unten Website und Instagram.
5. **05 Kontakt-QR** – vCard-QR (26 mm) rechts mit „KONTAKT SPEICHERN“, links Logo, Rolle, Name, Kontakt ohne Adresse; kleines Foto oben rechts. Rückseite: Link-QR (19 mm) mit Host-Zeile in Gold, Logo darunter.
6. **06 Schräge** – linkes Panel in der Panel-Farbe mit schräger Kante (Neigung der A-Marke), darin Marke und rundes Foto (ohne Foto: Leistungen als drei Zeilen). Rechts Rolle, Name, Goldlinie, Kontakt, Leistungszeile. Rückseite: Panel-Farbe mit schrägem Streifen der Grundfarbe rechts, Logo, Claim, Website.

## 7. Exporte (`exporte.ts`, `pdfRaster.ts`, `druckansicht.ts`)

- **Export-SVG**: Modus `export`, Schriften-CSS eingebettet (Montserrat 500/600/700, Raleway 400/500/600 als `data:font/woff2;base64` `@font-face`, aus den Fontsource-woff2 via Vite `?inline`), Foto eingebettet, optional 3 mm Beschnitt. Datei `image/svg+xml`.
- **PNG**: SVG-String → Blob-URL → `Image` → Canvas in Pixelgröße `round(mm / 25.4 × dpi)` (300 dpi: 1004 × 650, 600 dpi: 2008 × 1299, mit Beschnitt 2150 × 1441) → `toBlob('image/png')`.
- **Druck-PDF 600 dpi**: Vorder- und Rückseite mit Beschnitt gerastert, JPEG (Qualität 0.93, DCTDecode) in einen minimalen PDF-Writer (`pdfRaster.ts`, Port des Vorbilds): PDF 1.4, MediaBox = BleedBox = 91 × 61 mm, TrimBox 3 mm eingerückt, xref-Tabelle, sRGB.
- **Druck-PDF verlustfrei**: Rohes RGB aus dem Canvas, `CompressionStream('deflate')` → FlateDecode. Ohne `CompressionStream` erscheint eine Fehlermeldung mit Hinweis auf das 600-dpi-PDF.
- **Drucken → Vektor-PDF**: neues Fenster mit beiden Seiten in exakter Größe (`@page { size: 91mm 61mm; margin: 0 }`), Schriften-CSS eingebettet, Schnittmarken, `window.print()` nach `document.fonts.ready`. Pop-up-Blocker → Fehlermeldung.
- **Dateinamen** (`dateiname.ts` der Visitenkarten, nutzt `slug` aus `src/lib/dateiname.ts`): `Augusta-Energy_Visitenkarte_<nr>-<Titel>_<Hell|Dunkel>_<Name>` + `_Vorderseite|_Rueckseite` + `_300dpi|_600dpi` + `_Beschnitt` + Endung; PDF: `…_Druck.pdf` bzw. `…_Druck-verlustfrei.pdf`. Leerer Name → „Karte“.
- Download über temporären Blob-Link (`<a download>`), URL nach 4 s freigegeben.

## 8. Assets

- `public/visitenkarten/team/{niklas-trojovsky,gabriel-stefa,patrick-seebach}.jpg` – Kopien aus `augusta-energy-web/public/team` (je ≈125 KB). Laden über `import.meta.env.BASE_URL`.
- Schriften: Fontsource-Dateien, die die App bereits nutzt; für Export-CSS die woff2-Latin-Dateien (`src/brand/fonts.svg.browser.ts`, Node-Gegenstück `fonts.svg.node.ts` für das Skript).
- `npm run render:visitenkarten` (`scripts/render-visitenkarten.tsx`): schreibt alle 24 Export-SVGs (Beispielperson Niklas mit Foto) und eine Galerie `out/visitenkarten/galerie.html` zur Sichtprüfung (Screenshot per Playwright).

## 9. Tests (proportional, nur knifflige Logik)

- `vcard.test.ts`: Telefon-Normalisierung, N/FN-Aufteilung, Adress-Parsing, CRLF.
- `qr.test.ts`: bekannter Text ergibt erwartete Modulzahl, Pfad ohne `NaN`, Cache liefert dasselbe Objekt.
- `pdfRaster.test.ts`: xref-Offsets zeigen auf `n 0 obj`, `startxref`/`%%EOF`, TrimBox-Werte.
- `render.test.ts`: alle Designs × Farbwelten × Seiten rendern ohne `NaN`/`undefined`, beginnen mit `<?xml`, enden mit `</svg>`, Vorschau-Modus enthält `<use href="#vk-foto"`, Export-Modus die data-URL.
- `dateiname.test.ts`: Beispielnamen.
- `App.test.tsx`: dritter Tab vorhanden.

Keine jsdom-Tests der Oberfläche; Sichtprüfung über die Galerie und Screenshots.

## 10. Entscheidungen

- **Kein direkter Vektor-PDF-Download**: `@react-pdf/renderer` kennt weder SVG-Muster noch Bilder im SVG; ein zweiter Renderer würde jedes Layout doppelt implementieren. Der Weg des Vorbilds (Druckansicht → „Als PDF sichern“) liefert echte Vektoren; für Online-Druckereien reicht das 600-dpi-PDF.
- **Fotos halb entsättigt** (saturate 0.5) statt Schwarzweiß – entspricht der Team-Darstellung auf augusta-energy.de.
- **Rahmen (03)** liegt 4.5 mm innerhalb der Schnittkante (Schnitttoleranz), nicht 3.5 mm wie beim Vorbild.
- **Telefon/E-Mail der Personen** sind die Firmendaten (persönliche Durchwahlen unbekannt); frei editierbar.
- **Zentrale-Karte** ohne Foto, Name = Firma.
- **Kontakt-QR (05)** trägt eine 26-mm-Platte (Module ≈ 0,35 mm bei Fehlerkorrektur M, Ruhezone ≥ 4 Module); die Rückseite nutzt eine Ruhezone von 2,5 mm. Eine Karte, deren Name dem Firmennamen entspricht, ist eine Organisationskarte: die vCard setzt `N:;;;;` und `FN` = Firma.
- **Wasserzeichen (02)** und halbtransparente Palettenwerte werden über `mitAlpha(farben.x, α)` aus den Markenfarben abgeleitet (keine rgba-Literale in Designs).
- **Vorschau-Foto per `<use>`** statt 24-facher data-URL-Einbettung.
- **`qrcode`** (1.5.x) als einzige neue Abhängigkeit (+ `@types/qrcode`).

## 11. Deployment

Unverändert: Push auf `main` → Lint, Tests, Build, Pages. README erhält einen Abschnitt „Visitenkarten“.
