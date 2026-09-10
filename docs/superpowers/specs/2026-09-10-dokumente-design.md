# Augusta Energy „Dokumente“ – Design Spec

Date: 2026-09-10
Status: approved by the user (chat approval, 2026-09-10)
Repo: `Augusta-Energy/dokumente` (public) → GitHub Pages at `https://augusta-energy.github.io/dokumente/`

## 1. Purpose

A small, German-language, single-page web app for Augusta Energy (Einzelunternehmen, Inhaber
Niklas Trojovsky, Augsburg) that generates branded PDF documents from form input. Two documents:

1. **Energie-Vergleich** – a 3-page tariff comparison / offer letter for Strom or Gas. Modeled on
   a competitor's 3-page "Vergleich" (cover letter, summary comparison, detailed conditions) but
   redesigned in Augusta branding and with all derived numbers computed by the app.
2. **Vollmacht** – a power of attorney limited strictly to electricity/gas supply matters
   (obtain data, negotiate, conclude and terminate Strom/Gas contracts, run the supplier switch,
   check invoices) for named Lieferstellen, excluding everything else.

The app is used by Augusta Energy staff on a laptop. It stores nothing on a server; all state is
in the browser (localStorage). The site is public but must not be indexed.

Non-goals: user accounts, server-side storage, e-mail sending, multi-language UI, editing of the
document wording inside the app (wording is fixed in code), e-signatures.

## 2. Brand and company facts (source: `augusta-energy-web` repo, `src/lib/site.ts`, `src/app/globals.css`, `src/components/Logo.tsx`)

Colors (use exactly):

| token       | hex       | use                                   |
|-------------|-----------|---------------------------------------|
| ink         | `#111315` | primary text, dark blocks             |
| ink-800     | `#1b1e21` | hover on dark                         |
| ink-600     | `#43484e` | secondary text                        |
| muted       | `#6d7278` | hints, footnotes                      |
| gold        | `#d5a62e` | accents, rules, highlights on dark    |
| gold-deep   | `#b3891f` | gold text on light backgrounds        |
| gold-soft   | `#e8ca74` | tints                                 |
| cream       | `#f5f3ee` | light surfaces, text on dark          |
| paper       | `#fdfcfa` | page background                       |
| line        | `#e6e2d8` | borders, table rules                  |
| line-dark   | `#2a2d31` | borders on dark                       |

Fonts: **Montserrat** (display: headings, eyebrows, buttons; uppercase, letter-spaced) and
**Raleway** (body). Both via `@fontsource/montserrat` / `@fontsource/raleway` (OFL). Web UI uses
the package CSS (woff2); PDFs register the `files/*-latin-{400,500,600,700}-normal.woff` files.

Brand conventions carried over from the website:
- `.eyebrow`: Montserrat, 0.72rem, weight 600, letter-spacing 0.22em, uppercase.
- `.display`: Montserrat, weight 700, uppercase, letter-spacing 0.015em, line-height 1.08.
- Buttons: Montserrat, 0.8rem, weight 600, letter-spacing 0.14em, uppercase; `btn-gold`
  (gold bg, ink text), `btn-dark`, `btn-outline`.
- Thin 1px gold rule under eyebrows (`.gold-rule`).
- "WORD: rest" bullet pattern → the lead word before the colon is set in gold (gold-deep on
  light backgrounds). Use this in the PDF service lists.
- Phone numbers are written as 4 digits + space + rest: `0151 41378008`.

Logo: the A-mark is three polygons in a 307×245 box (copy verbatim from the website's
`Logo.tsx`):

```
CHEVRON (ink/cream): 153.5,0 0,245 47.5,245 153.5,75.8 196,143.5 213,95
LEG     (gold):      222,109.3 307,245 259.5,245 205,158
BAR     (gold):      121,168 198.3,168 216,197 105,193
```
Full logo = mark scaled to 100 units high (scale 0.40816) + wordmark "AUGUSTA" (Montserrat 600,
ink) with a gold rule – "ENERGY" (Montserrat 600, gold, letter-spaced) – gold rule underneath.
The same geometry is used for the web header (inline SVG) and in the PDFs (react-pdf `Svg` /
`Polygon`; the wordmark rendered as react-pdf `Text` with letterSpacing since `textLength` is not
available). `public/brand/logo-rund.png` from the website may be copied for the favicon only.

