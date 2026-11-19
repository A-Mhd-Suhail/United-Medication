# UNITED MEDICATION

United Medication is a React and Firebase healthcare portal connecting patients, caretakers, doctors, hospitals, and government administrators through a shared health identity and connected medical records.

## Portals

- **Patient Portal:** dashboard, activity, appointments, cases, medicines, results, doctors, caretaker, timeline, health overview, Health QR, billing, notifications, profile, settings, and emergency workflows.
- **Caretaker Portal:** care overview, assigned-patient selection, patients, medicine monitoring, medication checklist, appointments, care activities, notifications, profile, and assignment responses.
- **Doctor Portal:** clinical dashboard, cases, patients, patient verification, vitals, diagnoses, case notes, prescriptions, medicines, results, appointments, hospital affiliations, requests, earnings, messages, notifications, profile, and settings.
- **Hospital Portal:** hospital dashboard, patients, doctors, affiliation requests, appointments, cases, medicines, billing, result upload, reports, hospital requests, profile, and settings.
- **Government Admin Portal:** national overview, hospitals, doctors, patients, cases, reports, system activity, and protected administrative oversight.

## Shared features

- Firebase email/password authentication and role validation
- Persistent or session-based login, session restoration, registration, and password reset
- Demo account quick sign-in
- Lazy-loaded dashboards for faster initial loading
- Global feature search
- Home, back, refresh, and responsive mobile navigation
- Notifications, toast messages, loading states, and shared settings
- Ten languages, switched instantly with no page reload (`npm run i18n:missing` lists phrases still untranslated)
- One black, gold and white design system (no theme switching)
- Emergency overlay and safety workflows
- Optional prototype fingerprint enrollment/sign-in flow
- Health identity and QR verification workflows
- Firestore-backed profiles, records, appointments, medicines, reports, and activity data

## Healthcare workflow

```text
Register/sign in → Load role profile → Verify health identity
→ Select hospital/doctor/appointment → Consultation and care activity
→ Update vitals, cases, medicines, prescriptions, and reports
→ Continue authorized care through the connected patient timeline
```

## Security and privacy

- Role-based portal access
- Firebase Authentication and Firestore persistence
- Health identity and QR-based verification design
- Consent-aware access model
- Activity and notification flows for care coordination
- QR codes use identifiers/tokens rather than complete medical records

This is a prototype. Do not use it with real patient data without production Firestore rules, encryption, consent management, audit logging, identity verification, regulatory review, and healthcare compliance controls.

## Technology stack

- React 19, TypeScript, Vite, and Tailwind CSS 4
- Firebase Authentication, Cloud Firestore, and Firebase helpers
- Lucide React, Leaflet, QRCode React, and SimpleWebAuthn

## Project structure

```text
src/App.tsx          Routing between landing, auth and portals
src/auth/            Session hook (login, register, demo) and the sign-in screen
src/landing/         Public landing page
src/index.css        Design tokens and shared component styles
src/main.tsx         Application bootstrap and preference initialization
src/dashboards/      One thin file per role: navigation and tab routing
src/tabs/            Portal feature pages and tabs
src/components/      PortalShell (shared layout), Logo, controls, modals, search, toasts
src/lib/             Firebase helpers, types, preferences, i18n engine and utilities
scripts/             i18n gap report and Firestore rules tests
functions/           Firebase Cloud Functions entry point
firestore.rules      Role-aware Firestore security rules (see Security)
firebase.json        Emulator configuration for the rules tests
```

## Local development

Requirements: Node.js 18+, npm 9+, and a Firebase project with Authentication and Firestore enabled.

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:3000>.

### Commands

```bash
npm run dev          # Vite development server
npm run start        # Alias for dev
npm run lint         # TypeScript validation
npm run build        # Production build
npm run check        # lint plus production build
npm run preview      # Preview the production build
npm run i18n:missing # List UI phrases that have no translation yet
npm run vercel-build # Vercel build command
```

## Firebase configuration

Copy `.env.example` to `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Enable Email/Password authentication and create the Firestore database. Keep `.env` private; it is excluded from Git.

## Demo accounts

Use the landing-page demo buttons. The demo password is `demo123`.

```text
patient.demo@mhdhospital.in
caretaker.demo@mhdhospital.in
doctor.demo@mhdhospital.in
hospital.demo@mhdhospital.in
```

Government Admin uses its protected admin access flow and is not a normal public registration portal.

## Design system

One identity, no theme switching: black and charcoal frame the product (navigation, hero, footer), warm white carries content, and metallic gold marks actions and focus.

- Tokens live in `src/index.css` (`--c-gold`, `--c-black`, `--c-paper`, and semantic roles such as `bg-surface`, `text-ink`, `bg-primary`). Change the palette there only.
- `.btn`, `.btn-gold`, `.btn-dark`, `.btn-outline`, `.field` and `.field-label` are the shared controls.
- Fonts: Fraunces (display) and Manrope (body), loaded from Google Fonts in `index.html`.
- Every portal renders inside `src/components/PortalShell.tsx`; add a nav item in the role's dashboard file, not a new layout.
- Motion respects `prefers-reduced-motion`.

## Languages

Ten languages switch instantly with no reload. UI text is plain English in JSX; `src/lib/i18n.ts` matches each rendered phrase against the dictionaries (`i18n.ts` and `i18n.extra.ts`) and remembers the English original, so switching back is lossless. To translate a phrase, add its exact English text to every language in `src/lib/i18n.extra.ts`. Untranslated phrases fall back to English; `npm run i18n:missing` lists them (about 390 at the time of writing, mostly portal tab content and long landing paragraphs). Mark text that must never be translated with `data-no-i18n`.

## Security

`firestore.rules` no longer allows public access: every request needs a sign-in, patients read only their own records, and roles cannot be changed after registration. **The rules have not been run against the emulator or deployed.** Before deploying, install Java and run:

```bash
npm i -D firebase-tools @firebase/rules-unit-testing
npx firebase emulators:exec --only firestore --project demo-um 'node scripts/firestore-rules.test.mjs'
```

Known gaps that need server-side work: doctor and hospital roles are self-declared and unverified, the Government Admin credential is checked in the browser (override with `VITE_ADMIN_PASSWORD` and `VITE_ADMIN_SECRET`), and doctor access is not limited by patient consent.

## Deployment

```bash
npm run build
```

Vercel settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

Configure all `VITE_FIREBASE_*` variables for Preview and Production. `vercel.json` provides SPA rewrites and asset caching.

## Project identity

**Team:** NightBerrieZ  
**Project:** UNITED MEDICATION  
**Tagline:** One health ID, lifelong safety

## Disclaimer

United Medication is a hackathon/prototype healthcare application. It does not provide medical advice and is not a certified clinical information system. Production use requires comprehensive privacy, security, identity, consent, audit, infrastructure, and regulatory controls.
