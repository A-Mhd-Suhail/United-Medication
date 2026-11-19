import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Info, Mail, Menu, X } from 'lucide-react';
import { LangSelect } from '../components/Controls';
import { Wordmark } from '../components/Logo';
import { PORTALS, SOLUTIONS, type InfoKey } from './portals';
import type { PortalType } from '../auth/session';

type Props = {
  onLogin: (r: PortalType) => void;
  onInfo: (k: InfoKey) => void;
};

/** Jump to a landing section; optionally pre-select a role in the roles section. */
export function goTo(id: string, role?: PortalType) {
  if (role) window.dispatchEvent(new CustomEvent('um:role', { detail: role }));
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  else window.scrollTo({ top: 0 });
}

type Menu = 'platform' | 'solutions' | 'about' | 'login' | null;

const panel = 'pop-in absolute top-[calc(100%+6px)] z-10 rounded-lg border border-white/10 bg-charcoal p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]';
const row = 'group flex w-full items-center gap-3.5 rounded-md p-3 text-left hover:bg-white/[0.05] focus-visible:bg-white/[0.05]';
const trigger = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] font-semibold text-white/75 hover:text-white';

/** Minimal navigation: Home, Platform, Solutions, About, Login. Dropdowns open on hover and click. */
export default function MegaMenu({ onLogin, onInfo }: Props) {
  const [menu, setMenu] = useState<Menu>(null);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState<Menu>(null);
  const [solid, setSolid] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const timer = useRef(0);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(null); setDrawer(false); } };
    const onDoc = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setMenu(null); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDoc); window.clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const hoverOpen = (m: Exclude<Menu, null>) => { window.clearTimeout(timer.current); setMenu(m); };
  const hoverClose = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setMenu(null), 140); };
  const close = () => { setMenu(null); setDrawer(false); };
  const jump = (id: string) => { close(); goTo(id); };
  const portal = (r: PortalType) => { close(); onLogin(r); };
  const info = (k: InfoKey) => { close(); onInfo(k); };
  const open = solid || menu !== null || drawer;
  const groups: [Exclude<Menu, null>, string, [string, () => void][]][] = [
    ['platform', 'Platform', PORTALS.map((p) => [p.role === 'admin' ? 'Government Administration' : `${p.title} Portal`, () => portal(p.role)])],
    ['solutions', 'Solutions', SOLUTIONS.map((x) => [x.title, () => jump(x.id)])],
    ['about', 'About', [['About United Medication', () => info('about')], ['Contact', () => jump('contact')]]],
  ];

  /** One dropdown: a trigger button plus a panel, wired for hover, click, focus-out and Escape. */
  const Drop = ({ id, label, align = 'left', width, children }: { id: Exclude<Menu, null>; label: string; align?: 'left' | 'right'; width: string; children: React.ReactNode }) => (
    <li className="relative" onMouseEnter={() => hoverOpen(id)} onMouseLeave={hoverClose}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) hoverClose(); }}>
      <button onClick={() => setMenu((v) => (v === id ? null : id))} aria-expanded={menu === id} aria-haspopup="true" aria-controls={`menu-${id}`} className={`${trigger} ${menu === id ? '!text-white' : ''}`}>
        {label}<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${menu === id ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {menu === id && <div id={`menu-${id}`} className={`${panel} ${align === 'right' ? 'right-0' : 'left-0'} ${width}`} style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}>{children}</div>}
    </li>
  );

  return (
    <header ref={wrap} className={`on-dark fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${open ? 'border-white/10 bg-black/90 backdrop-blur-xl' : 'border-transparent bg-gradient-to-b from-black/60 to-transparent'}`}>
      <nav className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8" aria-label="Main">
        <a href="#top" onClick={(e) => { e.preventDefault(); jump('top'); }} aria-label="United Medication home" className="shrink-0"><Wordmark tone="dark" /></a>

        <ul className="hidden items-center lg:flex">
          <li><a href="#top" onClick={(e) => { e.preventDefault(); jump('top'); }} className={trigger}>Home</a></li>
          <Drop id="platform" label="Platform" width="w-[300px]">
            <p className="eyebrow px-3 pb-1 pt-2">Five connected portals</p>
            {PORTALS.map(({ role, icon: Icon, title }) => (
              <button key={role} onClick={() => portal(role)} className={row}>
                <Icon className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden />
                <span className="flex-1 text-[13.5px] font-semibold text-white">{role === 'admin' ? 'Government Administration' : `${title} Portal`}</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-champagne" aria-hidden />
              </button>
            ))}
          </Drop>
          <Drop id="solutions" label="Solutions" width="w-[360px]">
            {SOLUTIONS.map(({ id, icon: Icon, title, text }) => (
              <button key={id} onClick={() => jump(id)} className={`${row} !items-start`}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gold/30 text-champagne"><Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden /></span>
                <span><span className="block text-[13.5px] font-semibold text-white">{title}</span><span className="mt-0.5 block text-[12px] leading-snug text-white/55">{text}</span></span>
              </button>
            ))}
          </Drop>
          <Drop id="about" label="About" width="w-[260px]">
            <button onClick={() => info('about')} className={row}><Info className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden /><span className="text-[13.5px] font-semibold text-white">About United Medication</span></button>
            <button onClick={() => jump('contact')} className={row}><Mail className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden /><span className="text-[13.5px] font-semibold text-white">Contact</span></button>
          </Drop>
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <LangSelect tone="dark" className="!h-9 !w-[88px] !px-1.5 !text-[11.5px]" />
            <div className="relative" onMouseEnter={() => hoverOpen('login')} onMouseLeave={hoverClose} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) hoverClose(); }}>
              <button onClick={() => setMenu((v) => (v === 'login' ? null : 'login'))} aria-expanded={menu === 'login'} aria-haspopup="true" className={`${trigger} ${menu === 'login' ? '!text-white' : ''}`}>Login</button>
              {menu === 'login' && (
                <div className={`${panel} right-0 w-[280px]`} style={{ transformOrigin: 'top right' }}>
                  <p className="eyebrow px-3 pb-1 pt-2">Sign in as</p>
                  {PORTALS.map(({ role, icon: Icon, title }) => (
                    <button key={role} onClick={() => portal(role)} className={row}>
                      <Icon className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden />
                      <span className="flex-1 text-[13.5px] font-semibold text-white">{title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setDrawer((v) => !v)} aria-expanded={drawer} aria-controls="mobile-nav" aria-label={drawer ? 'Close menu' : 'Open menu'} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white lg:hidden">
            {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {drawer && (
        <div id="mobile-nav" className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-white/10 bg-black px-5 pb-8 pt-2 lg:hidden">
          <button onClick={() => jump('top')} className="flex min-h-[50px] w-full items-center border-b border-white/[0.07] text-left text-[16px] font-semibold text-white">Home</button>
          {groups.map(([id, label, items]) => (
            <div key={id} className="border-b border-white/[0.07]">
              <button onClick={() => setAcc((v) => (v === id ? null : id))} aria-expanded={acc === id} className="flex min-h-[50px] w-full items-center justify-between text-left text-[16px] font-semibold text-white">
                {label}<ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${acc === id ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {acc === id && (
                <ul className="pb-3">
                  {items.map(([t, fn]) => <li key={t}><button onClick={fn} className="flex min-h-[44px] w-full items-center pl-4 text-left text-[14.5px] text-white/70 hover:text-champagne">{t}</button></li>)}
                </ul>
              )}
            </div>
          ))}
          <button onClick={() => { setAcc((v) => (v === 'login' ? null : 'login')); }} aria-expanded={acc === 'login'} className="flex min-h-[50px] w-full items-center justify-between border-b border-white/[0.07] text-left text-[16px] font-semibold text-white">
            Login<ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${acc === 'login' ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {acc === 'login' && (
            <ul className="pb-3">{PORTALS.map((p) => <li key={p.role}><button onClick={() => portal(p.role)} className="flex min-h-[44px] w-full items-center pl-4 text-left text-[14.5px] text-white/70 hover:text-champagne">{p.title}</button></li>)}</ul>
          )}
          <div className="mt-6"><LangSelect tone="dark" className="w-full !h-11" /></div>
        </div>
      )}
    </header>
  );
}
