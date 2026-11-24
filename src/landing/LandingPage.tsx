import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowDown, ArrowLeft, ArrowRight, Bell, CalendarClock, CreditCard, FileText, Info, Languages, Lock, Mail, Pill, Search,
  ShieldCheck, Siren, Stethoscope, Activity, ListChecks,
} from 'lucide-react';
import Modal from '../components/Modal';
import { Wordmark } from '../components/Logo';
import MegaMenu, { goTo } from './MegaMenu';
import { PORTALS, type InfoKey } from './portals';
import type { PortalType } from '../auth/session';

type Props = {
  onLogin: (r: PortalType) => void;
  onSignup: (r: PortalType) => void;
  onDemo: (r: Exclude<PortalType, 'admin'>) => void;
  onAdmin: () => void;
  authLoading: boolean;
};

const EMAIL = 'unitedmadication@gmail.com';

const INFO_BASE: Pick<Record<InfoKey, { title: string; icon: typeof Info; body: string[] }>, 'about' | 'security'> = {
  about: {
    title: 'About United Medication',
    icon: Info,
    body: [
      'United Medication is a patient-centric digital healthcare platform. It connects patients, caretakers, doctors, hospitals and government administrators through a shared health identity and connected medical records.',
      'The aim is to keep a person’s identity, history and care information together, and to cut the fragmented records, paperwork and delays that come from moving between providers.',
    ],
  },
  security: {
    title: 'Security & privacy',
    icon: Lock,
    body: [
      'Role-based access: patients, caretakers, doctors, hospitals and administrators each use a separate portal, with access focused on their care role.',
      'Consent-aware design: health identity and QR checks use identifiers and tokens, not complete medical records.',
      'Prototype notice: this is a prototype. It should not hold real patient data until production security rules, encryption, consent management, audit logging and regulatory review are in place.',
    ],
  },
};

