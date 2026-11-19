import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Activity, FileText, Pill, MessageSquare, DollarSign, Bell, UserCircle,
  Users, CalendarCheck, Building2, Radio,
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { MhdUser } from '../lib/types';
import PortalShell, { PortalLoading, useTabNav, type NavItem } from '../components/PortalShell';
import NotificationBell from '../components/NotificationBell';

import DoctorHomeTab from '../tabs/doctor/DoctorHomeTab';
import HealthInputTab from '../tabs/doctor/HealthInputTab';
import CasesTab from '../tabs/doctor/CasesTab';
import PatientsTab from '../tabs/doctor/PatientsTab';
import AppointmentsTab from '../tabs/doctor/AppointmentsTab';
import MessagesTab from '../tabs/doctor/MessagesTab';
import EarningsTab from '../tabs/doctor/EarningsTab';
import VerifyTab from '../tabs/doctor/VerifyTab';
import MyHospitalsTab from '../tabs/doctor/MyHospitalsTab';
import NotificationsTab from '../tabs/shared/NotificationsTab';
import SettingsTab from '../tabs/shared/SettingsTab';

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'healthinput', label: 'healthinput', icon: Activity, group: 'Clinical' },
  { key: 'cases', label: 'cases', icon: FileText, group: 'Clinical' },
  { key: 'verify', label: 'verify', icon: Pill, group: 'Clinical' },
  { key: 'chats', label: 'chats', icon: MessageSquare, group: 'Practice' },
  { key: 'patients', label: 'patients', icon: Users, group: 'Clinical' },
  { key: 'dappts', label: 'dappts', icon: CalendarCheck, group: 'Practice' },
  { key: 'earnings', label: 'earnings', icon: DollarSign, group: 'Practice' },
  { key: 'myhospitals', label: 'My Hospitals', icon: Building2, group: 'Practice' },
  { key: 'notifs', label: 'notifs', icon: Bell, group: 'Account' },
  { key: 'myinfo', label: 'myinfo', icon: UserCircle, group: 'Account' },
];
const KEYS = NAV.map((n) => n.key);

export default function DoctorDashboard({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<MhdUser | null>(null);
  const [tab, go] = useTabNav(KEYS, 'dashboard', { settings: 'myinfo' });
  const watchRef = useRef<number | null>(null);
  const lastSendRef = useRef(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) setMe({ id: snap.id, ...snap.data() } as MhdUser);
    });
  }, []);

  /* Duty + live location (GPS throttled to one write per 20s) */
  useEffect(() => {
    if (me?.onDuty && 'geolocation' in navigator) {
      watchRef.current = navigator.geolocation.watchPosition((pos) => {
        const now = Date.now();
        if (now - lastSendRef.current < 20000) return;
        lastSendRef.current = now;
        updateDoc(doc(db, 'users', me.id), {
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: now },
        }).catch(() => { /* location is best effort */ });
      }, () => { /* permission denied: stay on duty without GPS */ }, { enableHighAccuracy: true });
    } else if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [me?.onDuty, me?.id]);

  const setDuty = async (on: boolean) => {
    if (!me) return;
    try {
      await updateDoc(doc(db, 'users', me.id), on ? { onDuty: true } : { onDuty: false, location: deleteField() });
    } catch { /* surfaced by the live snapshot: the toggle stays unchanged */ }
  };

  const logout = async () => {
    if (me) { try { await updateDoc(doc(db, 'users', me.id), { onDuty: false, location: deleteField() }); } catch { /* best effort */ } }
    try { await signOut(auth); } catch { /* local state is cleared anyway */ }
    onLogout();
  };

  if (!me) return <div className="flex h-screen items-center justify-center bg-app"><PortalLoading /></div>;

  const duty = (
    <div className={`mt-3 rounded-xl border p-3.5 ${me.onDuty ? 'border-gold/50 bg-gold/10' : 'border-white/10 bg-white/[0.04]'}`}>
      <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${me.onDuty ? 'text-champagne' : 'text-on-navy-muted'}`}>
        <Radio className={`h-3.5 w-3.5 ${me.onDuty ? 'animate-pulse' : ''}`} aria-hidden />
        {me.onDuty ? 'On duty (GPS active)' : 'Off duty'}
      </p>
      <button onClick={() => setDuty(!me.onDuty)} className={`btn mt-2.5 w-full !min-h-[38px] text-[12px] ${me.onDuty ? 'btn-outline' : 'btn-gold'}`}>
        {me.onDuty ? 'Go Off Duty' : 'Go On Duty'}
      </button>
      <p className="mt-2 text-[10px] leading-snug text-on-navy-muted">
        {me.onDuty ? 'Live GPS broadcasting to emergency radar.' : 'Enable to broadcast live clinical availability.'}
      </p>
    </div>
  );

  return (
    <PortalShell
      portalLabel="Doctor Portal" nav={NAV} active={tab} onActive={go}
      user={{ name: `Dr. ${me.name}`, sub: me.specialization }}
      onLogout={logout} sidebarExtra={duty} searchRole="doctor"
      onNotifications={<NotificationBell onOpen={() => go('notifs')} />}
    >
      {tab === 'dashboard' && <DoctorHomeTab doctorData={me} go={go} />}
      {tab === 'healthinput' && <HealthInputTab doctorData={me} />}
      {tab === 'cases' && <CasesTab doctorData={me} />}
      {tab === 'verify' && <VerifyTab doctorData={me} />}
      {tab === 'chats' && <MessagesTab doctorData={me} />}
      {tab === 'patients' && <PatientsTab doctorData={me} />}
      {tab === 'dappts' && <AppointmentsTab doctorData={me} />}
      {tab === 'earnings' && <EarningsTab doctorData={me} />}
      {tab === 'myhospitals' && <MyHospitalsTab doctorData={me} />}
      {tab === 'notifs' && <NotificationsTab />}
      {tab === 'myinfo' && <SettingsTab me={me} onSaved={setMe} />}
    </PortalShell>
  );
}
