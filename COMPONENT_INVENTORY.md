# COMPONENT_INVENTORY

## Public site (`src/landing/`)
| File | Role |
|---|---|
| `LandingPage.tsx` | Ten editorial sections: hero, ecosystem, five roles (tabs), capabilities (scroll-snap strip), patient journey, health identity, consultation, technology, CTA, footer. Scroll reveal hook. |
| `MegaMenu.tsx` | Site navigation: Home, About, Healthcare Solutions (dropdown), Patient Services, For Doctors, For Hospitals, Contact, language, Login (role dropdown), Get Started. Transparent over hero, solid after scroll; mobile drawer. Exports `goTo()` for section jumps. |
| `HeroMockup.tsx` | Sample Health ID card overlapping the hero photograph. |
| `portals.ts` | Five roles with README-sourced capability lists, and the Solutions menu entries. |

Photography: `public/img/*.jpg` (stock images, used for atmosphere only).

## Authentication (`src/auth/AuthScreen.tsx`)
Split screen: obsidian brand panel with role title, ivory form panel. Logic unchanged.

## Shared components (`src/components/`)
`PortalShell` (sidebar, header, breadcrumb, account menu, drawer), `Logo` + `Wordmark`, `Modal`, `GlobalSearchModal`, `NotificationBell`, `Controls` (`LangSelect`), `Toaster`, `EmergencyOverlay`, `MicButton`, `Charts` (`BarList`, `Composition`, `StatStrip`).

## Tab primitives (`src/tabs/common.tsx`)
`PageHeader`, `SectionHeading`, `Loading`, `EmptyState`, `StatusChip`, `FilterPills` (underline tabs), `btnPrimary`, `btnGhost`, `inputCls`, `labelCls`.

## Portals (`src/dashboards/`)
| Portal | Navigation groups |
|---|---|
| Patient | Overview · Care · Health identity (now includes Timeline and Billing) · Account |
| Caretaker | Care · Account |
| Doctor | Overview · Clinical · Practice · Account |
| Hospital | Overview · People · Operations · Account |
| Government Admin | Oversight · Account |

## Not adopted from the requested tools
- **shadcn/ui and 21st.dev**: neither could be installed or queried in this session, and the project has no `components.json`, Radix or class-variance packages. The primitives above were built directly on Tailwind 4 tokens instead. Adding shadcn later is compatible with the tokens in `index.css`.