const PRIVACY_TERMS: Partial<Record<InfoKey, { title: string; icon: typeof Info; body: string[] }>> = {
  privacy: {
    title: 'Privacy Policy',
    icon: Lock,
    body: [
      'United Medication is a prototype. Please do not enter real patient data. Demo accounts hold sample data only.',
      'What the platform stores: the profile you provide at registration, and the records created through care activity (appointments, cases, medicines, reports, bills, notifications and access logs), held in Firebase Authentication and Cloud Firestore.',
      'Access is role-based: patients see their own records; doctors, hospitals and administrators see what their role allows. Health QR codes carry identifiers and tokens, not the full medical record.',
      'Questions or requests about data: unitedmadication@gmail.com. A production release would require a legally reviewed policy.',
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    icon: Info,
    body: [
      'United Medication is a hackathon prototype built by Team NightBerrieZ. It is provided as is, for demonstration and evaluation.',
      'It does not provide medical advice and is not a certified clinical information system. Do not rely on it for diagnosis, treatment or emergencies.',
      'Do not upload real patient information. Use accounts only for the role you are registered for, and do not attempt to access other users’ records.',
      'These terms are a prototype notice, not a legal contract. A production release would require legally reviewed terms.',
    ],
  },
};

const INFO = { ...INFO_BASE, ...PRIVACY_TERMS } as Record<InfoKey, { title: string; icon: typeof Info; body: string[] }>;

const CAPABILITIES = [
  { icon: Activity, title: 'Health overview', text: 'Vitals and health status gathered in one place and kept current by the care team.' },
  { icon: CalendarClock, title: 'Appointments', text: 'Book and manage consultations with doctors across connected hospitals.' },
  { icon: FileText, title: 'Medical cases', text: 'Cases, diagnoses and case notes stay attached to the patient, not to a single visit.' },
  { icon: Pill, title: 'Medicines & prescriptions', text: 'Prescriptions and medicines are verified by a doctor and tracked every day.' },
  { icon: ListChecks, title: 'Reports & results', text: 'Hospitals upload results straight into the patient record.' },
  { icon: CreditCard, title: 'Billing', text: 'Bills and payments sit next to the care they belong to.' },
  { icon: Bell, title: 'Notifications', text: 'Care coordination alerts reach the right role at the right time.' },
  { icon: Search, title: 'Global search', text: 'Jump to any feature in your portal from one command bar.' },
  { icon: Languages, title: 'Ten languages', text: 'The whole interface switches instantly, with no page reload.' },
  { icon: Siren, title: 'Emergency workflows', text: 'A safety overlay surfaces the essentials when it matters most.' },
];

const JOURNEY = [
  ['Register or sign in', 'Create an account for your role, or return to your restored session.'],
  ['Load the role profile', 'The platform opens the portal that matches your role and permissions.'],
  ['Verify health identity', 'A Health ID and QR confirm who the patient is without exposing the whole record.'],
  ['Select hospital, doctor and appointment', 'Choose where and with whom care will happen.'],
  ['Consultation and care activity', 'Doctors and caretakers act on the same up-to-date picture.'],
  ['Update vitals, cases, medicines and reports', 'Every change is written to the patient record.'],
  ['Continue authorized care', 'The connected timeline carries the history to the next provider.'],
];

const STACK = [
  ['Interface', 'React 19, TypeScript, Vite and Tailwind CSS 4'],
  ['Identity', 'Firebase Authentication with role validation and session restoration'],
  ['Records', 'Cloud Firestore for profiles, cases, medicines, reports, appointments and activity'],
  ['Verification', 'QR codes built on identifiers and tokens; optional prototype fingerprint sign-in'],
  ['Maps & access', 'Leaflet maps for finding doctors; a ten-language interface'],
];

/** Fade-and-rise on scroll. Respects reduced motion through index.css. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

const d = (n: number): CSSProperties => ({ transitionDelay: `${n * 90}ms` });

function Section({ id, dark, children, className = '' }: { id: string; dark?: boolean; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`${dark ? 'on-dark bg-black text-white' : ''} ${className}`}>
      <div className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title, lead, dark }: { eyebrow: string; title: ReactNode; lead?: string; dark?: boolean }) {
  return (
    <header data-reveal className="max-w-[760px]">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`font-display mt-4 text-[clamp(2rem,4.2vw,3.5rem)] font-light leading-[1.06] ${dark ? 'text-white' : 'text-heading'}`}>{title}</h2>
      {lead && <p className={`mt-5 max-w-[58ch] text-[16.5px] leading-[1.7] ${dark ? 'text-white/65' : 'text-muted'}`}>{lead}</p>}
    </header>
  );
}

export default function LandingPage({ onLogin, onSignup, onDemo, onAdmin, authLoading }: Props) {
  const [info, setInfo] = useState<InfoKey | null>(null);
  const [role, setRole] = useState<PortalType>('patient');
  const strip = useRef<HTMLUListElement>(null);
  const openPortal = (r: PortalType) => (r === 'admin' ? onAdmin() : onLogin(r));
  const Icon = info ? INFO[info].icon : Info;
  const active = PORTALS.find((p) => p.role === role) ?? PORTALS[0];
  useReveal();

  useEffect(() => {
    const on = (e: Event) => setRole((e as CustomEvent<PortalType>).detail);
    window.addEventListener('um:role', on);
    return () => window.removeEventListener('um:role', on);
  }, []);

  const scrollStrip = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * 380, behavior: 'smooth' });

  return (
    <div id="top" className="bg-paper text-ink">
      <MegaMenu onLogin={openPortal} onInfo={setInfo} />

      {/* 1 — Cinematic hero: a grand hospital reception, one centred statement, one action */}
      <header className="on-dark relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-black pt-[72px] text-white">
        <img src="./img/hospital-lobby.webp" srcSet="./img/hospital-lobby-1280.webp 1280w, ./img/hospital-lobby.webp 2000w" sizes="100vw" alt="United Medication hospital lobby at sunset, with a marble reception desk, glass walls and a glowing oval ceiling"
          width={2000} height={1125} fetchPriority="high" decoding="async"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-[50%_42%]" />
        {/* Overlay: even base so the architecture stays legible, a soft pool behind the type, nav and floor fades, warm champagne ambience */}
        <div className="absolute inset-0 -z-20 bg-black/20" aria-hidden />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_56%_at_50%_44%,rgba(11,11,12,0.66),transparent_78%)]" aria-hidden />
        <div className="absolute inset-x-0 top-0 -z-20 h-40 bg-gradient-to-b from-black/80 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-20 h-1/4 bg-gradient-to-t from-black via-black/50 to-transparent" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(216,193,139,0.16),transparent_70%)]" aria-hidden />

        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 pb-24 pt-6 text-center sm:px-8">
          <p className="rise flex items-center justify-center gap-4 text-[11.5px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-champagne [text-shadow:0_1px_16px_rgba(0,0,0,0.7)] sm:text-[13.5px] sm:tracking-[0.32em]" style={{ '--i': 0 } as CSSProperties}>
            <span className="hidden h-px w-10 bg-champagne/60 sm:block" aria-hidden />
            <span className="max-w-[32ch] sm:max-w-none">INTERNATIONALLY DIGITALISED HEALTHCARE NETWORK</span>
            <span className="hidden h-px w-10 bg-champagne/60 sm:block" aria-hidden />
          </p>
          <h1 className="rise font-display mt-7 text-balance text-[clamp(2.5rem,5.4vw,5.4rem)] font-light leading-[1.04] tracking-[-0.025em] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]" style={{ '--i': 1 } as CSSProperties}>
            Healthcare Without <span className="text-champagne">Boundaries.</span>
          </h1>
          <p className="rise mt-6 text-[16px] tracking-[0.02em] text-white/75 sm:text-[19px]" style={{ '--i': 2 } as CSSProperties}>One network. Every health journey.</p>
        </div>

        {/* Scroll cue: a single curved pill anchored to the bottom of the hero */}
        <button onClick={() => goTo('network')} aria-label="Scroll to explore"
          className="rise group absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-champagne/45 bg-black/35 py-2.5 pl-6 pr-2.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne backdrop-blur-md sm:text-[11.5px] sm:tracking-[0.28em] hover:border-champagne hover:bg-black/55 hover:text-white sm:bottom-10"
          style={{ '--i': 4 } as CSSProperties}>
          Scroll to explore
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne/50 text-champagne transition-colors group-hover:border-champagne group-hover:bg-champagne group-hover:text-black">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden />
          </span>
        </button>
      </header>

      {/* 1b — The five participants: a quiet horizontal index into the portals */}
      <section id="network" className="on-dark bg-black text-white">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="gold-rule" aria-hidden />
          <ul className="grid divide-y divide-white/10 md:grid-cols-5 md:divide-x md:divide-y-0">
            {PORTALS.map(({ role: r, icon: I, title, text }, i) => (
              <li key={r}>
                <button onClick={() => openPortal(r)} className="group relative flex h-full w-full flex-col gap-5 px-1 py-8 text-left md:px-7 md:py-12 md:first:pl-0 md:last:pr-0">
                  <span className="flex items-center justify-between">
                    <span className="font-display text-[13px] font-light text-champagne/80 tnum">{String(i + 1).padStart(2, '0')}</span>
                    <I className="h-[18px] w-[18px] text-white/40 transition-colors group-hover:text-champagne" strokeWidth={1.4} aria-hidden />
                  </span>
                  <span className="font-display text-[26px] font-light leading-tight text-white">{r === 'admin' ? 'Government Administrators' : `${title}s`}</span>
                  <span className="text-[13.5px] leading-relaxed text-white/55">{text}</span>
                  <span className="mt-auto inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-champagne">
                    Enter portal <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100 md:inset-x-7 md:first:inset-x-0" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 — Ecosystem */}
      <Section id="about">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Heading eyebrow="The ecosystem" title={<>Care should not restart at every front desk.</>} />
          <div data-reveal style={d(1)} className="space-y-6 text-[16.5px] leading-[1.75] text-muted lg:pt-10">
            <p>United Medication is a patient-centric digital healthcare platform. It connects patients, caretakers, doctors, hospitals and government administrators through a shared health identity and connected medical records.</p>
            <p>The aim is to keep a person’s identity, history and care information together, and to cut the fragmented records, paperwork and delays that come from moving between providers.</p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-6 text-[13px] font-bold text-heading sm:grid-cols-4">
              {['Role-based access', 'Firebase Authentication', 'Consent-aware care', 'Ten languages'].map((x) => (
                <li key={x} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 3 — Five roles */}
      <Section id="roles" className="border-y border-line bg-surface">
        <Heading eyebrow="Five connected roles" title={<>One platform, five points of view.</>} lead="Every portal shares the same identity, records and design, with the tools each role actually needs." />
        <div className="mt-14 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <div role="tablist" aria-label="Portals" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {PORTALS.map(({ role: r, icon: I, title }) => {
              const on = r === role;
              return (
                <button key={r} role="tab" aria-selected={on} onClick={() => setRole(r)}
                  className={`group flex shrink-0 items-center gap-3.5 border-b-2 px-4 py-3.5 text-left lg:border-b-0 lg:border-l-2 lg:py-4 ${on ? 'border-gold bg-active/60' : 'border-transparent hover:bg-stripe'}`}>
                  <I className={`h-[18px] w-[18px] ${on ? 'text-gold-ink' : 'text-muted'}`} strokeWidth={1.5} aria-hidden />
                  <span className={`whitespace-nowrap text-[15px] font-semibold ${on ? 'text-heading' : 'text-muted group-hover:text-heading'}`}>{title}</span>
                </button>
              );
            })}
          </div>

          <div key={role} className="animate-in fade-in grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-start">
            <div>
              <active.icon className="h-7 w-7 text-gold-ink" strokeWidth={1.3} aria-hidden />
              <h3 className="font-display mt-5 text-[34px] font-light leading-tight text-heading">{active.title} Portal</h3>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.7] text-muted">{active.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => openPortal(active.role)} className="btn btn-dark">Sign in <ArrowRight className="h-4 w-4" aria-hidden /></button>
                {active.role !== 'admin' && (
                  <>
                    <button onClick={() => onSignup(active.role)} className="btn btn-outline">Create account</button>
                    <button onClick={() => onDemo(active.role as Exclude<PortalType, 'admin'>)} disabled={authLoading} className="btn btn-quiet">Try demo</button>
                  </>
                )}
              </div>
              {active.role !== 'admin' && <p className="mt-4 text-[12px] text-muted">Demo accounts contain sample data only.</p>}
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {active.points.map((p) => (
                <li key={p} className="flex gap-4 py-4 text-[14.5px] leading-snug text-ink">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />{p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 4 — Capabilities: horizontal strip */}
      <section id="capabilities" className="overflow-hidden">
        <div className="mx-auto max-w-[1320px] px-5 pt-20 sm:px-8 lg:pt-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Heading eyebrow="Core capabilities" title={<>Everything a care team needs, in one record.</>} />
            <div className="flex gap-2">
              <button onClick={() => scrollStrip(-1)} aria-label="Previous capabilities" className="btn btn-outline !min-h-[44px] !w-11 !px-0"><ArrowLeft className="h-4 w-4" aria-hidden /></button>
              <button onClick={() => scrollStrip(1)} aria-label="Next capabilities" className="btn btn-outline !min-h-[44px] !w-11 !px-0"><ArrowRight className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
        </div>
        <ul ref={strip} tabIndex={0} aria-label="Platform capabilities" className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-20 lg:pb-28 [padding-inline:max(1.25rem,calc((100vw_-_1320px)/2_+_2rem))] [scroll-padding-inline:max(1.25rem,calc((100vw_-_1320px)/2_+_2rem))]">
          {CAPABILITIES.map(({ icon: I, title, text }, i) => (
            <li key={title} className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-[10px] border border-line bg-surface p-7 sm:w-[320px]" style={{ minHeight: 280 }}>
              <div>
                <span className="font-display text-[13px] font-light text-gold-ink">{String(i + 1).padStart(2, '0')}</span>
                <I className="mt-6 h-6 w-6 text-heading" strokeWidth={1.3} aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-[23px] font-normal leading-tight text-heading">{title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 — Patient journey */}
      <Section id="journey" dark>
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Heading dark eyebrow="The patient journey" title={<>From first sign-in to continued care.</>} lead="The same record travels with the patient through every step of the workflow." />
          </div>
          <ol className="border-l border-white/15">
            {JOURNEY.map(([t, s], i) => (
              <li key={t} data-reveal style={d(i % 3)} className="relative pb-10 pl-10 last:pb-0">
                <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-gold ring-4 ring-black" aria-hidden />
                <p className="font-display text-[13px] text-champagne">Step {String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-display mt-1.5 text-[26px] font-light leading-snug text-white">{t}</h3>
                <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-white/60">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 6 — Health identity & QR */}
      <Section id="identity">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div data-reveal className="relative mx-auto w-full max-w-[460px]">
            <div className="rounded-[10px] bg-black p-8 text-white shadow-2xl sm:p-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <Wordmark tone="dark" sub="Health ID" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-champagne"><ShieldCheck className="h-3 w-3" aria-hidden />Sample</span>
              </div>
              <div className="mt-8 flex justify-center rounded-md bg-white p-5">
                <QRCodeSVG value="MHD-SAMPLE" size={180} fgColor="#0B0B0C" bgColor="#FFFFFF" level="M" />
              </div>
              <dl className="mt-7 grid grid-cols-2 gap-4 text-[13px]">
                <div><dt className="eyebrow">Holder</dt><dd className="mt-1 font-semibold">Sample Patient</dd></div>
                <div><dt className="eyebrow">ID</dt><dd className="mt-1 font-mono">MHD-SAMPLE</dd></div>
              </dl>
            </div>
          </div>
          <div>
            <Heading eyebrow="Health identity" title={<>One identity that follows the patient.</>} lead="Each patient holds a Health ID and a Health QR. A doctor or hospital scans it to confirm identity and open the connected record." />
            <ul data-reveal style={d(1)} className="mt-9 divide-y divide-line border-y border-line">
              {['QR codes carry identifiers and tokens, never the complete medical record.', 'Verification is consent-aware: access is focused on the care role.', 'Doctors verify patients before they record vitals, diagnoses or prescriptions.'].map((x) => (
                <li key={x} className="flex gap-4 py-4 text-[15px] leading-snug"><ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold-ink" strokeWidth={1.5} aria-hidden />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 7 — Appointments & consultation */}
      <section id="consultations" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-[1320px] items-stretch lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-[560px]">
            <img src="./img/consult.jpg" alt="A doctor explaining diagnostic imaging to a colleague" loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale-[25%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
          </div>
          <div className="px-5 py-16 sm:px-12 lg:px-16 lg:py-24">
            <Heading eyebrow="Appointments & consultation" title={<>From booking to follow-up, in one thread.</>} lead="Patients choose a hospital, a doctor and a time. The consultation then writes back to the same record." />
            <ul className="mt-9 space-y-5">
              {[
                [CalendarClock, 'Patients book appointments and see their queue number.'],
                [Stethoscope, 'Doctors manage appointments, record vitals and write case notes.'],
                [FileText, 'Prescriptions, results and follow-ups return to the patient timeline.'],
              ].map(([I, x]) => {
                const L = I as typeof Pill;
                return <li key={x as string} className="flex items-start gap-4 text-[15px] leading-snug"><L className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold-ink" strokeWidth={1.5} aria-hidden />{x as string}</li>;
              })}
            </ul>
            <button onClick={() => onSignup('patient')} className="btn btn-dark mt-10">Book as a patient <ArrowRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
      </section>

      {/* 8 — Technology */}
      <Section id="technology" dark>
        <Heading dark eyebrow="Platform technology" title={<>Connected by design, built on proven infrastructure.</>} />
        <dl className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {STACK.map(([k, v], i) => (
            <div key={k} data-reveal style={d(i % 3)} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-10">
              <dt className="font-display text-[22px] font-light text-champagne">{k}</dt>
              <dd className="text-[15.5px] leading-relaxed text-white/70">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-[70ch] text-[13px] leading-relaxed text-white/45">
          United Medication is a prototype. It does not provide medical advice and is not a certified clinical information system. It should not hold real patient data until production security rules, encryption, consent management, audit logging and regulatory review are in place.
        </p>
      </Section>

      {/* 9 — CTA */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1320px] px-5 py-24 text-center sm:px-8 lg:py-32">
          <p className="eyebrow">Begin</p>
          <h2 data-reveal className="font-display mx-auto mt-5 max-w-[16ch] text-[clamp(2.2rem,5vw,4.2rem)] font-light leading-[1.05] text-heading">One health ID, <em className="italic text-gold-ink">lifelong safety</em></h2>
          <p data-reveal style={d(1)} className="mx-auto mt-6 max-w-[48ch] text-[16.5px] leading-relaxed text-muted">Create your Health ID, or explore any portal with a demo account.</p>
          <div data-reveal style={d(2)} className="mt-10 flex flex-wrap justify-center gap-3">
            <button onClick={() => onSignup('patient')} className="btn btn-gold !min-h-[52px] !px-8 text-[15px]">Get Started <ArrowRight className="h-4 w-4" aria-hidden /></button>
            <button onClick={() => onDemo('patient')} disabled={authLoading} className="btn btn-outline !min-h-[52px] !px-8 text-[15px]">Try the patient demo</button>
          </div>
        </div>
      </section>

      {/* 10 — Footer */}
      <footer id="contact" className="on-dark bg-black text-white/60">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark tone="dark" />
            <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed">One health ID, lifelong safety</p>
            <a href={`mailto:${EMAIL}`} className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-champagne hover:text-white"><Mail className="h-4 w-4" aria-hidden />{EMAIL}</a>
          </div>
          <nav aria-label="Platform">
            <p className="eyebrow">Platform</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {[['About', 'about'], ['Capabilities', 'capabilities'], ['Patient journey', 'journey'], ['Health identity', 'identity'], ['Technology', 'technology']].map(([l, id]) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); goTo(id); }} className="hover:text-white">{l}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Portals">
            <p className="eyebrow">Portals</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {PORTALS.map((p) => <li key={p.role}><button onClick={() => openPortal(p.role)} className="hover:text-white">{p.title}</button></li>)}
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="eyebrow">Company</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li><button onClick={() => setInfo('about')} className="hover:text-white">About</button></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); goTo('contact'); }} className="hover:text-white">Contact</a></li>
              <li><button onClick={() => setInfo('security')} className="hover:text-white">Security</button></li>
              <li><button onClick={() => setInfo('privacy')} className="hover:text-white">Privacy Policy</button></li>
              <li><button onClick={() => setInfo('terms')} className="hover:text-white">Terms and Conditions</button></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-[1320px] px-5 py-6 text-[12px] sm:px-8">© {new Date().getFullYear()} United Medication in Cooperation · Team NightBerrieZ · Prototype, not for real patient data.</p>
        </div>
      </footer>

      {info && (
        <Modal small title={INFO[info].title} icon={<Icon className="h-5 w-5" strokeWidth={1.75} />} onClose={() => setInfo(null)}
          footer={<button type="button" onClick={() => setInfo(null)} className="btn btn-gold btn-sm">Close</button>}>
          <div className="space-y-3.5 text-[14px] leading-relaxed text-ink">
            {INFO[info].body.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Modal>
      )}
    </div>
  );
}
