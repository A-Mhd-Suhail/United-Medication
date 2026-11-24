import React, { useEffect, useState } from 'react';
/** Firebase is loaded on demand: the public landing page must not pay for it. */
const fb = () => import('./fb');
const HINT = 'um_session';
import { toast } from '../components/Toaster';
import { uid6, errMsg } from '../lib/format';
import { curLang } from '../lib/i18n';
import type { Role } from '../lib/types';

export type PortalType = Role;

// NOTE: the administrator credential is checked in the browser. This is the
// pre-existing prototype design; production needs a server-side check
// (e.g. a Cloud Function that mints an admin custom token).
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '9100';
const ADMIN_EMAIL = 'admin.official@mhdhospital.in';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'GovAdmin#9100!MHD';

/* ---------- Demo accounts (identical to the original app) ---------- */
const DEMO_PASS = 'demo123';
const DEMO: Record<PortalType, { email: string; profile: Record<string, unknown> }> = {
  patient: {
    email: 'patient.demo@mhdhospital.in',
    profile: { role: 'patient', name: 'Demo Patient', dob: '1995-06-15', gender: 'Other', bloodGroup: 'O+', phone: '0000000000', aadhaar: '000000000000', address: 'Demo Address', emergencyName: 'Demo Contact', emergencyPhone: '0000000000', heightCm: '170', weightKg: '70', allergies: 'None recorded', conditions: 'Demo condition', surgeries: 'None recorded', accidents: 'None recorded', familyHistory: 'None recorded', income: '0', language: 'en', healthId: 'MHD-DEMO01', fingerprintEnrolled: true },
  },
  caretaker: {
    email: 'caretaker.demo@mhdhospital.in',
    profile: { role: 'caretaker', name: 'Demo Caretaker', phone: '0000000000', state: 'Demo State', district: 'Demo District', caretakerPatientId: '', caretakerPatientName: '' },
  },
  doctor: {
    email: 'doctor.demo@mhdhospital.in',
    profile: { role: 'doctor', name: 'Demo Doctor', specialization: 'General Medicine', experience: '5', hospital: 'Demo Hospital', regNo: 'DEMO-0000', phone: '0000000000', onDuty: false },
  },
  hospital: {
    email: 'hospital.demo@mhdhospital.in',
    profile: { role: 'hospital', name: 'Demo Hospital', adminName: 'Demo Administrator', phone: '0000000000', address: 'Demo Hospital Address', licenseNo: 'DEMO-HOSP-0000' },
  },
  admin: {
    email: 'admin.demo@mhdhospital.in',
    profile: { role: 'admin', name: 'MHD Admin', adminName: 'System Administrator', phone: '1800-MHD-ADMIN' },
  },
};

