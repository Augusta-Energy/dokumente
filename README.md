# Augusta Energy · Dokumente

Interner Generator für drei Dokumentarten, die aus Formulareingaben erzeugt werden – komplett im Browser, ohne Server:

- **Energie-Vergleich** (Strom oder Gas): dreiseitiges Angebot mit Anschreiben, Vergleich auf einen Blick und Konditionen im Detail. Jahreskosten, Abschläge, Brutto-Werte und Ersparnis rechnet die App selbst.
- **Vollmacht**: beschränkt auf Angelegenheiten der Strom-/Gasversorgung der genannten Lieferstellen (Auskünfte, Angebote, Vertragsabschluss und -kündigung, Lieferantenwechsel, Rechnungsprüfung). Alles andere ist ausdrücklich ausgeschlossen. Das Dokument ist bewusst zweiseitig: der vollständige Wortlaut passt nicht auf eine A4-Seite.
- **Visitenkarten**: sechs Designs (Klassik, Signatur, Rahmen, Porträt, Kontakt-QR, Schräge) in je einer hellen und dunklen Farbwelt, 85 × 55 mm. Person aus dem Team wählen oder frei eintragen, Foto zuschalten oder eigenes hochladen; QR-Codes (vCard und Link) entstehen live. Exporte: SVG mit eingebetteten Schriften, PNG 300/600 dpi (optional mit 3 mm Beschnitt), Druck-PDF 600 dpi mit Trim-Box (JPEG oder verlustfrei) und „Drucken → Vektor-PDF“ über den Browser-Druckdialog. `?person=<id>` (niklas, gabriel, patrick, zentrale) wählt die Person vor.

Live: https://augusta-energy.github.io/dokumente/ (öffentlich erreichbar, aber per `noindex`-Meta-Tag von der Indexierung ausgeschlossen (die `robots.txt` gilt nur für den Domain-Root, der nicht zu diesem Repo gehört)).

## Entwicklung

```bash
npm install
npm run dev              # http://localhost:5173/dokumente/
npm test                 # Vitest (Berechnung, Formatierung, PDF-Rendering)
npm run lint             # oxlint
npm run build            # tsc + vite build → dist/
npm run render:beispiele # schreibt out/Energie-Vergleich.pdf und out/Vollmacht.pdf mit Beispieldaten
npm run render:visitenkarten # schreibt alle 24 Karten-SVGs und Galerien nach out/visitenkarten/
```

Node ≥ 24.

## Aufbau

- `src/lib` – reine Fachlogik: Zahlen/Datum/Formatierung, Berechnung des Vergleichs, Vollmacht-Texte, Pflichtfelder.
- `src/lib/visitenkarten` – Render-Engine der Visitenkarten (Zeichner in mm, Paletten, Designs, vCard/QR, Raster-PDF-Writer).
- `src/pdf` – die beiden Dokumente auf Basis von `@react-pdf/renderer` plus gemeinsame Bausteine (Seitenrahmen, Tabellen, Highlight).
- `src/ui` – Formulare, Vorschau und Absender-Einstellungen.
- `src/ui/visitenkarten` – Tab-Oberfläche und Exporte der Visitenkarten.
- `src/brand` – Farben, Logo-Geometrie und Schriften (Montserrat/Raleway via Fontsource).

Firmendaten und Ansprechpartner werden in der App unter „Absender“ gepflegt (im Browser gespeichert). Die Standardwerte stehen in `src/lib/absender.ts`.

## Deployment

Jeder Push auf `main` baut die Seite (Lint, Tests, Build) und veröffentlicht sie über GitHub Actions auf GitHub Pages (`.github/workflows/deploy.yml`).

## Hinweis zur Vollmacht

Der Vollmachtstext ist eine sorgfältig formulierte Vorlage, aber keine Rechtsberatung. Vor dem produktiven Einsatz sollte ein Rechtsanwalt den Text prüfen.
