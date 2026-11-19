# REDESIGN_PROGRESS

## Done
- Tokens: Obsidian Gold palette, status colours, tighter radius and shadow scale, tabular numerals, themed scrollbars, selection, focus rings.
- Typography: Fraunces for display and figures, Manrope for UI, `.eyebrow` label style.
- Logo and `Wordmark`; favicon and theme colour updated.
- Landing page rebuilt (ten sections, photography, role tabs, capability strip, journey, identity, technology, CTA, footer) and new navigation with dropdowns and mobile drawer.
- Authentication screens restyled.
- Portal shell rebuilt: grouped sidebar, breadcrumb header, ⌘K search, account menu (profile, home, back, refresh, language, log out), responsive drawer.
- Patient dashboard rebuilt around a clear hierarchy; Timeline and Billing added to patient navigation (the tabs already existed but were unreachable).
- Government overview: stat strip, appointments-by-status, patients-by-state and hospitals-by-state charts (real counts), paginated tables with status chips.
- All tabs normalised: stat figures, labels, headings, off-palette colours, content widths, ivory table headers.

## Homepage v2 (cinematic hero)
- Hero replaced by one full-bleed landscape photograph (stock glass hospital exterior, `public/img/hospital-hero.jpg`) with obsidian gradients and a warm gold glow. Eyebrow, headline, supporting line and the single `Explore the Network` CTA use the exact copy requested.
- Old split hero, rectangular photo, QR card, two-button CTA and `HeroMockup.tsx` removed.
- Navigation reduced to Home, Platform, Solutions, About, Login, Get Started (dropdowns open on hover and click; mobile accordion).
- Five participants appear as a horizontal index directly below the hero, each linking to its portal sign-in.
- Footer now includes About, Contact, Security, Privacy Policy and Terms and Conditions. These two were modal text written from the README; no legal pages existed before. They need legal review.

## Homepage v3 (reception hero)
- Hero photograph: lobby of The Chinese Medicine Hospital of Hong Kong, Wikimedia Commons, CC0 (public domain dedication, no attribution required; credited here anyway). Cropped to remove the camera watermark. `public/img/hospital-reception.jpg`.
- Centred composition: eyebrow `INTERNATIONALLY DIGITALISED HEALTHCARE NETWORK`, headline `Healthcare Without Boundaries.` (one serif family, one size, champagne on the last word), `One network. Every health journey.`, one `Explore the Network` button that scrolls to the participant row.
- Navigation untouched.

## Verified
- `npm run check` (TypeScript and production build): passes.
- Manually viewed in the browser pane: landing at 1440, 820 and 390 px; patient, doctor, hospital, caretaker and government portals at 1440 px; patient and government at 390 px; demo sign-in for four roles and the admin sign-in.

## Not done / not verified
- `npm run i18n:missing` reports 416 untranslated phrases (47 from the new landing copy). Untranslated text falls back to English. Add them to `src/lib/i18n.extra.ts`.
- 1280, 1024 and 360 px, authentication forms at mobile width, and registration forms were not inspected.
- No automated browser tests (Playwright) were run, and workflows that write data (booking, prescriptions, uploads, password reset) were not exercised.
- Doctor and hospital list pages (patients, doctors) still use card grids; a table treatment would be better for scanning.
- Individual tab internals (cases, medicines, billing forms, hospital requests, settings) received the global token and typography pass but not a bespoke layout pass.
- Emergency overlay keeps its intentional red treatment.
- shadcn/ui and 21st.dev were not used (see COMPONENT_INVENTORY.md).