Company defaults (editable in the app's "Absender" panel, persisted in localStorage):

```
firma:            Augusta Energy
inhaber:          Niklas Trojovsky
strasse:          Am Mittleren Moos 53
plz / ort:        86167 Augsburg
telefon:          0151 41378008
email:            info@augusta-energy.de
web:              augusta-energy.de
ustIdNr:          ""   (optional; shown in footer only when set)
bank / iban:      ""   (optional; shown in footer only when set)
ansprechpartner:  { name: "Niklas Trojovsky", rolle: "Inhaber & Vertriebsleitung",
                    telefon: "0151 41378008", email: "info@augusta-energy.de" }
```
Team members that may sign: Niklas Trojovsky (Inhaber & Vertriebsleitung), Gabriel Stefa
(Strom & Gas Experte), Patrick Seebach (Beratung & Projektleitung). The Ansprechpartner fields
are free text with a quick-pick of these three.

## 3. Architecture

- **Stack**: Vite 8 + React 19 + TypeScript (5.9 unless the scaffold's newer TS works cleanly
  with `tsc -b` and ESLint) + Tailwind CSS v4 (`@tailwindcss/vite`) + `@react-pdf/renderer` 4.x
  + Vitest. Node 24 locally and in CI. Package manager: npm (lockfile committed).
- **Rendering**: PDFs are produced client-side by react-pdf (vector text, embedded fonts).
  One React component per document renders both the live preview (via `usePDF` → blob URL in
  an `<iframe>`) and the download (`<a download>` to the same blob URL). Never two templates.
- **State**: plain React state per document + a `useLocalStorageState(key, initial)` hook.
  Keys: `augusta-dokumente:v1:vergleich`, `augusta-dokumente:v1:vollmacht`,
  `augusta-dokumente:v1:absender`. Preview re-render is debounced (≈400 ms).
- **No router**: one page, two tabs (Energie-Vergleich | Vollmacht), tab remembered in
  localStorage (`augusta-dokumente:v1:tab`).
- **Base path**: `vite.config.ts` `base: '/dokumente/'`.
- **No indexing**: `<meta name="robots" content="noindex, nofollow">` in `index.html` and
  `public/robots.txt` with `User-agent: *` / `Disallow: /`.
- **Deploy**: GitHub Actions on push to `main`: `npm ci` → `npm run lint` → `npm test` →
  `npm run build` → `actions/upload-pages-artifact` (`dist`) → `actions/deploy-pages`.
  Pages source = GitHub Actions (enabled via API by the orchestrator, not by the workflow).

### 3.1 Module layout

```
dokumente/
  .github/workflows/deploy.yml
  index.html                       lang="de", robots noindex, title "Augusta Energy · Dokumente"
  public/robots.txt
  public/favicon.png               (copy of website logo-rund.png)
  src/main.tsx                     fonts css imports, registerFonts(), <App/>
  src/App.tsx                      header, tabs, workspace switch
  src/index.css                    @import "tailwindcss"; @theme tokens; .eyebrow/.display/.btn/.gold-rule
  src/brand/colors.ts              hex constants (single source for UI + PDF)
  src/brand/logoGeometry.ts        polygon strings, viewBox sizes
  src/brand/Logo.tsx               web SVG logo (full / markOnly, light)
  src/brand/fonts.browser.ts       registerFonts() for the browser (?url imports of the woff files)
  src/brand/fonts.node.ts          registerFonts() for Node tests (absolute file paths)
  src/lib/absender.ts              Absender type + defaults + ansprechpartner quick-picks
  src/lib/format.ts                de-DE formatters (euro, ctProKwh, kwh, datum, monate, prozent)
  src/lib/datum.ts                 heuteIso(), addMonths(), lieferende(), gueltigBis(), parseIso()
  src/lib/zahl.ts                  parseDezimal("0,3054" | "0.3054") → number | null
  src/lib/dateiname.ts             slug() + pdfDateiname()
  src/lib/storage.ts               useLocalStorageState hook (try/catch around storage access)
  src/lib/vergleich/types.ts       VergleichDaten + Tarif types, leere Vorlage
  src/lib/vergleich/berechnung.ts  pure calculation → VergleichErgebnis
  src/lib/vergleich/vergleichsnummer.ts
  src/lib/vergleich/beispiel.ts    example data (fictional "Muster Gastronomie GmbH")
  src/lib/vergleich/pflichtfelder.ts  fehlendePflichtfelder(daten): string[]
  src/lib/vollmacht/types.ts       VollmachtDaten, Lieferstelle, leere Vorlage
  src/lib/vollmacht/beispiel.ts
  src/lib/vollmacht/pflichtfelder.ts
  src/pdf/theme.ts                 StyleSheet + constants (page size, margins, font sizes)
  src/pdf/components/*.tsx         LogoPdf, PageFrame (fixed header + footer + page numbers),
                                   SectionTitle, KeyValueGrid, Table, HighlightBlock, ColonLead
  src/pdf/VergleichDocument.tsx
  src/pdf/VollmachtDocument.tsx
  src/ui/components/*.tsx          Section, Field (label + hint), TextInput, DezimalInput,
                                   DateInput, Select, Toggle, Button, Tabs, PdfPreview
  src/ui/AbsenderPanel.tsx
  src/ui/VergleichForm.tsx
  src/ui/VollmachtForm.tsx
  src/ui/DocumentWorkspace.tsx     generic: form slot + sticky preview + toolbar
  README.md                        German
```

Tests live next to the code as `*.test.ts(x)`. Domain modules (`src/lib/**`) are pure and
framework-free. PDF documents depend only on `src/lib` types and `src/brand`.

## 4. Document 1: Energie-Vergleich

### 4.1 Input model (`VergleichDaten`)

All numeric inputs are stored as **strings** exactly as typed (German decimal comma allowed) and
parsed with `parseDezimal` for calculations; `null` (unparseable/empty) is treated as 0 in
calculations and rendered as "–" in the PDF.

```
kunde: {
  firma: string                    // optional for Privatkunden
  anrede: 'firma' | 'frau' | 'herr' | 'divers'   // salutation form (see 4.3)
  vorname: string, nachname: string
  strasse: string, plz: string, ort: string
}
vergleich: {
  nummer: string                   // auto "AE-YYYYMMDD-XXXX", editable
  datum: string (ISO yyyy-mm-dd)   // default today
  gueltigkeitTage: string          // default "3"
  preisdarstellung: 'netto' | 'brutto'   // default 'netto' (Gewerbe); 'brutto' for Privatkunden
  ustSatz: string                  // default "19"
  hinweise: string                 // optional free text on page 3
}
lieferstelle: {
  strasse: string, plz: string, ort: string
  energieart: 'strom' | 'gas'      // default 'strom'
  jahresverbrauchKwh: string
  lieferbeginn: string (ISO)
  laufzeitMonate: string           // default "24"; Lieferende is derived
}
empfehlung: Tarif
aktuell: Tarif
  Tarif = { versorger: string, preisgarantie: string,
            arbeitspreisCt: string  /* ct/kWh netto */,
            grundpreis: string      /* € netto */,
            grundpreisEinheit: 'monat' | 'jahr' /* default 'jahr' */ }
honorar: {
  anzeigen: boolean                // default true
  anbieterwechsel: string          // € netto, total for the term; "" → row hidden
  konzessionsabgabe: string        // € netto, total for the term; "" → row hidden
}
konzessionsabgabe: {
  reduktionProJahr: string         // € netto per year saved through KA reduction; "" → hidden
}
unterzeichner: { name: string, rolle: string }   // default = absender.ansprechpartner
```

Required fields (`pflichtfelder.ts`): kunde (firma or nachname), kunde.strasse/plz/ort,
lieferstelle.strasse/plz/ort, jahresverbrauchKwh > 0, lieferbeginn, laufzeitMonate ≥ 1,
empfehlung.versorger, empfehlung.arbeitspreisCt, aktuell.versorger, aktuell.arbeitspreisCt.
If any is missing, the workspace shows „Bitte ergänze: …“ and disables the download button;
the preview still renders.

### 4.2 Calculation (`berechnung.ts`, pure)

```
faktorUst        = 1 + ustSatz/100
laufzeitJahre    = laufzeitMonate / 12
lieferende       = lieferbeginn + laufzeitMonate months − 1 day   (see datum.ts)
gueltigBis       = datum + gueltigkeitTage days

per Tarif t:
  grundpreisJahr = grundpreis × (einheit === 'monat' ? 12 : 1)
  arbeitspreisEur = arbeitspreisCt / 100
  jahreskosten   = arbeitspreisEur × verbrauch + grundpreisJahr
  abschlagMonat  = jahreskosten / 12
  laufzeitkosten = jahreskosten × laufzeitJahre

ersparnisJahr            = aktuell.jahreskosten − empfehlung.jahreskosten
ersparnisLaufzeit        = ersparnisJahr × laufzeitJahre
kaReduktionLaufzeit      = reduktionProJahr × laufzeitJahre
honorarSumme             = anzeigen ? anbieterwechsel + konzessionsabgabe : 0
gesamtersparnisLaufzeit  = ersparnisLaufzeit + kaReduktionLaufzeit − honorarSumme
brutto(x)                = x × faktorUst
```
All values are kept unrounded; formatting rounds to 2 decimals (ct/kWh: 2 decimals). Both netto
and brutto variants are exposed for every money value.

Worked example (must be a unit test; matches the competitor PDF within ±0,02 €):
verbrauch 53416 kWh, laufzeit 24, USt 19 %; empfehlung 30,54 ct/kWh, 123,11 €/Jahr;
aktuell 32,44 ct/kWh, 89,11 €/Jahr; honorar 49,00 + 320,50; KA-Reduktion 794,83 €/Jahr →
jahreskosten 16 436,36 / 17 417,26; ersparnisJahr 980,90; abschlag brutto 1 629,94 / 1 727,21;
laufzeitkosten empfehlung 32 872,72 (brutto 39 118,54); honorar brutto 58,31 / 381,40;
ersparnisLaufzeit 1 961,80 (brutto 2 334,54); kaReduktionLaufzeit 1 589,66 (brutto 1 891,70);
gesamtersparnis netto 3 181,96, brutto 3 786,53.

### 4.3 Document content (German, formal „Sie“)

Page frame (all pages): header = logo (full wordmark, ≈ 38 pt high) left, contact block right
(„Augusta Energy · Am Mittleren Moos 53 · 86167 Augsburg“, „Telefon … · … · …“ in 8 pt muted),
1 pt gold rule beneath. Footer = 7.5 pt muted: line 1 „{firma} · Inhaber: {inhaber} ·
{strasse} · {plz} {ort}“; line 2 „Telefon {telefon} · {email} · {web}“ + „ · USt-IdNr. {ustIdNr}“
if set; line 3 „Bankverbindung: {bank} · IBAN {iban}“ if set; right-aligned „Seite {n} von {N}“.
Pages 2–3 additionally carry a running line under the header: „Energie-Vergleich Nr. {nummer}
vom {datum} für {kundenname}“.

Salutation logic: `firma` → „Sehr geehrte Damen und Herren,“; `frau` → „Sehr geehrte Frau
{nachname},“; `herr` → „Sehr geehrter Herr {nachname},“; `divers` → „Guten Tag {vorname}
{nachname},“. Kundenname (running line, address block line 1) = firma if set, else
„{vorname} {nachname}“. Address block: firma; if firma set and a name exists → „z. Hd. {vorname}
{nachname}“; strasse; „{plz} {ort}“.

**Seite 1 – Anschreiben**
- Small sender line above the address: „Augusta Energy · Am Mittleren Moos 53 · 86167 Augsburg“.
- Two columns: address block (left) and meta block (right): „Vergleichsnummer“, „Datum“,
  „Gültig bis“, „Ihr Ansprechpartner“ (name, telefon, email).
- Eyebrow: „{Strom|Gas} · {lieferstelle plz ort, strasse}“. Display title: „IHR PERSÖNLICHER
  ENERGIE-VERGLEICH“.
- Salutation, then:
  „vielen Dank für Ihr Vertrauen. Auf Grundlage Ihrer Verbrauchsdaten haben wir den Markt für
  Sie ausgeschrieben und ein Einkaufsmodell entwickelt, das auf Ihre Anforderungen zugeschnitten
  ist. Das Ergebnis finden Sie auf den folgenden Seiten – zunächst im Überblick, anschließend im
  Detail.“
- Heading „Das bietet Ihnen unser Einkaufsmodell“ + three ColonLead items:
  - „Optimierte Konditionen: Durch die strukturierte, datenbasierte Ausschreibung zeigen wir
    Ihnen die besten Konditionen und Einsparpotenziale auf.“
  - „Flexible Anpassung: Unser Angebot ist modular aufgebaut und lässt sich an veränderte
    Marktbedingungen oder Ihre Wünsche anpassen.“
  - „Nachhaltige Beschaffung: Effizienz und Nachhaltigkeit behalten wir bei der Beschaffung
    ebenso im Blick wie den Preis.“
- Heading „Unsere Leistungen für Sie“ + intro sentence „Diese Leistungen sind Bestandteil
  unseres Vergleichs“ + (if honorar.anzeigen and honorarSumme > 0) „ – hierfür erheben wir das
  auf Seite 3 ausgewiesene Beratungshonorar.“ else „.“ Then six ColonLead items in a 2-column
  grid:
  - „Anbieterwechsel: Wir kümmern uns um einen reibungslosen Wechsel und alle dafür nötigen
    Schritte.“
  - „Rechnungsprüfung: Wir prüfen alle eingehenden Rechnungen und veranlassen notwendige
    Korrekturen.“
  - „Reduktion der Konzessionsabgabe: Sofern die gesetzlichen Voraussetzungen erfüllt sind,
    reduzieren wir Ihre Konzessionsabgabe.“
  - „Forderungsmanagement: Zu viel gezahlte Abschläge fordern wir vom Versorger für Sie ein,
    wenn es dort zu Verzögerungen kommt.“
  - „Nachverhandlung: Fallen die Energiepreise erheblich, verhandeln wir bestehende Verträge zu
    Ihren Gunsten neu.“
  - „Laufende Vertragsbetreuung: Wir kümmern uns rechtzeitig vor Ablauf Ihrer Preisgarantie um
    den nächsten Wechsel.“
- Closing: „Wir freuen uns auf Ihre Beauftragung und stehen Ihnen bei Fragen jederzeit zur
  Verfügung.“ / „Mit freundlichen Grüßen“ / {unterzeichner.name} / „{unterzeichner.rolle} ·
  Augusta Energy“.

**Seite 2 – Ihr Vergleich auf einen Blick**
- Display title „IHR VERGLEICH AUF EINEN BLICK“.
- Lieferstelle grid (3 columns × 2 rows, label above value): Lieferstelle („{strasse}, {plz}
  {ort}“), Energieart, Jahresverbrauch („53.416 kWh“), Lieferbeginn, Lieferende, Laufzeit
  („24 Monate“).
- Comparison table, columns „Unsere Empfehlung“ (highlighted: gold top border, gold-soft tint
  at 25 % → use `#faf3dc`) and „Ihr aktueller Tarif“. Money rows follow `preisdarstellung`
  and the table caption states „Alle Preise {netto|brutto}“:
  Versorger · Preisgarantie · Arbeitspreis („30,54 ct/kWh“) · Grundpreis („123,11 €/Jahr“ or
  „…/Monat“) · Jahreskosten · Monatlicher Abschlag · Ersparnis pro Jahr (empfehlung column only,
  aktuell shows „–“).
- HighlightBlock (ink background, cream text, gold number): „Durch unsere Einkaufsstrategie
  sparen Sie jedes Jahr“ / „{ersparnisJahr} {netto|brutto}*“. If ersparnisJahr ≤ 0 the block
  reads „Mit unserer Empfehlung ergibt sich derzeit keine Ersparnis gegenüber Ihrem aktuellen
  Tarif.“ without a number.
- Footnotes (7.5 pt muted): „* Alle Preise verstehen sich {netto zzgl. | inkl.} der gesetzlichen
  Umsatzsteuer ({ustSatz} %).“ „** Gerundete Werte auf Basis des angegebenen Jahresverbrauchs.
  Bei starken Verbrauchsschwankungen können die tatsächlichen Kosten deutlich abweichen.“
  „Alle Werte sind auf zwei Nachkommastellen gerundet.“

**Seite 3 – Konditionen im Detail**
- Display title „KONDITIONEN IM DETAIL“, eyebrow „Vergleichskonditionen vom {datum} · gültig bis
  {gueltigBis}“.
- Compact Lieferstelle grid as on page 2.
- Table „Vertragsdetails – unsere Empfehlung“, columns „netto“ | „brutto“ (the column matching
  `preisdarstellung` is bold): Energieversorger (text spanning both), Preisgarantie (text
  spanning), Arbeitspreis, Grundpreis, „Gesamtkosten Laufzeit ({n} Monate)“, „Monatlicher
  Abschlag“.
- Table „Beratungshonorar“ (only if honorar.anzeigen and at least one amount > 0): „Honorar
  Anbieterwechsel“, „Honorar Konzessionsabgabe“ (each only if > 0), sum row „Summe
  Beratungshonorar“.
- Table „Ihr Einsparpotenzial über die Laufzeit“: „Ersparnis Anbieterwechsel ({n} Monate)“;
  „Reduktion Konzessionsabgabe ({n} Monate)“ (if > 0); „abzüglich Beratungshonorar“ shown as
  negative (if honorar shown); bold total „Gesamtersparnis“.
- HighlightBlock: „Durch unseren Anbieterwechsel sparen Sie insgesamt“ /
  „{gesamtersparnisLaufzeit} {netto|brutto}**“ (same ≤ 0 fallback as page 2).
- If `hinweise` non-empty: heading „Hinweise“ + the text.
- Footnotes as page 2 plus: „Dieses Angebot ist freibleibend. Grundlage sind die zum
  Vergleichsdatum gültigen Konditionen des Versorgers; Änderungen von Steuern, Abgaben und
  Umlagen bleiben vorbehalten.“

Download filename: `Augusta-Energy_Energie-Vergleich_{slug(kundenname)}_{datum}.pdf`.

## 5. Document 2: Vollmacht

### 5.1 Input model (`VollmachtDaten`)

```
vollmachtgeber: {
  typ: 'privat' | 'unternehmen'          // default 'privat'
  name: string                           // Firma (unternehmen) or „Vorname Nachname“ (privat)
  vertretenDurch: string                 // unternehmen only, optional („Geschäftsführer Max M.“)
  strasse, plz, ort: string
  geburtsdatum: string (ISO)             // privat only, optional
  email, telefon: string                 // optional
}
energiearten: { strom: boolean, gas: boolean }   // default both true; ≥ 1 required
lieferstellen: Lieferstelle[]           // ≥ 1
  Lieferstelle = { id: string, adresse: string, energieart: 'strom'|'gas'|'beide',
                   zaehlernummer: string, maloId: string, versorger: string }
geltung: { art: 'unbefristet' | 'befristet', bis: string (ISO) }   // default unbefristet
untervollmacht: boolean                 // default false
unterschrift: { ort: string, datum: string (ISO, optional) }   // ort defaults to vollmachtgeber.ort
```
Required: name, strasse, plz, ort, ≥ 1 energieart, every Lieferstelle has adresse; befristet →
bis.

### 5.2 Document content (1 page; 2 if many Lieferstellen — the Lieferstellen table may wrap
onto page 2, signature block must not be split: `wrap={false}`)

