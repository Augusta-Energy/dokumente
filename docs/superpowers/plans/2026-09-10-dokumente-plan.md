# Augusta Energy „Dokumente“ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A German single-page web app (GitHub Pages) that generates two branded PDFs from form input: a 3-page Energie-Vergleich and a Vollmacht limited to Strom/Gas supply matters.

**Architecture:** Vite + React + TypeScript SPA. Pure domain modules in `src/lib` (parsing, formatting, dates, calculation, validation) feed two `@react-pdf/renderer` document components in `src/pdf`, which render both the live preview (blob URL in an iframe) and the download. Form state lives in React state persisted to localStorage. No backend.

**Tech Stack:** Vite 8, React 19, TypeScript 6 (template default), Tailwind CSS v4 (`@tailwindcss/vite`), `@react-pdf/renderer` 4.9, `@fontsource/montserrat` + `@fontsource/raleway`, Vitest 5, oxlint, GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-10-dokumente-design.md` — read it first; every German string, color and formula in this plan comes from there.

## Global Constraints

- Project root: `/Users/daniel/Nofulla-Industries/Augusta-Energy/dokumente` (git repo, branch `main`). Run every command from there.
- Node ≥ 24, npm 11. Commit `package-lock.json`.
- Vite `base` is `/dokumente/`. `index.html` has `lang="de"` and `<meta name="robots" content="noindex, nofollow">`.
- Colors exactly: ink `#111315`, ink-800 `#1b1e21`, ink-600 `#43484e`, muted `#6d7278`, gold `#d5a62e`, gold-deep `#b3891f`, gold-soft `#e8ca74`, gold-tint `#faf3dc`, cream `#f5f3ee`, paper `#fdfcfa`, line `#e6e2d8`, line-dark `#2a2d31`.
- Fonts: Montserrat (display) and Raleway (body) from `@fontsource/*`. PDFs register the `files/*-latin-{400,500,600,700}-normal.woff` files. Hyphenation is disabled in PDFs (`Font.registerHyphenationCallback((wort) => [wort])`).
- Documents use formal „Sie“, the UI uses informal „du“. All UI and document text is German. Identifiers and comments may be German or English; be consistent within a file.
- All money/number inputs are stored as strings and parsed with `parseDezimal`; calculations never round; formatting rounds.
- Phone format `0151 41378008`.
- `erasableSyntaxOnly` is on: no `enum`, no `namespace`, no constructor parameter properties. Use union string types.
- Tests: Vitest, `environment: 'node'`, files `src/**/*.test.ts(x)`, explicit `import { describe, it, expect } from 'vitest'`.
- Before every commit: `npm run lint && npm run build && npm test` must pass (build includes `tsc -b`).
- Commit messages: conventional prefix (`feat:`, `test:`, `chore:`, `docs:`) + trailer lines:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01BtzAWQFoTQqpnn9wtzkHjd
  ```
- Never run `git push`, never create the GitHub repo, never touch `../augusta-energy-web` — the orchestrator does that.

## File Structure

```
.github/workflows/deploy.yml     CI: lint, test, build, deploy to Pages (Task 1)
.gitignore, .oxlintrc.json, index.html, package.json, tsconfig*.json, vite.config.ts (Task 1)
public/robots.txt, public/favicon.png (Task 1)
scripts/render-beispiele.tsx     writes out/*.pdf for visual QA (Task 6, extended Task 7)
src/main.tsx, src/App.tsx, src/index.css (Task 1; App rewritten Task 11)
src/brand/colors.ts, logoGeometry.ts, Logo.tsx (Task 1)
src/brand/fonts.browser.ts, fonts.node.ts (Task 5)
src/lib/zahl.ts, format.ts, datum.ts, dateiname.ts, storage.ts (+ tests) (Task 2)
src/lib/absender.ts (Task 3)
src/lib/vergleich/types.ts, vergleichsnummer.ts, berechnung.ts, pflichtfelder.ts, beispiel.ts (+ tests) (Task 3)
src/lib/vollmacht/types.ts, texte.ts, pflichtfelder.ts, beispiel.ts (+ tests) (Task 4)
src/pdf/theme.ts, testUtils.ts, components/{LogoPdf,PageFrame,Typo,KeyValueGrid,Tabelle,HighlightBlock}.tsx (Task 5)
src/pdf/VergleichDocument.tsx (+ test) (Task 6)
src/pdf/VollmachtDocument.tsx (+ test) (Task 7)
src/ui/components/{Button,Tabs,Section,Field,Inputs}.tsx, src/ui/useDebouncedValue.ts, src/ui/DocumentWorkspace.tsx (Task 8)
src/ui/VergleichForm.tsx, VergleichWorkspace.tsx (Task 9)
src/ui/VollmachtForm.tsx, VollmachtWorkspace.tsx (Task 10)
src/ui/AbsenderPanel.tsx, src/App.tsx final, README.md (Task 11)
```

---

### Task 1: Project scaffold, brand tokens, CI

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `.oxlintrc.json`, `.gitignore`, `index.html`, `public/robots.txt`, `public/favicon.png`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/brand/colors.ts`, `src/brand/logoGeometry.ts`, `src/brand/Logo.tsx`, `src/brand/Logo.test.tsx`, `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Produces: `farben` (object of hex strings) from `src/brand/colors.ts`; `MARKE_VIEWBOX`, `CHEVRON_POINTS`, `LEG_POINTS`, `BAR_POINTS`, `MARKE_SCALE` from `src/brand/logoGeometry.ts`; `Logo({ light?, markOnly?, className? })` React component; npm scripts `dev`, `build`, `lint`, `test`, `test:watch`, `preview`.

- [ ] **Step 1: Write the config files exactly as below**

`package.json`:
```json
{
  "name": "augusta-dokumente",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint",
    "test": "vitest run",
    "test:watch": "vitest",
    "render:beispiele": "tsx scripts/render-beispiele.tsx"
  }
}
```

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json` (template default plus `"node"` in `types` and `scripts` in `include`):
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client", "node"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "scripts"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`:
```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/dokumente/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

`.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "ignorePatterns": ["dist", "out", "node_modules"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

`.gitignore`:
```
logs
*.log
npm-debug.log*
node_modules
dist
dist-ssr
*.local
out
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.tsbuildinfo
```

`index.html`:
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#111315" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>Augusta Energy · Dokumente</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`public/robots.txt`:
```
User-agent: *
Disallow: /
```

`public/favicon.png`: copy `/Users/daniel/Nofulla-Industries/Augusta-Energy/augusta-energy-web/public/brand/logo-rund.png` (read-only source; `cp` it).

- [ ] **Step 2: Install dependencies**

```bash
npm install react@^19 react-dom@^19 @react-pdf/renderer@^4.9 @fontsource/montserrat@^5.3 @fontsource/raleway@^5.3
npm install -D vite@^8 @vitejs/plugin-react@^6 typescript@~6.0 @types/node@^24 @types/react@^19 @types/react-dom@^19 tailwindcss@^4 @tailwindcss/vite@^4 vitest@^5 oxlint@^1 tsx@^4
```
Expected: no peer-dependency errors. If `typescript@~6.0` fails `tsc -b` later for tooling reasons, fall back to `typescript@~5.9` — note it in the commit message.

- [ ] **Step 3: Brand tokens and CSS**

`src/brand/colors.ts`:
```ts
/** Markenfarben – einzige Quelle für UI (über index.css gespiegelt) und PDF. */
export const farben = {
  ink: '#111315',
  ink800: '#1b1e21',
  ink600: '#43484e',
  muted: '#6d7278',
  gold: '#d5a62e',
  goldDeep: '#b3891f',
  goldSoft: '#e8ca74',
  goldTint: '#faf3dc',
  cream: '#f5f3ee',
  paper: '#fdfcfa',
  line: '#e6e2d8',
  lineDark: '#2a2d31',
} as const
```

`src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-ink: #111315;
  --color-ink-800: #1b1e21;
  --color-ink-600: #43484e;
  --color-muted: #6d7278;
  --color-gold: #d5a62e;
  --color-gold-deep: #b3891f;
  --color-gold-soft: #e8ca74;
  --color-gold-tint: #faf3dc;
  --color-cream: #f5f3ee;
  --color-paper: #fdfcfa;
  --color-line: #e6e2d8;
  --color-line-dark: #2a2d31;
  --font-sans: "Raleway", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  body {
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
  }
  ::selection {
    background: var(--color-gold);
    color: var(--color-ink);
  }
  :where(a, button, summary):focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--color-ink);
  }
}

@layer components {
  .eyebrow {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  .display {
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.015em;
    line-height: 1.08;
    text-wrap: balance;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 0.95rem 1.7rem;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;
    cursor: pointer;
  }
  .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.45; cursor: not-allowed; }
  .btn-sm { padding: 0.7rem 1.25rem; font-size: 0.7rem; }
  .btn-gold { background: var(--color-gold); color: var(--color-ink); }
  .btn-gold:hover:not(:disabled) { background: var(--color-gold-deep); }
  .btn-dark { background: var(--color-ink); color: var(--color-cream); }
  .btn-dark:hover:not(:disabled) { background: var(--color-ink-800); }
  .btn-outline { border: 1px solid var(--color-ink); color: var(--color-ink); }
  .btn-outline:hover:not(:disabled) { background: var(--color-ink); color: var(--color-cream); }
  .btn-text { color: var(--color-ink-600); text-decoration: underline; text-decoration-color: var(--color-gold); text-underline-offset: 4px; padding: 0.7rem 0.5rem; }
  .btn-text:hover { color: var(--color-gold-deep); }
  .gold-rule { height: 1px; background: var(--color-gold); }

  /* Formularfelder */
  .feld {
    width: 100%;
    background: var(--color-cream);
    border: 1px solid var(--color-line);
    border-bottom-color: var(--color-ink-600);
    padding: 0.65rem 0.8rem;
    font-size: 0.95rem;
    color: var(--color-ink);
    transition: border-color 0.15s, background-color 0.15s;
  }
  .feld:focus { outline: 2px solid var(--color-gold); outline-offset: 1px; border-bottom-color: var(--color-gold-deep); background: #fff; }
  .feld::placeholder { color: var(--color-muted); }
  .feld-label {
    display: block;
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ink-600);
    margin-bottom: 0.35rem;
  }
}
```

- [ ] **Step 4: Logo geometry and web logo**

`src/brand/logoGeometry.ts`:
```ts
/** Geometrie der A-Marke, aus dem Original-Artwork der Website (Logo.tsx) übernommen.
 *  Bezugsrahmen 307 × 245. CHEVRON = dunkler Winkel, LEG = goldener rechter Schaft, BAR = goldener Querbalken. */
export const MARKE_VIEWBOX = { breite: 307, hoehe: 245 } as const
export const CHEVRON_POINTS = '153.5,0 0,245 47.5,245 153.5,75.8 196,143.5 213,95'
export const LEG_POINTS = '222,109.3 307,245 259.5,245 205,158'
export const BAR_POINTS = '121,168 198.3,168 216,197 105,193'
/** Vollständiges Logo: Marke auf 100 Einheiten Höhe skaliert, Wortmarke rechts daneben. */
export const LOGO_VIEWBOX = { breite: 470, hoehe: 100 } as const
export const MARKE_SCALE = 0.40816
```

`src/brand/Logo.tsx` (web only; the PDF logo comes in Task 5):
```tsx
import { farben } from './colors'
import { BAR_POINTS, CHEVRON_POINTS, LEG_POINTS, LOGO_VIEWBOX, MARKE_SCALE, MARKE_VIEWBOX } from './logoGeometry'

type LogoProps = {
  /** Auf dunklem Grund: Ink-Flächen werden cremefarben ausgegeben. */
  light?: boolean
  /** Nur die A-Marke, ohne Wortmarke. */
  markOnly?: boolean
  className?: string
}

function MarkShapes({ base }: { base: string }) {
  return (
    <>
      <polygon points={CHEVRON_POINTS} fill={base} />
      <polygon points={LEG_POINTS} fill={farben.gold} />
      <polygon points={BAR_POINTS} fill={farben.gold} />
    </>
  )
}

export function Logo({ light = false, markOnly = false, className }: LogoProps) {
  const base = light ? farben.cream : farben.ink
  if (markOnly) {
    return (
      <svg viewBox={`0 0 ${MARKE_VIEWBOX.breite} ${MARKE_VIEWBOX.hoehe}`} role="img" aria-label="Augusta Energy" className={className ?? 'h-9 w-auto'}>
        <MarkShapes base={base} />
      </svg>
    )
  }
  return (
    <svg viewBox={`0 0 ${LOGO_VIEWBOX.breite} ${LOGO_VIEWBOX.hoehe}`} role="img" aria-label="Augusta Energy" className={className ?? 'h-9 w-auto'}>
      <g transform={`scale(${MARKE_SCALE})`}>
        <MarkShapes base={base} />
      </g>
      <text className="font-display" x="155" y="50.5" fontSize="45.7" fontWeight="600" textLength="315" lengthAdjust="spacing" fill={base}>
        AUGUSTA
      </text>
      <rect x="163" y="73.3" width="63.7" height="1.4" fill={farben.gold} />
      <text className="font-display" x="312.5" y="81.6" fontSize="22.4" fontWeight="600" textAnchor="middle" textLength="157.5" lengthAdjust="spacing" fill={farben.gold}>
        ENERGY
      </text>
      <rect x="398.3" y="73.3" width="63.7" height="1.4" fill={farben.gold} />
    </svg>
  )
}
```

`src/brand/Logo.test.tsx` (proves the test pipeline handles TSX; uses react-dom/server, no jsdom):
```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Logo } from './Logo'
import { farben } from './colors'

describe('Logo', () => {
  it('rendert Marke und Wortmarke in Ink und Gold', () => {
    const html = renderToStaticMarkup(<Logo />)
    expect(html).toContain('AUGUSTA')
    expect(html).toContain('ENERGY')
    expect(html).toContain(`fill="${farben.gold}"`)
    expect(html).toContain(`fill="${farben.ink}"`)
  })
  it('gibt auf dunklem Grund Creme statt Ink aus', () => {
    const html = renderToStaticMarkup(<Logo light markOnly />)
    expect(html).toContain(`fill="${farben.cream}"`)
    expect(html).not.toContain('AUGUSTA')
  })
})
```

- [ ] **Step 5: Entry point and placeholder App**

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/raleway/400.css'
import '@fontsource/raleway/500.css'
import '@fontsource/raleway/600.css'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx` (placeholder, replaced in Task 11):
```tsx
import { Logo } from './brand/Logo'

export function App() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Logo className="h-10 w-auto" />
        <span className="eyebrow text-gold-deep">Dokumente</span>
      </header>
      <main className="py-12">
        <p className="eyebrow text-gold-deep">Augusta Energy</p>
        <div className="gold-rule mt-4 w-16" />
        <h1 className="display mt-6 text-3xl md:text-5xl">Dokumente</h1>
        <p className="mt-6 max-w-xl text-ink-600">Energie-Vergleich und Vollmacht – die Generatoren folgen in den nächsten Schritten.</p>
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Run the toolchain**

Run: `npm run lint && npm run build && npm test`
Expected: lint clean, `dist/index.html` exists and contains `<meta name="robots" content="noindex, nofollow">` and `/dokumente/assets/`, tests: 2 passed. Also check `grep -o 'href="[^"]*favicon.png"' dist/index.html` prints `href="/dokumente/favicon.png"`.

- [ ] **Step 7: CI workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```
(Majors verified on 2026-09-10: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5.)

`README.md` (initial; completed in Task 11):
```markdown
# Augusta Energy · Dokumente

Generator für Energie-Vergleich und Vollmacht als PDF – läuft komplett im Browser, gehostet auf GitHub Pages.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:5173/dokumente/
npm test         # Vitest
npm run lint     # oxlint
npm run build    # tsc + vite build → dist/
```
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite/React app with brand tokens, logo and Pages workflow"
```
(with the trailer lines from Global Constraints)

---

### Task 2: Pure utilities – numbers, formatting, dates, filenames, storage

**Files:**
- Create: `src/lib/zahl.ts`, `src/lib/zahl.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/datum.ts`, `src/lib/datum.test.ts`, `src/lib/dateiname.ts`, `src/lib/dateiname.test.ts`, `src/lib/storage.ts`, `src/lib/storage.test.ts`

**Interfaces:**
- Produces:
  - `parseDezimal(eingabe: string | null | undefined): number | null`, `zahlOder0(eingabe: string): number`
  - `euro(betrag: number | null): string`, `ctProKwh(ct: number | null): string`, `kwh(menge: number | null): string`, `monate(n: number | null): string`, `prozent(p: number | null): string`, `datum(iso: string | null | undefined): string`, `grundpreisText(betrag: number | null, einheit: 'monat' | 'jahr'): string`, `zahl2(n: number): string`
  - `heuteIso(): string`, `parseIso(iso: string): { jahr: number; monat: number; tag: number } | null`, `toIso(jahr, monat, tag): string`, `addMonths(iso: string, monate: number): string | null`, `addDays(iso: string, tage: number): string | null`, `lieferende(lieferbeginn: string, laufzeitMonate: number): string | null`, `gueltigBis(datumIso: string, tage: number): string | null`
  - `slug(text: string): string`, `pdfDateiname(dokument: 'Energie-Vergleich' | 'Vollmacht', name: string, datumIso: string): string`
  - `lesen<T>(key, fallback, storage?)`, `schreiben<T>(key, wert, storage?)`, `useLocalStorageState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, () => void]`

- [ ] **Step 1: Failing tests for `zahl`**

`src/lib/zahl.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { parseDezimal, zahlOder0 } from './zahl'

