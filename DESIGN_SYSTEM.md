# DESIGN_SYSTEM — Obsidian Gold

All tokens live in `src/index.css`. Change the palette there only.

## Colour
| Token | Value | Use |
|---|---|---|
| `--brand-black` | `#0B0B0C` | Hero, sidebar, footer, dark feature surfaces |
| `--brand-charcoal` | `#191817` | Raised panels on black (menus) |
| `--brand-gold` | `#B59655` | Primary action fill, active marker, rules |
| `--brand-champagne` | `#D8C18B` | Gold highlight on dark, selection |
| `--surface-ivory` | `#F7F5F0` | App background |
| `--surface-white` | `#FFFFFF` | Cards, tables, inputs |
| `--text-primary` | `#26231F` | Body text |
| `--text-secondary` | `#77736C` | Metadata only (decorative and large text) |
| `--border-subtle` | `#E7E1D6` | Hairlines |
| `--status-success / danger / warning / info` | `#237A57 / #B54747 / #A66A16 / #356D9A` | Semantic status |

Deliberate deviations from the starting tokens, for WCAG AA:
- `--c-muted: #6B675F` is used for readable secondary text (the spec's `#77736C` measures about 4.2:1 on ivory).
- `--c-gold-ink: #7A5B1F` is used for gold text on light surfaces (`#B59655` is about 2.8:1 on white).

Legacy utility names (`bg-surface`, `text-ink`, `text-muted`, `bg-primary`, `border-line`, `text-primary-ink`, …) map onto these tokens, so every existing tab inherits the palette.

## Typography
- **Fraunces** (display): headings, large figures. Weight 300 for hero and section headings, 400–500 for page titles and dialogs.
- **Manrope** (UI): body, labels, tables.
- Scale: hero `clamp(2.7rem, 6.2vw, 5.6rem)`; section `clamp(2rem, 4.2vw, 3.5rem)`; page title 28–32px; card title 19–23px; body 13.5–16.5px; label (`.eyebrow`) 11px, 800, 0.16em tracking, uppercase.
- Portal figures use `font-display tnum` at 36–40px weight 300. Tabular numerals are on for tables and `.tnum`.
- Dense dashboards never use display sizes above 40px.

## Shape, depth, spacing
- Radius: 6 / 8 / 10 / 14 px (`rounded-lg / xl / 2xl / 3xl`). Cards and buttons are 8–10 px.
- Shadows are warm and low: cards rely on a hairline border, menus and dialogs use `shadow-lg` / `shadow-2xl`.
- Page content max width: 1320 px shell, 1120 px for form-heavy pages. Landing container 1320 px, section padding 80–112 px vertical.

## Components (shared)
| Piece | Where |
|---|---|
| `.btn` `.btn-gold` `.btn-dark` `.btn-outline` `.btn-quiet` `.btn-sm` | `index.css` |
| `.field` `.field-label` | `index.css` |
| `.card` `.card-pad` `.eyebrow` `.gold-rule` | `index.css` |
| Tables (ivory header, hairline rows, tabular numerals) | global `table` rules in `index.css` |
| `PageHeader` `SectionHeading` `EmptyState` `Loading` `StatusChip` `FilterPills` | `src/tabs/common.tsx` |
| `StatStrip` `BarList` `Composition` (charts from real counts) | `src/components/Charts.tsx` |
| `Modal`, `GlobalSearchModal`, `NotificationBell`, `LangSelect` | `src/components/` |
| `Logo`, `Wordmark` | `src/components/Logo.tsx` |
| `PortalShell` | `src/components/PortalShell.tsx` |

## Portal shell
- 280 px obsidian sidebar: wordmark with role label, hairline, grouped navigation (`NavItem.group`), gold 2 px marker on the active item, emergency action (patient), user block.
- 60 px header: breadcrumb (portal › group › page), command search (⌘K), notifications, account menu (profile, home, back, refresh, language, log out).
- Below `lg`, the sidebar becomes a drawer. Header title replaces the breadcrumb below `sm`.

## Interaction
- State transitions 160 ms ease-out; menus pop in 180 ms; dialogs 180 ms.
- Focus ring: 2 px gold, 2 px offset (champagne on dark). Inputs gain a soft gold halo.
- `prefers-reduced-motion` collapses all animation and reveals content immediately.