Same page frame as the Vergleich (header, footer, page numbers). No running line.

- Eyebrow „Energieversorgung · {Strom | Gas | Strom und Gas}“ (from energiearten), display title
  „VOLLMACHT“.
- Two side-by-side boxes (cream background): „Vollmachtgeber/in“ → name; „vertreten durch
  {vertretenDurch}“ (if set); strasse; „{plz} {ort}“; „geb. am {geburtsdatum}“ (if set); email /
  telefon (if set). „Bevollmächtigte“ → „{firma}“; „Inhaber: {inhaber}“; strasse; „{plz} {ort}“;
  „Telefon {telefon} · {email}“.
- Paragraph (ich/wir by typ: privat → „bevollmächtige ich“, unternehmen → „bevollmächtigen wir“):
  „Hiermit {bevollmächtige ich | bevollmächtigen wir} (nachfolgend „Vollmachtgeber“) die vorstehend
  genannte Bevollmächtigte, {mich | uns} in allen Angelegenheiten der Versorgung mit
  {Strom | Gas | Strom und Gas} für die nachfolgend aufgeführten Lieferstellen gegenüber
  Energieversorgungsunternehmen, Netzbetreibern und Messstellenbetreibern zu vertreten.“
- Heading „Lieferstellen“ + table: Nr. | Adresse | Energieart | Zählernummer | Marktlokations-ID
  | Bisheriger Versorger (empty cells „–“).
