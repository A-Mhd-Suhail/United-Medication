import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

/* Shared UI primitives for all portal feature tabs. */

export const inputCls = 'field !min-h-[40px] !text-[13px]';
export const labelCls = 'field-label';

export function PageHeader({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-display text-[28px] font-medium leading-tight text-heading sm:text-[32px]">{title}</h2>
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">{sub}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Section heading inside a page: small caps label, optional right-aligned action. */
export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="eyebrow !text-muted">{title}</h3>
      {action}
    </div>
  );
}

export function Loading() {
  return (
    <div className="card p-10 text-center" role="status">
      <Loader2 className="mx-auto h-5 w-5 animate-spin text-gold" aria-hidden />
      <p className="mt-3 text-[13px] font-medium text-muted">Loading feature data…</p>
    </div>
  );
}

export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="card border-dashed p-12 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-app text-gold-ink">
        {icon}
      </div>
      <p className="font-display text-[19px] font-medium text-heading">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{sub}</p>
    </div>
  );
}

export function StatusChip({ ok, warn, danger, children }: { ok?: boolean; warn?: boolean; danger?: boolean; children: ReactNode }) {
  const tone = ok
    ? 'text-ok bg-ok-bg border-ok-bd'
    : danger
      ? 'text-danger-d bg-danger-bg border-danger-bd'
      : 'text-warn-d bg-warn-bg border-warn-bd';
  const dot = ok ? 'bg-ok' : danger ? 'bg-danger' : 'bg-warn';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.08em] ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {children}
    </span>
  );
}

export function FilterPills({ filters, value, onChange }: { filters: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line">
      {filters.map((f, i) => {
        const on = value === f;
        return (
          <button
            key={`${f}-${i}`}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(f)}
            className={`-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-[13px] font-semibold ${
              on ? 'border-gold text-heading' : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}

export const btnGhost = 'btn btn-outline btn-sm';
export const btnPrimary = 'btn btn-gold btn-sm';