export function useSession() {
  const [portal, setPortal] = useState<PortalType | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedIn, setLoggedIn] = useState<PortalType | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Restore the active portal after a refresh from Firebase's persisted session;
  // the role always comes from the user's Firestore profile, never from local storage.
  useEffect(() => {
    let off: (() => void) | undefined;
    let cancelled = false;
    let returning = false;
    try { returning = localStorage.getItem(HINT) === '1'; } catch { /* storage may be blocked */ }
    // New visitors see the landing page immediately; only returning users wait for their session.
    if (!returning) setAuthReady(true);

    const start = async () => {
      const { auth, db, onAuthStateChanged, doc, getDoc } = await fb();
      if (cancelled) return;
      off = onAuthStateChanged(auth, async (user) => {
        try { user ? localStorage.setItem(HINT, '1') : localStorage.removeItem(HINT); } catch { /* storage may be blocked */ }
        if (!user) { setLoggedIn(null); setAuthReady(true); return; }
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          setLoggedIn((snap.data()?.role as PortalType | undefined) ?? null);
        } catch {
          setLoggedIn(null);
        } finally { setAuthReady(true); }
      });
    };
    // Returning users: now. Everyone else: after the landing page has painted.
    const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
    const handle = returning ? (void start(), 0) : idle ? idle(() => void start(), { timeout: 3000 }) : window.setTimeout(() => void start(), 1200);
    return () => {
      cancelled = true; off?.();
      if (!returning) { (window as any).cancelIdleCallback?.(handle); window.clearTimeout(handle); }
    };
  }, []);

  // Registration fields (MHD patient form is the full medical intake)
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const clearForm = () => { setEmail(''); setPassword(''); setF({}); setAuthError(''); };

  const selectPortal = (type: PortalType | null, registering: boolean) => {
    setPortal(type);
    setIsRegistering(type === 'admin' ? false : registering);
    clearForm();
  };

  /* ---------- auth handlers ---------- */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut, doc, setDoc, getDoc } = await fb();
    setAuthError('');
    if (!portal) return;

    if (portal === 'admin') {
      if (!password) { setAuthError('Please enter the Government Admin password.'); return; }
      if (password !== ADMIN_PASSWORD) { setAuthError('Invalid Government Admin password. Access denied.'); return; }
      setAuthLoading(true);
      try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        try {
          await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_SECRET);
        } catch {
          // First use: provision the official administrator account
          await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_SECRET);
        }
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Administrator sign-in failed. Please try again.');
        await setDoc(doc(db, 'users', uid), {
          role: 'admin', name: 'Government Healthcare Administrator', adminName: 'Government Administrator',
          phone: '1800-MHD-GOV', email: ADMIN_EMAIL, designation: 'National Health Authority Admin', official: true,
        }, { merge: true });
        setLoggedIn('admin');
      } catch (err) {
        setAuthError(errMsg(err)); // no fallback: a failed sign-in never opens the admin portal
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!email || !password) { setAuthError('Please fill in all required fields.'); return; }
    setAuthLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Role comes from the users doc (same as the original app)
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (!snap.exists()) {
        await signOut(auth);
        throw new Error('Profile missing. Please register again or contact support.');
      }
      const role = snap.data().role as PortalType;
      if (role !== portal) {
        await signOut(auth);
        const label = role === 'hospital' ? 'Hospital' : role === 'admin' ? 'Government Admin' : role;
        throw new Error(`This account is registered as ${label}. Please use the ${label} Portal.`);
      }
      setLoggedIn(portal);
    } catch (error) {
      setAuthError(errMsg(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgot = async () => {
    const { auth, sendPasswordResetEmail } = await fb();
    if (!email.trim()) { toast('Enter your email above first, then tap Forgot password.', 'info'); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast('Password reset email sent');
    } catch (error) {
      toast(errMsg(error), 'err');
    }
  };

  const handleDummyFingerprintLogin = async () => {
    const { loginWithFingerprint } = await fb();
    if (portal !== 'patient') return;
    setAuthError('');
    if (!email.trim()) {
      setAuthError('Enter the patient email first. Fingerprint sign-in is a demo simulation.');
      return;
    }
    // Real WebAuthn fingerprint login — Cloud Functions verify the biometric
    // and mint a custom token; onAuthStateChanged routes by the user's role.
    setAuthError('');
    setAuthLoading(true);
    try {
      await loginWithFingerprint();
    } catch (error) {
      setAuthError(errMsg(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { auth, db, createUserWithEmailAndPassword, doc, setDoc } = await fb();
    setAuthError('');
    if (!portal) return;
    const passOk = f.password && f.password.length >= 6;
    if (!passOk) { setAuthError('Password must be at least 6 characters.'); return; }
    const hasLocation = (value: string | undefined) => Boolean(value?.trim());
    if (portal === 'patient') {
      if (!f.name?.trim() || !f.dob || !f.phone?.trim() || !hasLocation(f.state) || !hasLocation(f.district)) { setAuthError('Name, date of birth, phone, state and district are required.'); return; }
      const aad = (f.aadhaar || '').replace(/\D/g, '');
      if (aad.length !== 12) { setAuthError('Aadhaar number must be exactly 12 digits.'); return; }
    }
    if (portal === 'doctor' && (!f.name?.trim() || !f.specialization?.trim() || !f.regNo?.trim() || !f.hospital?.trim() || !f.address?.trim() || !hasLocation(f.state) || !hasLocation(f.district))) { setAuthError('Doctor name, specialization, registration number, hospital, address, state and district are required.'); return; }
    if (portal === 'hospital' && (!f.name?.trim() || !f.address?.trim() || !hasLocation(f.state) || !hasLocation(f.district))) { setAuthError('Hospital name, address, state and district are required.'); return; }
    if (portal === 'caretaker' && (!f.name?.trim() || !hasLocation(f.state) || !hasLocation(f.district))) { setAuthError('Name, state and district are required.'); return; }
    if (portal === 'admin') { setAuthError('Account registration is disabled for the Admin Portal.'); return; }
    setAuthLoading(true);
    try {
      const emailToUse = (f.email || email).trim();
      const cred = await createUserWithEmailAndPassword(auth, emailToUse, f.password);
      try {
        const profile: Record<string, unknown> = {
          role: portal,
          email: emailToUse,
          language: curLang(),
          createdAt: Date.now(),
        };
        if (portal === 'patient') {
          Object.assign(profile, {
            name: f.name, dob: f.dob, gender: f.gender || 'Male', bloodGroup: f.bloodGroup || '',
            phone: f.phone, aadhaar: (f.aadhaar || '').replace(/\D/g, ''), address: f.address || '',
            emergencyName: f.emergencyName || '', emergencyPhone: f.emergencyPhone || '',
            heightCm: f.heightCm || '', weightKg: f.weightKg || '', allergies: f.allergies || '',
            conditions: f.conditions || '', surgeries: f.surgeries || '', accidents: f.accidents || '',
            familyHistory: f.familyHistory || '', income: f.income || '',
            healthId: 'MHD-' + uid6(), state: f.state, district: f.district,
            fingerprintEnrolled: f.fingerprintEnrolled === 'true',
          });
        } else if (portal === 'doctor') {
          Object.assign(profile, {
            name: f.name, specialization: f.specialization, experience: f.experience || '',
            hospital: f.hospital, regNo: f.regNo, phone: f.phone || '', address: f.address, state: f.state, district: f.district, onDuty: false,
          });
        } else if (portal === 'caretaker') {
          Object.assign(profile, { name: f.name, phone: f.phone || '', state: f.state, district: f.district });
        } else {
          Object.assign(profile, {
            name: f.name, adminName: f.adminName || '', phone: f.phone || '',
            address: f.address || '', licenseNo: f.licenseNo || '', state: f.state || '', district: f.district || '',
          });
        }
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        setLoggedIn(portal);
      } catch (dbError) {
        try { await auth.currentUser?.delete(); } catch { /* keep the original database error */ }
        throw dbError;
      }
    } catch (error) {
      setAuthError(errMsg(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const quickDemo = async (role: PortalType) => {
    const { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, doc, setDoc } = await fb();
    const d = DEMO[role];
    if (!d) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      const signedIn = await signInWithEmailAndPassword(auth, d.email, DEMO_PASS);
      const repairedProfile = { ...d.profile };
      if (role === 'caretaker') {
        delete repairedProfile.caretakerPatientId;
        delete repairedProfile.caretakerPatientName;
      }
      await setDoc(doc(db, 'users', signedIn.user.uid), { ...repairedProfile, email: d.email, role, updatedAt: Date.now() }, { merge: true });
      setLoggedIn(role);
    } catch {
      // First use — create the demo account (same as the original quickDemo)
      try {
        const cred = await createUserWithEmailAndPassword(auth, d.email, DEMO_PASS);
        await setDoc(doc(db, 'users', cred.user.uid), { ...d.profile, email: d.email, createdAt: Date.now() });
        if (role === 'caretaker') {
          const { setDoc: saveDoc, doc: makeDoc, addDoc, collection } = await import('firebase/firestore');
          const demoPatientId = 'caretaker-demo-patient';
          await saveDoc(makeDoc(db, 'users', demoPatientId), { role: 'patient', name: 'Caretaker Demo Patient', healthId: 'MHD-CARE01', state: 'Tamil Nadu', district: 'Chennai', createdAt: Date.now() }, { merge: true });
          await saveDoc(makeDoc(db, 'users', cred.user.uid), { caretakerPatientId: demoPatientId, caretakerPatientName: 'Caretaker Demo Patient' }, { merge: true });
          await addDoc(collection(db, 'medicines'), { patientId: demoPatientId, name: 'Demo medicine', dosage: '1 tablet after breakfast', startDate: new Date().toISOString().slice(0, 10), prescribedBy: 'Dr. Demo', verified: true, active: true, createdAt: Date.now() });
        }
        if (role === 'patient') {
          const { addDoc, collection } = await import('firebase/firestore');
          await addDoc(collection(db, 'medicines'), {
            patientId: cred.user.uid, name: 'Metformin 500mg', dosage: '1 tablet after breakfast',
            startDate: new Date().toISOString().slice(0, 10), durationDays: '30',
            prescribedBy: 'Demo Patient (self-reported)', verified: false, source: 'patient',
            active: true, createdAt: Date.now(),
          });
        }
        setLoggedIn(role);
      } catch (e2) {
        setAuthError(errMsg(e2));
      }
    }
    setAuthLoading(false);
  };

  const logout = () => { setLoggedIn(null); setPortal(null); };

  return {
    portal, isRegistering, setIsRegistering, loggedIn, authReady, email, setEmail, password, setPassword,
    rememberMe, setRememberMe, authLoading, authError, setAuthError, f, set,
    selectPortal, handleLogin, handleRegister, handleForgot, handleDummyFingerprintLogin, quickDemo, logout,
  };
}