- Heading „Umfang der Vollmacht“ + „Die Vollmacht umfasst insbesondere:“ + numbered list:
  1. „die Einholung von Auskünften und Unterlagen bei bisherigen und künftigen Energieversorgern,
     Netzbetreibern und Messstellenbetreibern, insbesondere zu Vertragsdaten, Laufzeiten,
     Kündigungsfristen, Verbrauchsdaten, Zählerständen und Rechnungen;“
  2. „die Einholung, den Vergleich und die Verhandlung von Angeboten für die Lieferung von
     {Strom | Gas | Strom und Gas};“
  3. „den Abschluss von Energielieferverträgen für die genannten Lieferstellen im Namen des
     Vollmachtgebers einschließlich der Abgabe aller hierfür erforderlichen Erklärungen;“
  4. „die Kündigung bestehender Energielieferverträge sowie die Ausübung von
     Sonderkündigungs- und Widerrufsrechten;“
  5. „die Durchführung und Begleitung des Lieferantenwechsels einschließlich der An- und
     Abmeldung der Lieferstellen beim Netzbetreiber;“
  6. „die Prüfung von Rechnungen und Abschlägen, die Geltendmachung von Korrekturen,
     Rückerstattungen und Guthaben sowie die Beantragung einer Reduzierung der
     Konzessionsabgabe;“
  7. „die Entgegennahme von Korrespondenz und Vertragsunterlagen im Zusammenhang mit den
     vorgenannten Angelegenheiten.“
