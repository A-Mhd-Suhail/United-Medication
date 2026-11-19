import type { ReactNode } from 'react';

/** Horizontal bar list built from real counts. Pure CSS: no chart library, accessible as a list. */
export function BarList({ title, sub, data, empty = 'No data yet.', tone = 'dark' }: {
  title: string; sub?: string; data: [string, number][]; empty?: string; tone?: 'dark' | 'gold';
}) {
  const max = Math.max(1, ...data.map(([, v]) => v));
  const total = data.reduce((a, [, v]) => a + v, 0);
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="eyebrow !text-muted">{title}</h3>
      {sub && <p className="mt-1 text-[12.5px] text-muted">{sub}</p>}
      {data.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted">{empty}</p>
      ) : (
        <ul className="mt-5 space-y-3.5">
          {data.map(([label, value]) => (
            <li key={label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate font-semibold text-heading">{label}</span>
                <span className="tnum shrink-0 text-muted"><b className="font-bold text-heading">{value}</b>{total ? ` · ${Math.round((value / total) * 100)}%` : ''}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-app" role="presentation">
                <div className={`h-full rounded-full ${tone === 'gold' ? 'bg-gold' : 'bg-heading'}`} style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A single stacked bar showing parts of a whole, with a legend that never relies on colour alone. */
export function Composition({ title, parts }: { title: string; parts: { label: string; value: number; cls: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="eyebrow !text-muted">{title}</h3>
      {total === 0 ? <p className="py-8 text-center text-[13px] text-muted">No data yet.</p> : (
        <>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-app" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
            {parts.filter((p) => p.value).map((p) => <div key={p.label} className={p.cls} style={{ width: `${(p.value / total) * 100}%` }} />)}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
            {parts.map((p) => (
              <li key={p.label} className="flex items-center gap-2.5 text-[13px]">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${p.cls}`} aria-hidden />
                <span className="flex-1 truncate text-muted">{p.label}</span>
                <span className="tnum font-bold text-heading">{p.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function StatStrip({ items }: { items: { label: string; value: ReactNode; icon?: ReactNode; onClick?: () => void }[] }) {
  return (
    <dl className="card grid grid-cols-2 lg:grid-cols-4 [&>*]:border-line [&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t lg:[&>*]:border-t-0 lg:[&>*:not(:first-child)]:border-l">
      {items.map((it) => (
        <button key={it.label} onClick={it.onClick} disabled={!it.onClick} className="flex flex-col gap-3 p-5 text-left enabled:hover:bg-stripe sm:p-6">
          <dt className="flex items-center justify-between text-[12px] font-bold text-muted">{it.label}{it.icon}</dt>
          <dd className="font-display tnum text-[40px] font-light leading-none text-heading">{it.value}</dd>
        </button>
      ))}
    </dl>
  );
}
