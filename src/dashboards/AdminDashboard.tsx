import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Stethoscope, FileText, Pill, Calendar, Bell, UserCircle, FileCheck,
  CreditCard, Upload, UserPlus,
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { MhdUser } from '../lib/types';
import PortalShell, { PortalLoading, useTabNav, type NavItem } from '../components/PortalShell';
import NotificationBell from '../components/NotificationBell';

import AdminHomeTab from '../tabs/admin/AdminHomeTab';
import AdminPatientsTab from '../tabs/admin/AdminPatientsTab';
import AdminDoctorsTab from '../tabs/admin/AdminDoctorsTab';
import HospitalRequestsTab from '../tabs/admin/HospitalRequestsTab';
import AdminCasesTab from '../tabs/admin/AdminCasesTab';
import AdminMedicinesTab from '../tabs/admin/AdminMedicinesTab';
import AdminAppointmentsTab from '../tabs/admin/AdminAppointmentsTab';
import AdminBillingTab from '../tabs/admin/AdminBillingTab';
import AdminReportsTab from '../tabs/admin/AdminReportsTab';
import UploadResultTab from '../tabs/admin/UploadResultTab';
import NotificationsTab from '../tabs/shared/NotificationsTab';
import SettingsTab from '../tabs/shared/SettingsTab';

const BASE_NAV: NavItem[] = [
  { key: 'hdash', label: 'hdash', icon: LayoutDashboard, group: 'Overview' },
  { key: 'hpatients', label: 'hpatients', icon: Users, group: 'People' },
  { key: 'hdoctors', label: 'hdoctors', icon: Stethoscope, group: 'People' },
  { key: 'hrequests', label: 'Hospital Requests', icon: UserPlus, group: 'People' },
  { key: 'hcases', label: 'hcases', icon: FileText, group: 'Operations' },
  { key: 'hmeds', label: 'hmeds', icon: Pill, group: 'Operations' },
  { key: 'happts', label: 'happts', icon: Calendar, group: 'Operations' },
  { key: 'hdocs', label: 'hdocs', icon: FileCheck, group: 'Operations' },
  { key: 'hupload', label: 'hupload', icon: Upload, group: 'Operations' },
  { key: 'billing', label: 'billing', icon: CreditCard, group: 'Operations' },
  { key: 'notifs', label: 'notifs', icon: Bell, group: 'Account' },
  { key: 'myinfo', label: 'myinfo', icon: UserCircle, group: 'Account' },
];
const KEYS = BASE_NAV.map((n) => n.key);

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<MhdUser | null>(null);
  const [pending, setPending] = useState(0);
  // 'dashboard' is what the search palette and shared tabs send for "home"
  const [tab, go] = useTabNav(KEYS, 'hdash', { dashboard: 'hdash', Dashboard: 'hdash', settings: 'myinfo' });

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) setMe({ id: snap.id, ...snap.data() } as MhdUser);
    });
  }, []);

  // Live count of pending doctor join requests for this hospital
  useEffect(() => {
    if (!me?.id) return;
    return onSnapshot(collection(db, 'hospital_requests'), (snap) => {
      setPending(snap.docs.filter((d) => {
        const data = d.data();
        const sameName = data.hospitalName && me.name && data.hospitalName.trim().toLowerCase() === me.name.trim().toLowerCase();
        return (data.hospitalId === me.id || sameName) && data.status === 'pending';
      }).length);
    });
  }, [me?.id, me?.name]);

  const logout = async () => {
    try { await signOut(auth); } catch { /* local state is cleared anyway */ }
    onLogout();
  };

  if (!me) return <div className="flex h-screen items-center justify-center bg-app"><PortalLoading /></div>;

  const nav = BASE_NAV.map((n) => (n.key === 'hrequests' ? { ...n, badge: pending } : n));

  return (
    <PortalShell
      portalLabel="Hospital Portal" nav={nav} active={tab} onActive={go}
      user={{ name: me.name, sub: me.licenseNo }} onLogout={logout} searchRole="hospital"
      onNotifications={<NotificationBell onOpen={() => go('notifs')} />}
    >
      {tab === 'hdash' && <AdminHomeTab adminData={me} go={go} />}
      {tab === 'hpatients' && <AdminPatientsTab adminData={me} />}
      {tab === 'hdoctors' && <AdminDoctorsTab adminData={me} />}
      {tab === 'hrequests' && <HospitalRequestsTab adminData={me} />}
      {tab === 'hcases' && <AdminCasesTab adminData={me} />}
      {tab === 'hmeds' && <AdminMedicinesTab adminData={me} />}
      {tab === 'happts' && <AdminAppointmentsTab adminData={me} />}
      {tab === 'hdocs' && <AdminReportsTab adminData={me} />}
      {tab === 'hupload' && <UploadResultTab adminData={me} />}
      {tab === 'billing' && <AdminBillingTab adminData={me} />}
      {tab === 'notifs' && <NotificationsTab />}
      {tab === 'myinfo' && <SettingsTab me={me} onSaved={setMe} />}
    </PortalShell>
  );
}