- Heading „Beschränkung der Vollmacht“:
  „Diese Vollmacht ist ausschließlich auf Angelegenheiten der {Strom- und Gasversorgung |
  Stromversorgung | Gasversorgung} der genannten Lieferstellen beschränkt. Sie berechtigt die
  Bevollmächtigte insbesondere nicht“ + bullets:
  - „zum Abschluss von Verträgen anderer Art, etwa Kauf-, Werk-, Miet-, Darlehens- oder
    Finanzierungsverträgen – auch nicht über Photovoltaikanlagen oder Wärmepumpen;“
  - „zur Eingehung von Zahlungsverpflichtungen des Vollmachtgebers, die über die Entgelte der
    abgeschlossenen Energielieferverträge hinausgehen;“
  - „zur Verfügung über Bankkonten oder zur Erteilung von SEPA-Lastschriftmandaten – diese
    bleiben dem Vollmachtgeber vorbehalten;“
  - „zur Vertretung in gerichtlichen Verfahren oder zur Abgabe von Schuldanerkenntnissen.“
- Heading „Untervollmacht“: default „Die Bevollmächtigte darf sich zur Ausführung dieser
  Vollmacht ihrer Mitarbeitenden bedienen. Die Erteilung einer Untervollmacht an Dritte ist nicht
  gestattet.“ If untervollmacht: „Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.“
