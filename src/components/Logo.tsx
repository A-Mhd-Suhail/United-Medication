/** United Medication mark: a gold hexagon with a solid core, on black. */
export function Logo({ className = 'h-9 w-9', plain = false }: { className?: string; plain?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="United Medication" xmlns="http://www.w3.org/2000/svg">
      {!plain && <rect width="32" height="32" rx="8" fill="#0a0a0a" stroke="#c6a15b" strokeOpacity="0.45" />}
      <path fill="#c6a15b" d="M16 5L26 10.5V21.5L16 27L6 21.5V10.5L16 5ZM16 8.3L8.9 12.2V19.8L16 23.7L23.1 19.8V12.2L16 8.3Z" />
      <rect x="13" y="13" width="6" height="6" fill="#e1c58a" />
    </svg>
  );
}

const NETWORK = 'Internationally Digitalised HealthCare Network';

/**
 * Logo and name. Without `sub` the network line sits on ONE line beneath the logo, flush with the logo's
 * left edge. With `sub` (portal sidebars) the role label sits beside the logo instead.
 */
export function Wordmark({ tone = 'dark', sub, className = '' }: { tone?: 'dark' | 'light'; sub?: string; className?: string }) {
  const main = tone === 'dark' ? 'text-white' : 'text-heading';
  const accent = tone === 'dark' ? 'text-champagne' : 'text-gold-ink';
  if (sub === undefined) {
    return (
      <span className={`flex min-w-0 flex-col items-start gap-1.5 ${className}`} data-no-i18n>
        <span className="flex items-center gap-3">
          <Logo className="h-9 w-9 shrink-0" />
          <span className={`font-display whitespace-nowrap text-[17px] font-medium leading-none tracking-[0.01em] ${main}`}>United Medication</span>
        </span>
        <span className={`whitespace-nowrap text-[7px] font-extrabold uppercase leading-none tracking-[0.07em] min-[430px]:text-[8.5px] min-[430px]:tracking-[0.12em] ${accent}`}>{NETWORK}</span>
      </span>
    );
  }
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`} data-no-i18n>
      <Logo className="h-9 w-9 shrink-0" />
      <span className="min-w-0 leading-none">
        <span className={`font-display block truncate text-[17px] font-medium tracking-[0.01em] ${main}`}>United Medication</span>
        <span className={`mt-1.5 block truncate text-[9.5px] font-extrabold uppercase tracking-[0.2em] ${accent}`}>{sub}</span>
      </span>
    </span>
  );
}
