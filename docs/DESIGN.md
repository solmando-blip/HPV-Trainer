# Design-System „Terrain"

Stand: 2026-09-10. Quelle der Wahrheit ist `frontend/src/styles/theme.css`
(wird in `index.js` **nach** `bootstrap.min.css` geladen und überschreibt Bootstrap
5.3 überwiegend via dessen CSS-Variablen). Diese Datei erklärt das Warum.

## Idee

Die Farb- und Materialwelt des Boule-Platzes statt generischem SaaS-Blau: Sand/Kies
des Terrains, patinierter Stahl der Kugel, Olivgrün (Provence-Herkunft des Sports)
und das Terrakotta des *cochonnet* (Zielkügelchen). Ruhig, taktil, europäisch.

## Farben (Tokens in `:root`)

| Token | Hex | Rolle |
|---|---|---|
| `--tp-sand` | `#FAF6EE` | Seiten-Hintergrund (`--bs-body-bg`) |
| `--tp-sand-panel` | `#F1E9D9` | ruhige Flächen: Card-Header, Filter-Sidebar, Tabellenstreifen |
| `--tp-sand-border` | `#E4D8C0` | **alle** Rahmen/Trennlinien (`--bs-border-color`) |
| `--tp-pine` | `#1F2D25` | Primärtext, Navbar, Überschriften |
| `--tp-pine-700` | `#33473B` | Formular-Labels, sekundär |
| `--tp-olive` | `#5F6F3C` | Links, Fokus-Ringe, aktive Checkboxen |
| `--tp-olive-text` | `#4C5A30` | Link-Textfarbe (AA-Kontrast auf Sand) |
| `--tp-terracotta` | `#C25534` | Primär-CTA (`--bs-primary`), aktiver Nav-Indikator, Kennzahlen |
| `--tp-terracotta-600` | `#A5442A` | Hover/aktiv |
| `--tp-steel` | `#737F82` | gedämpfter Text (`.text-muted`), Icons, Disabled |

Semantik an die Palette angeglichen: `--tp-success #3C7A4E`, `--tp-danger #B23A34`,
`--tp-warning #C4882E`, `--tp-info #4A6A6E`. Bootstrap-Utilities (`.bg-primary`,
`.text-primary`, `.badge.bg-*`, `.alert-*`, `.btn-*`) sind entsprechend umdefiniert.

## Typografie

- **Headlines: Fraunces** (Google Fonts, `opsz` optisch, 500–600). Charaktervolle
  Soft-Serif — editorial, un-generisch. `font-optical-sizing: auto`.
- **Body / UI: IBM Plex Sans** (400/500/600). Humanist, präzise — bewusst nicht Inter.
- **Mono: IBM Plex Mono** (Template-Editor, Code-Snippets).

Eingebunden per `<link>` in `frontend/public/index.html` (preconnect + `display=swap`,
Fallback-Stacks in `--tp-font-*`).

### Type Scale (Basis 16px · Verhältnis 1.2)

| Element | Größe | |
|---|---|---|
| `.display-4` (Hero-H1) | 2.49rem / 40px | LH 1.08 |
| `h1` | 2.07rem / 33px | |
| `h2` | 1.73rem / 28px | Sektionstitel |
| `h3` | 1.44rem / 23px | |
| `h4` | 1.20rem / 19px | Card-Titel |
| Body | 1rem / 16px | LH 1.6 |
| `small` | 0.833rem / 13px | Meta |
| `.tp-eyebrow` | 0.6875rem / 11px | uppercase, `letter-spacing .09em`, Terrakotta |

Headings: LH 1.15, `letter-spacing -0.011em` ab h1/h2/h3.

## Layout & Spacing

- **4px-Raster**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
- Seiten-Sektionen ~48px Abstand (mobil 32)
- **Karten flach**: 1px `--tp-sand-border`, Radius 12px, Padding 24px, **kein Schatten**.
  `.shadow-sm` ist global auf `box-shadow: none` gesetzt.
- **Genau ein Schatten** im System (`--tp-shadow-overlay`) — nur Modals, Toasts,
  Hilfe-Dialog, Hilfe-FAB.
- Buttons: Radius 8px, `font-weight 600`. Primär = Terrakotta solid, Sekundär =
  Pine-Outline, `.btn-outline-secondary` = Sand-Rahmen.
- Inputs: Radius 8px, Fokus `0 0 0 3px rgba(olive,.22)` + Olive-Rahmen. Disabled = Sand-Panel.
- Navbar: solid `--tp-pine`, Brand in Fraunces, aktiver Link = 2px Terrakotta-Unterkante,
  Admin-Zugang als randlose Pille (`.tp-nav-admin`). `navbar-expand-xl` → Hamburger < 1200px.
- Text-Seiten (Legal, News-Artikel): `.tp-prose` begrenzt Lesebreite auf 680px.
- Emoji: keine. Weder in der Wortmarke noch in Überschriften/Buttons.

## Wiederverwendbare Klassen (in theme.css)

`.tp-eyebrow` · `.tp-prose` · `.tp-hero` (+ `.tp-hero__boules`, aktuell ungenutzt) ·
`.tp-tile` / `.tp-tile__mark` / `.tp-tile__cta` (Startseiten-Kacheln) ·
`.tp-collapsible` (Admin-Panel-Karten) · `.tp-stat` / `--accent` / `--warn` / `--ok`
(Kennzahl-Kacheln) · `.tp-authcard` (Login/Register/… ) · `.tp-create-user` / `.tp-profile`
(gescopte Seiten-Styles, ersetzen die früher global leckenden `CreateUser.css`/`Profile.css`).

## Bekannte Reste / später

- `frontend/src/styles/*.css` (Pagination, SearchFilter, Toast, Help, …) nutzen jetzt
  Tokens, sind aber weiter pro Komponente organisiert — keine zentrale Zusammenführung.
- Bootstrap wird als vorkompiliertes CSS geladen und zur Laufzeit übersteuert (kein
  SCSS-Rebuild). Bei einem Bootstrap-Major-Upgrade die Variablen-Overrides prüfen.
- `.tp-hero__boules` (dekorative Kugeln) ist im CSS vorhanden, im JSX aber entfernt —
  bei Bedarf wieder einhängen.