- Heading „Geltungsdauer und Widerruf“: „Die Vollmacht gilt ab dem Datum der Unterzeichnung
  {unbefristet bis auf Widerruf | bis zum {bis}}. Sie kann jederzeit ohne Angabe von Gründen in
  Textform (z. B. per E-Mail an {email}) widerrufen werden. Mit Zugang des Widerrufs erlischt
  die Vollmacht; bis dahin vorgenommene Handlungen bleiben wirksam.“
- Heading „Datenschutz“: „Der Vollmachtgeber ist damit einverstanden, dass die Bevollmächtigte
  die zur Ausführung dieser Vollmacht erforderlichen personenbezogenen Daten (insbesondere Name,
  Anschrift, Kontaktdaten, Zählernummern, Verbrauchs- und Vertragsdaten) verarbeitet und an die
  betreffenden Energieversorger, Netzbetreiber und Messstellenbetreiber übermittelt. Die
  Datenschutzhinweise der Bevollmächtigten ({web}/datenschutz) wurden zur Kenntnis genommen.“
- Heading „Sonstiges“: „Eine Kopie oder ein Scan dieser Vollmacht gilt als Original. Sollte eine
  Bestimmung dieser Vollmacht unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen
  unberührt.“
- Signature block (`wrap={false}`), two columns with a line each: „Ort, Datum“ (prefilled
  „{ort}, {datum}“ or „{ort}, “ when datum empty) and „Unterschrift Vollmachtgeber/in“ with the
  small note „bei Unternehmen: Name in Druckbuchstaben, Funktion, ggf. Firmenstempel“.

