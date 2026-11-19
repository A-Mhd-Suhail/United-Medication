import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircle, ArrowLeft, ChevronDown, ChevronRight, Command, Home, Loader2, LogOut, Menu, RefreshCw, Search, Settings, UserCircle, X,
  type LucideIcon,
} from 'lucide-react';
import { LangSelect } from './Controls';
import GlobalSearchModal from './GlobalSearchModal';
import { Wordmark } from './Logo';
import { matchKey, t, useLang } from '../lib/i18n';

/* One shell for every role. A portal supplies its navigation, identity and
 * content; the shell owns layout, the mobile drawer, search, language and the
 * header controls — so every dashboard looks and behaves the same. */

export type NavItem = { key: string; label: string; icon: LucideIcon; badge?: number; group?: string };

type ShellProps = {
  portalLabel: string;
  nav: NavItem[];
  active: string;
  onActive: (key: string) => void;
  user: { name: string; sub?: string; photo?: string };
  onLogout: () => void;
  onEmergency?: () => void;
  sidebarExtra?: ReactNode;
  /** Nav key opened from the profile menu (defaults to 'myinfo'). */
  profileKey?: string;
  onNotifications?: ReactNode;
  searchRole?: string;
  children: ReactNode;
};

/** Active-tab state that survives language changes. Tabs call `go()` with any
 *  label (translated, English, or a key) and it resolves to a stable nav key. */
export function useTabNav(keys: string[], initial: string, extraAliases: Record<string, string> = {}) {
  const [active, setActive] = useState(initial);
  const joined = keys.join('|');
  const go = useCallback((label: string) => {
    const hit = extraAliases[label] || matchKey(label, joined.split('|'));
    if (hit) setActive(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined]);
  useEffect(() => {
    const onNav = (e: Event) => go(String((e as CustomEvent).detail ?? ''));
    window.addEventListener('mhd:navigate', onNav);
    return () => window.removeEventListener('mhd:navigate', onNav);
  }, [go]);
  return [active, go] as const;
}

export function PortalLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[240px] items-center justify-center gap-2.5 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden /> {label}
    </div>
  );
}

