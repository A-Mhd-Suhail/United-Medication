import { lazy, useEffect, useState } from 'react';
import {
  LayoutDashboard, CalendarClock, FileText, Pill, Activity, Calendar, QrCode, Bell, UserCircle,
  Stethoscope, HeartHandshake, ListChecks, Flame, History, CreditCard,
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { MhdUser } from '../lib/types';
import PortalShell, { PortalLoading, useTabNav, type NavItem } from '../components/PortalShell';
import EmergencyOverlay from '../components/EmergencyOverlay';
import NotificationBell from '../components/NotificationBell';

const DashboardTab = lazy(() => import('../tabs/patient/DashboardTab'));
const ActivityTab = lazy(() => import('../tabs/patient/ActivityTab'));
const UpcomingTab = lazy(() => import('../tabs/UpcomingTab'));
const MyCaseTab = lazy(() => import('../tabs/MyCaseTab'));
const MedicinesTab = lazy(() => import('../tabs/MedicinesTab'));
const ResultsTab = lazy(() => import('../tabs/ResultsTab'));
const AppointmentsTab = lazy(() => import('../tabs/AppointmentsTab'));
const MyDoctorsTab = lazy(() => import('../tabs/MyDoctorsTab'));
const MyCaretakerTab = lazy(() => import('../tabs/MyCaretakerTab'));
const TimelineTab = lazy(() => import('../tabs/TimelineTab'));
const HealthOverviewTab = lazy(() => import('../tabs/HealthOverviewTab'));
const MyQRTab = lazy(() => import('../tabs/MyQRTab'));
const BillingTab = lazy(() => import('../tabs/BillingTab'));
const NotificationsTab = lazy(() => import('../tabs/shared/NotificationsTab'));
const SettingsTab = lazy(() => import('../tabs/shared/SettingsTab'));

/** Navigation keys are dictionary keys, so labels translate and tabs resolve in every language. */
const NAV: NavItem[] = [
  { key: 'dashboard', label: 'dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'activity', label: 'Activity', icon: Flame, group: 'Overview' },
  { key: 'upcoming', label: 'upcoming', icon: CalendarClock, group: 'Overview' },
  { key: 'mycase', label: 'mycase', icon: FileText, group: 'Care' },
  { key: 'meds', label: 'meds', icon: Pill, group: 'Care' },
  { key: 'results', label: 'results', icon: ListChecks, group: 'Care' },
  { key: 'appts', label: 'appts', icon: Calendar, group: 'Care' },
  { key: 'doctors', label: 'doctors', icon: Stethoscope, group: 'Care' },
  { key: 'caretaker', label: 'My Caretaker', icon: HeartHandshake, group: 'Care' },
  { key: 'tracking', label: 'tracking', icon: Activity, group: 'Health identity' },
  { key: 'timeline', label: 'Timeline', icon: History, group: 'Health identity' },
  { key: 'qr', label: 'qr', icon: QrCode, group: 'Health identity' },
  { key: 'billing', label: 'Billing', icon: CreditCard, group: 'Health identity' },
  { key: 'notifs', label: 'notifs', icon: Bell, group: 'Account' },
  { key: 'myinfo', label: 'myinfo', icon: UserCircle, group: 'Account' },
];
const KEYS = NAV.map((n) => n.key);
const ALIASES = { settings: 'myinfo' };

export default function PatientDashboard({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<MhdUser | null>(null);
  const [emOpen, setEmOpen] = useState(false);
  const [tab, go] = useTabNav(KEYS, 'dashboard', ALIASES);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (!snap.exists()) return;
      const u = { id: snap.id, ...snap.data() } as MhdUser;
      setMe(u);
      try { localStorage.setItem('mhd_emergency', JSON.stringify(u)); } catch { /* storage may be blocked */ }
    });
  }, []);

  const logout = async () => {
    try { await signOut(auth); } catch { /* sign-out is best effort; local state is cleared anyway */ }
    onLogout();
  };

  if (!me) return <div className="flex h-screen items-center justify-center bg-app"><PortalLoading /></div>;

  return (
    <>
      <PortalShell
        portalLabel="Patient Portal" nav={NAV} active={tab} onActive={go}
        user={{ name: me.name, sub: me.healthId, photo: me.photo }}
        onLogout={logout} onEmergency={() => setEmOpen(true)} searchRole="patient"
        onNotifications={<NotificationBell onOpen={() => go('notifs')} />}
      >
        {tab === 'dashboard' && <DashboardTab me={me} go={go} />}
        {tab === 'activity' && <ActivityTab me={me} />}
        {tab === 'upcoming' && <UpcomingTab patientData={me} />}
        {tab === 'mycase' && <MyCaseTab patientData={me} />}
        {tab === 'meds' && <MedicinesTab patientData={me} />}
        {tab === 'results' && <ResultsTab patientData={me} />}
        {tab === 'appts' && <AppointmentsTab patientData={me} />}
        {tab === 'doctors' && <MyDoctorsTab patientData={me} />}
        {tab === 'caretaker' && <MyCaretakerTab patientData={me} />}
        {tab === 'timeline' && <TimelineTab patientData={me} />}
        {tab === 'tracking' && <HealthOverviewTab patientData={me} />}
        {tab === 'qr' && <MyQRTab patientData={me} />}
        {tab === 'billing' && <BillingTab patientData={me} />}
        {tab === 'notifs' && <NotificationsTab />}
        {tab === 'myinfo' && <SettingsTab me={me} onSaved={setMe} onNavigate={go} />}
      </PortalShell>
      {emOpen && <EmergencyOverlay me={me} onClose={() => setEmOpen(false)} />}
    </>
  );
}