Download filename: `Augusta-Energy_Vollmacht_{slug(name)}_{datum-or-today}.pdf`.

## 6. UI (German, informal „du“ like the website; documents stay „Sie“)

- **Header**: full logo (links to nothing), eyebrow „Dokumente“, right: button „Absender“
  (opens the Absender panel as a slide-over/dialog with the fields from §2 and a „Zurücksetzen
  auf Standard“ link).
- **Tabs**: „Energie-Vergleich“ / „Vollmacht“ (Montserrat uppercase, gold underline on active).
- **Workspace** (`DocumentWorkspace`): grid `lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]`.
  Left = form sections (each: eyebrow + gold rule + fields in a responsive 1–2 column grid).
  Right = sticky column: toolbar (`btn-gold` „PDF herunterladen“, `btn-outline`
  „Beispieldaten laden“, text button „Zurücksetzen“ with `confirm()`), status line („Vorschau
  wird aktualisiert …“ while rendering; missing-field notice „Bitte ergänze: a, b, c“), then the
  preview iframe with A4 aspect ratio (`aspect-[210/297]`, max height ≈ 80vh, border `line`).
  On < lg the preview stacks below the form.
- **Inputs**: text inputs on cream background with ink 1px bottom/border, gold focus ring
  (matches the site: `outline 2px gold`), labels as small Montserrat uppercase, hints in muted.
  `DezimalInput` = text input with `inputMode="decimal"`, right-aligned, unit suffix shown
  (ct/kWh, €, kWh, Monate, %, Tage). `DateInput` = native `type="date"`.