export default function PortalShell({
  portalLabel, nav, active, onActive, user, onLogout, onEmergency, sidebarExtra, onNotifications, searchRole = 'patient', profileKey = 'myinfo', children,
}: ShellProps) {
  const lang = useLang();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = nav.find((n) => n.key === active) ?? nav[0];
  const hasProfile = nav.some((n) => n.key === profileKey);

  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener('mhd:open-search', open);
    return () => window.removeEventListener('mhd:open-search', open);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);
  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: PointerEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('pointerdown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [menu]);

  // Group consecutive items that share a group label
  const groups: { label?: string; items: NavItem[] }[] = [];
  nav.forEach((n) => {
    const hit = groups.find((g) => g.label === n.group);
    if (hit) hit.items.push(n); else groups.push({ label: n.group, items: [n] });
  });

  const avatar = (size: string) => user.photo ? (
    <img src={user.photo} alt="" className={`${size} shrink-0 rounded-full object-cover ring-1 ring-gold/60`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full border border-gold/40 bg-charcoal-2 text-champagne`}>
      <UserCircle className="h-[60%] w-[60%]" strokeWidth={1.4} aria-hidden />
    </span>
  );

  const sidebar = (
    <aside className="on-dark flex h-full w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-black text-white" aria-label={`${portalLabel} navigation`}>
      <div className="flex h-[68px] shrink-0 items-center justify-between gap-3 px-5">
        <Wordmark tone="dark" sub={t(portalLabel)} />
        <button onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded-lg p-2 text-on-navy-muted hover:text-white lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-5 h-px bg-gradient-to-r from-gold/50 via-white/10 to-transparent" aria-hidden />

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-3">
        {groups.map((g, gi) => (
          <div key={`${g.label ?? 'main'}-${gi}`} className={gi > 0 ? 'mt-5' : ''}>
            {g.label && <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">{t(g.label)}</p>}
            <ul className="space-y-px">
              {g.items.map(({ key, label, icon: Icon, badge }) => {
                const on = key === current.key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => { onActive(key); setDrawer(false); }}
                      aria-current={on ? 'page' : undefined}
                      className={`group relative flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold ${
                        on ? 'bg-white/[0.07] text-white' : 'text-on-navy-muted hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      {on && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gold" aria-hidden />}
                      <Icon className={`h-[17px] w-[17px] shrink-0 ${on ? 'text-gold' : 'text-white/45 group-hover:text-champagne'}`} strokeWidth={1.6} aria-hidden />
                      <span className="flex-1 truncate">{t(label)}</span>
                      {badge ? <span className="rounded-full bg-gold px-1.5 py-px text-[10px] font-extrabold text-black">{badge}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {sidebarExtra}
      </nav>

      {onEmergency && (
        <div className="shrink-0 px-3 pb-3">
          <button
            onClick={onEmergency}
            className="flex min-h-[42px] w-full items-center gap-3 rounded-lg border border-danger/50 bg-danger/10 px-3 text-[13px] font-bold text-[#F0B8B8] hover:bg-danger hover:text-white"
          >
            <AlertCircle className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} aria-hidden />
            {t('emergencyBtn')}
          </button>
        </div>
      )}

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          {avatar('h-9 w-9')}
          <div className="min-w-0 flex-1" data-no-i18n>
            <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
            {user.sub && <p className="truncate font-mono text-[11px] text-on-navy-muted">{user.sub}</p>}
          </div>
        </div>
      </div>
    </aside>
  );

  const headerBtn = 'flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-active hover:text-heading';
  const menuItem = 'flex min-h-[40px] w-full items-center gap-3 rounded-md px-3 text-left text-[13px] font-semibold text-ink hover:bg-active';

  return (
    <div className="flex h-screen overflow-hidden bg-app font-sans text-ink">
      <div className="hidden h-full lg:block">{sidebar}</div>

      {drawer && (
        <div className="fixed inset-0 z-[80] flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="animate-in fade-in h-full max-w-[85vw]">{sidebar}</div>
          <button className="flex-1 bg-black/60 backdrop-blur-[2px]" onClick={() => setDrawer(false)} aria-label="Close menu" />
        </div>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="relative z-30 flex h-[60px] shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className={`${headerBtn} border border-line lg:hidden`}>
              <Menu className="h-5 w-5" />
            </button>
            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 whitespace-nowrap text-[13px] sm:flex">
              <span className="text-muted">{t(portalLabel)}</span>
              {current.group && (<><ChevronRight className="h-3.5 w-3.5 text-ghost" aria-hidden /><span className="text-muted">{t(current.group)}</span></>)}
              <ChevronRight className="h-3.5 w-3.5 text-ghost" aria-hidden />
              <span aria-current="page" className="truncate font-bold text-heading">{t(current.label)}</span>
            </nav>
            <span className="truncate text-[14px] font-bold text-heading sm:hidden">{t(current.label)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 w-[260px] items-center gap-2.5 whitespace-nowrap rounded-lg border border-line bg-app px-3 text-[12.5px] font-medium text-muted hover:border-gold xl:flex"
            >
              <Search className="h-3.5 w-3.5 text-gold-ink" aria-hidden />
              <span className="flex-1 text-left">{t('Search features…')}</span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px]"><Command className="h-3 w-3" aria-hidden />K</kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className={`${headerBtn} xl:hidden`}><Search className="h-[18px] w-[18px]" /></button>
            {onNotifications}
            <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-haspopup="menu" aria-label="Account menu"
                className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 hover:bg-active sm:pr-2"
              >
                {avatar('h-7 w-7')}
                <ChevronDown className={`hidden h-3.5 w-3.5 text-muted transition-transform sm:block ${menu ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              {menu && (
                <div role="menu" className="pop-in absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-xl border border-line bg-surface p-1.5 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-line px-3 pb-3 pt-2" data-no-i18n>
                    {avatar('h-10 w-10')}
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold text-heading">{user.name}</p>
                      {user.sub && <p className="truncate font-mono text-[11px] text-muted">{user.sub}</p>}
                    </div>
                  </div>
                  <div className="py-1.5">
                    {hasProfile && (
                      <button role="menuitem" className={menuItem} onClick={() => { onActive(profileKey); setMenu(false); }}>
                        <Settings className="h-4 w-4 text-gold-ink" aria-hidden /> {t('Profile & settings')}
                      </button>
                    )}
                    <button role="menuitem" className={menuItem} onClick={() => { onActive(nav[0].key); setMenu(false); }}><Home className="h-4 w-4 text-gold-ink" aria-hidden /> {t('Home')}</button>
                    <button role="menuitem" className={menuItem} onClick={() => { window.history.back(); setMenu(false); }}><ArrowLeft className="h-4 w-4 text-gold-ink" aria-hidden /> {t('Back')}</button>
                    <button role="menuitem" className={menuItem} onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 text-gold-ink" aria-hidden /> {t('Refresh portal')}</button>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2.5">
                    <span className="text-[12px] font-semibold text-muted">{t('Language')}</span>
                    <LangSelect />
                  </div>
                  <div className="border-t border-line pt-1.5">
                    <button role="menuitem" onClick={onLogout} className={`${menuItem} text-danger-d hover:bg-danger-bg`}>
                      <LogOut className="h-4 w-4" aria-hidden /> {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="main" className="custom-scrollbar relative flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
          {/* Remount on tab or language change so every t() call re-evaluates */}
          <div key={`${current.key}-${lang}`} className="animate-in fade-in mx-auto w-full max-w-[1320px]">
            <Suspense fallback={<PortalLoading />}>{children}</Suspense>
          </div>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => { window.dispatchEvent(new CustomEvent('mhd:navigate', { detail: tab })); setSearchOpen(false); }}
        userRole={searchRole}
      />
    </div>
  );
}
