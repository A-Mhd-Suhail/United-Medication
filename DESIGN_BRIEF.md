# DESIGN_BRIEF — UNITED MEDICATION · Obsidian Gold

## Direction
An editorial, restrained healthcare technology identity. Obsidian frames the brand (hero, navigation, sidebar, footer). Ivory and white carry every reading surface. Antique gold is the single accent: the primary action, the active navigation marker, hairline rules and brand detail. Champagne is gold's highlight on dark.

It is **not** a hospital template: no gradient blobs, no rows of identical icon cards, no bright yellow, no all-black dashboards.

## Two registers
| Surface | Mode | Posture |
|---|---|---|
| Landing page, authentication | Persuade | Editorial. Large Fraunces headings, photography, split layouts, one authored motion moment. |
| Five portals | Operate | Clarity first. Dense, scannable, consistent chrome. Brand lives in details: type, hairlines, active states. |

## Findings from the audit that drove the redesign
- Landing was a single screen with one mock card pair; no editorial flow, no photography.
- Navigation exposed only Portals / Security / About behind a hover mega-menu.
- Portal sidebar was a flat list of up to 13 items with no grouping; header had five icon buttons (home, back, refresh, language, search) competing for attention.
- Every tab styled cards, stat tiles and headings independently (radius 2xl–3xl, shadow-sm/md, bold 2xl headings), so portals read as generic SaaS.
- Patient dashboard stacked eight same-weight cards.
- Table headers were solid charcoal with a gold underline, heavy on every table.
- Status colours mixed Tailwind amber and hard-coded blue hex values; `dark:` variants existed although there is no dark mode.

## Landing composition (top to bottom)
1. Hero: obsidian, headline "One health ID, lifelong safety", one photograph, no buttons.
2. Ecosystem statement (two columns, no cards).
3. Five roles: tabbed split view with sign-in, create account, demo.
4. Core capabilities: horizontal scroll-snap strip with previous/next controls.
5. Patient journey: sticky heading beside a stepped vertical timeline (obsidian).
6. Health identity and QR: Health ID card beside a ruled list.
7. Appointments and consultation: full-bleed photograph beside copy.
8. Platform technology: definition list (obsidian).
9. Closing call to action, then footer with contact.

Content comes only from the README and the code: no invented facilities, doctors, statistics or testimonials. Photography is stock imagery used for atmosphere; it is not presented as a real hospital or staff.

## Rules
- Gold fills only the single primary action per view. Secondary actions are outline or quiet.
- One dark feature surface per portal page at most.
- Never rely on colour alone for status: chips carry a dot and a text label.
- Motion: one authored entrance on the hero, scroll reveals on the landing page only, 160–240 ms state changes in portals, all disabled under `prefers-reduced-motion`.
