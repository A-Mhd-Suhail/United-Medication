import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, Building2, CalendarDays, Stethoscope, Users, UserCircle, Search } from 'lucide-react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import type { Appointment, MhdUser } from '../lib/types';
import NotificationsTab from '../tabs/shared/NotificationsTab';
import SettingsTab from '../tabs/shared/SettingsTab';
import PortalShell, { useTabNav, type NavItem } from '../components/PortalShell';
import { BarList, Composition, StatStrip } from '../components/Charts';
import { StatusChip } from '../tabs/common';

type Section = 'overview' | 'hospitals' | 'doctors' | 'patients' | 'appointments' | 'notifications' | 'myinfo';

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: Activity, group: 'Oversight' },
  { key: 'hospitals', label: 'Hospitals', icon: Building2, group: 'Oversight' },
  { key: 'doctors', label: 'Doctors', icon: Stethoscope, group: 'Oversight' },
  { key: 'patients', label: 'Patients', icon: Users, group: 'Oversight' },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays, group: 'Oversight' },
  { key: 'notifications', label: 'Notifications', icon: Bell, group: 'Account' },
  { key: 'myinfo', label: 'My Info', icon: UserCircle, group: 'Account' },
];
const KEYS = NAV.map((n) => n.key);
const ALIASES = { notifs: 'notifications', dashboard: 'overview', Dashboard: 'overview', settings: 'myinfo' };

