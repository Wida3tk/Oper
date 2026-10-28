# Sulukera Operations — Design System v2

Introduced with the Operations Dashboard redesign. The tokens live in `app/globals.css` under
`:root{--sk-*}` and are additive: no existing module reads them yet, so nothing outside the
dashboard changes until a module is migrated.

## Brand basis

The brand values come from the running product (`--blue:#315efb`, `--nav:#111d36`, `--ink:#172038`,
the Sulukera logo set in `public/`, IBM Plex Sans Arabic), **not** from
`design-system/sulukera-b2b/MASTER.md`. The MASTER file was auto-generated and lists Plus Jakarta Sans
and `#0369A1`, which the product has never used. Treat this document as the dashboard's page-level
override (per the MASTER file's own rule), and update MASTER once you've approved the direction.

## Tokens

| Group | Token | Value | Use |
|---|---|---|---|
| Brand | `--sk-brand` | `#315efb` | Primary actions, selected states, sales series |
| | `--sk-brand-strong` | `#2448d6` | Pressed / emphasis on brand |
| | `--sk-brand-soft` | `#eef2ff` | Icon wells, soft highlights |
| | `--sk-navy` / `--sk-navy-2` | `#111d36` / `#1a2a4f` | Sidebar, the single dark "hero" figure per page |
| Text | `--sk-ink` | `#172038` | Headings, figures (15.6:1 on white) |
| | `--sk-ink-2` | `#3a4660` | Labels |
| | `--sk-muted` | `#5f6b82` | Secondary text (5.4:1 on white, AA) |
| | `--sk-subtle` | `#9aa3b5` | Decorative only (chevrons, info icons) — never body text |
| Surface | `--sk-canvas` | `#f5f7fa` | Page background |
| | `--sk-surface` | `#fff` | Panels |
| | `--sk-sunken` | `#f7f9fc` | Inset strips, hover rows, rails |
| | `--sk-line` / `--sk-line-strong` | `#e6e9ef` / `#d6dce6` | Hairlines / control borders |
| Data | `--sk-sales` | `#315efb` | Sales series |
| | `--sk-collection` | `#1f9d68` | Collections series, "achieved" |
| Status | `--sk-success(-soft)` | `#13804f` / `#e7f6ee` | Done, achieved |
| | `--sk-warning(-soft)` / `--sk-warning-mark` | `#955800` / `#fff3df` / `#e9972b` | Due today, needs review (text / fill / marker) |
| | `--sk-danger(-soft)` / `--sk-danger-mark` | `#bf3341` / `#fdeced` / `#dc4f5d` | Overdue, urgent |
| Shape | `--sk-radius-sm` / `--sk-radius` / `--sk-radius-lg` | 8 / 12 / 16px | Controls / insets / panels |
| Depth | `--sk-shadow-1` | 1px hairline shadow | Panels at rest — no lift on hover |
| | `--sk-shadow-2` | soft drop | Popovers, drawers (future) |
| Focus | `--sk-ring` | 3px brand at 30% | Every interactive element, via `:focus-visible` |
| Motion | `--sk-ease-out` | `cubic-bezier(.23,1,.32,1)` | All UI transitions |
| | `--sk-dur-fast` / `--sk-dur` | 150 / 220ms | Colour changes / movement |
| Type | `--sk-fs-2xs … --sk-fs-display` | 11, 12, 13, 14, 16, 20, 26, 36px | 11px is the floor (chart ticks only); 12px for meta, 13px body |

Status colours always come as a pair: a *mark* (bar, dot) plus a *soft fill + dark text* chip, so
state never relies on colour alone. A label is always present ("اليوم", "متأخرة", "أولوية عاجلة").

## Patterns (reusable)

| Pattern | Class | When to use |
|---|---|---|
| **Masthead** | `.oh-masthead` | Page greeting / title + one page-level control (e.g. month). No card around it. |
| **Pulse ribbon** | `.oh-pulse` | 2–4 headline counts that navigate somewhere. One surface split by hairlines, not separate cards. |
| **Panel** | `.oh-panel` + `.oh-panel-head` | Every content block: icon well, title, one-line purpose, optional count/pager at the end. |
| **Metric** | `HomeMetric` → `.oh-metric` | A labelled figure with a note. Becomes a `<button>` with a chevron when it opens the source records. Tones: `brand`, `success`, `neutral`, `attention`. |
| **Hero figure** | `.oh-cash` | The one number a page is about, on navy. At most one per page. Includes its own composition bar, built from real parts only. |
| **Ledger** | `.oh-ledger` | Secondary figures as rows (label + note, value at the end). Use instead of a grid of small cards. |
| **Priority queue** | `.oh-queue` / `.oh-task` | Actionable items: priority marker, title, department, due chip (`today` / `late`). |
| **Segmented control** | `.oh-segment` | 2–3 mutually exclusive views (`role="tablist"`, `aria-selected`). |
| **Inset stat strip** | `.chart-total-cards` | 2–4 numbers tied to the control directly above them. |
| **Goal ring** | `.month-target` / `.oh-ring` | Progress vs. a target the team set. Shows "no target set" instead of a fake 0%. |
| **Timeline** | `.oh-timeline` | Audit or activity feeds: day groups, actor initial, sentence, subject, time. |
| **Distribution list** | `.oh-trainee-list` | Expandable groups with bars scaled to the largest group. No percentages, because the API counts can overlap. |
| **Footnote** | `.oh-footnote` | Methodology or definition text. Use instead of coloured banners. |
| **Skeleton** | `HomeDashboardSkeleton` | First load only. Refreshes keep the data on screen and dim it (`aria-busy`). |
| **Buttons** | `.oh-btn` (`.primary`, `.ghost`) | Small inline actions. `scale(.97)` on press. |

## Rules

- **Composition over cards.** Group related numbers on one surface separated by hairlines. Use a
  panel per *question* ("What needs me now?", "How is money moving?"), not per number.
- **Real data only.** Every figure, bar and label maps to a field the API already returns. If a
  value is missing, say so ("لم يُحدَّد هدف لهذا الشهر", "دون موعد"). Never show placeholders that
  look like data.
- **RTL first.** Use logical properties (`inset-inline-*`, `padding-inline-*`, `border-inline-*`).
  Charts run day 1 → 31 from right to left. Numbers use Latin digits and `tabular-nums`.
- **Motion.** Only feedback and state changes animate (hover colour, press scale, chevron rotate,
  progress fill). No entrance animations on a screen people open many times a day. Hover effects
  sit behind `(hover:hover) and (pointer:fine)`. `prefers-reduced-motion` turns off all transitions.
- **Accessibility.** Text is at least 4.5:1 contrast. Every control is a real `<button>`, `<input>` or `<label>`
  with `:focus-visible` ring. Icon-only buttons carry `aria-label`. Panels are `<section>`s labelled by
  their heading.
- **Responsive.** ≥1281px: two columns (content + 360px aside). ≤1280px: narrower aside, stacked
  finance hero. ≤1024px: one column re-ordered by urgency (priorities → finance → reviews →
  performance → activity → trainees). ≤720px: compact pulse, notes hidden, compressed chart. No page-level horizontal scroll at any
  width.
- **Scoping.** New CSS is scoped under `.ops-home` or prefixed `oh-` so it can't leak into other
  modules. Watch for legacy global selectors (e.g. `nav button{width:100%}`) and neutralise them locally.
