import { lazy, Suspense } from 'react';
import { PortalLoading } from './components/PortalShell';
import { useSession } from './auth/session';
import LandingPage from './landing/LandingPage';
import AuthScreen from './auth/AuthScreen';

// Each portal is its own chunk: visitors only download the one they open.
const DASHBOARDS = {
  patient: lazy(() => import('./dashboards/PatientDashboard')),
  caretaker: lazy(() => import('./dashboards/CaretakerDashboard')),
  doctor: lazy(() => import('./dashboards/DoctorDashboard')),
  hospital: lazy(() => import('./dashboards/AdminDashboard')),
  admin: lazy(() => import('./dashboards/GovernmentAdminDashboard')),
};

export default function App() {
  const s = useSession();

  if (!s.authReady) return <div className="flex min-h-screen items-center justify-center bg-black"><PortalLoading label="Loading…" /></div>;

  if (s.loggedIn) {
    const Dashboard = DASHBOARDS[s.loggedIn];
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-app"><PortalLoading /></div>}>
        <Dashboard onLogout={s.logout} />
      </Suspense>
    );
  }

  if (s.portal) return <AuthScreen s={s} onBack={() => s.selectPortal(null, false)} />;

  return (
    <LandingPage
      onLogin={(r) => s.selectPortal(r, false)}
      onSignup={(r) => s.selectPortal(r, true)}
      onDemo={s.quickDemo}
      onAdmin={() => s.selectPortal('admin', false)}
      authLoading={s.authLoading}
    />
  );
}