export default function GovernmentAdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<MhdUser | null>(null);
  const [users, setUsers] = useState<MhdUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sectionKey, setSection] = useTabNav(KEYS, 'overview', ALIASES);
  const section = sectionKey as Section;
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All states');
  const [district, setDistrict] = useState('All districts');
  const [hospital, setHospital] = useState('All hospitals');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (s) => s.exists() && setMe({ id: s.id, ...s.data() } as MhdUser));
  }, []);

  useEffect(() => {
    const us = [
      onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() } as MhdUser)))),
      onSnapshot(collection(db, 'appointments'), (s) => setAppointments(s.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)))),
    ];
    return () => us.forEach((u) => u());
  }, []);

  const hospitals = users.filter((u) => u.role === 'hospital');
  const doctors = users.filter((u) => u.role === 'doctor');
  const patients = users.filter((u) => u.role === 'patient');

  const states = useMemo(() => ['All states', ...Array.from(new Set(users.map((u) => u.state).filter(Boolean)))], [users]);
  const districts = useMemo(() => ['All districts', ...Array.from(new Set(users.filter((u) => state === 'All states' || u.state === state).map((u) => u.district).filter(Boolean)))], [users, state]);
  const hospitalNames = useMemo(() => ['All hospitals', ...Array.from(new Set(hospitals.map((u) => u.name).filter(Boolean)))], [hospitals]);

  const matches = (v: unknown) => String(v || '').toLowerCase().includes(search.toLowerCase());
  const location = (u: MhdUser) => (state === 'All states' || u.state === state) && (district === 'All districts' || u.district === district);

  const fd = doctors.filter((u) => location(u) && (hospital === 'All hospitals' || u.hospital === hospital) && matches(`${u.name} ${u.email} ${u.regNo} ${u.hospital}`));
  const fp = patients.filter((u) => location(u) && matches(`${u.name} ${u.email} ${u.healthId} ${u.phone}`));
  const fh = hospitals.filter((u) => location(u) && matches(`${u.name} ${u.email} ${u.licenseNo}`));
  const byState = (rows: MhdUser[]): [string, number][] => {
    const m = new Map<string, number>();
    rows.forEach((u) => { if (u.state) m.set(u.state, (m.get(u.state) || 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  };
  const apptStatus: [string, number][] = (() => {
    const m = new Map<string, number>();
    appointments.forEach((a) => { const k = a.status ? a.status[0].toUpperCase() + a.status.slice(1) : 'Unknown'; m.set(k, (m.get(k) || 0) + 1); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  })();
  const fa = appointments.filter((a) => matches(`${a.patientName} ${a.doctorName} ${a.hospital} ${a.status}`));

  const logout = async () => {
    await signOut(auth).catch(() => { /* local state is cleared anyway */ });
    onLogout();
  };

  return (
    <PortalShell
      portalLabel="Govt Admin Portal" nav={NAV} active={section} onActive={setSection}
      user={{ name: me?.name || 'Government Administrator', sub: me?.adminName }} onLogout={logout} searchRole="admin"
    >
      <div className="mx-auto max-w-[1400px]">
              {section === 'notifications' ? (
                <NotificationsTab />
              ) : section === 'myinfo' ? (
                <div>
                  <div className="mb-6">
                    <h1 className="font-display tnum text-[36px] font-light leading-none text-heading">My Administrator Profile</h1>
                    <p className="text-muted text-sm mt-1">Manage government authority credentials and portal settings.</p>
                  </div>
                  <SettingsTab
                    me={me || { id: auth.currentUser?.uid || 'gov-admin', name: auth.currentUser?.displayName || 'Government Admin', role: 'admin', email: auth.currentUser?.email || 'admin@gov.in' } as MhdUser}
                    onSaved={setMe}
                  />
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="font-display text-[28px] font-medium leading-tight text-heading">
                        {section === 'overview' ? 'National Healthcare Dashboard' : section[0].toUpperCase() + section.slice(1)}
                      </h1>
                      <p className="text-muted text-sm mt-1">System-wide healthcare oversight, hospital registrations, and patient metrics.</p>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="card mb-6 p-4 sm:p-5">
                    <p className="eyebrow !text-muted mb-3">Geographic & Record Filters</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <label className="field-label !mb-0">
                        Search Query
                        <div className="relative mt-1">
                          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search records…"
                            className="field !min-h-[40px] !pl-9 !text-[13px]"
                          />
                        </div>
                      </label>

                      <label className="field-label !mb-0">
                        State
                        <select
                          value={state}
                          onChange={(e) => { setState(e.target.value); setDistrict('All districts'); }}
                          className="field !min-h-[40px] mt-1 !text-[13px]"
                        >
                          {states.map((x, i) => <option key={`st-${x}-${i}`}>{x}</option>)}
                        </select>
                      </label>

                      <label className="field-label !mb-0">
                        District
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="field !min-h-[40px] mt-1 !text-[13px]"
                        >
                          {districts.map((x, i) => <option key={`dst-${x}-${i}`}>{x}</option>)}
                        </select>
                      </label>

                      <label className="field-label !mb-0">
                        Hospital
                        <select
                          value={hospital}
                          onChange={(e) => setHospital(e.target.value)}
                          className="field !min-h-[40px] mt-1 !text-[13px]"
                        >
                          {hospitalNames.map((x, i) => <option key={`hosp-${x}-${i}`}>{x}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Main sections */}
                  {section === 'overview' && (
                    <div className="space-y-6">
                      <StatStrip items={[
                        { label: 'Registered Hospitals', value: hospitals.length, icon: <Building2 className="h-4 w-4 text-gold-ink" />, onClick: () => setSection('hospitals') },
                        { label: 'Verified Doctors', value: doctors.length, icon: <Stethoscope className="h-4 w-4 text-gold-ink" />, onClick: () => setSection('doctors') },
                        { label: 'Enrolled Patients', value: patients.length, icon: <Users className="h-4 w-4 text-gold-ink" />, onClick: () => setSection('patients') },
                        { label: 'Total Appointments', value: appointments.length, icon: <CalendarDays className="h-4 w-4 text-gold-ink" />, onClick: () => setSection('appointments') },
                      ]} />
                      <div className="grid gap-6 lg:grid-cols-3">
                        <Composition title="Appointments by status" parts={apptStatus.map(([label, value], i) => ({ label, value, cls: ({ Completed: 'bg-ok', Upcoming: 'bg-gold', Cancelled: 'bg-danger' } as Record<string, string>)[label] || ['bg-heading', 'bg-info', 'bg-ghost'][i % 3] }))} />
                        <BarList title="Patients by state" sub="Enrolled patients with a recorded state" data={byState(patients)} />
                        <BarList title="Hospitals by state" sub="Registered hospitals with a recorded state" data={byState(hospitals)} tone="gold" />
                      </div>
                    </div>
                  )}

                  {section === 'hospitals' && (
                    <DataTable
                      title={`Registered Hospitals (${fh.length})`}
                      headers={['Hospital Name', 'State', 'District', 'License No', 'Administrator', 'Email']}
                      rows={fh.map((u) => [u.name, u.state, u.district, u.licenseNo || 'Pending', u.adminName, u.email])}
                    />
                  )}

                  {section === 'doctors' && (
                    <DataTable
                      title={`Verified Doctors (${fd.length})`}
                      headers={['Doctor Name', 'State', 'District', 'Specialization', 'Hospital', 'Reg No']}
                      rows={fd.map((u) => [u.name && `Dr. ${u.name}`, u.state, u.district, u.specialization, u.hospital, u.regNo])}
                    />
                  )}

                  {section === 'patients' && (
                    <DataTable
                      title={`Enrolled Patients (${fp.length})`}
                      headers={['Patient Name', 'State', 'District', 'Health ID', 'Phone', 'Email']}
                      rows={fp.map((u) => [u.name, u.state, u.district, u.healthId, u.phone, u.email])}
                    />
                  )}

                  {section === 'appointments' && (
                    <DataTable
                      title={`System Appointments (${fa.length})`}
                      headers={['Patient', 'Doctor', 'Hospital', 'Date & Time', 'Status']}
                      rows={fa.map((a) => [a.patientName, a.doctorName, a.hospital, `${a.date} ${a.time}`, a.status])}
                    />
                  )}
                </>
              )}
      </div>
    </PortalShell>
  );
}

const PAGE = 12;

function DataTable({ title, headers, rows }: { title: string; headers: string[]; rows: unknown[][] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const slice = rows.slice(cur * PAGE, cur * PAGE + PAGE);
  const statusCol = headers.findIndex((h) => h === 'Status');
  const tone = (v: string) => (['completed', 'confirmed', 'approved'].includes(v.toLowerCase()) ? { ok: true } : ['cancelled', 'rejected'].includes(v.toLowerCase()) ? { danger: true } : {});
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <h2 className="font-display text-[21px] font-normal text-heading">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="p-10 text-center text-[13px] text-muted">No matching records found.</p>
      ) : (
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr>{headers.map((h, i) => <th className="whitespace-nowrap px-5 sm:px-6" key={`th-${h}-${i}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {slice.map((row, i) => (
                <tr key={`row-${cur}-${i}`}>
                  {row.map((cell, j) => (
                    <td className={`whitespace-nowrap px-5 py-3.5 sm:px-6 ${j === 0 ? 'font-bold text-heading' : 'text-ink'}`} key={`cell-${i}-${j}`}>
                      {j === statusCol && cell ? <StatusChip {...tone(String(cell))}>{String(cell)}</StatusChip> : String(cell ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > PAGE && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-[12.5px] text-muted sm:px-6">
          <span className="tnum">{cur * PAGE + 1}–{Math.min(rows.length, cur * PAGE + PAGE)} of {rows.length}</span>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</button>
            <button className="btn btn-outline btn-sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
}