- **Vergleich form sections**: „Kunde“, „Vergleich“ (nummer with „Neu“ button, datum,
  gueltigkeitTage, preisdarstellung radio „netto (Gewerbe) / brutto (Privat)“, ustSatz),
  „Lieferstelle & Belieferung“ (energieart radio, verbrauch, lieferbeginn, laufzeit, derived
  Lieferende shown read-only), „Unsere Empfehlung“ / „Aktueller Tarif“ (two tariff blocks with
  the same fields), „Beratungshonorar“ (toggle + two amounts), „Konzessionsabgabe“
  (reduktionProJahr), „Unterzeichner“ (quick-pick + name/rolle), „Hinweise“ (textarea).
  A small read-only „Ergebnis“ strip under the tariff blocks shows Jahreskosten both tariffs,
  Ersparnis/Jahr and Gesamtersparnis, so the user sees the maths without the preview.
- **Vollmacht form sections**: „Vollmachtgeber“ (typ radio switches which fields show),
  „Energiearten“ (two checkboxes), „Lieferstellen“ (repeatable rows with „Lieferstelle
  hinzufügen“ / remove; energieart select per row), „Geltungsdauer“ (radio + date),
  „Untervollmacht“ (toggle with a one-line explanation), „Unterschrift“ (ort, datum).
- Empty state of the preview before first render: cream box with „Vorschau wird erstellt …“.
- Errors from react-pdf rendering are shown in a red-bordered box with the message; never a
  blank screen.
- Accessibility: every input has a `<label>`; buttons have visible text; focus rings visible.

## 7. Testing

- Unit (Vitest, node env): `format`, `datum` (addMonths clamps to month end: 2026-01-31 + 1 →
  2026-02-28, so lieferende(2026-01-31, 1) = 2026-02-27; lieferende(2026-01-01, 24) =
  2027-12-31), `zahl.parseDezimal` („0,3054“, „0.3054“, „1.234,56“, „“ → null, „abc“ → null),
  `dateiname.slug` („Müller & Söhne GmbH“ → „Mueller-Soehne-GmbH“, „Trattoria da Schnecki“ →
  „Trattoria-da-Schnecki“), `vergleichsnummer` (regex `^AE-\d{8}-[A-HJ-NP-Z2-9]{4}$`),
  `berechnung` (worked example in §4.2 plus edge cases: monthly Grundpreis, zero honorar,
  negative savings), `pflichtfelder` for both documents.
- PDF smoke tests (Vitest, node env, real fonts via `fonts.node.ts`): `renderToBuffer` of
  `VergleichDocument` with `beispiel` → buffer starts with `%PDF`, page count 3
  (count `/Type /Page` objects excluding `/Pages`); `VollmachtDocument` with the example
  (2 Lieferstellen) → 1 page; with 12 Lieferstellen → 2 pages and no thrown error.
- `npm run lint`, `tsc -b`, `npm run build` must pass in CI.
- Visual QA by the orchestrator: render both example PDFs to files and inspect them page by
  page (the Read tool renders PDFs); fix layout issues before the final push.

## 8. Deployment and repo

- Repo `Augusta-Energy/dokumente`, public, default branch `main`, description „Dokumente
  generieren: Energie-Vergleich und Vollmacht (Augusta Energy)“.
- Pages: source „GitHub Actions“ (`gh api -X POST repos/Augusta-Energy/dokumente/pages
  -f build_type=workflow`). Workflow permissions: `contents: read`, `pages: write`,
  `id-token: write`; concurrency group `pages`. Node 24, `npm ci`.
- README (German): purpose, local dev (`npm install`, `npm run dev`), tests, deploy, a note
  that the Vollmacht wording is a template and should be checked by a lawyer before productive
  use, and where to change the company defaults (`src/lib/absender.ts`).

## 9. Open assumptions (stated, not blocking)

- Honorar amounts are entered as totals for the term, not per year.
- The fee section can be switched off entirely for customers without a Beratungshonorar.
- Bank details and USt-IdNr are unknown and left blank by default.
- The Vollmacht text is a carefully worded template, not legal advice.
