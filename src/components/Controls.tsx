import { LANGS, setLanguage, useLang } from '../lib/i18n';

/** Language switcher — changes every label instantly, no page reload. */
export function LangSelect({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const lang = useLang();
  const base = tone === 'dark'
    ? 'bg-charcoal text-white border-white/15 hover:border-gold'
    : 'bg-surface text-ink border-line hover:border-primary';
  return (
    <select
      aria-label="Language"
      title="Language"
      value={lang}
      onChange={(e) => setLanguage(e.target.value)}
      className={`h-9 rounded-lg border px-2 text-[12px] font-semibold ${base} ${className}`}
    >
      {LANGS.map(([v, n]) => <option key={v} value={v} className="bg-white text-black">{n}</option>)}
    </select>
  );
}