describe('parseDezimal', () => {
  it('liest deutsche und englische Schreibweise', () => {
    expect(parseDezimal('0,3054')).toBe(0.3054)
    expect(parseDezimal('0.3054')).toBe(0.3054)
    expect(parseDezimal('1.234,56')).toBe(1234.56)
    expect(parseDezimal(' 53416 ')).toBe(53416)
    expect(parseDezimal('-12,5')).toBe(-12.5)
  })
  it('gibt null für leere oder ungültige Eingaben', () => {
    expect(parseDezimal('')).toBeNull()
    expect(parseDezimal('   ')).toBeNull()
    expect(parseDezimal('abc')).toBeNull()
    expect(parseDezimal('1,2,3')).toBeNull()
    expect(parseDezimal(null)).toBeNull()
    expect(parseDezimal(undefined)).toBeNull()
  })
  it('zahlOder0 ersetzt null durch 0', () => {
    expect(zahlOder0('')).toBe(0)
    expect(zahlOder0('7')).toBe(7)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/lib/zahl.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `zahl.ts`**

```ts
/** Parst Zahlen so, wie deutsche Nutzer sie tippen: „0,3054“, „1.234,56“, aber auch „0.3054“.
 *  Ohne Komma gilt der Punkt als Dezimaltrennzeichen („1.234“ → 1.234). */
export function parseDezimal(eingabe: string | null | undefined): number | null {
  if (eingabe == null) return null
  const s = eingabe.replace(/\s/g, '')
  if (s === '') return null
  const normalisiert = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  if (!/^-?\d+(\.\d+)?$/.test(normalisiert)) return null
  const n = Number(normalisiert)
  return Number.isFinite(n) ? n : null
}

export function zahlOder0(eingabe: string): number {
  return parseDezimal(eingabe) ?? 0
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/lib/zahl.test.ts` → PASS.

- [ ] **Step 5: Failing tests for `format`**

`src/lib/format.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { ctProKwh, datum, euro, grundpreisText, kwh, monate, prozent, zahl2 } from './format'

describe('format', () => {
  it('formatiert Euro deutsch mit Tausenderpunkt', () => {
    expect(euro(16436.36)).toBe('16.436,36 €')
    expect(euro(0)).toBe('0,00 €')
    expect(euro(-369.5)).toBe('-369,50 €')
    expect(euro(null)).toBe('–')
  })
  it('formatiert Arbeitspreis, Verbrauch, Laufzeit, Prozent', () => {
    expect(ctProKwh(30.54)).toBe('30,54 ct/kWh')
    expect(ctProKwh(30.5)).toBe('30,50 ct/kWh')
    expect(kwh(53416)).toBe('53.416 kWh')
    expect(monate(24)).toBe('24 Monate')
    expect(monate(1)).toBe('1 Monat')
    expect(prozent(19)).toBe('19 %')
    expect(prozent(7.5)).toBe('7,5 %')
    expect(zahl2(1234.5)).toBe('1.234,50')
  })
  it('formatiert ISO-Daten deutsch', () => {
    expect(datum('2025-04-10')).toBe('10.04.2025')
    expect(datum('')).toBe('–')
    expect(datum('2025-13-40')).toBe('–')
    expect(datum(undefined)).toBe('–')
  })
  it('formatiert Grundpreis mit Einheit', () => {
    expect(grundpreisText(123.11, 'jahr')).toBe('123,11 €/Jahr')
    expect(grundpreisText(9.9, 'monat')).toBe('9,90 €/Monat')
    expect(grundpreisText(null, 'jahr')).toBe('–')
  })
})
```

- [ ] **Step 6: Run to verify failure**, then **Step 7: Implement `format.ts`**

```ts
import { parseIso } from './datum'

export const LEER = '–'

const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const nfProzent = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

export function zahl2(n: number): string {
  // Intl liefert bei -0 ein „-0,00“; das vermeiden wir.
  return nf2.format(Object.is(n, -0) ? 0 : n)
}

export function euro(betrag: number | null): string {
  return betrag == null ? LEER : `${zahl2(betrag)} €`
}

export function ctProKwh(ct: number | null): string {
  return ct == null ? LEER : `${zahl2(ct)} ct/kWh`
}

export function kwh(menge: number | null): string {
  return menge == null ? LEER : `${nf0.format(menge)} kWh`
}

export function monate(n: number | null): string {
  if (n == null) return LEER
  return n === 1 ? '1 Monat' : `${nf0.format(n)} Monate`
}

export function prozent(p: number | null): string {
  return p == null ? LEER : `${nfProzent.format(p)} %`
}

export function datum(iso: string | null | undefined): string {
  if (!iso) return LEER
  const d = parseIso(iso)
  if (!d) return LEER
  const tt = String(d.tag).padStart(2, '0')
  const mm = String(d.monat).padStart(2, '0')
  return `${tt}.${mm}.${d.jahr}`
}

export function grundpreisText(betrag: number | null, einheit: 'monat' | 'jahr'): string {
  if (betrag == null) return LEER
  return `${zahl2(betrag)} €/${einheit === 'monat' ? 'Monat' : 'Jahr'}`
}
```
Note: `Intl` in de-DE uses ASCII `-` for negatives and `.`/`,` separators; if a test fails on the minus sign, normalise with `.replace('−', '-')` inside `zahl2`.

- [ ] **Step 8: Failing tests for `datum`**

`src/lib/datum.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { addDays, addMonths, gueltigBis, heuteIso, lieferende, parseIso, toIso } from './datum'

describe('datum', () => {
  it('parst und serialisiert ISO-Daten streng', () => {
    expect(parseIso('2026-01-31')).toEqual({ jahr: 2026, monat: 1, tag: 31 })
    expect(parseIso('2026-02-30')).toBeNull()
    expect(parseIso('2026-1-5')).toBeNull()
    expect(parseIso('')).toBeNull()
    expect(toIso(2026, 3, 7)).toBe('2026-03-07')
  })
  it('addiert Monate und klemmt den Tag ans Monatsende', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(addMonths('2026-01-01', 24)).toBe('2028-01-01')
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15')
    expect(addMonths('ungültig', 1)).toBeNull()
  })
  it('addiert Tage über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('berechnet Lieferende = Beginn + Laufzeit − 1 Tag', () => {
    expect(lieferende('2026-01-01', 24)).toBe('2027-12-31')
    expect(lieferende('2026-03-15', 12)).toBe('2027-03-14')
    expect(lieferende('2026-01-31', 1)).toBe('2026-02-27')
    expect(lieferende('2026-01-01', 0)).toBeNull()
    expect(lieferende('', 12)).toBeNull()
  })
  it('berechnet Gültigkeit in Tagen', () => {
    expect(gueltigBis('2025-04-10', 3)).toBe('2025-04-13')
    expect(gueltigBis('2025-04-10', -1)).toBeNull()
  })
  it('liefert heute als ISO-Datum', () => {
    expect(heuteIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

- [ ] **Step 9: Run to verify failure**, then **Step 10: Implement `datum.ts`** (all arithmetic in UTC to dodge DST):

```ts
export type Datumsteile = { jahr: number; monat: number; tag: number }

export function parseIso(iso: string): Datumsteile | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const jahr = Number(m[1])
  const monat = Number(m[2])
  const tag = Number(m[3])
  const d = new Date(Date.UTC(jahr, monat - 1, tag))
  if (d.getUTCFullYear() !== jahr || d.getUTCMonth() !== monat - 1 || d.getUTCDate() !== tag) return null
  return { jahr, monat, tag }
}

export function toIso(jahr: number, monat: number, tag: number): string {
  return `${String(jahr).padStart(4, '0')}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

function ausUtc(d: Date): string {
  return toIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

export function heuteIso(): string {
  const jetzt = new Date()
  return toIso(jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate())
}

export function addMonths(iso: string, monate: number): string | null {
  const d = parseIso(iso)
  if (!d || !Number.isInteger(monate)) return null
  const erster = new Date(Date.UTC(d.jahr, d.monat - 1 + monate, 1))
  const letzterTag = new Date(Date.UTC(erster.getUTCFullYear(), erster.getUTCMonth() + 1, 0)).getUTCDate()
  return ausUtc(new Date(Date.UTC(erster.getUTCFullYear(), erster.getUTCMonth(), Math.min(d.tag, letzterTag))))
}

export function addDays(iso: string, tage: number): string | null {
  const d = parseIso(iso)
  if (!d || !Number.isInteger(tage)) return null
  return ausUtc(new Date(Date.UTC(d.jahr, d.monat - 1, d.tag + tage)))
}

/** Lieferende = Lieferbeginn + Laufzeit − 1 Tag (01.01.2026 + 24 Monate → 31.12.2027). */
export function lieferende(lieferbeginn: string, laufzeitMonate: number): string | null {
  if (!Number.isInteger(laufzeitMonate) || laufzeitMonate < 1) return null
  const ende = addMonths(lieferbeginn, laufzeitMonate)
  return ende ? addDays(ende, -1) : null
}

export function gueltigBis(datumIso: string, tage: number): string | null {
  if (!Number.isInteger(tage) || tage < 0) return null
  return addDays(datumIso, tage)
}
```

- [ ] **Step 11: Failing tests for `dateiname`**

`src/lib/dateiname.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { pdfDateiname, slug } from './dateiname'

describe('dateiname', () => {
  it('bildet Slugs mit Umlaut-Umschrift', () => {
    expect(slug('Müller & Söhne GmbH')).toBe('Mueller-Soehne-GmbH')
    expect(slug('Trattoria da Schnecki')).toBe('Trattoria-da-Schnecki')
    expect(slug('Ärztehaus Straße 3')).toBe('Aerztehaus-Strasse-3')
    expect(slug('  ')).toBe('Dokument')
    expect(slug('Café Ñandú')).toBe('Cafe-Nandu')
  })
  it('baut den PDF-Dateinamen', () => {
    expect(pdfDateiname('Energie-Vergleich', 'Muster Gastronomie GmbH', '2026-09-10')).toBe(
      'Augusta-Energy_Energie-Vergleich_Muster-Gastronomie-GmbH_2026-09-10.pdf',
    )
    expect(pdfDateiname('Vollmacht', '', '2026-09-10')).toBe('Augusta-Energy_Vollmacht_Dokument_2026-09-10.pdf')
  })
})
```

- [ ] **Step 12: Run to verify failure**, then **Step 13: Implement `dateiname.ts`**

```ts
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
```

- [ ] **Step 14: Failing tests for `storage`** (pure helpers only; the hook is exercised by the UI)

`src/lib/storage.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { lesen, schreiben } from './storage'

function fakeStorage(): Storage {
  const daten = new Map<string, string>()
  return {
    get length() { return daten.size },
    clear: () => daten.clear(),
    getItem: (k) => daten.get(k) ?? null,
    key: (i) => [...daten.keys()][i] ?? null,
    removeItem: (k) => { daten.delete(k) },
    setItem: (k, v) => { daten.set(k, String(v)) },
  }
}

describe('storage', () => {
  it('liest den Fallback, wenn nichts gespeichert ist', () => {
    expect(lesen('x', { a: 1 }, fakeStorage())).toEqual({ a: 1 })
  })
  it('schreibt und liest JSON, ergänzt fehlende Felder aus dem Fallback', () => {
    const s = fakeStorage()
    schreiben('x', { a: 2 }, s)
    expect(lesen('x', { a: 1, b: 'neu' }, s)).toEqual({ a: 2, b: 'neu' })
  })
  it('ignoriert kaputtes JSON und fehlenden Storage', () => {
    const s = fakeStorage()
    s.setItem('x', '{nicht json')
    expect(lesen('x', 5, s)).toBe(5)
    expect(lesen('x', 5, undefined)).toBe(5)
    expect(() => schreiben('x', 1, undefined)).not.toThrow()
  })
})
```

- [ ] **Step 15: Run to verify failure**, then **Step 16: Implement `storage.ts`**

```ts
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function istObjekt(w: unknown): w is Record<string, unknown> {
  return typeof w === 'object' && w !== null && !Array.isArray(w)
}

export function browserStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}

export function lesen<T>(key: string, fallback: T, storage: Storage | undefined = browserStorage()): T {
  try {
    const roh = storage?.getItem(key)
    if (roh == null) return fallback
    const wert = JSON.parse(roh) as unknown
    if (istObjekt(fallback) && istObjekt(wert)) return { ...fallback, ...wert } as T
    return wert as T
  } catch {
    return fallback
  }
}

export function schreiben<T>(key: string, wert: T, storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.setItem(key, JSON.stringify(wert))
  } catch {
    // Speicher voll oder gesperrt – die App funktioniert auch ohne Persistenz.
  }
}

/** React-State, der in localStorage gespiegelt wird. Der dritte Rückgabewert setzt auf `initial` zurück. */
export function useLocalStorageState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [wert, setWert] = useState<T>(() => lesen(key, initial))
  useEffect(() => {
    schreiben(key, wert)
  }, [key, wert])
  const zuruecksetzen = useCallback(() => setWert(initial), [initial])
  return [wert, setWert, zuruecksetzen]
}
```

- [ ] **Step 17: Run everything, commit**

Run: `npm run lint && npm run build && npm test` → all green.
```bash
git add src/lib
git commit -m "feat: number parsing, German formatting, date maths, filenames and storage helpers"
```

---

### Task 3: Absender + Energie-Vergleich domain (types, calculation, validation, example)

**Files:**
- Create: `src/lib/absender.ts`, `src/lib/vergleich/types.ts`, `src/lib/vergleich/vergleichsnummer.ts`, `src/lib/vergleich/vergleichsnummer.test.ts`, `src/lib/vergleich/berechnung.ts`, `src/lib/vergleich/berechnung.test.ts`, `src/lib/vergleich/pflichtfelder.ts`, `src/lib/vergleich/pflichtfelder.test.ts`, `src/lib/vergleich/beispiel.ts`

**Interfaces:**
- Consumes: `parseDezimal`, `zahlOder0` (Task 2), `lieferende`, `gueltigBis`, `heuteIso` (Task 2).
- Produces: `Absender`, `Ansprechpartner`, `standardAbsender`, `teamAuswahl`; `VergleichDaten`, `Tarif`, `Energieart`, `energieartLabel`, `leererVergleich(heute, nummer, ansprechpartner)`; `neueVergleichsnummer(datumIso?, zufall?)`; `berechneVergleich(daten): VergleichErgebnis`, `brutto(netto, faktorUst)`; `fehlendePflichtfelder(daten): string[]`; `beispielVergleich(heute?: string): VergleichDaten`.

- [ ] **Step 1: Write `absender.ts`** (no test needed – data only)

```ts
export type Ansprechpartner = { name: string; rolle: string; telefon: string; email: string }

export type Absender = {
  firma: string
  inhaber: string
  strasse: string
  plz: string
  ort: string
  telefon: string
  email: string
  web: string
  /** Optional – erscheint nur in der Fußzeile, wenn gesetzt. */
  ustIdNr: string
  bank: string
  iban: string
  ansprechpartner: Ansprechpartner
}

export const standardAbsender: Absender = {
  firma: 'Augusta Energy',
  inhaber: 'Niklas Trojovsky',
  strasse: 'Am Mittleren Moos 53',
  plz: '86167',
  ort: 'Augsburg',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  ustIdNr: '',
  bank: '',
  iban: '',
  ansprechpartner: {
    name: 'Niklas Trojovsky',
    rolle: 'Inhaber & Vertriebsleitung',
    telefon: '0151 41378008',
    email: 'info@augusta-energy.de',
  },
}

/** Schnellauswahl für Ansprechpartner/Unterzeichner. */
export const teamAuswahl: ReadonlyArray<{ name: string; rolle: string }> = [
  { name: 'Niklas Trojovsky', rolle: 'Inhaber & Vertriebsleitung' },
  { name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte' },
  { name: 'Patrick Seebach', rolle: 'Beratung & Projektleitung' },
]
```

- [ ] **Step 2: Write `vergleich/types.ts`**

```ts
import type { Ansprechpartner } from '../absender'

export type Energieart = 'strom' | 'gas'
export const energieartLabel: Record<Energieart, string> = { strom: 'Strom', gas: 'Gas' }

export type Anrede = 'firma' | 'frau' | 'herr' | 'divers'
export type Preisdarstellung = 'netto' | 'brutto'
export type GrundpreisEinheit = 'monat' | 'jahr'

export type Tarif = {
  versorger: string
  preisgarantie: string
  /** ct/kWh netto, als Eingabetext */
  arbeitspreisCt: string
  /** € netto, als Eingabetext */
  grundpreis: string
  grundpreisEinheit: GrundpreisEinheit
}

export type VergleichDaten = {
  kunde: {
    firma: string
    anrede: Anrede
    vorname: string
    nachname: string
    strasse: string
    plz: string
    ort: string
  }
  vergleich: {
    nummer: string
    datum: string
    gueltigkeitTage: string
    preisdarstellung: Preisdarstellung
    ustSatz: string
    hinweise: string
  }
  lieferstelle: {
    strasse: string
    plz: string
    ort: string
    energieart: Energieart
    jahresverbrauchKwh: string
    lieferbeginn: string
    laufzeitMonate: string
  }
  empfehlung: Tarif
  aktuell: Tarif
  honorar: {
    anzeigen: boolean
    anbieterwechsel: string
    konzessionsabgabe: string
  }
  konzessionsabgabe: {
    reduktionProJahr: string
  }
  unterzeichner: { name: string; rolle: string }
}

export const leererTarif: Tarif = { versorger: '', preisgarantie: '', arbeitspreisCt: '', grundpreis: '', grundpreisEinheit: 'jahr' }

export function leererVergleich(heute: string, nummer: string, ansprechpartner: Ansprechpartner): VergleichDaten {
  return {
    kunde: { firma: '', anrede: 'firma', vorname: '', nachname: '', strasse: '', plz: '', ort: '' },
    vergleich: { nummer, datum: heute, gueltigkeitTage: '3', preisdarstellung: 'netto', ustSatz: '19', hinweise: '' },
    lieferstelle: { strasse: '', plz: '', ort: '', energieart: 'strom', jahresverbrauchKwh: '', lieferbeginn: '', laufzeitMonate: '24' },
    empfehlung: { ...leererTarif },
    aktuell: { ...leererTarif },
    honorar: { anzeigen: true, anbieterwechsel: '', konzessionsabgabe: '' },
    konzessionsabgabe: { reduktionProJahr: '' },
    unterzeichner: { name: ansprechpartner.name, rolle: ansprechpartner.rolle },
  }
}

/** Kundenname für Anschrift, Laufzeile und Dateiname. */
export function kundenname(d: VergleichDaten): string {
  const firma = d.kunde.firma.trim()
  if (firma) return firma
  return `${d.kunde.vorname} ${d.kunde.nachname}`.trim()
}
```

- [ ] **Step 3: Failing test for `vergleichsnummer`**

`src/lib/vergleich/vergleichsnummer.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { neueVergleichsnummer } from './vergleichsnummer'

describe('neueVergleichsnummer', () => {
  it('hat das Format AE-JJJJMMTT-XXXX ohne verwechselbare Zeichen', () => {
    for (let i = 0; i < 50; i++) {
      expect(neueVergleichsnummer('2026-09-10')).toMatch(/^AE-20260910-[A-HJ-NP-Z2-9]{4}$/)
    }
  })
  it('ist bei festem Zufall deterministisch', () => {
    expect(neueVergleichsnummer('2026-09-10', () => 0)).toBe('AE-20260910-AAAA')
    expect(neueVergleichsnummer('2026-09-10', () => 0.999)).toBe('AE-20260910-9999')
  })
})
```

- [ ] **Step 4: Run to verify failure**, then **Step 5: Implement**

`src/lib/vergleich/vergleichsnummer.ts`:
```ts
import { heuteIso } from '../datum'

/** Ohne 0/O, 1/I – die Nummer wird am Telefon vorgelesen. */
const ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function neueVergleichsnummer(datumIso: string = heuteIso(), zufall: () => number = Math.random): string {
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += ZEICHEN[Math.min(ZEICHEN.length - 1, Math.floor(zufall() * ZEICHEN.length))]
  }
  return `AE-${datumIso.replace(/-/g, '')}-${suffix}`
}
```

- [ ] **Step 6: Failing tests for `berechnung`** (the worked example from spec §4.2)

`src/lib/vergleich/berechnung.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { berechneVergleich, brutto } from './berechnung'
import { leererVergleich, type VergleichDaten } from './types'

function beispiel(): VergleichDaten {
  const d = leererVergleich('2025-04-10', 'AE-20250410-TEST', { name: 'N', rolle: 'R', telefon: '', email: '' })
  d.lieferstelle.jahresverbrauchKwh = '53416'
  d.lieferstelle.lieferbeginn = '2026-01-01'
  d.lieferstelle.laufzeitMonate = '24'
  d.empfehlung = { versorger: 'M4ENERGY', preisgarantie: 'Energiepreisgarantie', arbeitspreisCt: '30,54', grundpreis: '123,11', grundpreisEinheit: 'jahr' }
  d.aktuell = { versorger: 'EnBW', preisgarantie: 'Oft bereits abgelaufen', arbeitspreisCt: '32,44', grundpreis: '89,11', grundpreisEinheit: 'jahr' }
  d.honorar = { anzeigen: true, anbieterwechsel: '49,00', konzessionsabgabe: '320,50' }
  d.konzessionsabgabe.reduktionProJahr = '794,83'
  return d
}

describe('berechneVergleich', () => {
  it('reproduziert das Beispiel aus dem Konkurrenz-PDF (±0,02 €)', () => {
    const e = berechneVergleich(beispiel())
    expect(e.laufzeitMonate).toBe(24)
    expect(e.lieferende).toBe('2027-12-31')
    expect(e.gueltigBis).toBe('2025-04-13')
    expect(e.empfehlung.jahreskosten).toBeCloseTo(16436.36, 2)
    expect(e.aktuell.jahreskosten).toBeCloseTo(17417.26, 2)
    expect(e.ersparnisJahr).toBeCloseTo(980.9, 2)
    expect(brutto(e.empfehlung.abschlagMonat, e.faktorUst)).toBeCloseTo(1629.94, 1)
    expect(brutto(e.aktuell.abschlagMonat, e.faktorUst)).toBeCloseTo(1727.21, 1)
    expect(e.empfehlung.laufzeitkosten).toBeCloseTo(32872.72, 1)
    expect(brutto(e.empfehlung.laufzeitkosten, e.faktorUst)).toBeCloseTo(39118.54, 1)
    expect(e.honorarSumme).toBeCloseTo(369.5, 2)
    expect(e.ersparnisLaufzeit).toBeCloseTo(1961.8, 1)
    expect(e.kaReduktionLaufzeit).toBeCloseTo(1589.66, 1)
    expect(e.gesamtersparnisLaufzeit).toBeCloseTo(3181.96, 1)
    expect(brutto(e.gesamtersparnisLaufzeit, e.faktorUst)).toBeCloseTo(3786.53, 1)
  })
  it('rechnet monatlichen Grundpreis aufs Jahr hoch', () => {
    const d = beispiel()
    d.empfehlung.grundpreis = '10'
    d.empfehlung.grundpreisEinheit = 'monat'
    const e = berechneVergleich(d)
    expect(e.empfehlung.grundpreisJahr).toBe(120)
    expect(e.empfehlung.jahreskosten).toBeCloseTo(0.3054 * 53416 + 120, 6)
  })
  it('lässt ausgeblendetes Honorar aus der Gesamtersparnis heraus', () => {
    const d = beispiel()
    d.honorar.anzeigen = false
    const e = berechneVergleich(d)
    expect(e.honorarSichtbar).toBe(false)
    expect(e.honorarSumme).toBe(0)
    expect(e.gesamtersparnisLaufzeit).toBeCloseTo(1961.8 + 1589.66, 1)
  })
  it('meldet Honorar als unsichtbar, wenn beide Beträge leer sind', () => {
    const d = beispiel()
    d.honorar = { anzeigen: true, anbieterwechsel: '', konzessionsabgabe: '' }
    expect(berechneVergleich(d).honorarSichtbar).toBe(false)
  })
  it('liefert negative Ersparnis, wenn die Empfehlung teurer ist', () => {
    const d = beispiel()
    d.empfehlung.arbeitspreisCt = '40'
    expect(berechneVergleich(d).ersparnisJahr).toBeLessThan(0)
  })
  it('kommt mit leeren Eingaben zurecht (alles 0, keine NaN)', () => {
    const e = berechneVergleich(leererVergleich('2026-09-10', 'AE-1', { name: '', rolle: '', telefon: '', email: '' }))
    expect(e.empfehlung.jahreskosten).toBe(0)
    expect(e.gesamtersparnisLaufzeit).toBe(0)
    expect(e.lieferende).toBeNull()
    expect(Number.isNaN(e.ersparnisJahr)).toBe(false)
  })
})
```

- [ ] **Step 7: Run to verify failure**, then **Step 8: Implement `berechnung.ts`**

```ts
import { gueltigBis, lieferende } from '../datum'
import { parseDezimal, zahlOder0 } from '../zahl'
import type { Tarif, VergleichDaten } from './types'

export type TarifErgebnis = {
  arbeitspreisCt: number
  arbeitspreisEur: number
  grundpreisJahr: number
  grundpreisEingabe: number
  jahreskosten: number
  abschlagMonat: number
  laufzeitkosten: number
}

export type VergleichErgebnis = {
  ustSatz: number
  faktorUst: number
  verbrauchKwh: number
  laufzeitMonate: number
  laufzeitJahre: number
  lieferende: string | null
  gueltigBis: string | null
  empfehlung: TarifErgebnis
  aktuell: TarifErgebnis
  ersparnisJahr: number
  ersparnisLaufzeit: number
  kaReduktionJahr: number
  kaReduktionLaufzeit: number
  honorarAnbieterwechsel: number
  honorarKonzessionsabgabe: number
  honorarSumme: number
  /** true, wenn das Honorar angezeigt werden soll und mindestens ein Betrag > 0 ist */
  honorarSichtbar: boolean
  gesamtersparnisLaufzeit: number
}

export function brutto(netto: number, faktorUst: number): number {
  return netto * faktorUst
}

function berechneTarif(t: Tarif, verbrauchKwh: number, laufzeitJahre: number): TarifErgebnis {
  const arbeitspreisCt = zahlOder0(t.arbeitspreisCt)
  const grundpreisEingabe = zahlOder0(t.grundpreis)
  const grundpreisJahr = grundpreisEingabe * (t.grundpreisEinheit === 'monat' ? 12 : 1)
  const arbeitspreisEur = arbeitspreisCt / 100
  const jahreskosten = arbeitspreisEur * verbrauchKwh + grundpreisJahr
  return {
    arbeitspreisCt,
    arbeitspreisEur,
    grundpreisJahr,
    grundpreisEingabe,
    jahreskosten,
    abschlagMonat: jahreskosten / 12,
    laufzeitkosten: jahreskosten * laufzeitJahre,
  }
}

export function berechneVergleich(d: VergleichDaten): VergleichErgebnis {
  const ustSatz = zahlOder0(d.vergleich.ustSatz)
  const faktorUst = 1 + ustSatz / 100
  const verbrauchKwh = zahlOder0(d.lieferstelle.jahresverbrauchKwh)
  const laufzeitRoh = parseDezimal(d.lieferstelle.laufzeitMonate)
  const laufzeitMonate = laufzeitRoh != null && laufzeitRoh > 0 ? Math.round(laufzeitRoh) : 0
  const laufzeitJahre = laufzeitMonate / 12

  const empfehlung = berechneTarif(d.empfehlung, verbrauchKwh, laufzeitJahre)
  const aktuell = berechneTarif(d.aktuell, verbrauchKwh, laufzeitJahre)

  const ersparnisJahr = aktuell.jahreskosten - empfehlung.jahreskosten
  const kaReduktionJahr = zahlOder0(d.konzessionsabgabe.reduktionProJahr)
  const honorarAnbieterwechsel = d.honorar.anzeigen ? zahlOder0(d.honorar.anbieterwechsel) : 0
  const honorarKonzessionsabgabe = d.honorar.anzeigen ? zahlOder0(d.honorar.konzessionsabgabe) : 0
  const honorarSumme = honorarAnbieterwechsel + honorarKonzessionsabgabe
  const ersparnisLaufzeit = ersparnisJahr * laufzeitJahre
  const kaReduktionLaufzeit = kaReduktionJahr * laufzeitJahre

  return {
    ustSatz,
    faktorUst,
    verbrauchKwh,
    laufzeitMonate,
    laufzeitJahre,
    lieferende: laufzeitMonate > 0 ? lieferende(d.lieferstelle.lieferbeginn, laufzeitMonate) : null,
    gueltigBis: gueltigBis(d.vergleich.datum, Math.round(zahlOder0(d.vergleich.gueltigkeitTage))),
    empfehlung,
    aktuell,
    ersparnisJahr,
    ersparnisLaufzeit,
    kaReduktionJahr,
    kaReduktionLaufzeit,
    honorarAnbieterwechsel,
    honorarKonzessionsabgabe,
    honorarSumme,
    honorarSichtbar: d.honorar.anzeigen && honorarSumme > 0,
    gesamtersparnisLaufzeit: ersparnisLaufzeit + kaReduktionLaufzeit - honorarSumme,
  }
}
```

- [ ] **Step 9: Failing tests for `pflichtfelder`**

`src/lib/vergleich/pflichtfelder.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { fehlendePflichtfelder } from './pflichtfelder'
import { beispielVergleich } from './beispiel'
import { leererVergleich } from './types'

describe('fehlendePflichtfelder (Vergleich)', () => {
  it('ist leer für die Beispieldaten', () => {
    expect(fehlendePflichtfelder(beispielVergleich('2026-09-10'))).toEqual([])
  })
  it('listet alle Lücken einer leeren Vorlage mit deutschen Bezeichnungen', () => {
    const fehlt = fehlendePflichtfelder(leererVergleich('2026-09-10', 'AE-1', { name: '', rolle: '', telefon: '', email: '' }))
    expect(fehlt).toEqual([
      'Kunde (Firma oder Nachname)',
      'Anschrift des Kunden',
      'Anschrift der Lieferstelle',
      'Jahresverbrauch',
      'Lieferbeginn',
      'Versorger (Empfehlung)',
      'Arbeitspreis (Empfehlung)',
      'Versorger (aktueller Tarif)',
      'Arbeitspreis (aktueller Tarif)',
    ])
  })
  it('akzeptiert Privatkunden ohne Firma, verlangt Laufzeit ≥ 1', () => {
    const d = beispielVergleich('2026-09-10')
    d.kunde.firma = ''
    d.kunde.nachname = 'Muster'
    d.lieferstelle.laufzeitMonate = '0'
    expect(fehlendePflichtfelder(d)).toEqual(['Laufzeit'])
  })
})
```

- [ ] **Step 10: Write `beispiel.ts`** (fictional customer with the competitor PDF's numbers)

```ts
import type { VergleichDaten } from './types'

export function beispielVergleich(heute: string): VergleichDaten {
  return {
    kunde: { firma: 'Muster Gastronomie GmbH', anrede: 'herr', vorname: 'Max', nachname: 'Mustermann', strasse: 'Musterstraße 12', plz: '86150', ort: 'Augsburg' },
    vergleich: { nummer: `AE-${heute.replace(/-/g, '')}-MSTR`, datum: heute, gueltigkeitTage: '3', preisdarstellung: 'netto', ustSatz: '19', hinweise: '' },
    lieferstelle: { strasse: 'Musterstraße 12', plz: '86150', ort: 'Augsburg', energieart: 'strom', jahresverbrauchKwh: '53416', lieferbeginn: '2027-01-01', laufzeitMonate: '24' },
    empfehlung: { versorger: 'M4ENERGY', preisgarantie: 'Energiepreisgarantie bis 31.12.2028', arbeitspreisCt: '30,54', grundpreis: '123,11', grundpreisEinheit: 'jahr' },
    aktuell: { versorger: 'EnBW', preisgarantie: 'Preisgarantie abgelaufen', arbeitspreisCt: '32,44', grundpreis: '89,11', grundpreisEinheit: 'jahr' },
    honorar: { anzeigen: true, anbieterwechsel: '49,00', konzessionsabgabe: '320,50' },
    konzessionsabgabe: { reduktionProJahr: '794,83' },
    unterzeichner: { name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte' },
  }
}
```

- [ ] **Step 11: Implement `pflichtfelder.ts`**

```ts
import { parseDezimal } from '../zahl'
import type { VergleichDaten } from './types'

const leer = (s: string) => s.trim() === ''
const anschriftFehlt = (a: { strasse: string; plz: string; ort: string }) => leer(a.strasse) || leer(a.plz) || leer(a.ort)

/** Bezeichnungen sind für die Nutzerin gedacht („Bitte ergänze: …“). Reihenfolge = Reihenfolge im Formular. */
export function fehlendePflichtfelder(d: VergleichDaten): string[] {
  const fehlt: string[] = []
  if (leer(d.kunde.firma) && leer(d.kunde.nachname)) fehlt.push('Kunde (Firma oder Nachname)')
  if (anschriftFehlt(d.kunde)) fehlt.push('Anschrift des Kunden')
  if (anschriftFehlt(d.lieferstelle)) fehlt.push('Anschrift der Lieferstelle')
  const verbrauch = parseDezimal(d.lieferstelle.jahresverbrauchKwh)
  if (verbrauch == null || verbrauch <= 0) fehlt.push('Jahresverbrauch')
  if (leer(d.lieferstelle.lieferbeginn)) fehlt.push('Lieferbeginn')
  const laufzeit = parseDezimal(d.lieferstelle.laufzeitMonate)
  if (laufzeit == null || laufzeit < 1) fehlt.push('Laufzeit')
  if (leer(d.empfehlung.versorger)) fehlt.push('Versorger (Empfehlung)')
  if (parseDezimal(d.empfehlung.arbeitspreisCt) == null) fehlt.push('Arbeitspreis (Empfehlung)')
  if (leer(d.aktuell.versorger)) fehlt.push('Versorger (aktueller Tarif)')
  if (parseDezimal(d.aktuell.arbeitspreisCt) == null) fehlt.push('Arbeitspreis (aktueller Tarif)')
  return fehlt
}
```
Note the empty-template test expects no „Laufzeit“ entry because the template's default is „24“.

- [ ] **Step 12: Run everything, commit**

Run: `npm run lint && npm run build && npm test` → green.
```bash
git add src/lib
git commit -m "feat: Vergleich domain – types, calculation, validation, example data, Absender defaults"
```

---

### Task 4: Vollmacht domain (types, texts, validation, example)

**Files:**
- Create: `src/lib/vollmacht/types.ts`, `src/lib/vollmacht/texte.ts`, `src/lib/vollmacht/texte.test.ts`, `src/lib/vollmacht/pflichtfelder.ts`, `src/lib/vollmacht/pflichtfelder.test.ts`, `src/lib/vollmacht/beispiel.ts`

**Interfaces:**
- Consumes: `datum()` from `src/lib/format.ts`.
- Produces: `VollmachtDaten`, `Lieferstelle`, `LieferstellenEnergieart`, `lieferstellenEnergieartLabel`, `neueLieferstelle()`, `leereVollmacht()`, `vollmachtgeberName(d)`; `energieartenText(e)`, `versorgungText(e)`, `bevollmaechtigungsSatz(d)`, `umfangPunkte(d)`, `beschraenkungEinleitung(d)`, `beschraenkungPunkte`, `untervollmachtSatz(d)`, `geltungSatz(d, email)`, `datenschutzSatz(web)`, `sonstigesSatz`; `fehlendePflichtfelder(d)`; `beispielVollmacht()`.

- [ ] **Step 1: Write `vollmacht/types.ts`**

```ts
export type VollmachtgeberTyp = 'privat' | 'unternehmen'
export type LieferstellenEnergieart = 'strom' | 'gas' | 'beide'
export const lieferstellenEnergieartLabel: Record<LieferstellenEnergieart, string> = {
  strom: 'Strom',
  gas: 'Gas',
  beide: 'Strom und Gas',
}

export type Lieferstelle = {
  id: string
  /** „Musterstraße 12, 86150 Augsburg“ – eine Zeile */
  adresse: string
  energieart: LieferstellenEnergieart
  zaehlernummer: string
  maloId: string
  versorger: string
}

export type Energiearten = { strom: boolean; gas: boolean }

export type VollmachtDaten = {
  vollmachtgeber: {
    typ: VollmachtgeberTyp
    /** Firma (unternehmen) bzw. „Vorname Nachname“ (privat) */
    name: string
    vertretenDurch: string
    strasse: string
    plz: string
    ort: string
    geburtsdatum: string
    email: string
    telefon: string
  }
  energiearten: Energiearten
  lieferstellen: Lieferstelle[]
  geltung: { art: 'unbefristet' | 'befristet'; bis: string }
  untervollmacht: boolean
  unterschrift: { ort: string; datum: string }
}

export function neueId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export function neueLieferstelle(): Lieferstelle {
  return { id: neueId(), adresse: '', energieart: 'beide', zaehlernummer: '', maloId: '', versorger: '' }
}

export function leereVollmacht(): VollmachtDaten {
  return {
    vollmachtgeber: { typ: 'privat', name: '', vertretenDurch: '', strasse: '', plz: '', ort: '', geburtsdatum: '', email: '', telefon: '' },
    energiearten: { strom: true, gas: true },
    lieferstellen: [neueLieferstelle()],
    geltung: { art: 'unbefristet', bis: '' },
    untervollmacht: false,
    unterschrift: { ort: '', datum: '' },
  }
}

export function vollmachtgeberName(d: VollmachtDaten): string {
  return d.vollmachtgeber.name.trim()
}
```

- [ ] **Step 2: Failing tests for `texte`**

`src/lib/vollmacht/texte.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { beschraenkungEinleitung, bevollmaechtigungsSatz, energieartenText, geltungSatz, umfangPunkte, untervollmachtSatz, versorgungText } from './texte'
import { leereVollmacht } from './types'

describe('Vollmacht-Texte', () => {
  it('benennt die Energiearten', () => {
    expect(energieartenText({ strom: true, gas: true })).toBe('Strom und Gas')
    expect(energieartenText({ strom: true, gas: false })).toBe('Strom')
    expect(energieartenText({ strom: false, gas: true })).toBe('Gas')
    expect(energieartenText({ strom: false, gas: false })).toBe('Energie')
    expect(versorgungText({ strom: true, gas: true })).toBe('Strom- und Gasversorgung')
    expect(versorgungText({ strom: true, gas: false })).toBe('Stromversorgung')
    expect(versorgungText({ strom: false, gas: true })).toBe('Gasversorgung')
    expect(versorgungText({ strom: false, gas: false })).toBe('Energieversorgung')
  })
  it('formuliert ich/wir je nach Vollmachtgeber-Typ', () => {
    const privat = leereVollmacht()
    expect(bevollmaechtigungsSatz(privat)).toContain('bevollmächtige ich')
    expect(bevollmaechtigungsSatz(privat)).toContain(' mich ')
    const firma = leereVollmacht()
    firma.vollmachtgeber.typ = 'unternehmen'
    expect(bevollmaechtigungsSatz(firma)).toContain('bevollmächtigen wir')
    expect(bevollmaechtigungsSatz(firma)).toContain(' uns ')
    expect(bevollmaechtigungsSatz(firma)).toContain('Versorgung mit Strom und Gas')
  })
  it('setzt die Energieart in Umfang und Beschränkung ein', () => {
    const d = leereVollmacht()
    d.energiearten = { strom: false, gas: true }
    const punkte = umfangPunkte(d)
    expect(punkte).toHaveLength(7)
    expect(punkte[1]).toContain('Lieferung von Gas')
    expect(beschraenkungEinleitung(d)).toContain('Gasversorgung')
  })
  it('formuliert Geltungsdauer und Untervollmacht', () => {
    const d = leereVollmacht()
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('unbefristet bis auf Widerruf')
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('per E-Mail an info@augusta-energy.de')
    d.geltung = { art: 'befristet', bis: '2027-12-31' }
    expect(geltungSatz(d, 'x@y.de')).toContain('bis zum 31.12.2027')
    expect(untervollmachtSatz(d)).toContain('nicht gestattet')
    d.untervollmacht = true
    expect(untervollmachtSatz(d)).toBe('Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.')
  })
})
```

- [ ] **Step 3: Run to verify failure**, then **Step 4: Implement `texte.ts`** (wording verbatim from spec §5.2)

```ts
import { datum } from '../format'
import type { Energiearten, VollmachtDaten } from './types'

export function energieartenText(e: Energiearten): string {
  if (e.strom && e.gas) return 'Strom und Gas'
  if (e.strom) return 'Strom'
  if (e.gas) return 'Gas'
  return 'Energie'
}

export function versorgungText(e: Energiearten): string {
  if (e.strom && e.gas) return 'Strom- und Gasversorgung'
  if (e.strom) return 'Stromversorgung'
  if (e.gas) return 'Gasversorgung'
  return 'Energieversorgung'
}

export function bevollmaechtigungsSatz(d: VollmachtDaten): string {
  const wir = d.vollmachtgeber.typ === 'unternehmen'
  return (
    `Hiermit ${wir ? 'bevollmächtigen wir' : 'bevollmächtige ich'} (nachfolgend „Vollmachtgeber“) die vorstehend genannte Bevollmächtigte, ` +
    `${wir ? 'uns' : 'mich'} in allen Angelegenheiten der Versorgung mit ${energieartenText(d.energiearten)} für die nachfolgend aufgeführten ` +
    'Lieferstellen gegenüber Energieversorgungsunternehmen, Netzbetreibern und Messstellenbetreibern zu vertreten.'
  )
}

export function umfangPunkte(d: VollmachtDaten): string[] {
  return [
    'die Einholung von Auskünften und Unterlagen bei bisherigen und künftigen Energieversorgern, Netzbetreibern und Messstellenbetreibern, insbesondere zu Vertragsdaten, Laufzeiten, Kündigungsfristen, Verbrauchsdaten, Zählerständen und Rechnungen;',
    `die Einholung, den Vergleich und die Verhandlung von Angeboten für die Lieferung von ${energieartenText(d.energiearten)};`,
    'den Abschluss von Energielieferverträgen für die genannten Lieferstellen im Namen des Vollmachtgebers einschließlich der Abgabe aller hierfür erforderlichen Erklärungen;',
    'die Kündigung bestehender Energielieferverträge sowie die Ausübung von Sonderkündigungs- und Widerrufsrechten;',
    'die Durchführung und Begleitung des Lieferantenwechsels einschließlich der An- und Abmeldung der Lieferstellen beim Netzbetreiber;',
    'die Prüfung von Rechnungen und Abschlägen, die Geltendmachung von Korrekturen, Rückerstattungen und Guthaben sowie die Beantragung einer Reduzierung der Konzessionsabgabe;',
    'die Entgegennahme von Korrespondenz und Vertragsunterlagen im Zusammenhang mit den vorgenannten Angelegenheiten.',
  ]
}

export function beschraenkungEinleitung(d: VollmachtDaten): string {
  return `Diese Vollmacht ist ausschließlich auf Angelegenheiten der ${versorgungText(d.energiearten)} der genannten Lieferstellen beschränkt. Sie berechtigt die Bevollmächtigte insbesondere nicht`
}

export const beschraenkungPunkte: readonly string[] = [
  'zum Abschluss von Verträgen anderer Art, etwa Kauf-, Werk-, Miet-, Darlehens- oder Finanzierungsverträgen – auch nicht über Photovoltaikanlagen oder Wärmepumpen;',
  'zur Eingehung von Zahlungsverpflichtungen des Vollmachtgebers, die über die Entgelte der abgeschlossenen Energielieferverträge hinausgehen;',
  'zur Verfügung über Bankkonten oder zur Erteilung von SEPA-Lastschriftmandaten – diese bleiben dem Vollmachtgeber vorbehalten;',
  'zur Vertretung in gerichtlichen Verfahren oder zur Abgabe von Schuldanerkenntnissen.',
]

export function untervollmachtSatz(d: VollmachtDaten): string {
  return d.untervollmacht
    ? 'Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.'
    : 'Die Bevollmächtigte darf sich zur Ausführung dieser Vollmacht ihrer Mitarbeitenden bedienen. Die Erteilung einer Untervollmacht an Dritte ist nicht gestattet.'
}

export function geltungSatz(d: VollmachtDaten, email: string): string {
  const dauer = d.geltung.art === 'befristet' ? `bis zum ${datum(d.geltung.bis)}` : 'unbefristet bis auf Widerruf'
  return (
    `Die Vollmacht gilt ab dem Datum der Unterzeichnung ${dauer}. Sie kann jederzeit ohne Angabe von Gründen in Textform ` +
    `(z. B. per E-Mail an ${email}) widerrufen werden. Mit Zugang des Widerrufs erlischt die Vollmacht; bis dahin vorgenommene Handlungen bleiben wirksam.`
  )
}

export function datenschutzSatz(web: string): string {
  return (
    'Der Vollmachtgeber ist damit einverstanden, dass die Bevollmächtigte die zur Ausführung dieser Vollmacht erforderlichen personenbezogenen Daten ' +
    '(insbesondere Name, Anschrift, Kontaktdaten, Zählernummern, Verbrauchs- und Vertragsdaten) verarbeitet und an die betreffenden Energieversorger, ' +
    `Netzbetreiber und Messstellenbetreiber übermittelt. Die Datenschutzhinweise der Bevollmächtigten (${web}/datenschutz) wurden zur Kenntnis genommen.`
  )
}

export const sonstigesSatz =
  'Eine Kopie oder ein Scan dieser Vollmacht gilt als Original. Sollte eine Bestimmung dieser Vollmacht unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.'
```

- [ ] **Step 5: Failing tests for `pflichtfelder`**

`src/lib/vollmacht/pflichtfelder.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { beispielVollmacht } from './beispiel'
import { fehlendePflichtfelder } from './pflichtfelder'
import { leereVollmacht } from './types'

describe('fehlendePflichtfelder (Vollmacht)', () => {
  it('ist leer für die Beispieldaten', () => {
    expect(fehlendePflichtfelder(beispielVollmacht())).toEqual([])
  })
  it('listet die Lücken einer leeren Vorlage', () => {
    expect(fehlendePflichtfelder(leereVollmacht())).toEqual([
      'Name des Vollmachtgebers',
      'Anschrift des Vollmachtgebers',
      'Adresse der Lieferstelle 1',
    ])
  })
  it('verlangt eine Energieart, eine Lieferstelle und bei Befristung ein Datum', () => {
    const d = beispielVollmacht()
    d.energiearten = { strom: false, gas: false }
    d.lieferstellen = []
    d.geltung = { art: 'befristet', bis: '' }
    expect(fehlendePflichtfelder(d)).toEqual(['Mindestens eine Energieart', 'Mindestens eine Lieferstelle', 'Befristung (Datum)'])
  })
})
```

- [ ] **Step 6: Write `beispiel.ts`**

```ts
import type { VollmachtDaten } from './types'

export function beispielVollmacht(): VollmachtDaten {
  return {
    vollmachtgeber: {
      typ: 'unternehmen',
      name: 'Muster Gastronomie GmbH',
      vertretenDurch: 'Geschäftsführer Max Mustermann',
      strasse: 'Musterstraße 12',
      plz: '86150',
      ort: 'Augsburg',
      geburtsdatum: '',
      email: 'info@muster-gastronomie.de',
      telefon: '0821 1234567',
    },
    energiearten: { strom: true, gas: true },
    lieferstellen: [
      { id: 'beispiel-1', adresse: 'Musterstraße 12, 86150 Augsburg', energieart: 'strom', zaehlernummer: '1ABC0012345678', maloId: '51234567890', versorger: 'EnBW' },
      { id: 'beispiel-2', adresse: 'Beispielweg 4 (Lager), 86159 Augsburg', energieart: 'gas', zaehlernummer: '7GAS0098765', maloId: '', versorger: 'erdgas schwaben' },
    ],
    geltung: { art: 'unbefristet', bis: '' },
    untervollmacht: false,
    unterschrift: { ort: 'Augsburg', datum: '' },
  }
}
```

- [ ] **Step 7: Implement `pflichtfelder.ts`**

```ts
import type { VollmachtDaten } from './types'

const leer = (s: string) => s.trim() === ''

export function fehlendePflichtfelder(d: VollmachtDaten): string[] {
  const fehlt: string[] = []
  if (leer(d.vollmachtgeber.name)) fehlt.push('Name des Vollmachtgebers')
  if (leer(d.vollmachtgeber.strasse) || leer(d.vollmachtgeber.plz) || leer(d.vollmachtgeber.ort)) fehlt.push('Anschrift des Vollmachtgebers')
  if (!d.energiearten.strom && !d.energiearten.gas) fehlt.push('Mindestens eine Energieart')
  if (d.lieferstellen.length === 0) fehlt.push('Mindestens eine Lieferstelle')
  d.lieferstellen.forEach((l, i) => {
    if (leer(l.adresse)) fehlt.push(`Adresse der Lieferstelle ${i + 1}`)
  })
  if (d.geltung.art === 'befristet' && leer(d.geltung.bis)) fehlt.push('Befristung (Datum)')
  return fehlt
}
```

- [ ] **Step 8: Run everything, commit**

Run: `npm run lint && npm run build && npm test` → green.
```bash
git add src/lib/vollmacht
git commit -m "feat: Vollmacht domain – types, wording, validation, example data"
```

---

### Task 5: PDF foundation – fonts, theme, shared components, Node smoke test

**Files:**
- Create: `src/brand/fonts.ts`, `src/brand/fonts.browser.ts`, `src/brand/fonts.node.ts`, `src/pdf/theme.ts`, `src/pdf/testUtils.ts`, `src/pdf/components/LogoPdf.tsx`, `src/pdf/components/PageFrame.tsx`, `src/pdf/components/Typo.tsx`, `src/pdf/components/KeyValueGrid.tsx`, `src/pdf/components/Tabelle.tsx`, `src/pdf/components/HighlightBlock.tsx`, `src/pdf/components/PageFrame.test.tsx`

**Interfaces:**
- Consumes: `farben`, logo geometry (Task 1), `Absender` (Task 3).
- Produces: `registerFonts()` (browser and node variants, same name), `SCHRIFT = { display: 'Montserrat', text: 'Raleway' }`, `styles`, `GROESSE`, `SEITE` from theme; components `LogoPdf({ hoehe?, hell? })`, `PageFrame({ absender, laufzeile?, children })`, `fusszeilen(absender): string[]`, `SectionTitle({ eyebrow?, titel })`, `Ueberschrift({ children })`, `Absatz({ children, klein?, fett?, abstand? })`, `ColonLead({ lead, text })`, `Fussnoten({ zeilen })`, `KeyValueGrid({ eintraege, spalten? })`, `Tabelle({ spalten, zeilen })` with `TabellenSpalte = { label; flex?; align?; hervorgehoben? }`, `TabellenZeile = { zellen; fett?; span? }`, `HighlightBlock({ text, wert?, hinweis? })`; test helpers `istPdf(buf)`, `seitenAnzahl(buf)`.

- [ ] **Step 1: Font registration (shared + browser + node)**

`src/brand/fonts.ts`:
```ts
import { Font } from '@react-pdf/renderer'

export const SCHRIFT = { display: 'Montserrat', text: 'Raleway' } as const

export type SchriftQuellen = {
  montserrat500: string
  montserrat600: string
  montserrat700: string
  raleway400: string
  raleway500: string
  raleway600: string
}

let registriert = false

/** Registriert Montserrat/Raleway für react-pdf. Idempotent. Silbentrennung ist aus:
 *  react-pdf kennt nur englische Trennregeln, die deutsche Wörter falsch trennen würden. */
export function registriereSchriften(q: SchriftQuellen): void {
  if (registriert) return
  registriert = true
  Font.register({
    family: SCHRIFT.display,
    fonts: [
      { src: q.montserrat500, fontWeight: 500 },
      { src: q.montserrat600, fontWeight: 600 },
      { src: q.montserrat700, fontWeight: 700 },
    ],
  })
  Font.register({
    family: SCHRIFT.text,
    fonts: [
      { src: q.raleway400, fontWeight: 400 },
      { src: q.raleway500, fontWeight: 500 },
      { src: q.raleway600, fontWeight: 600 },
    ],
  })
  Font.registerHyphenationCallback((wort) => [wort])
}
```

`src/brand/fonts.browser.ts`:
```ts
import montserrat500 from '@fontsource/montserrat/files/montserrat-latin-500-normal.woff?url'
import montserrat600 from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff?url'
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url'
import raleway400 from '@fontsource/raleway/files/raleway-latin-400-normal.woff?url'
import raleway500 from '@fontsource/raleway/files/raleway-latin-500-normal.woff?url'
import raleway600 from '@fontsource/raleway/files/raleway-latin-600-normal.woff?url'
import { registriereSchriften } from './fonts'

export function registerFonts(): void {
  registriereSchriften({ montserrat500, montserrat600, montserrat700, raleway400, raleway500, raleway600 })
}
```

`src/brand/fonts.node.ts` (tests and the render script only – never import from browser code):
```ts
import { createRequire } from 'node:module'
import { registriereSchriften } from './fonts'

const require = createRequire(import.meta.url)

export function registerFonts(): void {
  registriereSchriften({
    montserrat500: require.resolve('@fontsource/montserrat/files/montserrat-latin-500-normal.woff'),
    montserrat600: require.resolve('@fontsource/montserrat/files/montserrat-latin-600-normal.woff'),
    montserrat700: require.resolve('@fontsource/montserrat/files/montserrat-latin-700-normal.woff'),
    raleway400: require.resolve('@fontsource/raleway/files/raleway-latin-400-normal.woff'),
    raleway500: require.resolve('@fontsource/raleway/files/raleway-latin-500-normal.woff'),
    raleway600: require.resolve('@fontsource/raleway/files/raleway-latin-600-normal.woff'),
  })
}
```
(`@fontsource/*` exports `./files/*.woff`, verified.) If `tsc` complains about `?url` imports, add `src/vite-env.d.ts` with `/// <reference types="vite/client" />`.

- [ ] **Step 2: Theme**

`src/pdf/theme.ts`:
```ts
import { StyleSheet } from '@react-pdf/renderer'
import { farben } from '../brand/colors'
import { SCHRIFT } from '../brand/fonts'

/** A4 = 595,28 × 841,89 pt. Ränder in pt. */
export const SEITE = { randOben: 104, randUnten: 76, randSeite: 48 } as const
export const GROESSE = { titel: 19, eyebrow: 7, label: 6.5, ueberschrift: 10, text: 9.2, klein: 7.8, fussnote: 7 } as const

export const styles = StyleSheet.create({
  seite: {
    paddingTop: SEITE.randOben,
    paddingBottom: SEITE.randUnten,
    paddingHorizontal: SEITE.randSeite,
    fontFamily: SCHRIFT.text,
    fontSize: GROESSE.text,
    lineHeight: 1.45,
    color: farben.ink,
  },
  kopf: {
    position: 'absolute',
    top: 32,
    left: SEITE.randSeite,
    right: SEITE.randSeite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: farben.gold,
  },
  kopfKontakt: { textAlign: 'right', fontSize: GROESSE.klein, color: farben.muted, lineHeight: 1.4 },
  fuss: {
    position: 'absolute',
    bottom: 28,
    left: SEITE.randSeite,
    right: SEITE.randSeite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: farben.line,
  },
  fussText: { fontSize: GROESSE.fussnote, color: farben.muted, lineHeight: 1.4 },
  laufzeile: { fontSize: GROESSE.klein, color: farben.muted, marginBottom: 12 },
  eyebrow: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.eyebrow,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: farben.goldDeep,
  },
  label: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.label,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: farben.muted,
  },
  titel: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.titel,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    lineHeight: 1.12,
    color: farben.ink,
    marginTop: 5,
  },
  goldRule: { width: 40, height: 1, backgroundColor: farben.gold, marginTop: 8, marginBottom: 12 },
  ueberschrift: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.ueberschrift,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: farben.ink,
    marginTop: 12,
    marginBottom: 5,
  },
  absatz: { marginBottom: 6 },
  klein: { fontSize: GROESSE.klein, color: farben.ink600 },
  fussnote: { fontSize: GROESSE.fussnote, color: farben.muted, lineHeight: 1.4, marginTop: 2 },
  fett: { fontWeight: 600 },
  gold: { color: farben.goldDeep },
})
```

- [ ] **Step 3: Components**

`src/pdf/components/LogoPdf.tsx`:
```tsx
import { Polygon, Svg, Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { SCHRIFT } from '../../brand/fonts'
import { BAR_POINTS, CHEVRON_POINTS, LEG_POINTS, MARKE_VIEWBOX } from '../../brand/logoGeometry'

/** Logo für PDFs: A-Marke als Vektor, Wortmarke als gesetzter Text (react-pdf kennt kein textLength). */
export function LogoPdf({ hoehe = 30, hell = false }: { hoehe?: number; hell?: boolean }) {
  const base = hell ? farben.cream : farben.ink
  const markeBreite = hoehe * (MARKE_VIEWBOX.breite / MARKE_VIEWBOX.hoehe)
  const wortGroesse = hoehe * 0.46
  const energyGroesse = hoehe * 0.21
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg viewBox={`0 0 ${MARKE_VIEWBOX.breite} ${MARKE_VIEWBOX.hoehe}`} style={{ width: markeBreite, height: hoehe }}>
        <Polygon points={CHEVRON_POINTS} fill={base} />
        <Polygon points={LEG_POINTS} fill={farben.gold} />
        <Polygon points={BAR_POINTS} fill={farben.gold} />
      </Svg>
      <View style={{ marginLeft: hoehe * 0.32 }}>
        <Text style={{ fontFamily: SCHRIFT.display, fontWeight: 600, fontSize: wortGroesse, letterSpacing: wortGroesse * 0.24, color: base, lineHeight: 1 }}>
          AUGUSTA
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hoehe * 0.08 }}>
          <View style={{ flex: 1, height: 0.8, backgroundColor: farben.gold }} />
          <Text style={{ fontFamily: SCHRIFT.display, fontWeight: 600, fontSize: energyGroesse, letterSpacing: energyGroesse * 0.34, color: farben.gold, marginHorizontal: hoehe * 0.14, lineHeight: 1 }}>
            ENERGY
          </Text>
          <View style={{ flex: 1, height: 0.8, backgroundColor: farben.gold }} />
        </View>
      </View>
    </View>
  )
}
```

`src/pdf/components/PageFrame.tsx`:
```tsx
import { Page, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { Absender } from '../../lib/absender'
import { styles } from '../theme'
import { LogoPdf } from './LogoPdf'

/** Fußzeilen: Zeile 3 (Bank) und die USt-IdNr erscheinen nur, wenn gepflegt. */
export function fusszeilen(a: Absender): string[] {
  const zeile1 = `${a.firma} · Inhaber: ${a.inhaber} · ${a.strasse} · ${a.plz} ${a.ort}`
  const zeile2 = [`Telefon ${a.telefon}`, a.email, a.web, a.ustIdNr.trim() ? `USt-IdNr. ${a.ustIdNr.trim()}` : '']
    .filter(Boolean)
    .join(' · ')
  const bank = [a.bank.trim(), a.iban.trim() ? `IBAN ${a.iban.trim()}` : ''].filter(Boolean).join(' · ')
  const zeile3 = bank ? `Bankverbindung: ${bank}` : ''
  return [zeile1, zeile2, zeile3].filter(Boolean)
}

type Props = { absender: Absender; laufzeile?: string; children: ReactNode }

/** A4-Seite mit festem Kopf (Logo + Kontakt + Goldlinie) und Fuß (Firmenzeilen + „Seite x von y“). */
export function PageFrame({ absender, laufzeile, children }: Props) {
  return (
    <Page size="A4" style={styles.seite}>
      <View fixed style={styles.kopf}>
        <LogoPdf hoehe={30} />
        <View style={styles.kopfKontakt}>
          <Text>{`${absender.firma} · ${absender.strasse} · ${absender.plz} ${absender.ort}`}</Text>
          <Text>{`Telefon ${absender.telefon} · ${absender.email} · ${absender.web}`}</Text>
        </View>
      </View>
      {laufzeile ? <Text style={styles.laufzeile}>{laufzeile}</Text> : null}
      {children}
      <View fixed style={styles.fuss}>
        <View>
          {fusszeilen(absender).map((zeile) => (
            <Text key={zeile} style={styles.fussText}>{zeile}</Text>
          ))}
        </View>
        <Text style={styles.fussText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  )
}
```

`src/pdf/components/Typo.tsx`:
```tsx
import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { GROESSE, styles } from '../theme'

export function SectionTitle({ eyebrow, titel }: { eyebrow?: string; titel: string }) {
  return (
    <View style={{ marginBottom: 2 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.titel}>{titel}</Text>
      <View style={styles.goldRule} />
    </View>
  )
}

export function Ueberschrift({ children }: { children: string }) {
  return <Text style={styles.ueberschrift}>{children}</Text>
}

export function Absatz({ children, klein = false, fett = false, abstand = 6 }: { children: ReactNode; klein?: boolean; fett?: boolean; abstand?: number }) {
  return (
    <Text style={{ marginBottom: abstand, fontSize: klein ? GROESSE.klein : GROESSE.text, fontWeight: fett ? 600 : 400 }}>
      {children}
    </Text>
  )
}

/** „Leitwort: Text“ – das Leitwort in Gold (Markenkonvention der Website). */
export function ColonLead({ lead, text }: { lead: string; text: string }) {
  return (
    <Text style={styles.absatz}>
      <Text style={[styles.fett, styles.gold]}>{`${lead}: `}</Text>
      {text}
    </Text>
  )
}

export function Fussnoten({ zeilen }: { zeilen: string[] }) {
  return (
    <View style={{ marginTop: 14 }}>
      {zeilen.map((zeile) => (
        <Text key={zeile} style={styles.fussnote}>{zeile}</Text>
      ))}
    </View>
  )
}
```

`src/pdf/components/KeyValueGrid.tsx`:
```tsx
import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { styles } from '../theme'

export type KeyValue = { label: string; wert: string }

export function KeyValueGrid({ eintraege, spalten = 3 }: { eintraege: KeyValue[]; spalten?: 2 | 3 }) {
  const breite = `${100 / spalten}%`
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: farben.line, marginBottom: 8 }}>
      {eintraege.map((e) => (
        <View key={e.label} style={{ width: breite, paddingVertical: 5, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: farben.line }}>
          <Text style={styles.label}>{e.label}</Text>
          <Text style={{ marginTop: 2, fontWeight: 500 }}>{e.wert}</Text>
        </View>
      ))}
    </View>
  )
}
```

`src/pdf/components/Tabelle.tsx`:
```tsx
import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { styles } from '../theme'

export type TabellenSpalte = { label: string; flex?: number; align?: 'left' | 'right'; hervorgehoben?: boolean }
/** `span`: zellen[1] erstreckt sich über alle Spalten rechts der ersten. */
export type TabellenZeile = { zellen: string[]; fett?: boolean; span?: boolean }

export function Tabelle({ spalten, zeilen }: { spalten: TabellenSpalte[]; zeilen: TabellenZeile[] }) {
  const restFlex = spalten.slice(1).reduce((summe, s) => summe + (s.flex ?? 1), 0)
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', backgroundColor: farben.cream }}>
        {spalten.map((s, i) => (
          <View
            key={i}
            style={{
              flex: s.flex ?? 1,
              paddingVertical: 5,
              paddingHorizontal: 6,
              borderTopWidth: s.hervorgehoben ? 2 : 0,
              borderTopColor: farben.gold,
            }}
          >
            <Text style={[styles.label, { textAlign: s.align ?? 'left', color: s.hervorgehoben ? farben.goldDeep : farben.muted }]}>{s.label}</Text>
          </View>
        ))}
      </View>
      {zeilen.map((z, zi) => {
        const zellen = z.span ? [z.zellen[0], z.zellen[1]] : z.zellen
        return (
          <View
            key={zi}
            wrap={false}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: farben.line,
              borderTopWidth: z.fett ? 1 : 0,
              borderTopColor: farben.ink,
            }}
          >
            {zellen.map((zelle, i) => {
              const spalte = spalten[i]
              const flex = z.span && i === 1 ? restFlex : (spalte?.flex ?? 1)
              const hervorgehoben = !z.span && spalte?.hervorgehoben
              return (
                <View key={i} style={{ flex, paddingVertical: 5, paddingHorizontal: 6, backgroundColor: hervorgehoben ? farben.goldTint : undefined }}>
                  <Text style={{ textAlign: z.span && i === 1 ? 'left' : (spalte?.align ?? 'left'), fontWeight: z.fett ? 600 : 400 }}>{zelle}</Text>
                </View>
              )
            })}
          </View>
        )
      })}
    </View>
  )
}
```

`src/pdf/components/HighlightBlock.tsx`:
```tsx
import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { SCHRIFT } from '../../brand/fonts'

/** Ink-Block mit goldener Kante: Kernaussage links, große Goldzahl rechts. */
export function HighlightBlock({ text, wert, hinweis }: { text: string; wert?: string; hinweis?: string }) {
  return (
    <View
      wrap={false}
      style={{
        backgroundColor: farben.ink,
        borderLeftWidth: 3,
        borderLeftColor: farben.gold,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginTop: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Text style={{ fontFamily: SCHRIFT.display, fontSize: 7, fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase', color: farben.cream }}>{text}</Text>
        {hinweis ? <Text style={{ color: farben.cream, fontSize: 8.5, marginTop: 5, lineHeight: 1.4 }}>{hinweis}</Text> : null}
      </View>
      {wert ? <Text style={{ fontFamily: SCHRIFT.display, fontSize: 21, fontWeight: 700, color: farben.gold }}>{wert}</Text> : null}
    </View>
  )
}
```

`src/pdf/testUtils.ts`:
```ts
/** Zählt die Seitenobjekte (`/Type /Page`, nicht `/Pages`) – pdfkit schreibt sie unkomprimiert. */
export function seitenAnzahl(pdf: Uint8Array): number {
  const text = Buffer.from(pdf).toString('latin1')
  return (text.match(/\/Type\s*\/Page\b/g) ?? []).length
}

export function istPdf(pdf: Uint8Array): boolean {
  return Buffer.from(pdf.subarray(0, 5)).toString('latin1') === '%PDF-'
}
```

- [ ] **Step 4: Smoke test**

`src/pdf/components/PageFrame.test.tsx`:
```tsx
import { beforeAll, describe, expect, it } from 'vitest'
import { Document, renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../../brand/fonts.node'
import { standardAbsender } from '../../lib/absender'
import { istPdf, seitenAnzahl } from '../testUtils'
import { HighlightBlock } from './HighlightBlock'
import { KeyValueGrid } from './KeyValueGrid'
import { fusszeilen, PageFrame } from './PageFrame'
import { Tabelle } from './Tabelle'
import { Absatz, ColonLead, Fussnoten, SectionTitle, Ueberschrift } from './Typo'

beforeAll(() => registerFonts())

describe('PDF-Grundgerüst', () => {
  it('bildet die Fußzeilen abhängig von optionalen Angaben', () => {
    expect(fusszeilen(standardAbsender)).toEqual([
      'Augusta Energy · Inhaber: Niklas Trojovsky · Am Mittleren Moos 53 · 86167 Augsburg',
      'Telefon 0151 41378008 · info@augusta-energy.de · augusta-energy.de',
    ])
    expect(fusszeilen({ ...standardAbsender, ustIdNr: 'DE123456789', bank: 'Musterbank', iban: 'DE00 1234' })).toEqual([
      'Augusta Energy · Inhaber: Niklas Trojovsky · Am Mittleren Moos 53 · 86167 Augsburg',
      'Telefon 0151 41378008 · info@augusta-energy.de · augusta-energy.de · USt-IdNr. DE123456789',
      'Bankverbindung: Musterbank · IBAN DE00 1234',
    ])
  })

  it('rendert eine Seite mit Kopf, Fuß, Tabelle und Highlight in den Markenschriften', async () => {
    const pdf = await renderToBuffer(
      <Document>
        <PageFrame absender={standardAbsender} laufzeile="Energie-Vergleich Nr. AE-1 vom 10.09.2026 für Test">
          <SectionTitle eyebrow="Strom · Musterstraße 12, 86150 Augsburg" titel="Ihr persönlicher Energie-Vergleich" />
          <Absatz>Umlaute ÄÖÜ äöü ß und € müssen sauber gesetzt werden.</Absatz>
          <Ueberschrift>Unsere Leistungen für Sie</Ueberschrift>
          <ColonLead lead="Anbieterwechsel" text="Wir kümmern uns um einen reibungslosen Wechsel." />
          <KeyValueGrid spalten={3} eintraege={[{ label: 'Energieart', wert: 'Strom' }, { label: 'Laufzeit', wert: '24 Monate' }, { label: 'Lieferbeginn', wert: '01.01.2027' }]} />
          <Tabelle
            spalten={[{ label: '', flex: 2 }, { label: 'Unsere Empfehlung', align: 'right', hervorgehoben: true }, { label: 'Ihr aktueller Tarif', align: 'right' }]}
            zeilen={[
              { zellen: ['Versorger', 'M4ENERGY', 'EnBW'] },
              { zellen: ['Preisgarantie', 'Energiepreisgarantie bis 31.12.2028'], span: true },
              { zellen: ['Jahreskosten', '16.436,36 €', '17.417,26 €'], fett: true },
            ]}
          />
          <HighlightBlock text="Durch unsere Einkaufsstrategie sparen Sie jedes Jahr" wert="980,90 € netto*" />
          <Fussnoten zeilen={['* Alle Preise netto.', '** Gerundete Werte.']} />
        </PageFrame>
      </Document>,
    )
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBe(1)
    const roh = Buffer.from(pdf).toString('latin1')
    expect(roh).toMatch(/Montserrat/)
    expect(roh).toMatch(/Raleway/)
  })
})
```

- [ ] **Step 5: Run the test, fix until green**

Run: `npx vitest run src/pdf`
Expected: PASS. Typical failures and fixes: (a) `?url` typing → add `src/vite-env.d.ts`; (b) font fetch errors → check the `require.resolve` paths print absolute `.woff` files; (c) `textTransform`/`letterSpacing` type complaints → these are valid react-pdf style keys, check spelling.

- [ ] **Step 6: Lint, build, commit**

Run: `npm run lint && npm run build && npm test` → green (the browser build must include the `.woff` assets: `ls dist/assets | grep -c woff` prints 6).
```bash
git add src/brand src/pdf
git commit -m "feat: PDF foundation – fonts, theme, page frame, tables, highlight block"
```

---

### Task 6: VergleichDocument (3 pages) + render script

**Files:**
- Create: `src/pdf/VergleichDocument.tsx`, `src/pdf/VergleichDocument.test.tsx`, `scripts/render-beispiele.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2, 3, 5.
- Produces: `VergleichDocument({ daten, absender })` React element (a react-pdf `<Document>`), `vergleichDateiname(daten): string`; npm script `render:beispiele` writing `out/Energie-Vergleich.pdf`.

- [ ] **Step 1: Failing test**

`src/pdf/VergleichDocument.test.tsx`:
```tsx
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../brand/fonts.node'
import { standardAbsender } from '../lib/absender'
import { beispielVergleich } from '../lib/vergleich/beispiel'
import { leererVergleich } from '../lib/vergleich/types'
import { istPdf, seitenAnzahl } from './testUtils'
import { VergleichDocument, vergleichDateiname } from './VergleichDocument'

beforeAll(() => registerFonts())

describe('VergleichDocument', () => {
  it('rendert die Beispieldaten auf genau drei Seiten', async () => {
    const pdf = await renderToBuffer(<VergleichDocument daten={beispielVergleich('2026-09-10')} absender={standardAbsender} />)
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('bleibt bei ausgeblendetem Honorar, Brutto-Darstellung, Hinweisen und negativer Ersparnis bei drei Seiten', async () => {
    const d = beispielVergleich('2026-09-10')
    d.honorar.anzeigen = false
    d.vergleich.preisdarstellung = 'brutto'
    d.vergleich.hinweise = 'Der Wechsel erfolgt zum 01.01.2027. Bitte senden Sie uns die letzte Jahresabrechnung.'
    d.empfehlung.arbeitspreisCt = '40'
    d.kunde.anrede = 'frau'
    const pdf = await renderToBuffer(<VergleichDocument daten={d} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('rendert auch eine leere Vorlage ohne Fehler', async () => {
    const leer = leererVergleich('2026-09-10', 'AE-20260910-AAAA', standardAbsender.ansprechpartner)
    const pdf = await renderToBuffer(<VergleichDocument daten={leer} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('bildet den Dateinamen aus Kundenname und Datum', () => {
    expect(vergleichDateiname(beispielVergleich('2026-09-10'))).toBe('Augusta-Energy_Energie-Vergleich_Muster-Gastronomie-GmbH_2026-09-10.pdf')
  })
})
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: Implement `VergleichDocument.tsx`**

```tsx
import { Document, Text, View } from '@react-pdf/renderer'
import type { Absender } from '../lib/absender'
import { pdfDateiname } from '../lib/dateiname'
import { ctProKwh, datum, euro, grundpreisText, kwh, LEER, monate, prozent } from '../lib/format'
import { berechneVergleich, brutto, type VergleichErgebnis } from '../lib/vergleich/berechnung'
import { energieartLabel, kundenname, type Preisdarstellung, type VergleichDaten } from '../lib/vergleich/types'
import { parseDezimal } from '../lib/zahl'
import { GROESSE, styles } from './theme'
import { HighlightBlock } from './components/HighlightBlock'
import { KeyValueGrid, type KeyValue } from './components/KeyValueGrid'
import { PageFrame } from './components/PageFrame'
import { Tabelle, type TabellenZeile } from './components/Tabelle'
import { Absatz, ColonLead, Fussnoten, SectionTitle, Ueberschrift } from './components/Typo'

type Props = { daten: VergleichDaten; absender: Absender }

const VORTEILE: ReadonlyArray<[string, string]> = [
  ['Optimierte Konditionen', 'Durch die strukturierte, datenbasierte Ausschreibung zeigen wir Ihnen die besten Konditionen und Einsparpotenziale auf.'],
  ['Flexible Anpassung', 'Unser Angebot ist modular aufgebaut und lässt sich an veränderte Marktbedingungen oder Ihre Wünsche anpassen.'],
  ['Nachhaltige Beschaffung', 'Effizienz und Nachhaltigkeit behalten wir bei der Beschaffung ebenso im Blick wie den Preis.'],
]

const LEISTUNGEN: ReadonlyArray<[string, string]> = [
  ['Anbieterwechsel', 'Wir kümmern uns um einen reibungslosen Wechsel und alle dafür nötigen Schritte.'],
  ['Rechnungsprüfung', 'Wir prüfen alle eingehenden Rechnungen und veranlassen notwendige Korrekturen.'],
  ['Reduktion der Konzessionsabgabe', 'Sofern die gesetzlichen Voraussetzungen erfüllt sind, reduzieren wir Ihre Konzessionsabgabe.'],
  ['Forderungsmanagement', 'Zu viel gezahlte Abschläge fordern wir vom Versorger für Sie ein, wenn es dort zu Verzögerungen kommt.'],
  ['Nachverhandlung', 'Fallen die Energiepreise erheblich, verhandeln wir bestehende Verträge zu Ihren Gunsten neu.'],
  ['Laufende Vertragsbetreuung', 'Wir kümmern uns rechtzeitig vor Ablauf Ihrer Preisgarantie um den nächsten Wechsel.'],
]

const oder = (s: string) => (s.trim() === '' ? LEER : s.trim())

export function vergleichDateiname(d: VergleichDaten): string {
  return pdfDateiname('Energie-Vergleich', kundenname(d), d.vergleich.datum)
}

function anredeZeile(d: VergleichDaten): string {
  const { anrede, vorname, nachname } = d.kunde
  const name = `${vorname} ${nachname}`.trim()
  if (anrede === 'frau') return `Sehr geehrte Frau ${nachname.trim()},`
  if (anrede === 'herr') return `Sehr geehrter Herr ${nachname.trim()},`
  if (anrede === 'divers') return `Guten Tag ${name},`
  return 'Sehr geehrte Damen und Herren,'
}

function adresszeilen(d: VergleichDaten): string[] {
  const firma = d.kunde.firma.trim()
  const name = `${d.kunde.vorname} ${d.kunde.nachname}`.trim()
  const zeilen: string[] = []
  if (firma) {
    zeilen.push(firma)
    if (name) zeilen.push(`z. Hd. ${name}`)
  } else if (name) {
    zeilen.push(name)
  }
  if (d.kunde.strasse.trim()) zeilen.push(d.kunde.strasse.trim())
  const ort = `${d.kunde.plz} ${d.kunde.ort}`.trim()
  if (ort) zeilen.push(ort)
  return zeilen
}

function lieferstelleText(d: VergleichDaten): string {
  const teile = [d.lieferstelle.strasse.trim(), `${d.lieferstelle.plz} ${d.lieferstelle.ort}`.trim()].filter(Boolean)
  return teile.length ? teile.join(', ') : LEER
}

function lieferstelleEintraege(d: VergleichDaten, e: VergleichErgebnis): KeyValue[] {
  return [
    { label: 'Lieferstelle', wert: lieferstelleText(d) },
    { label: 'Energieart', wert: energieartLabel[d.lieferstelle.energieart] },
    { label: 'Jahresverbrauch', wert: kwh(parseDezimal(d.lieferstelle.jahresverbrauchKwh)) },
    { label: 'Lieferbeginn', wert: datum(d.lieferstelle.lieferbeginn) },
    { label: 'Lieferende', wert: datum(e.lieferende) },
    { label: 'Laufzeit', wert: e.laufzeitMonate > 0 ? monate(e.laufzeitMonate) : LEER },
  ]
}

function fussnotenBasis(e: VergleichErgebnis, p: Preisdarstellung): string[] {
  return [
    `* Alle Preise verstehen sich ${p === 'netto' ? 'netto zzgl.' : 'inkl.'} der gesetzlichen Umsatzsteuer (${prozent(e.ustSatz)}).`,
    '** Gerundete Werte auf Basis des angegebenen Jahresverbrauchs. Bei starken Verbrauchsschwankungen können die tatsächlichen Kosten deutlich abweichen.',
    'Alle Werte sind auf zwei Nachkommastellen gerundet.',
  ]
}

function MetaZeile({ label, wert }: { label: string; wert: string }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 3 }}>
      <Text style={[styles.label, { width: 92, paddingTop: 1.5 }]}>{label}</Text>
      <Text style={{ flex: 1, fontSize: GROESSE.klein }}>{wert}</Text>
    </View>
  )
}

export function VergleichDocument({ daten, absender }: Props) {
  const e = berechneVergleich(daten)
  const p = daten.vergleich.preisdarstellung
  const w = (netto: number) => (p === 'brutto' ? brutto(netto, e.faktorUst) : netto)
  const b = (netto: number) => brutto(netto, e.faktorUst)
  const name = kundenname(daten) || LEER
  const nummer = oder(daten.vergleich.nummer)
  const laufzeile = `Energie-Vergleich Nr. ${nummer} vom ${datum(daten.vergleich.datum)} für ${name}`
  const laufzeitText = e.laufzeitMonate > 0 ? monate(e.laufzeitMonate) : 'Laufzeit'
  const honorarHinweis = e.honorarSichtbar ? ' – hierfür erheben wir das auf Seite 3 ausgewiesene Beratungshonorar.' : '.'

  const vergleichZeilen: TabellenZeile[] = [
    { zellen: ['Versorger', oder(daten.empfehlung.versorger), oder(daten.aktuell.versorger)] },
    { zellen: ['Preisgarantie', oder(daten.empfehlung.preisgarantie), oder(daten.aktuell.preisgarantie)] },
    { zellen: ['Arbeitspreis', ctProKwh(w(e.empfehlung.arbeitspreisCt)), ctProKwh(w(e.aktuell.arbeitspreisCt))] },
    {
      zellen: [
        'Grundpreis',
        grundpreisText(w(e.empfehlung.grundpreisEingabe), daten.empfehlung.grundpreisEinheit),
        grundpreisText(w(e.aktuell.grundpreisEingabe), daten.aktuell.grundpreisEinheit),
      ],
    },
    { zellen: ['Jahreskosten', euro(w(e.empfehlung.jahreskosten)), euro(w(e.aktuell.jahreskosten))] },
    { zellen: ['Monatlicher Abschlag', euro(w(e.empfehlung.abschlagMonat)), euro(w(e.aktuell.abschlagMonat))] },
    { zellen: ['Ersparnis pro Jahr', euro(w(e.ersparnisJahr)), LEER], fett: true },
  ]

  const vertragZeilen: TabellenZeile[] = [
    { zellen: ['Energieversorger', oder(daten.empfehlung.versorger)], span: true },
    { zellen: ['Preisgarantie', oder(daten.empfehlung.preisgarantie)], span: true },
    { zellen: ['Arbeitspreis', ctProKwh(e.empfehlung.arbeitspreisCt), ctProKwh(b(e.empfehlung.arbeitspreisCt))] },
    {
      zellen: [
        'Grundpreis',
        grundpreisText(e.empfehlung.grundpreisEingabe, daten.empfehlung.grundpreisEinheit),
        grundpreisText(b(e.empfehlung.grundpreisEingabe), daten.empfehlung.grundpreisEinheit),
      ],
    },
    { zellen: [`Gesamtkosten Laufzeit (${laufzeitText})`, euro(e.empfehlung.laufzeitkosten), euro(b(e.empfehlung.laufzeitkosten))] },
    { zellen: ['Monatlicher Abschlag', euro(e.empfehlung.abschlagMonat), euro(b(e.empfehlung.abschlagMonat))] },
  ]

  const honorarZeilen: TabellenZeile[] = [
    ...(e.honorarAnbieterwechsel > 0 ? [{ zellen: ['Honorar Anbieterwechsel', euro(e.honorarAnbieterwechsel), euro(b(e.honorarAnbieterwechsel))] }] : []),
    ...(e.honorarKonzessionsabgabe > 0 ? [{ zellen: ['Honorar Konzessionsabgabe', euro(e.honorarKonzessionsabgabe), euro(b(e.honorarKonzessionsabgabe))] }] : []),
    { zellen: ['Summe Beratungshonorar', euro(e.honorarSumme), euro(b(e.honorarSumme))], fett: true },
  ]

  const ersparnisZeilen: TabellenZeile[] = [
    { zellen: [`Ersparnis Anbieterwechsel (${laufzeitText})`, euro(e.ersparnisLaufzeit), euro(b(e.ersparnisLaufzeit))] },
    ...(e.kaReduktionLaufzeit > 0
      ? [{ zellen: [`Reduktion Konzessionsabgabe (${laufzeitText})`, euro(e.kaReduktionLaufzeit), euro(b(e.kaReduktionLaufzeit))] }]
      : []),
    ...(e.honorarSichtbar ? [{ zellen: ['abzüglich Beratungshonorar', euro(-e.honorarSumme), euro(-b(e.honorarSumme))] }] : []),
    { zellen: ['Gesamtersparnis', euro(e.gesamtersparnisLaufzeit), euro(b(e.gesamtersparnisLaufzeit))], fett: true },
  ]

  const nettoBruttoSpalten = [
    { label: '', flex: 2.4 },
    { label: 'netto', align: 'right' as const, hervorgehoben: p === 'netto' },
    { label: 'brutto', align: 'right' as const, hervorgehoben: p === 'brutto' },
  ]

  const keineErsparnis = 'Mit unserer Empfehlung ergibt sich derzeit keine Ersparnis gegenüber Ihrem aktuellen Tarif.'

  return (
    <Document
      title={`Energie-Vergleich ${nummer}`}
      author={absender.firma}
      subject={`Energie-Vergleich für ${name}`}
      language="de"
      creator="Augusta Energy Dokumente"
      producer="Augusta Energy Dokumente"
    >
      {/* Seite 1 – Anschreiben */}
      <PageFrame absender={absender}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }}>
          <View style={{ width: '52%' }}>
            <Text style={[styles.fussnote, { marginBottom: 8 }]}>{`${absender.firma} · ${absender.strasse} · ${absender.plz} ${absender.ort}`}</Text>
            {adresszeilen(daten).map((zeile, i) => (
              <Text key={i} style={{ lineHeight: 1.4 }}>{zeile}</Text>
            ))}
          </View>
          <View style={{ width: '42%' }}>
            <MetaZeile label="Vergleichsnummer" wert={nummer} />
            <MetaZeile label="Datum" wert={datum(daten.vergleich.datum)} />
            <MetaZeile label="Gültig bis" wert={datum(e.gueltigBis)} />
            <MetaZeile label="Ansprechpartner" wert={`${absender.ansprechpartner.name} · ${absender.ansprechpartner.telefon} · ${absender.ansprechpartner.email}`} />
          </View>
        </View>

        <SectionTitle eyebrow={`${energieartLabel[daten.lieferstelle.energieart]} · ${lieferstelleText(daten)}`} titel="Ihr persönlicher Energie-Vergleich" />

        <Absatz>{anredeZeile(daten)}</Absatz>
        <Absatz>
          vielen Dank für Ihr Vertrauen. Auf Grundlage Ihrer Verbrauchsdaten haben wir den Markt für Sie ausgeschrieben und ein Einkaufsmodell entwickelt, das auf Ihre Anforderungen zugeschnitten ist. Das Ergebnis finden Sie auf den folgenden Seiten – zunächst im Überblick, anschließend im Detail.
        </Absatz>

        <Ueberschrift>Das bietet Ihnen unser Einkaufsmodell</Ueberschrift>
        {VORTEILE.map(([lead, text]) => (
          <ColonLead key={lead} lead={lead} text={text} />
        ))}

        <Ueberschrift>Unsere Leistungen für Sie</Ueberschrift>
        <Absatz>{`Diese Leistungen sind Bestandteil unseres Vergleichs${honorarHinweis}`}</Absatz>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {LEISTUNGEN.map(([lead, text]) => (
            <View key={lead} style={{ width: '50%', paddingRight: 12 }}>
              <ColonLead lead={lead} text={text} />
            </View>
          ))}
        </View>

        <Absatz abstand={4}>Wir freuen uns auf Ihre Beauftragung und stehen Ihnen bei Fragen jederzeit zur Verfügung.</Absatz>
        <Absatz>Mit freundlichen Grüßen</Absatz>
        <Text style={[styles.fett, { marginTop: 18, fontSize: GROESSE.text }]}>{oder(daten.unterzeichner.name)}</Text>
        <Text style={styles.klein}>{`${oder(daten.unterzeichner.rolle)} · ${absender.firma}`}</Text>
      </PageFrame>

      {/* Seite 2 – Überblick */}
      <PageFrame absender={absender} laufzeile={laufzeile}>
        <SectionTitle titel="Ihr Vergleich auf einen Blick" />
        <KeyValueGrid spalten={3} eintraege={lieferstelleEintraege(daten, e)} />
        <Text style={[styles.klein, { marginTop: 6, marginBottom: 4 }]}>{`Alle Preise ${p}*`}</Text>
        <Tabelle
          spalten={[{ label: '', flex: 1.6 }, { label: 'Unsere Empfehlung', align: 'right', hervorgehoben: true }, { label: 'Ihr aktueller Tarif', align: 'right' }]}
          zeilen={vergleichZeilen}
        />
        {e.ersparnisJahr > 0 ? (
          <HighlightBlock text="Durch unsere Einkaufsstrategie sparen Sie jedes Jahr" wert={`${euro(w(e.ersparnisJahr))} ${p}*`} />
        ) : (
          <HighlightBlock text="Ihre Ersparnis" hinweis={keineErsparnis} />
        )}
        <Fussnoten zeilen={fussnotenBasis(e, p)} />
      </PageFrame>

      {/* Seite 3 – Details */}
      <PageFrame absender={absender} laufzeile={laufzeile}>
        <SectionTitle eyebrow={`Vergleichskonditionen vom ${datum(daten.vergleich.datum)} · gültig bis ${datum(e.gueltigBis)}`} titel="Konditionen im Detail" />
        <KeyValueGrid spalten={3} eintraege={lieferstelleEintraege(daten, e)} />

        <Ueberschrift>Vertragsdetails – unsere Empfehlung</Ueberschrift>
        <Tabelle spalten={nettoBruttoSpalten} zeilen={vertragZeilen} />

        {e.honorarSichtbar ? (
          <>
            <Ueberschrift>Beratungshonorar</Ueberschrift>
            <Tabelle spalten={nettoBruttoSpalten} zeilen={honorarZeilen} />
          </>
        ) : null}

        <Ueberschrift>Ihr Einsparpotenzial über die Laufzeit</Ueberschrift>
        <Tabelle spalten={nettoBruttoSpalten} zeilen={ersparnisZeilen} />

        {e.gesamtersparnisLaufzeit > 0 ? (
          <HighlightBlock text="Durch unseren Anbieterwechsel sparen Sie insgesamt" wert={`${euro(w(e.gesamtersparnisLaufzeit))} ${p}**`} />
        ) : (
          <HighlightBlock text="Ihre Gesamtersparnis" hinweis={keineErsparnis} />
        )}

        {daten.vergleich.hinweise.trim() ? (
          <>
            <Ueberschrift>Hinweise</Ueberschrift>
            <Absatz>{daten.vergleich.hinweise.trim()}</Absatz>
          </>
        ) : null}

        <Fussnoten
          zeilen={[
            ...fussnotenBasis(e, p),
            'Dieses Angebot ist freibleibend. Grundlage sind die zum Vergleichsdatum gültigen Konditionen des Versorgers; Änderungen von Steuern, Abgaben und Umlagen bleiben vorbehalten.',
          ]}
        />
      </PageFrame>
    </Document>
  )
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/pdf/VergleichDocument.test.tsx`
Expected: PASS with exactly 3 pages. If a page overflows to 4, reduce `GROESSE.text` to 9 or the page-1 `marginBottom`s – do not delete content.

- [ ] **Step 5: Render script for visual QA**

`scripts/render-beispiele.tsx`:
```tsx
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../src/brand/fonts.node'
import { standardAbsender } from '../src/lib/absender'
import { heuteIso } from '../src/lib/datum'
import { beispielVergleich } from '../src/lib/vergleich/beispiel'
import { VergleichDocument } from '../src/pdf/VergleichDocument'

registerFonts()
mkdirSync('out', { recursive: true })

const vergleich = await renderToBuffer(<VergleichDocument daten={beispielVergleich(heuteIso())} absender={standardAbsender} />)
writeFileSync('out/Energie-Vergleich.pdf', vergleich)
console.log('out/Energie-Vergleich.pdf geschrieben')
```
Run: `npm run render:beispiele` → prints the line, `out/Energie-Vergleich.pdf` exists (`out/` is git-ignored).

- [ ] **Step 6: Lint, build, commit**

Run: `npm run lint && npm run build && npm test` → green.
```bash
git add src/pdf scripts
git commit -m "feat: Energie-Vergleich PDF document with cover letter, overview and detail pages"
```

---

### Task 7: VollmachtDocument

**Files:**
- Create: `src/pdf/VollmachtDocument.tsx`, `src/pdf/VollmachtDocument.test.tsx`
- Modify: `scripts/render-beispiele.tsx` (add the Vollmacht)

**Interfaces:**
- Consumes: Tasks 4 and 5.
- Produces: `VollmachtDocument({ daten, absender })`, `vollmachtDateiname(daten): string`.

- [ ] **Step 1: Failing test**

`src/pdf/VollmachtDocument.test.tsx`:
```tsx
import { beforeAll, describe, expect, it } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../brand/fonts.node'
import { standardAbsender } from '../lib/absender'
import { beispielVollmacht } from '../lib/vollmacht/beispiel'
import { leereVollmacht, neueLieferstelle } from '../lib/vollmacht/types'
import { istPdf, seitenAnzahl } from './testUtils'
import { VollmachtDocument, vollmachtDateiname } from './VollmachtDocument'

beforeAll(() => registerFonts())

describe('VollmachtDocument', () => {
  it('rendert die Beispieldaten auf höchstens zwei Seiten', async () => {
    const pdf = await renderToBuffer(<VollmachtDocument daten={beispielVollmacht()} absender={standardAbsender} />)
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBeLessThanOrEqual(2)
  })
  it('läuft bei vielen Lieferstellen auf weitere Seiten über, ohne zu brechen', async () => {
    const d = beispielVollmacht()
    d.lieferstellen = Array.from({ length: 12 }, (_, i) => ({ ...neueLieferstelle(), adresse: `Teststraße ${i + 1}, 86150 Augsburg`, zaehlernummer: `Z${i}` }))
    const pdf = await renderToBuffer(<VollmachtDocument daten={d} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBeGreaterThanOrEqual(2)
  })
  it('rendert Privatperson, Befristung und Untervollmacht sowie die leere Vorlage', async () => {
    const d = beispielVollmacht()
    d.vollmachtgeber = { ...d.vollmachtgeber, typ: 'privat', name: 'Erika Musterfrau', vertretenDurch: '', geburtsdatum: '1980-05-17' }
    d.geltung = { art: 'befristet', bis: '2027-12-31' }
    d.untervollmacht = true
    d.unterschrift = { ort: 'Augsburg', datum: '2026-09-10' }
    expect(seitenAnzahl(await renderToBuffer(<VollmachtDocument daten={d} absender={standardAbsender} />))).toBeLessThanOrEqual(2)
    expect(seitenAnzahl(await renderToBuffer(<VollmachtDocument daten={leereVollmacht()} absender={standardAbsender} />))).toBeGreaterThanOrEqual(1)
  })
  it('bildet den Dateinamen aus Vollmachtgeber und Datum', () => {
    const d = beispielVollmacht()
    d.unterschrift.datum = '2026-09-10'
    expect(vollmachtDateiname(d)).toBe('Augusta-Energy_Vollmacht_Muster-Gastronomie-GmbH_2026-09-10.pdf')
  })
})
```

- [ ] **Step 2: Run to verify failure**, then **Step 3: Implement `VollmachtDocument.tsx`**

```tsx
import { Document, Text, View } from '@react-pdf/renderer'
import { farben } from '../brand/colors'
import type { Absender } from '../lib/absender'
import { pdfDateiname } from '../lib/dateiname'
import { heuteIso } from '../lib/datum'
import { datum, LEER } from '../lib/format'
import { beschraenkungEinleitung, beschraenkungPunkte, bevollmaechtigungsSatz, datenschutzSatz, energieartenText, geltungSatz, sonstigesSatz, umfangPunkte, untervollmachtSatz } from '../lib/vollmacht/texte'
import { lieferstellenEnergieartLabel, vollmachtgeberName, type VollmachtDaten } from '../lib/vollmacht/types'
import { GROESSE, styles } from './theme'
import { PageFrame } from './components/PageFrame'
import { Tabelle } from './components/Tabelle'
import { Absatz, SectionTitle, Ueberschrift } from './components/Typo'

type Props = { daten: VollmachtDaten; absender: Absender }

const oder = (s: string) => (s.trim() === '' ? LEER : s.trim())

export function vollmachtDateiname(d: VollmachtDaten): string {
  return pdfDateiname('Vollmacht', vollmachtgeberName(d), d.unterschrift.datum.trim() || heuteIso())
}

function Box({ titel, zeilen }: { titel: string; zeilen: string[] }) {
  return (
    <View style={{ flex: 1, backgroundColor: farben.cream, padding: 10 }}>
      <Text style={[styles.label, { marginBottom: 4 }]}>{titel}</Text>
      {zeilen.map((z, i) => (
        <Text key={i} style={{ lineHeight: 1.4, fontWeight: i === 0 ? 600 : 400 }}>{z}</Text>
      ))}
    </View>
  )
}

function Liste({ punkte, nummeriert }: { punkte: readonly string[]; nummeriert: boolean }) {
  return (
    <View style={{ marginBottom: 4 }}>
      {punkte.map((punkt, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 2.5 }}>
          <Text style={{ width: 16, color: farben.goldDeep, fontWeight: 600 }}>{nummeriert ? `${i + 1}.` : '–'}</Text>
          <Text style={{ flex: 1 }}>{punkt}</Text>
        </View>
      ))}
    </View>
  )
}

export function VollmachtDocument({ daten, absender }: Props) {
  const vg = daten.vollmachtgeber
  const vollmachtgeberZeilen = [
    oder(vg.name),
    vg.typ === 'unternehmen' && vg.vertretenDurch.trim() ? `vertreten durch ${vg.vertretenDurch.trim()}` : '',
    vg.strasse.trim(),
    `${vg.plz} ${vg.ort}`.trim(),
    vg.typ === 'privat' && vg.geburtsdatum.trim() ? `geb. am ${datum(vg.geburtsdatum)}` : '',
    [vg.email.trim(), vg.telefon.trim()].filter(Boolean).join(' · '),
  ].filter(Boolean)

  const bevollmaechtigteZeilen = [
    absender.firma,
    `Inhaber: ${absender.inhaber}`,
    absender.strasse,
    `${absender.plz} ${absender.ort}`,
    `Telefon ${absender.telefon} · ${absender.email}`,
  ]

  const lieferstellenZeilen = daten.lieferstellen.map((l, i) => ({
    zellen: [`${i + 1}`, oder(l.adresse), lieferstellenEnergieartLabel[l.energieart], oder(l.zaehlernummer), oder(l.maloId), oder(l.versorger)],
  }))

  const ortDatum = `${daten.unterschrift.ort.trim() || vg.ort.trim()}${daten.unterschrift.datum.trim() ? `, ${datum(daten.unterschrift.datum)}` : ', '}`

  return (
    <Document title={`Vollmacht ${vollmachtgeberName(daten)}`.trim()} author={absender.firma} subject="Vollmacht Energieversorgung" language="de" creator="Augusta Energy Dokumente" producer="Augusta Energy Dokumente">
      <PageFrame absender={absender}>
        <SectionTitle eyebrow={`Energieversorgung · ${energieartenText(daten.energiearten)}`} titel="Vollmacht" />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Box titel="Vollmachtgeber/in" zeilen={vollmachtgeberZeilen} />
          <Box titel="Bevollmächtigte" zeilen={bevollmaechtigteZeilen} />
        </View>

        <Absatz>{bevollmaechtigungsSatz(daten)}</Absatz>

        <Ueberschrift>Lieferstellen</Ueberschrift>
        <Tabelle
          spalten={[
            { label: 'Nr.', flex: 0.35 },
            { label: 'Adresse', flex: 2.2 },
            { label: 'Energieart', flex: 1 },
            { label: 'Zählernummer', flex: 1.2 },
            { label: 'Marktlokations-ID', flex: 1.2 },
            { label: 'Bisheriger Versorger', flex: 1.3 },
          ]}
          zeilen={lieferstellenZeilen.length ? lieferstellenZeilen : [{ zellen: ['1', LEER, LEER, LEER, LEER, LEER] }]}
        />

        <Ueberschrift>Umfang der Vollmacht</Ueberschrift>
        <Absatz abstand={3}>Die Vollmacht umfasst insbesondere:</Absatz>
        <Liste punkte={umfangPunkte(daten)} nummeriert />

        <Ueberschrift>Beschränkung der Vollmacht</Ueberschrift>
        <Absatz abstand={3}>{beschraenkungEinleitung(daten)}</Absatz>
        <Liste punkte={beschraenkungPunkte} nummeriert={false} />

        <Ueberschrift>Untervollmacht</Ueberschrift>
        <Absatz>{untervollmachtSatz(daten)}</Absatz>

        <Ueberschrift>Geltungsdauer und Widerruf</Ueberschrift>
        <Absatz>{geltungSatz(daten, absender.email)}</Absatz>

        <Ueberschrift>Datenschutz</Ueberschrift>
        <Absatz>{datenschutzSatz(absender.web)}</Absatz>

        <Ueberschrift>Sonstiges</Ueberschrift>
        <Absatz>{sonstigesSatz}</Absatz>

        <View wrap={false} style={{ flexDirection: 'row', gap: 28, marginTop: 26 }}>
          <View style={{ flex: 1 }}>
            <View style={{ height: 30, justifyContent: 'flex-end', borderBottomWidth: 1, borderBottomColor: farben.ink, paddingBottom: 3 }}>
              <Text>{ortDatum}</Text>
            </View>
            <Text style={[styles.label, { marginTop: 4 }]}>Ort, Datum</Text>
          </View>
          <View style={{ flex: 1.3 }}>
            <View style={{ height: 30, borderBottomWidth: 1, borderBottomColor: farben.ink }} />
            <Text style={[styles.label, { marginTop: 4 }]}>Unterschrift Vollmachtgeber/in</Text>
            <Text style={{ fontSize: GROESSE.fussnote, color: farben.muted, marginTop: 2 }}>bei Unternehmen: Name in Druckbuchstaben, Funktion, ggf. Firmenstempel</Text>
          </View>
        </View>
      </PageFrame>
    </Document>
  )
}
```
`heuteIso` lives in `src/lib/datum.ts` – import it from there, not from `format`.

- [ ] **Step 4: Run the test** → PASS. If the example needs 2 pages, that is acceptable; if it needs 3, tighten spacing (`GROESSE.text` 9, `Absatz` abstand 4).

- [ ] **Step 5: Extend the render script**

Append to `scripts/render-beispiele.tsx`:
```tsx
import { beispielVollmacht } from '../src/lib/vollmacht/beispiel'
import { VollmachtDocument } from '../src/pdf/VollmachtDocument'
// … after the Vergleich block:
const vollmacht = await renderToBuffer(<VollmachtDocument daten={beispielVollmacht()} absender={standardAbsender} />)
writeFileSync('out/Vollmacht.pdf', vollmacht)
console.log('out/Vollmacht.pdf geschrieben')
```
(keep all imports at the top of the file). Run `npm run render:beispiele` → both files written.

- [ ] **Step 6: Lint, build, commit**

```bash
git add src/pdf scripts
git commit -m "feat: Vollmacht PDF document limited to Strom/Gas supply matters"
```

---

### Task 8: UI primitives, debounced PDF preview and DocumentWorkspace

**Files:**
- Create: `src/ui/components/Button.tsx`, `src/ui/components/Tabs.tsx`, `src/ui/components/Section.tsx`, `src/ui/components/Field.tsx`, `src/ui/components/Inputs.tsx`, `src/ui/components/Inputs.test.tsx`, `src/ui/useDebouncedValue.ts`, `src/ui/DocumentWorkspace.tsx`
- Modify: `src/main.tsx` (register PDF fonts), `src/App.tsx` (temporary: show the example Vergleich through the workspace)

**Interfaces:**
- Consumes: `usePDF` from `@react-pdf/renderer`; `VergleichDocument`, `vergleichDateiname` (Task 6); `beispielVergleich` (Task 3); `registerFonts` from `src/brand/fonts.browser.ts` (Task 5).
- Produces: `Button({ variante?: 'gold'|'dark'|'outline'|'text', klein?, ...button props })`, `Tabs<T>({ wert, onChange, tabs })`, `Section({ titel, beschreibung?, aktionen?, children })`, `Field({ label, htmlFor, hinweis?, breit?, children })`, `TextInput`, `DezimalInput`, `DateInput`, `Textarea`, `Select<T>`, `RadioGroup<T>`, `Toggle`, `Option<T>`; `useDebouncedValue<T>(wert, ms)`; `DocumentWorkspace({ dokument, dateiname, fehlendeFelder, onBeispiel, onZuruecksetzen, children })`.

- [ ] **Step 1: Components**

`src/ui/components/Button.tsx`:
```tsx
import type { ButtonHTMLAttributes } from 'react'

type Variante = 'gold' | 'dark' | 'outline' | 'text'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; klein?: boolean }

export function Button({ variante = 'outline', klein = false, className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={`btn btn-${variante} ${klein ? 'btn-sm' : ''} ${className}`.trim()} {...rest} />
}
```

`src/ui/components/Tabs.tsx`:
```tsx
export type TabOption<T extends string> = { wert: T; label: string }

export function Tabs<T extends string>({ wert, onChange, tabs }: { wert: T; onChange: (wert: T) => void; tabs: TabOption<T>[] }) {
  return (
    <div role="tablist" aria-label="Dokumentart" className="flex gap-8 border-b border-line">
      {tabs.map((tab) => {
        const aktiv = tab.wert === wert
        return (
          <button
            key={tab.wert}
            type="button"
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(tab.wert)}
            className={`eyebrow -mb-px border-b-2 pb-3 pt-1 transition-colors ${aktiv ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
```

`src/ui/components/Section.tsx`:
```tsx
import type { ReactNode } from 'react'

export function Section({ titel, beschreibung, aktionen, children }: { titel: string; beschreibung?: string; aktionen?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pb-8 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="eyebrow text-gold-deep">{titel}</h2>
          <div className="gold-rule mt-3 w-10" />
          {beschreibung ? <p className="mt-3 max-w-prose text-sm text-ink-600">{beschreibung}</p> : null}
        </div>
        {aktionen}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
```

`src/ui/components/Field.tsx`:
```tsx
import type { ReactNode } from 'react'

export function Field({ label, htmlFor, hinweis, breit = false, children }: { label: string; htmlFor: string; hinweis?: string; breit?: boolean; children: ReactNode }) {
  return (
    <div className={breit ? 'sm:col-span-2' : ''}>
      <label htmlFor={htmlFor} className="feld-label">{label}</label>
      {children}
      {hinweis ? <p className="mt-1 text-xs text-muted">{hinweis}</p> : null}
    </div>
  )
}
```

`src/ui/components/Inputs.tsx`:
```tsx
type Basis = { id: string; value: string; onChange: (wert: string) => void; placeholder?: string }

export function TextInput({ id, value, onChange, placeholder, type = 'text' }: Basis & { type?: 'text' | 'email' | 'tel' }) {
  return <input id={id} type={type} className="feld" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

/** Zahlenfeld mit Einheit rechts; akzeptiert Komma und Punkt (parseDezimal). */
export function DezimalInput({ id, value, onChange, placeholder, einheit }: Basis & { einheit: string }) {
  return (
    <div className="relative">
      <input id={id} type="text" inputMode="decimal" className="feld pr-20 text-right" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{einheit}</span>
    </div>
  )
}

export function DateInput({ id, value, onChange }: Omit<Basis, 'placeholder'>) {
  return <input id={id} type="date" className="feld" value={value} onChange={(e) => onChange(e.target.value)} />
}

export function Textarea({ id, value, onChange, placeholder, zeilen = 4 }: Basis & { zeilen?: number }) {
  return <textarea id={id} rows={zeilen} className="feld" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export type Option<T extends string> = { wert: T; label: string }

export function Select<T extends string>({ id, value, onChange, optionen }: { id: string; value: T; onChange: (wert: T) => void; optionen: Option<T>[] }) {
  return (
    <select id={id} className="feld" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {optionen.map((o) => (
        <option key={o.wert} value={o.wert}>{o.label}</option>
      ))}
    </select>
  )
}

export function RadioGroup<T extends string>({ name, label, value, onChange, optionen }: { name: string; label: string; value: T; onChange: (wert: T) => void; optionen: Option<T>[] }) {
  return (
    <fieldset>
      <legend className="feld-label">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
        {optionen.map((o) => (
          <label key={o.wert} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name={name} value={o.wert} checked={value === o.wert} onChange={() => onChange(o.wert)} className="accent-gold-deep" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Toggle({ id, checked, onChange, label, hinweis }: { id: string; checked: boolean; onChange: (checked: boolean) => void; label: string; hinweis?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-gold-deep" />
      <span>
        <span className="font-medium">{label}</span>
        {hinweis ? <span className="block text-xs text-muted">{hinweis}</span> : null}
      </span>
    </label>
  )
}
```

`src/ui/components/Inputs.test.tsx` (label association, no jsdom needed):
```tsx
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Field } from './Field'
import { DezimalInput, RadioGroup, TextInput } from './Inputs'
import { Tabs } from './Tabs'

describe('UI-Bausteine', () => {
  it('verknüpft Label und Eingabefeld über die id', () => {
    const html = renderToStaticMarkup(
      <Field label="Firma" htmlFor="v-firma"><TextInput id="v-firma" value="Muster GmbH" onChange={() => {}} /></Field>,
    )
    expect(html).toContain('for="v-firma"')
    expect(html).toContain('id="v-firma"')
    expect(html).toContain('value="Muster GmbH"')
  })
  it('zeigt die Einheit am Dezimalfeld und nutzt die Dezimaltastatur', () => {
    const html = renderToStaticMarkup(<DezimalInput id="v-ap" value="30,54" onChange={() => {}} einheit="ct/kWh" />)
    expect(html).toContain('inputmode="decimal"')
    expect(html).toContain('ct/kWh')
  })
  it('markiert die gewählte Option und den aktiven Tab', () => {
    const radio = renderToStaticMarkup(<RadioGroup name="art" label="Energieart" value="gas" onChange={() => {}} optionen={[{ wert: 'strom', label: 'Strom' }, { wert: 'gas', label: 'Gas' }]} />)
    expect(radio).toMatch(/value="gas"[^>]*checked=""/)
    const tabs = renderToStaticMarkup(<Tabs wert="vollmacht" onChange={() => {}} tabs={[{ wert: 'vergleich', label: 'Energie-Vergleich' }, { wert: 'vollmacht', label: 'Vollmacht' }]} />)
    expect(tabs).toContain('aria-selected="true"')
    expect(tabs).toContain('Vollmacht')
  })
})
```
(If the `checked=""` assertion fails because React emits `checked` differently, assert `toContain('checked')` on the gas option's substring instead.)

- [ ] **Step 2: Debounce hook and workspace**

`src/ui/useDebouncedValue.ts`:
```ts
import { useEffect, useState } from 'react'

/** Gibt `wert` erst zurück, wenn er `verzoegerungMs` lang unverändert war – die PDF-Vorschau
 *  soll nicht bei jedem Tastendruck neu gerendert werden. */
export function useDebouncedValue<T>(wert: T, verzoegerungMs = 400): T {
  const [entprellt, setEntprellt] = useState(wert)
  useEffect(() => {
    const timer = setTimeout(() => setEntprellt(wert), verzoegerungMs)
    return () => clearTimeout(timer)
  }, [wert, verzoegerungMs])
  return entprellt
}
```

`src/ui/DocumentWorkspace.tsx`:
```tsx
import { useEffect, type ReactElement, type ReactNode } from 'react'
import { usePDF, type DocumentProps } from '@react-pdf/renderer'
import { Button } from './components/Button'

type Props = {
  /** Fertiges react-pdf-<Document>, bereits entprellt (useDebouncedValue) */
  dokument: ReactElement<DocumentProps>
  dateiname: string
  fehlendeFelder: string[]
  onBeispiel: () => void
  onZuruecksetzen: () => void
  children: ReactNode
}

/** Formular links, klebende Vorschau mit Werkzeugleiste rechts (ab lg), sonst untereinander. */
export function DocumentWorkspace({ dokument, dateiname, fehlendeFelder, onBeispiel, onZuruecksetzen, children }: Props) {
  const [instanz, aktualisiere] = usePDF()
  useEffect(() => {
    aktualisiere(dokument)
  }, [dokument, aktualisiere])

  const bereit = Boolean(instanz.url) && !instanz.loading && fehlendeFelder.length === 0

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div>{children}</div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-wrap items-center gap-3">
          {bereit && instanz.url ? (
            <a className="btn btn-gold" href={instanz.url} download={dateiname}>PDF herunterladen</a>
          ) : (
            <Button variante="gold" disabled>PDF herunterladen</Button>
          )}
          <Button variante="outline" klein onClick={onBeispiel}>Beispieldaten laden</Button>
          <Button
            variante="text"
            klein
            onClick={() => {
              if (window.confirm('Alle Eingaben dieses Dokuments verwerfen?')) onZuruecksetzen()
            }}
          >
            Zurücksetzen
          </Button>
        </div>
        <div className="mt-3 min-h-6 text-sm" aria-live="polite">
          {instanz.loading ? <p className="text-muted">Vorschau wird aktualisiert …</p> : null}
          {instanz.error ? (
            <p className="border border-red-700 bg-red-50 p-3 text-red-800">Die Vorschau konnte nicht erstellt werden: {String(instanz.error)}</p>
          ) : null}
          {fehlendeFelder.length ? (
            <p className="text-ink-600"><span className="font-medium">Bitte ergänze:</span> {fehlendeFelder.join(', ')}</p>
          ) : null}
        </div>
        <div className="mt-3 aspect-[210/297] max-h-[80vh] w-full border border-line bg-cream">
          {instanz.url ? (
            <iframe key={instanz.url} title="PDF-Vorschau" src={`${instanz.url}#toolbar=0&navpanes=0&view=FitH`} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Vorschau wird erstellt …</div>
          )}
        </div>
      </aside>
    </div>
  )
}
```
If `DocumentProps` is not exported under that name, look in `node_modules/@react-pdf/renderer/lib/react-pdf.d.ts` for the `Document` props type and use that; as a last resort type `dokument` as `ReactElement` and cast at the `aktualisiere` call.

- [ ] **Step 3: Register fonts at startup and show the example through the workspace**

`src/main.tsx` – add after the CSS imports:
```tsx
import { registerFonts } from './brand/fonts.browser'
registerFonts()
```

`src/App.tsx` (temporary content – replaced in Task 11):
```tsx
import { useMemo } from 'react'
import { Logo } from './brand/Logo'
import { standardAbsender } from './lib/absender'
import { heuteIso } from './lib/datum'
import { beispielVergleich } from './lib/vergleich/beispiel'
import { VergleichDocument, vergleichDateiname } from './pdf/VergleichDocument'
import { DocumentWorkspace } from './ui/DocumentWorkspace'

export function App() {
  const daten = useMemo(() => beispielVergleich(heuteIso()), [])
  const dokument = useMemo(() => <VergleichDocument daten={daten} absender={standardAbsender} />, [daten])
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Logo className="h-10 w-auto" />
        <span className="eyebrow text-gold-deep">Dokumente</span>
      </header>
      <main className="py-10">
        <DocumentWorkspace dokument={dokument} dateiname={vergleichDateiname(daten)} fehlendeFelder={[]} onBeispiel={() => {}} onZuruecksetzen={() => {}}>
          <p className="text-ink-600">Formular folgt im nächsten Schritt.</p>
        </DocumentWorkspace>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Verify in the browser build**

Run: `npm run lint && npm run build && npm test` → green. Then `npm run dev` in the background, `curl -s http://localhost:5173/dokumente/ | grep -c 'src/main.tsx'` prints 1, stop the dev server. Check `dist/assets` contains the six `.woff` files and no build warning mentions `@react-pdf`. If Vite reports a missing Node polyfill (`Buffer`, `process`, `stream`) when the page loads, document the exact error and fix it via `resolve.alias`/`optimizeDeps.include` in `vite.config.ts` – do not add a polyfill plugin without confirming the error.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: form primitives, debounced PDF preview and document workspace"
```

---

### Task 9: Energie-Vergleich form and workspace wiring

**Files:**
- Create: `src/ui/VergleichForm.tsx`, `src/ui/VergleichWorkspace.tsx`
- Modify: `src/App.tsx` (use `VergleichWorkspace`)

**Interfaces:**
- Consumes: Task 3 (`VergleichDaten`, `leererVergleich`, `beispielVergleich`, `berechneVergleich`, `fehlendePflichtfelder`, `neueVergleichsnummer`, `teamAuswahl`), Task 2 (`useLocalStorageState`, `heuteIso`, `lieferende`, `euro`, `datum`, `parseDezimal`), Task 6, Task 8.
- Produces: `VergleichWorkspace({ absender })`, `VergleichForm({ daten, setDaten, ergebnis })`.

- [ ] **Step 1: Write `VergleichForm.tsx`**

```tsx
import type { Dispatch, SetStateAction } from 'react'
import { teamAuswahl } from '../lib/absender'
import { datum, euro } from '../lib/format'
import type { VergleichErgebnis } from '../lib/vergleich/berechnung'
import { neueVergleichsnummer } from '../lib/vergleich/vergleichsnummer'
import type { Tarif, VergleichDaten } from '../lib/vergleich/types'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { DateInput, DezimalInput, RadioGroup, Select, Textarea, TextInput, Toggle } from './components/Inputs'
import { Section } from './components/Section'

type Setter = Dispatch<SetStateAction<VergleichDaten>>
type Props = { daten: VergleichDaten; setDaten: Setter; ergebnis: VergleichErgebnis }

function teil<K extends keyof VergleichDaten>(setDaten: Setter, key: K) {
  return (patch: Partial<VergleichDaten[K]>) => setDaten((d) => ({ ...d, [key]: { ...d[key], ...patch } }))
}

const EIGENE = '__eigene__'

function TarifFelder({ prefix, tarif, onChange }: { prefix: string; tarif: Tarif; onChange: (patch: Partial<Tarif>) => void }) {
  return (
    <>
      <Field label="Versorger" htmlFor={`${prefix}-versorger`}>
        <TextInput id={`${prefix}-versorger`} value={tarif.versorger} onChange={(versorger) => onChange({ versorger })} placeholder="z. B. M4ENERGY" />
      </Field>
      <Field label="Preisgarantie" htmlFor={`${prefix}-garantie`} hinweis="Freitext, z. B. „Energiepreisgarantie bis 31.12.2028“">
        <TextInput id={`${prefix}-garantie`} value={tarif.preisgarantie} onChange={(preisgarantie) => onChange({ preisgarantie })} />
      </Field>
      <Field label="Arbeitspreis (netto)" htmlFor={`${prefix}-arbeitspreis`}>
        <DezimalInput id={`${prefix}-arbeitspreis`} value={tarif.arbeitspreisCt} onChange={(arbeitspreisCt) => onChange({ arbeitspreisCt })} einheit="ct/kWh" placeholder="30,54" />
      </Field>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Field label="Grundpreis (netto)" htmlFor={`${prefix}-grundpreis`}>
          <DezimalInput id={`${prefix}-grundpreis`} value={tarif.grundpreis} onChange={(grundpreis) => onChange({ grundpreis })} einheit="€" placeholder="123,11" />
        </Field>
        <Field label="je" htmlFor={`${prefix}-grundpreis-einheit`}>
          <Select id={`${prefix}-grundpreis-einheit`} value={tarif.grundpreisEinheit} onChange={(grundpreisEinheit) => onChange({ grundpreisEinheit })} optionen={[{ wert: 'jahr', label: 'Jahr' }, { wert: 'monat', label: 'Monat' }]} />
        </Field>
      </div>
    </>
  )
}

function Kennzahl({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="border-l-2 border-gold pl-3">
      <p className="feld-label mb-0">{label}</p>
      <p className="font-display text-lg font-semibold">{wert}</p>
    </div>
  )
}

export function VergleichForm({ daten, setDaten, ergebnis }: Props) {
  const kunde = teil(setDaten, 'kunde')
  const vergleich = teil(setDaten, 'vergleich')
  const lieferstelle = teil(setDaten, 'lieferstelle')
  const empfehlung = teil(setDaten, 'empfehlung')
  const aktuell = teil(setDaten, 'aktuell')
  const honorar = teil(setDaten, 'honorar')
  const konzessionsabgabe = teil(setDaten, 'konzessionsabgabe')
  const unterzeichner = teil(setDaten, 'unterzeichner')

  const teamTreffer = teamAuswahl.find((t) => t.name === daten.unterzeichner.name && t.rolle === daten.unterzeichner.rolle)
  const unterzeichnerAuswahl = teamTreffer ? teamTreffer.name : EIGENE

  return (
    <div>
      <Section titel="Kunde">
        <Field label="Firma" htmlFor="v-firma" hinweis="Leer lassen bei Privatkunden">
          <TextInput id="v-firma" value={daten.kunde.firma} onChange={(firma) => kunde({ firma })} />
        </Field>
        <RadioGroup name="v-anrede" label="Anrede" value={daten.kunde.anrede} onChange={(anrede) => kunde({ anrede })} optionen={[{ wert: 'firma', label: 'Damen und Herren' }, { wert: 'frau', label: 'Frau' }, { wert: 'herr', label: 'Herr' }, { wert: 'divers', label: 'Guten Tag + Name' }]} />
        <Field label="Vorname" htmlFor="v-vorname"><TextInput id="v-vorname" value={daten.kunde.vorname} onChange={(vorname) => kunde({ vorname })} /></Field>
        <Field label="Nachname" htmlFor="v-nachname"><TextInput id="v-nachname" value={daten.kunde.nachname} onChange={(nachname) => kunde({ nachname })} /></Field>
        <Field label="Straße und Hausnummer" htmlFor="v-strasse" breit><TextInput id="v-strasse" value={daten.kunde.strasse} onChange={(strasse) => kunde({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="v-plz"><TextInput id="v-plz" value={daten.kunde.plz} onChange={(plz) => kunde({ plz })} /></Field>
        <Field label="Ort" htmlFor="v-ort"><TextInput id="v-ort" value={daten.kunde.ort} onChange={(ort) => kunde({ ort })} /></Field>
      </Section>

      <Section titel="Vergleich">
        <Field label="Vergleichsnummer" htmlFor="v-nummer">
          <div className="flex gap-2">
            <TextInput id="v-nummer" value={daten.vergleich.nummer} onChange={(nummer) => vergleich({ nummer })} />
            <Button klein onClick={() => vergleich({ nummer: neueVergleichsnummer(daten.vergleich.datum || undefined) })}>Neu</Button>
          </div>
        </Field>
        <Field label="Datum" htmlFor="v-datum"><DateInput id="v-datum" value={daten.vergleich.datum} onChange={(datum) => vergleich({ datum })} /></Field>
        <Field label="Gültigkeit" htmlFor="v-gueltigkeit" hinweis={ergebnis.gueltigBis ? `Gültig bis ${datum(ergebnis.gueltigBis)}` : undefined}>
          <DezimalInput id="v-gueltigkeit" value={daten.vergleich.gueltigkeitTage} onChange={(gueltigkeitTage) => vergleich({ gueltigkeitTage })} einheit="Tage" />
        </Field>
        <Field label="Umsatzsteuer" htmlFor="v-ust"><DezimalInput id="v-ust" value={daten.vergleich.ustSatz} onChange={(ustSatz) => vergleich({ ustSatz })} einheit="%" /></Field>
        <RadioGroup name="v-preisdarstellung" label="Preisdarstellung" value={daten.vergleich.preisdarstellung} onChange={(preisdarstellung) => vergleich({ preisdarstellung })} optionen={[{ wert: 'netto', label: 'netto (Gewerbekunden)' }, { wert: 'brutto', label: 'brutto (Privatkunden)' }]} />
      </Section>

      <Section titel="Lieferstelle & Belieferung">
        <Field label="Straße und Hausnummer" htmlFor="v-ls-strasse" breit><TextInput id="v-ls-strasse" value={daten.lieferstelle.strasse} onChange={(strasse) => lieferstelle({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="v-ls-plz"><TextInput id="v-ls-plz" value={daten.lieferstelle.plz} onChange={(plz) => lieferstelle({ plz })} /></Field>
        <Field label="Ort" htmlFor="v-ls-ort"><TextInput id="v-ls-ort" value={daten.lieferstelle.ort} onChange={(ort) => lieferstelle({ ort })} /></Field>
        <RadioGroup name="v-energieart" label="Energieart" value={daten.lieferstelle.energieart} onChange={(energieart) => lieferstelle({ energieart })} optionen={[{ wert: 'strom', label: 'Strom' }, { wert: 'gas', label: 'Gas' }]} />
        <Field label="Jahresverbrauch" htmlFor="v-verbrauch"><DezimalInput id="v-verbrauch" value={daten.lieferstelle.jahresverbrauchKwh} onChange={(jahresverbrauchKwh) => lieferstelle({ jahresverbrauchKwh })} einheit="kWh" placeholder="53416" /></Field>
        <Field label="Lieferbeginn" htmlFor="v-lieferbeginn"><DateInput id="v-lieferbeginn" value={daten.lieferstelle.lieferbeginn} onChange={(lieferbeginn) => lieferstelle({ lieferbeginn })} /></Field>
        <Field label="Laufzeit" htmlFor="v-laufzeit" hinweis={ergebnis.lieferende ? `Lieferende ${datum(ergebnis.lieferende)}` : 'Lieferende ergibt sich aus Beginn und Laufzeit'}>
          <DezimalInput id="v-laufzeit" value={daten.lieferstelle.laufzeitMonate} onChange={(laufzeitMonate) => lieferstelle({ laufzeitMonate })} einheit="Monate" />
        </Field>
      </Section>

      <Section titel="Unsere Empfehlung"><TarifFelder prefix="v-empf" tarif={daten.empfehlung} onChange={empfehlung} /></Section>
      <Section titel="Aktueller Tarif"><TarifFelder prefix="v-akt" tarif={daten.aktuell} onChange={aktuell} /></Section>

      <div className="grid gap-4 border-t border-line py-6 sm:grid-cols-4">
        <Kennzahl label="Jahreskosten Empfehlung" wert={euro(ergebnis.empfehlung.jahreskosten)} />
        <Kennzahl label="Jahreskosten aktuell" wert={euro(ergebnis.aktuell.jahreskosten)} />
        <Kennzahl label="Ersparnis pro Jahr" wert={euro(ergebnis.ersparnisJahr)} />
        <Kennzahl label="Gesamtersparnis Laufzeit" wert={euro(ergebnis.gesamtersparnisLaufzeit)} />
      </div>

      <Section titel="Beratungshonorar" beschreibung="Beträge netto, gesamt für die Laufzeit. Leere Felder erscheinen nicht im Dokument.">
        <div className="sm:col-span-2">
          <Toggle id="v-honorar-anzeigen" checked={daten.honorar.anzeigen} onChange={(anzeigen) => honorar({ anzeigen })} label="Honorar im Dokument ausweisen" hinweis="Ausgeschaltet: keine Honorartabelle, kein Honorar-Hinweis im Anschreiben." />
        </div>
        <Field label="Honorar Anbieterwechsel" htmlFor="v-honorar-wechsel"><DezimalInput id="v-honorar-wechsel" value={daten.honorar.anbieterwechsel} onChange={(anbieterwechsel) => honorar({ anbieterwechsel })} einheit="€" /></Field>
        <Field label="Honorar Konzessionsabgabe" htmlFor="v-honorar-ka"><DezimalInput id="v-honorar-ka" value={daten.honorar.konzessionsabgabe} onChange={(konzessionsabgabe) => honorar({ konzessionsabgabe })} einheit="€" /></Field>
      </Section>

      <Section titel="Konzessionsabgabe" beschreibung="Erwartete Ersparnis durch die Reduktion der Konzessionsabgabe, netto pro Jahr. Leer = nicht ausweisen.">
        <Field label="Reduktion pro Jahr" htmlFor="v-ka"><DezimalInput id="v-ka" value={daten.konzessionsabgabe.reduktionProJahr} onChange={(reduktionProJahr) => konzessionsabgabe({ reduktionProJahr })} einheit="€/Jahr" /></Field>
      </Section>

      <Section titel="Unterzeichner">
        <Field label="Auswahl" htmlFor="v-unterzeichner-auswahl">
          <Select
            id="v-unterzeichner-auswahl"
            value={unterzeichnerAuswahl}
            onChange={(wert) => {
              const t = teamAuswahl.find((x) => x.name === wert)
              if (t) unterzeichner({ name: t.name, rolle: t.rolle })
            }}
            optionen={[...teamAuswahl.map((t) => ({ wert: t.name, label: `${t.name} – ${t.rolle}` })), { wert: EIGENE, label: 'Eigene Angabe' }]}
          />
        </Field>
        <div />
        <Field label="Name" htmlFor="v-unterzeichner-name"><TextInput id="v-unterzeichner-name" value={daten.unterzeichner.name} onChange={(name) => unterzeichner({ name })} /></Field>
        <Field label="Rolle" htmlFor="v-unterzeichner-rolle"><TextInput id="v-unterzeichner-rolle" value={daten.unterzeichner.rolle} onChange={(rolle) => unterzeichner({ rolle })} /></Field>
      </Section>

      <Section titel="Hinweise" beschreibung="Optionaler Freitext für Seite 3.">
        <Field label="Hinweise" htmlFor="v-hinweise" breit><Textarea id="v-hinweise" value={daten.vergleich.hinweise} onChange={(hinweise) => vergleich({ hinweise })} /></Field>
      </Section>
    </div>
  )
}
```

- [ ] **Step 2: Write `VergleichWorkspace.tsx`**

```tsx
import { useMemo, useState } from 'react'
import type { Absender } from '../lib/absender'
import { heuteIso } from '../lib/datum'
import { useLocalStorageState } from '../lib/storage'
import { beispielVergleich } from '../lib/vergleich/beispiel'
import { berechneVergleich } from '../lib/vergleich/berechnung'
import { fehlendePflichtfelder } from '../lib/vergleich/pflichtfelder'
import { leererVergleich, type VergleichDaten } from '../lib/vergleich/types'
import { neueVergleichsnummer } from '../lib/vergleich/vergleichsnummer'
import { VergleichDocument, vergleichDateiname } from '../pdf/VergleichDocument'
import { DocumentWorkspace } from './DocumentWorkspace'
import { useDebouncedValue } from './useDebouncedValue'
import { VergleichForm } from './VergleichForm'

export const VERGLEICH_KEY = 'augusta-dokumente:v1:vergleich'

export function VergleichWorkspace({ absender }: { absender: Absender }) {
  const [vorlage] = useState(() => leererVergleich(heuteIso(), neueVergleichsnummer(), absender.ansprechpartner))
  const [daten, setDaten] = useLocalStorageState<VergleichDaten>(VERGLEICH_KEY, vorlage)
  const entprellt = useDebouncedValue(daten, 400)
  const dokument = useMemo(() => <VergleichDocument daten={entprellt} absender={absender} />, [entprellt, absender])
  const ergebnis = useMemo(() => berechneVergleich(daten), [daten])
  const fehlend = useMemo(() => fehlendePflichtfelder(daten), [daten])

  return (
    <DocumentWorkspace
      dokument={dokument}
      dateiname={vergleichDateiname(daten)}
      fehlendeFelder={fehlend}
      onBeispiel={() => setDaten(beispielVergleich(heuteIso()))}
      onZuruecksetzen={() => setDaten(leererVergleich(heuteIso(), neueVergleichsnummer(), absender.ansprechpartner))}
    >
      <VergleichForm daten={daten} setDaten={setDaten} ergebnis={ergebnis} />
    </DocumentWorkspace>
  )
}
```

- [ ] **Step 3: Use it in `App.tsx`**

Replace the `<main>` content of the temporary App with `<VergleichWorkspace absender={standardAbsender} />` and drop the now-unused imports.

- [ ] **Step 4: Verify and commit**

Run: `npm run lint && npm run build && npm test` → green. Start `npm run dev` briefly and curl the page as in Task 8.
```bash
git add src
git commit -m "feat: Energie-Vergleich form with live calculation and localStorage persistence"
```

---

### Task 10: Vollmacht form and workspace wiring

**Files:**
- Create: `src/ui/VollmachtForm.tsx`, `src/ui/VollmachtWorkspace.tsx`

**Interfaces:**
- Consumes: Task 4, Task 7, Task 8, `useLocalStorageState`.
- Produces: `VollmachtWorkspace({ absender })`, `VollmachtForm({ daten, setDaten })`.

- [ ] **Step 1: Write `VollmachtForm.tsx`**

```tsx
import type { Dispatch, SetStateAction } from 'react'
import { lieferstellenEnergieartLabel, neueLieferstelle, type Lieferstelle, type VollmachtDaten } from '../lib/vollmacht/types'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { DateInput, RadioGroup, Select, TextInput, Toggle } from './components/Inputs'
import { Section } from './components/Section'

type Setter = Dispatch<SetStateAction<VollmachtDaten>>
type Props = { daten: VollmachtDaten; setDaten: Setter }

function teil<K extends keyof VollmachtDaten>(setDaten: Setter, key: K) {
  return (patch: Partial<VollmachtDaten[K]>) => setDaten((d) => ({ ...d, [key]: { ...d[key], ...patch } }))
}

const ENERGIEART_OPTIONEN = (Object.keys(lieferstellenEnergieartLabel) as Lieferstelle['energieart'][]).map((wert) => ({ wert, label: lieferstellenEnergieartLabel[wert] }))

export function VollmachtForm({ daten, setDaten }: Props) {
  const vg = teil(setDaten, 'vollmachtgeber')
  const energiearten = teil(setDaten, 'energiearten')
  const geltung = teil(setDaten, 'geltung')
  const unterschrift = teil(setDaten, 'unterschrift')
  const privat = daten.vollmachtgeber.typ === 'privat'

  const lieferstelleAendern = (id: string, patch: Partial<Lieferstelle>) =>
    setDaten((d) => ({ ...d, lieferstellen: d.lieferstellen.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  const lieferstelleEntfernen = (id: string) => setDaten((d) => ({ ...d, lieferstellen: d.lieferstellen.filter((l) => l.id !== id) }))
  const lieferstelleHinzufuegen = () => setDaten((d) => ({ ...d, lieferstellen: [...d.lieferstellen, neueLieferstelle()] }))

  return (
    <div>
      <Section titel="Vollmachtgeber">
        <div className="sm:col-span-2">
          <RadioGroup name="vm-typ" label="Vollmachtgeber ist" value={daten.vollmachtgeber.typ} onChange={(typ) => vg({ typ })} optionen={[{ wert: 'privat', label: 'Privatperson' }, { wert: 'unternehmen', label: 'Unternehmen' }]} />
        </div>
        <Field label={privat ? 'Vor- und Nachname' : 'Firma'} htmlFor="vm-name" breit={!privat}>
          <TextInput id="vm-name" value={daten.vollmachtgeber.name} onChange={(name) => vg({ name })} />
        </Field>
        {privat ? (
          <Field label="Geburtsdatum (optional)" htmlFor="vm-geburtsdatum"><DateInput id="vm-geburtsdatum" value={daten.vollmachtgeber.geburtsdatum} onChange={(geburtsdatum) => vg({ geburtsdatum })} /></Field>
        ) : (
          <Field label="Vertreten durch (optional)" htmlFor="vm-vertreten" breit hinweis="z. B. „Geschäftsführer Max Mustermann“"><TextInput id="vm-vertreten" value={daten.vollmachtgeber.vertretenDurch} onChange={(vertretenDurch) => vg({ vertretenDurch })} /></Field>
        )}
        <Field label="Straße und Hausnummer" htmlFor="vm-strasse" breit><TextInput id="vm-strasse" value={daten.vollmachtgeber.strasse} onChange={(strasse) => vg({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="vm-plz"><TextInput id="vm-plz" value={daten.vollmachtgeber.plz} onChange={(plz) => vg({ plz })} /></Field>
        <Field label="Ort" htmlFor="vm-ort"><TextInput id="vm-ort" value={daten.vollmachtgeber.ort} onChange={(ort) => vg({ ort })} /></Field>
        <Field label="E-Mail (optional)" htmlFor="vm-email"><TextInput id="vm-email" type="email" value={daten.vollmachtgeber.email} onChange={(email) => vg({ email })} /></Field>
        <Field label="Telefon (optional)" htmlFor="vm-telefon"><TextInput id="vm-telefon" type="tel" value={daten.vollmachtgeber.telefon} onChange={(telefon) => vg({ telefon })} /></Field>
      </Section>

      <Section titel="Energiearten" beschreibung="Die Vollmacht gilt nur für die gewählten Energiearten.">
        <Toggle id="vm-strom" checked={daten.energiearten.strom} onChange={(strom) => energiearten({ strom })} label="Strom" />
        <Toggle id="vm-gas" checked={daten.energiearten.gas} onChange={(gas) => energiearten({ gas })} label="Gas" />
      </Section>

      <Section titel="Lieferstellen" beschreibung="Alle Abnahmestellen, für die Augusta Energy handeln darf." aktionen={<Button klein onClick={lieferstelleHinzufuegen}>Lieferstelle hinzufügen</Button>}>
        {daten.lieferstellen.map((l, i) => (
          <div key={l.id} className="grid gap-3 border border-line bg-cream/40 p-4 sm:col-span-2 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:col-span-2">
              <span className="eyebrow text-ink-600">Lieferstelle {i + 1}</span>
              {daten.lieferstellen.length > 1 ? <Button variante="text" klein onClick={() => lieferstelleEntfernen(l.id)}>Entfernen</Button> : null}
            </div>
            <Field label="Adresse" htmlFor={`vm-ls-${l.id}-adresse`} breit><TextInput id={`vm-ls-${l.id}-adresse`} value={l.adresse} onChange={(adresse) => lieferstelleAendern(l.id, { adresse })} placeholder="Musterstraße 12, 86150 Augsburg" /></Field>
            <Field label="Energieart" htmlFor={`vm-ls-${l.id}-energieart`}><Select id={`vm-ls-${l.id}-energieart`} value={l.energieart} onChange={(energieart) => lieferstelleAendern(l.id, { energieart })} optionen={ENERGIEART_OPTIONEN} /></Field>
            <Field label="Zählernummer" htmlFor={`vm-ls-${l.id}-zaehler`}><TextInput id={`vm-ls-${l.id}-zaehler`} value={l.zaehlernummer} onChange={(zaehlernummer) => lieferstelleAendern(l.id, { zaehlernummer })} /></Field>
            <Field label="Marktlokations-ID (optional)" htmlFor={`vm-ls-${l.id}-malo`}><TextInput id={`vm-ls-${l.id}-malo`} value={l.maloId} onChange={(maloId) => lieferstelleAendern(l.id, { maloId })} /></Field>
            <Field label="Bisheriger Versorger" htmlFor={`vm-ls-${l.id}-versorger`}><TextInput id={`vm-ls-${l.id}-versorger`} value={l.versorger} onChange={(versorger) => lieferstelleAendern(l.id, { versorger })} /></Field>
          </div>
        ))}
      </Section>

      <Section titel="Geltungsdauer">
        <div className="sm:col-span-2">
          <RadioGroup name="vm-geltung" label="Die Vollmacht gilt" value={daten.geltung.art} onChange={(art) => geltung({ art })} optionen={[{ wert: 'unbefristet', label: 'unbefristet bis auf Widerruf' }, { wert: 'befristet', label: 'befristet bis' }]} />
        </div>
        {daten.geltung.art === 'befristet' ? (
          <Field label="Befristet bis" htmlFor="vm-bis"><DateInput id="vm-bis" value={daten.geltung.bis} onChange={(bis) => geltung({ bis })} /></Field>
        ) : null}
      </Section>

      <Section titel="Untervollmacht">
        <div className="sm:col-span-2">
          <Toggle id="vm-untervollmacht" checked={daten.untervollmacht} onChange={(untervollmacht) => setDaten((d) => ({ ...d, untervollmacht }))} label="Untervollmacht an Dritte erlauben" hinweis="Standard: nur eigene Mitarbeitende dürfen handeln, keine Weitergabe an Dritte." />
        </div>
      </Section>

      <Section titel="Unterschrift" beschreibung="Datum leer lassen, wenn der Kunde es handschriftlich einträgt.">
        <Field label="Ort" htmlFor="vm-u-ort"><TextInput id="vm-u-ort" value={daten.unterschrift.ort} onChange={(ort) => unterschrift({ ort })} placeholder={daten.vollmachtgeber.ort || 'Augsburg'} /></Field>
        <Field label="Datum (optional)" htmlFor="vm-u-datum"><DateInput id="vm-u-datum" value={daten.unterschrift.datum} onChange={(datum) => unterschrift({ datum })} /></Field>
      </Section>
    </div>
  )
}
```

- [ ] **Step 2: Write `VollmachtWorkspace.tsx`**

```tsx
import { useMemo } from 'react'
import type { Absender } from '../lib/absender'
import { useLocalStorageState } from '../lib/storage'
import { beispielVollmacht } from '../lib/vollmacht/beispiel'
import { fehlendePflichtfelder } from '../lib/vollmacht/pflichtfelder'
import { leereVollmacht, type VollmachtDaten } from '../lib/vollmacht/types'
import { VollmachtDocument, vollmachtDateiname } from '../pdf/VollmachtDocument'
import { DocumentWorkspace } from './DocumentWorkspace'
import { useDebouncedValue } from './useDebouncedValue'
import { VollmachtForm } from './VollmachtForm'

export const VOLLMACHT_KEY = 'augusta-dokumente:v1:vollmacht'
const VORLAGE = leereVollmacht()

export function VollmachtWorkspace({ absender }: { absender: Absender }) {
  const [daten, setDaten] = useLocalStorageState<VollmachtDaten>(VOLLMACHT_KEY, VORLAGE)
  const entprellt = useDebouncedValue(daten, 400)
  const dokument = useMemo(() => <VollmachtDocument daten={entprellt} absender={absender} />, [entprellt, absender])
  const fehlend = useMemo(() => fehlendePflichtfelder(daten), [daten])

  return (
    <DocumentWorkspace
      dokument={dokument}
      dateiname={vollmachtDateiname(daten)}
      fehlendeFelder={fehlend}
      onBeispiel={() => setDaten(beispielVollmacht())}
      onZuruecksetzen={() => setDaten(leereVollmacht())}
    >
      <VollmachtForm daten={daten} setDaten={setDaten} />
    </DocumentWorkspace>
  )
}
```

- [ ] **Step 3: Verify and commit**

Temporarily render `<VollmachtWorkspace absender={standardAbsender} />` in `App.tsx` instead of the Vergleich to exercise it (`npm run build` must pass), then leave `App.tsx` showing the Vergleich again (Task 11 adds the tabs).
Run: `npm run lint && npm run build && npm test` → green.
```bash
git add src
git commit -m "feat: Vollmacht form with repeatable Lieferstellen and persistence"
```

---

### Task 11: App shell with tabs, Absender panel, README

**Files:**
- Create: `src/ui/AbsenderPanel.tsx`
- Modify: `src/App.tsx`, `README.md`

**Interfaces:**
- Consumes: `useLocalStorageState`, `standardAbsender`, `teamAuswahl`, `VergleichWorkspace`, `VollmachtWorkspace`, `Tabs`, `Button`, `Field`, `TextInput`, `Select`, `Logo`.
- Produces: final `App`; `AbsenderPanel({ offen, absender, setAbsender, onReset, onClose })`.

- [ ] **Step 1: Write `AbsenderPanel.tsx`**

```tsx
import { useEffect, type Dispatch, type SetStateAction } from 'react'
import { teamAuswahl, type Absender } from '../lib/absender'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { Select, TextInput } from './components/Inputs'

type Props = {
  offen: boolean
  absender: Absender
  setAbsender: Dispatch<SetStateAction<Absender>>
  onReset: () => void
  onClose: () => void
}

const EIGENE = '__eigene__'

/** Seitlicher Dialog mit den Firmen- und Ansprechpartnerdaten, die in beide Dokumente laufen. */
export function AbsenderPanel({ offen, absender, setAbsender, onReset, onClose }: Props) {
  useEffect(() => {
    if (!offen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onClose])

  if (!offen) return null

  const feld = (key: keyof Omit<Absender, 'ansprechpartner'>) => (wert: string) => setAbsender((a) => ({ ...a, [key]: wert }))
  const ap = (patch: Partial<Absender['ansprechpartner']>) => setAbsender((a) => ({ ...a, ansprechpartner: { ...a.ansprechpartner, ...patch } }))
  const treffer = teamAuswahl.find((t) => t.name === absender.ansprechpartner.name && t.rolle === absender.ansprechpartner.rolle)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="absender-titel" className="h-full w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-deep">Einstellungen</p>
            <h2 id="absender-titel" className="display mt-2 text-2xl">Absender</h2>
            <p className="mt-2 text-sm text-ink-600">Diese Angaben erscheinen in Kopf- und Fußzeile beider Dokumente. Sie werden nur in deinem Browser gespeichert.</p>
          </div>
          <Button klein onClick={onClose}>Fertig</Button>
        </div>

        <div className="mt-6 grid gap-4">
          <Field label="Firma" htmlFor="ab-firma"><TextInput id="ab-firma" value={absender.firma} onChange={feld('firma')} /></Field>
          <Field label="Inhaber" htmlFor="ab-inhaber"><TextInput id="ab-inhaber" value={absender.inhaber} onChange={feld('inhaber')} /></Field>
          <Field label="Straße und Hausnummer" htmlFor="ab-strasse"><TextInput id="ab-strasse" value={absender.strasse} onChange={feld('strasse')} /></Field>
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="PLZ" htmlFor="ab-plz"><TextInput id="ab-plz" value={absender.plz} onChange={feld('plz')} /></Field>
            <Field label="Ort" htmlFor="ab-ort"><TextInput id="ab-ort" value={absender.ort} onChange={feld('ort')} /></Field>
          </div>
          <Field label="Telefon" htmlFor="ab-telefon" hinweis="Schreibweise: 0151 41378008"><TextInput id="ab-telefon" type="tel" value={absender.telefon} onChange={feld('telefon')} /></Field>
          <Field label="E-Mail" htmlFor="ab-email"><TextInput id="ab-email" type="email" value={absender.email} onChange={feld('email')} /></Field>
          <Field label="Website" htmlFor="ab-web"><TextInput id="ab-web" value={absender.web} onChange={feld('web')} /></Field>
          <Field label="USt-IdNr. (optional)" htmlFor="ab-ust"><TextInput id="ab-ust" value={absender.ustIdNr} onChange={feld('ustIdNr')} placeholder="DE123456789" /></Field>
          <Field label="Bank (optional)" htmlFor="ab-bank"><TextInput id="ab-bank" value={absender.bank} onChange={feld('bank')} /></Field>
          <Field label="IBAN (optional)" htmlFor="ab-iban"><TextInput id="ab-iban" value={absender.iban} onChange={feld('iban')} /></Field>

          <p className="eyebrow mt-4 text-gold-deep">Ansprechpartner</p>
          <Field label="Auswahl" htmlFor="ab-ap-auswahl">
            <Select
              id="ab-ap-auswahl"
              value={treffer ? treffer.name : EIGENE}
              onChange={(wert) => {
                const t = teamAuswahl.find((x) => x.name === wert)
                if (t) ap({ name: t.name, rolle: t.rolle })
              }}
              optionen={[...teamAuswahl.map((t) => ({ wert: t.name, label: `${t.name} – ${t.rolle}` })), { wert: EIGENE, label: 'Eigene Angabe' }]}
            />
          </Field>
          <Field label="Name" htmlFor="ab-ap-name"><TextInput id="ab-ap-name" value={absender.ansprechpartner.name} onChange={(name) => ap({ name })} /></Field>
          <Field label="Rolle" htmlFor="ab-ap-rolle"><TextInput id="ab-ap-rolle" value={absender.ansprechpartner.rolle} onChange={(rolle) => ap({ rolle })} /></Field>
          <Field label="Telefon" htmlFor="ab-ap-telefon"><TextInput id="ab-ap-telefon" type="tel" value={absender.ansprechpartner.telefon} onChange={(telefon) => ap({ telefon })} /></Field>
          <Field label="E-Mail" htmlFor="ab-ap-email"><TextInput id="ab-ap-email" type="email" value={absender.ansprechpartner.email} onChange={(email) => ap({ email })} /></Field>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Button variante="text" klein onClick={() => { if (window.confirm('Absender auf die Standardwerte zurücksetzen?')) onReset() }}>Zurücksetzen auf Standard</Button>
          <Button variante="gold" klein onClick={onClose}>Fertig</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Final `App.tsx`**

```tsx
import { useState } from 'react'
import { Logo } from './brand/Logo'
import { standardAbsender, type Absender } from './lib/absender'
import { useLocalStorageState } from './lib/storage'
import { AbsenderPanel } from './ui/AbsenderPanel'
import { Button } from './ui/components/Button'
import { Tabs } from './ui/components/Tabs'
import { VergleichWorkspace } from './ui/VergleichWorkspace'
import { VollmachtWorkspace } from './ui/VollmachtWorkspace'

type Tab = 'vergleich' | 'vollmacht'

export function App() {
  const [tab, setTab] = useLocalStorageState<Tab>('augusta-dokumente:v1:tab', 'vergleich')
  const [absender, setAbsender, absenderZuruecksetzen] = useLocalStorageState<Absender>('augusta-dokumente:v1:absender', standardAbsender)
  const [absenderOffen, setAbsenderOffen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-auto md:h-10" />
          <span className="eyebrow border-l border-line pl-4 text-gold-deep">Dokumente</span>
        </div>
        <Button klein onClick={() => setAbsenderOffen(true)}>Absender</Button>
      </header>

      <main className="py-8">
        <p className="eyebrow text-muted">Dokument wählen</p>
        <div className="mt-3">
          <Tabs wert={tab} onChange={setTab} tabs={[{ wert: 'vergleich', label: 'Energie-Vergleich' }, { wert: 'vollmacht', label: 'Vollmacht' }]} />
        </div>
        <div className="mt-8">
          {tab === 'vergleich' ? <VergleichWorkspace absender={absender} /> : <VollmachtWorkspace absender={absender} />}
        </div>
      </main>

      <footer className="border-t border-line py-6 text-xs text-muted">
        Interne Anwendung von {absender.firma}. Eingaben bleiben im Browser – nichts wird an einen Server gesendet.
      </footer>

      <AbsenderPanel offen={absenderOffen} absender={absender} setAbsender={setAbsender} onReset={absenderZuruecksetzen} onClose={() => setAbsenderOffen(false)} />
    </div>
  )
}
```

- [ ] **Step 3: README (German, final)**

```markdown
# Augusta Energy · Dokumente

Interner Generator für zwei PDF-Dokumente, die aus Formulareingaben erzeugt werden – komplett im Browser, ohne Server:

- **Energie-Vergleich** (Strom oder Gas): dreiseitiges Angebot mit Anschreiben, Vergleich auf einen Blick und Konditionen im Detail. Jahreskosten, Abschläge, Brutto-Werte und Ersparnis rechnet die App selbst.
- **Vollmacht**: beschränkt auf Angelegenheiten der Strom-/Gasversorgung der genannten Lieferstellen (Auskünfte, Angebote, Vertragsabschluss und -kündigung, Lieferantenwechsel, Rechnungsprüfung). Alles andere ist ausdrücklich ausgeschlossen.

Live: https://augusta-energy.github.io/dokumente/ (öffentlich erreichbar, aber per `noindex` und `robots.txt` von Suchmaschinen ausgeschlossen).

## Entwicklung

```bash
npm install
npm run dev              # http://localhost:5173/dokumente/
npm test                 # Vitest (Berechnung, Formatierung, PDF-Rendering)
npm run lint             # oxlint
npm run build            # tsc + vite build → dist/
npm run render:beispiele # schreibt out/Energie-Vergleich.pdf und out/Vollmacht.pdf mit Beispieldaten
```

Node ≥ 24.

## Aufbau

- `src/lib` – reine Fachlogik: Zahlen/Datum/Formatierung, Berechnung des Vergleichs, Vollmacht-Texte, Pflichtfelder.
- `src/pdf` – die beiden Dokumente auf Basis von `@react-pdf/renderer` plus gemeinsame Bausteine (Seitenrahmen, Tabellen, Highlight).
- `src/ui` – Formulare, Vorschau und Absender-Einstellungen.
- `src/brand` – Farben, Logo-Geometrie und Schriften (Montserrat/Raleway via Fontsource).

Firmendaten und Ansprechpartner werden in der App unter „Absender“ gepflegt (im Browser gespeichert). Die Standardwerte stehen in `src/lib/absender.ts`.

## Deployment

Jeder Push auf `main` baut die Seite (Lint, Tests, Build) und veröffentlicht sie über GitHub Actions auf GitHub Pages (`.github/workflows/deploy.yml`).

## Hinweis zur Vollmacht

Der Vollmachtstext ist eine sorgfältig formulierte Vorlage, aber keine Rechtsberatung. Vor dem produktiven Einsatz sollte ein Rechtsanwalt den Text prüfen.
```

- [ ] **Step 4: Verify and commit**

Run: `npm run lint && npm run build && npm test` → green. `grep -c noindex dist/index.html` → 1.
```bash
git add -A
git commit -m "feat: app shell with document tabs, Absender settings and README"
```

---

### Task 12 (orchestrator only): repository, GitHub Pages, deployment check, visual QA

Not for implementer subagents. The orchestrator:

1. `gh repo create Augusta-Energy/dokumente --public --description "Dokumente generieren: Energie-Vergleich und Vollmacht (Augusta Energy)" --source . --remote origin --push` (after Task 1 already, so CI is validated early; later tasks push as they land).
2. `gh api -X POST repos/Augusta-Energy/dokumente/pages -f build_type=workflow` (enables Pages with the Actions source; if it returns 409 the site already exists).
3. `gh run watch` / `gh run list` until the deploy job is green; `curl -sI https://augusta-energy.github.io/dokumente/` → 200 and `curl -s … | grep noindex`.
4. Visual QA: `npm run render:beispiele`, then read `out/Energie-Vergleich.pdf` and `out/Vollmacht.pdf` page by page; fix layout issues via follow-up tasks.
5. Screenshot the live page with headless Chrome if available; otherwise verify via curl and the built assets.
