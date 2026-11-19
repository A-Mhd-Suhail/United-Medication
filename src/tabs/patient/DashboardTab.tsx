import { useEffect, useState } from 'react';
import {
  Pill, CalendarClock, ListChecks, Bell, FileText, CalendarPlus, MessageSquare,
  AlertCircle, QrCode, Activity, Loader2, CheckCircle2, ArrowRight, TrendingUp, ShieldCheck,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { MhdUser, Medicine, Appointment, CaseDoc, TimelineEntry, ReportDoc, Bill } from '../../lib/types';
import { t } from '../../lib/i18n';
import { greetKey } from '../../lib/format';
import { fmtD, todayStr, schedTimeFromDosage, queueNumberOf, rupees } from '../../lib/format';
import { ActivityStreakCard } from './ActivityTab';

/** Patient dashboard — modern SaaS & AI-friendly clinical experience. */
export default function DashboardTab({ me, go }: { me: MhdUser; go: (tab: string) => void }) {
  const uid = me.id;
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifs, setNotifs] = useState<{ id: string; read: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const bind = <T,>(col: string, cb: (rows: T[]) => void, ...wheres: [string, unknown][]) => {
      let q: any = collection(db, col);
      wheres.forEach(([f, v]) => { q = query(q, where(f, '==', v)); });
      unsubs.push(onSnapshot(q, (s: any) => { cb(s.docs.map((d: any) => ({ id: d.id, ...d.data() }))); setLoading(false); }, () => setLoading(false)));
    };
    bind<Medicine>('medicines', setMeds, ['patientId', uid]);
    bind<Appointment>('appointments', setAppts, ['patientId', uid]);
    bind<CaseDoc>('cases', setCases, ['patientId', uid]);
    bind<TimelineEntry>('timeline', setTimeline, ['patientId', uid]);
    bind<ReportDoc>('reports', setReports, ['patientId', uid]);
    bind<Bill>('bills', setBills, ['patientId', uid]);
    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('to', '==', uid ?? '')),
      (s) => setNotifs(s.docs.map((d) => ({ id: d.id, read: !!d.data().read }))),
      () => { /* ignore */ },
    ));
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  if (loading) {
    return (
      <div className="max-w-[1120px] p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-ink mb-3" />
        <p className="text-sm font-medium text-muted">Syncing health records & vitals…</p>
      </div>
    );
  }

  const today = todayStr();
  const upcoming = appts.filter((a) => a.status === 'upcoming' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextAppt = upcoming[0];
  const activeMeds = meds.filter((m) => m.active !== false);
  const unread = notifs.filter((n) => !n.read).length;
  const reviewed = cases.filter((c) => c.status === 'reviewed').length;
  const healthPct = cases.length ? Math.round((reviewed / cases.length) * 100) : 100;
  const dueFollowups = timeline.filter((e) => e.type === 'followup' && e.due && e.due >= today);
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 100);
  const verifiedMeds = activeMeds.filter((m) => m.verified).length;
  const verifiedReports = reports.filter((r) => r.verified).length;
  const paidBills = bills.filter((b) => b.status === 'paid').length;
  const careBars: [string, number][] = [
    ['Cases reviewed', pct(reviewed, cases.length)],
    ['Meds verified', pct(verifiedMeds, activeMeds.length)],
    ['Results verified', pct(verifiedReports, reports.length)],
    ['Bills paid', pct(paidBills, bills.length)],
  ];
  const lastBill = [...bills].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

  const todaysMeds = activeMeds
    .map((m) => ({ ...m, at: schedTimeFromDosage(m.dosage || '') }))
    .sort((a, b) => a.at.localeCompare(b.at));

  const reco = cases.length === 0 ? t('recoStart') : healthPct === 100 ? t('recoGreat') : t('recoDoing');

  const quickActions: [string, typeof Pill, string][] = [
    [t('bookAppt'), CalendarPlus, t('appts')],
    [t('talkDoctor'), MessageSquare, t('doctors')],
    [t('newCase'), FileText, t('mycase')],
    [t('qr'), QrCode, t('qr')],
  ];

  const stats: [string, number, typeof Pill, string][] = [
    [t('activeSub'), activeMeds.length, Pill, t('meds')],
    [t('upcomingSub'), upcoming.length, CalendarClock, t('appts')],
    [t('totalSub'), reports.length, ListChecks, t('results')],
    [t('unreadSub'), unread, Bell, t('notifs')],
  ];
  const rowHead = 'flex items-center justify-between mb-3';
  const eyebrowCls = 'eyebrow !text-muted';
  const linkCls = 'text-[12px] font-bold text-gold-ink hover:underline';

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> MHD Verified Patient Profile</p>
          <h2 className="font-display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)] font-light leading-[1.08] text-heading">
            {t(greetKey())}, {me.name}
          </h2>
          <p className="mt-2 text-[13.5px] text-muted">
            Health ID <span className="font-mono font-bold text-heading">{me.healthId}</span> <span className="mx-1.5 text-ghost">|</span> Blood group <span className="font-semibold text-heading">{me.bloodGroup || 'O+'}</span>
          </p>
        </div>
        <button onClick={() => go(t('appts'))} className="btn btn-gold shrink-0"><CalendarPlus className="h-4 w-4" aria-hidden /> {t('bookAppt')}</button>
      </div>

      {/* Key figures: one strip, not four cards */}
      <dl className="card grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-line lg:[&>*:nth-child(n+3)]:border-t-0 [&>*:nth-child(even)]:border-l [&>*:nth-child(even)]:border-line lg:[&>*:nth-child(even)]:border-l-0">
        {stats.map(([label, val, Icon, navTab]) => (
          <button key={label} onClick={() => go(navTab)} className="group flex flex-col gap-3 p-5 text-left hover:bg-stripe sm:p-6">
            <dt className="flex items-center justify-between text-[12px] font-bold text-muted">
              {label}<Icon className="h-4 w-4 text-gold-ink" strokeWidth={1.6} aria-hidden />
            </dt>
            <dd className="font-display tnum text-[40px] font-light leading-none text-heading">{val}</dd>
          </button>
        ))}
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          {/* Next appointment: the one dark feature surface */}
          <section className="on-dark rounded-[10px] bg-black p-6 text-white sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="eyebrow">{t('nextApptLbl')}</h3>
              <CalendarClock className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden />
            </div>
            {nextAppt ? (
              <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="font-display text-[30px] font-light leading-tight">{nextAppt.doctorName}</p>
                  <p className="mt-2 text-[14px] text-white/70">{nextAppt.type}{nextAppt.hospital ? ` · ${nextAppt.hospital}` : ''}</p>
                  <p className="tnum mt-1 text-[14px] text-champagne">{fmtD(nextAppt.date)} · {nextAppt.time} · Queue #{queueNumberOf(appts, nextAppt)}</p>
                </div>
                <button onClick={() => go(t('appts'))} className="btn btn-outline btn-sm">{t('viewDetails')} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="font-display text-[24px] font-light text-white/90">{t('noUpcomingAppts')}</p>
                <button onClick={() => go(t('appts'))} className="btn btn-gold btn-sm">{t('bookAppt')} <ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
              </div>
            )}
            {dueFollowups.length > 0 && (
              <p className="mt-6 border-t border-white/10 pt-4 text-[13px] text-champagne">{t('followDue')}: {fmtD(dueFollowups[0].due)}</p>
            )}
          </section>

          {/* Today's medications */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <h3 className={eyebrowCls}>{t('todaysMeds')}</h3>
              <button onClick={() => go(t('meds'))} className={linkCls}>{t('viewAll')}</button>
            </div>
            {todaysMeds.length === 0 ? (
              <p className="p-8 text-center text-[13px] text-muted">No active medicines scheduled for today. You can add prescriptions in {t('meds')}.</p>
            ) : (
              <div className="custom-scrollbar overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead>
                    <tr>
                      {['Time', 'Medicine', 'Dosage', t('verifiedLbl')].map((h, i) => <th key={`${h}-${i}`} className="px-5 sm:px-6">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {todaysMeds.slice(0, 5).map((m) => (
                      <tr key={m.id}>
                        <td className="tnum px-5 py-3.5 font-mono text-muted sm:px-6">{m.at}</td>
                        <td className="px-5 py-3.5 font-bold text-heading sm:px-6">{m.name}</td>
                        <td className="px-5 py-3.5 text-ink sm:px-6">{m.dosage || '1 dose'}</td>
                        <td className="px-5 py-3.5 sm:px-6">
                          {m.verified ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ok"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Verified</span>
                          ) : (
                            <span className="text-[12px] font-semibold text-muted">Self-reported</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent: three lists in one card */}
          <section className="card grid divide-line md:grid-cols-3 md:divide-x [&>*]:p-5 sm:[&>*]:p-6 max-md:divide-y">
            <div>
              <div className={rowHead}><h3 className={eyebrowCls}>{t('allMeds')}</h3><button onClick={() => go(t('meds'))} className={linkCls}>{t('viewLink')}</button></div>
              {activeMeds.slice(0, 3).map((m) => (
                <p key={m.id} className="border-b border-line py-2 text-[13px] text-ink last:border-0">{m.name} <span className="text-muted">· {m.dosage}</span></p>
              ))}
              {activeMeds.length === 0 && <p className="text-[12.5px] text-muted">None yet</p>}
            </div>
            <div>
              <div className={rowHead}><h3 className={eyebrowCls}>{t('allResults')}</h3><button onClick={() => go(t('results'))} className={linkCls}>{t('viewLink')}</button></div>
              {reports.slice(-3).reverse().map((r) => (
                <p key={r.id} className="border-b border-line py-2 text-[13px] text-ink last:border-0">{r.title} <span className="text-muted">· {fmtD(r.date)}</span></p>
              ))}
              {reports.length === 0 && <p className="text-[12.5px] text-muted">None yet</p>}
            </div>
            <div>
              <div className={rowHead}><h3 className={eyebrowCls}>{t('billingHistory')}</h3><button onClick={() => go(t('billing'))} className={linkCls}>{t('viewLink')}</button></div>
              {lastBill ? (
                <p className="py-2 text-[13px] text-ink"><span className="tnum">{rupees(lastBill.total)}</span> <span className={`font-semibold ${lastBill.status === 'paid' ? 'text-ok' : 'text-danger'}`}>· {lastBill.status === 'paid' ? t('paidLbl') : t('pendingLbl')}</span></p>
              ) : <p className="text-[12.5px] text-muted">{t('noBillsYet')}</p>}
              {pendingBills.length > 0 && <p className="mt-1 text-[12px] font-semibold text-danger">{pendingBills.length} {t('pendingLbl').toLowerCase()}</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          {/* Health status */}
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className={eyebrowCls}>{t('healthStatus')}</h3>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ok"><TrendingUp className="h-3.5 w-3.5" aria-hidden /> Optimal</span>
            </div>
            <p className="font-display tnum mt-4 text-[56px] font-light leading-none text-heading">{healthPct}<span className="text-[28px] text-muted">%</span></p>
            <p className="mt-2 text-[12.5px] text-muted">{reviewed} of {cases.length} cases reviewed</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-app"><div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${healthPct}%` }} /></div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">{reco}</p>
            {cases.some((c) => c.status === 'waiting') && (
              <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-warn-bd bg-warn-bg p-3 text-[12.5px] font-medium text-warn-d"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t('waitingReview')}</p>
            )}
          </section>

          {/* Care progress */}
          <section className="card space-y-4 p-6">
            <h3 className={eyebrowCls}>{t('careStatus')}</h3>
            {careBars.map(([label, pct]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-[12.5px]"><span className="text-muted">{label}</span><span className="tnum font-bold text-heading">{pct}%</span></div>
                <div className="h-1 overflow-hidden rounded-full bg-app"><div className="h-full rounded-full bg-heading" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </section>

          {/* Quick actions */}
          <section className="card overflow-hidden">
            <h3 className={`${eyebrowCls} border-b border-line px-6 py-4`}>{t('quickActions')}</h3>
            <ul className="divide-y divide-line">
              {quickActions.map(([label, Icon, nav]) => (
                <li key={label}>
                  <button onClick={() => go(nav)} className="group flex min-h-[52px] w-full items-center gap-4 px-6 text-left hover:bg-stripe">
                    <Icon className="h-[18px] w-[18px] text-gold-ink" strokeWidth={1.5} aria-hidden />
                    <span className="flex-1 text-[14px] font-semibold text-heading">{label}</span>
                    <ArrowRight className="h-4 w-4 text-ghost transition-transform group-hover:translate-x-0.5 group-hover:text-gold-ink" aria-hidden />
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => go(t('tracking'))} className="group flex min-h-[52px] w-full items-center gap-4 px-6 text-left hover:bg-stripe">
                  <Activity className="h-[18px] w-[18px] text-gold-ink" strokeWidth={1.5} aria-hidden />
                  <span className="flex-1 text-[14px] font-semibold text-heading">{t('tracking')}</span>
                  <ArrowRight className="h-4 w-4 text-ghost transition-transform group-hover:translate-x-0.5 group-hover:text-gold-ink" aria-hidden />
                </button>
              </li>
            </ul>
          </section>

          <button onClick={() => go('Activity')} className="block w-full text-left"><ActivityStreakCard me={me} /></button>
        </aside>
      </div>
    </div>
  );
}
