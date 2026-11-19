import { useState } from 'react';
import { ArrowLeft, Fingerprint, Loader2, ShieldCheck, Stethoscope, HeartHandshake, User, Building2, Eye, EyeOff } from 'lucide-react';
import MicButton from '../components/MicButton';
import { LangSelect } from '../components/Controls';
import { Wordmark } from '../components/Logo';
import { toast } from '../components/Toaster';
import type { useSession, PortalType } from './session';

type Session = ReturnType<typeof useSession>;

const COPY: Record<PortalType, { icon: typeof User; title: string; desc: string; signIn: string; register: string; registerBtn: string }> = {
  patient: { icon: User, title: 'Patient Portal', desc: 'Your health identity, medicines, appointments and records in one secure place.', signIn: 'Patient Sign In', register: 'Create Patient Account', registerBtn: 'Create Health ID' },
  caretaker: { icon: HeartHandshake, title: 'Caretaker Portal', desc: "Follow a patient's medicines and care tasks with confidence.", signIn: 'Caretaker Sign In', register: 'Register as Caretaker', registerBtn: 'Register Caretaker' },
  doctor: { icon: Stethoscope, title: 'Doctor Portal', desc: 'Review cases, record vitals, verify medicines and manage appointments.', signIn: 'Doctor Sign In', register: 'Register as Doctor', registerBtn: 'Register as Doctor' },
  hospital: { icon: Building2, title: 'Hospital Portal', desc: 'Run hospital operations: doctors, patients, appointments, billing and reports.', signIn: 'Hospital Sign In', register: 'Register Hospital', registerBtn: 'Register Hospital' },
  admin: { icon: ShieldCheck, title: 'Government Admin Portal', desc: 'National oversight of hospitals, doctors, patients and appointments.', signIn: 'Government Admin Portal', register: '', registerBtn: '' },
};

export default function AuthScreen({ s, onBack }: { s: Session; onBack: () => void }) {
  const { portal, isRegistering, setIsRegistering, authLoading, authError, setAuthError, f, set, email, setEmail, password, setPassword, rememberMe, setRememberMe } = s;
  const [showPw, setShowPw] = useState(false);
  if (!portal) return null;
  const c = COPY[portal];
  const Icon = c.icon;
  const isAdmin = portal === 'admin';

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Brand panel */}
      <aside className="on-dark relative hidden flex-col justify-between overflow-hidden bg-black p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <img src="./img/hospital.jpg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" aria-hidden />
        <button onClick={onBack} aria-label="Back to home" className="relative w-fit text-left"><Wordmark tone="dark" /></button>
        <div className="relative max-w-md">
          <span className="mb-7 flex h-12 w-12 items-center justify-center rounded-lg border border-gold/40 text-champagne"><Icon className="h-6 w-6" strokeWidth={1.3} aria-hidden /></span>
          <p className="eyebrow">United Medication</p>
          <h1 className="font-display mt-4 text-[48px] font-light leading-[1.04] text-white">{c.title}</h1>
          <div className="gold-rule mt-7 w-24" aria-hidden />
          <p className="mt-6 text-[15.5px] leading-relaxed text-white/65">{c.desc}</p>
        </div>
        <p className="relative text-[12px] text-white/45">One health ID, lifelong safety</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-10">
          <button type="button" onClick={onBack} className="btn btn-outline !min-h-[40px] text-[13px]">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to home
          </button>
          <LangSelect />
        </div>

        <div className="flex flex-1 items-start justify-center px-5 pb-16 pt-4 sm:px-10 lg:items-center">
          <div className="w-full max-w-[640px] rounded-[10px] border border-line bg-surface p-6 shadow-md sm:p-10">
            <div className="mb-1 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-champagne"><Icon className="h-5 w-5" aria-hidden /></span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-ink">{c.title}</span>
            </div>
            <h2 className="font-display text-[32px] font-light leading-tight text-heading">{isRegistering ? c.register : c.signIn}</h2>
            <p className="mb-6 mt-1.5 border-b border-line pb-5 text-[13px] text-muted">
              {isRegistering ? 'Create your account to continue.' : isAdmin ? 'Enter the official government administrator password to proceed.' : 'Login to continue to your health portal'}
            </p>

            {authError && (
              <div role="alert" className="mb-5 rounded-xl border border-danger-bd bg-danger-bg p-3.5 text-[13px] font-medium text-danger-d">{authError}</div>
            )}

            {!isRegistering ? (
              <form onSubmit={s.handleLogin} className="space-y-4">
                {!isAdmin && (
                  <div>
                    <label htmlFor="auth-email" className="field-label">Email address</label>
                    <input id="auth-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="Enter your email address" />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-pw" className="field-label">{isAdmin ? 'Administrator Password' : 'Password'}</label>
                  <div className="relative">
                    <input id="auth-pw" type={showPw ? 'text' : 'password'} required autoComplete={isAdmin ? 'off' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-12" placeholder={isAdmin ? 'Enter administrator password' : 'Enter your password'} autoFocus={isAdmin} />
                    <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-heading">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4" /> Remember me
                  </label>
                  {!isAdmin && <button type="button" onClick={s.handleForgot} className="text-[13px] font-bold text-gold-ink hover:underline">Forgot password?</button>}
                </div>
                <button type="submit" disabled={authLoading} className="btn btn-gold w-full">
                  {authLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Signing in" /> : isAdmin ? 'Access Admin Portal' : 'Sign In'}
                </button>
                {portal === 'patient' && (
                  <button type="button" onClick={s.handleDummyFingerprintLogin} disabled={authLoading} className="btn btn-outline w-full">
                    <Fingerprint className="h-4 w-4" aria-hidden /> Continue with fingerprint (demo)
                  </button>
                )}
                {!isAdmin && (
                  <p className="pt-2 text-center">
                    <button type="button" onClick={() => { setIsRegistering(true); setAuthError(''); }} className="text-[13px] font-bold text-gold-ink hover:underline">
                      Don&apos;t have an account? Create an account
                    </button>
                  </p>
                )}
              </form>
            ) : (
              /* ---------- REGISTER ---------- */
        <form onSubmit={s.handleRegister} className="space-y-1">
                  

                          <div className="space-y-3">
                            {portal === 'patient' && (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <FieldWithMic label="Full Name *" value={f.name || ''} onChange={(v) => set('name', v)} required />
                                  <div>
                                    <label className="field-label">Date of Birth *</label>
                                    <input type="date" required value={f.dob || ''} onChange={(e) => set('dob', e.target.value)} className="field" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="field-label">Gender *</label>
                                    <select value={f.gender || 'Male'} onChange={(e) => set('gender', e.target.value)} className="field">
                                      <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="field-label">Blood Group</label>
                                    <select value={f.bloodGroup || ''} onChange={(e) => set('bloodGroup', e.target.value)} className="field">
                                      <option value="">Select</option>
                                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><label className="field-label">Phone *</label><input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} className="field" /></div>
                                  <div><label className="field-label">Aadhaar Number *</label><input value={f.aadhaar || ''} onChange={(e) => set('aadhaar', e.target.value)} className="field" placeholder="12-digit" maxLength={12} /></div>
                                </div>
                                <FieldWithMic label="Address" textarea value={f.address || ''} onChange={(v) => set('address', v)} />
                                <LocationFields f={f} set={set} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><label className="field-label">Emergency Contact 1 (optional)</label><input placeholder="Optional" value={f.emergencyName || ''} onChange={(e) => set('emergencyName', e.target.value)} className="field" /></div>
                                  <div><label className="field-label">Emergency Contact 1 Phone (optional)</label><input placeholder="Optional" value={f.emergencyPhone || ''} onChange={(e) => set('emergencyPhone', e.target.value)} className="field" /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><label className="field-label">Annual Income (₹) (optional)</label><input type="number" placeholder="Optional" value={f.income || ''} onChange={(e) => set('income', e.target.value)} className="field" /></div>
                                  <div>
                                    <label className="field-label">Language</label>
                                    <select value={f.rpLang || 'English'} onChange={(e) => set('rpLang', e.target.value)} className="field">
                                      <option>English</option><option>Hindi</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="rounded-md border border-line bg-stripe p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[13px] font-medium text-ink">Optional fingerprint sign-in</p>
                                      <p className="text-[11px] text-muted mt-1">Prototype only — no real fingerprint is collected.</p>
                                    </div>
                                    <button type="button" onClick={() => { set('fingerprintEnrolled', 'true'); toast('Demo fingerprint enrolled for this prototype'); }} className={`px-3 py-2 btn !min-h-[38px] !px-3 text-[12px] ${f.fingerprintEnrolled === 'true' ? 'bg-ok-bg text-ok' : 'btn-gold'}`}>
                                      <Fingerprint className="w-4 h-4" /> {f.fingerprintEnrolled === 'true' ? 'Enrolled' : 'Enroll demo'}
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}

                            {portal === 'doctor' && (
                              <>
                                <FieldWithMic label="Doctor Name *" value={f.name || ''} onChange={(v) => set('name', v)} required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><label className="field-label">Specialization *</label><input required value={f.specialization || ''} onChange={(e) => set('specialization', e.target.value)} className="field" placeholder="e.g. General Surgery" /></div>
                                  <div><label className="field-label">Experience (years)</label><input type="number" value={f.experience || ''} onChange={(e) => set('experience', e.target.value)} className="field" /></div>
                                </div>
                                <div><label className="field-label">Hospital Name *</label><input required value={f.hospital || ''} onChange={(e) => set('hospital', e.target.value)} className="field" placeholder="Enter the hospital where you work" /></div>
                                <FieldWithMic label="Address *" textarea value={f.address || ''} onChange={(v) => set('address', v)} placeholder="Doctor or clinic address" required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><label className="field-label">Medical Reg No *</label><input required value={f.regNo || ''} onChange={(e) => set('regNo', e.target.value)} className="field" /></div>
                                  <div><label className="field-label">Phone</label><input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} className="field" /></div>
                                </div>
                                <LocationFields f={f} set={set} />
                              </>
                            )}

                            {portal === 'hospital' && (
                              <>
                                <div><label className="field-label">Hospital Name *</label><input value={f.name || ''} onChange={(e) => set('name', e.target.value)} className="field" /></div>
                                <div><label className="field-label">Phone (optional)</label><input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} className="field" /></div>
                                <FieldWithMic label="Address *" textarea value={f.address || ''} onChange={(v) => set('address', v)} required />
                                <LocationFields f={f} set={set} />
                                <div><label className="field-label">License No</label><input value={f.licenseNo || ''} onChange={(e) => set('licenseNo', e.target.value)} className="field" /></div>
                              </>
                            )}

                            {portal === 'caretaker' && (
                              <>
                                <FieldWithMic label="Caretaker Name *" value={f.name || ''} onChange={(v) => set('name', v)} required />
                                <div><label className="field-label">Phone</label><input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} className="field" /></div>
                                <LocationFields f={f} set={set} />
                              </>
                            )}

                            <div>
                              <label className="field-label">Email *</label>
                              <input type="email" required value={f.email || ''} onChange={(e) => set('email', e.target.value)} className="field" />
                            </div>
                            <div>
                              <label className="field-label">Password *</label>
                              <input type="password" required value={f.password || ''} onChange={(e) => set('password', e.target.value)} className="field" placeholder="min 6 characters" />
                            </div>

                            <div className="pt-2 flex gap-3">
                              <button type="submit" disabled={authLoading} className="btn btn-gold flex-1">
                                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                  portal === 'patient' ? 'Create Health ID' : portal === 'doctor' ? 'Register as Doctor' : portal === 'caretaker' ? 'Register Caretaker' : 'Register Hospital'
                                )}
                              </button>
                            </div>

                            <div className="pt-3 text-center">
                              <button type="button" onClick={() => { setIsRegistering(false); setAuthError(''); }} className="text-[13px] font-bold text-gold-ink hover:underline">
                                Already have an account? Sign in
                              </button>
                            </div>
                          </div>
                        </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FieldWithMic({ label, value, onChange, textarea, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="flex gap-2">
        {textarea ? (
          <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="field" />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="field" />
        )}
        <MicButton onText={(t) => onChange(value ? value + ' ' + t : t)} />
      </div>
    </div>
  );
}

function LocationFields({ f, set }: { f: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><label className="field-label">State *</label><input required value={f.state || ''} onChange={(e) => set('state', e.target.value)} className="field" placeholder="State" /></div>
      <div><label className="field-label">District *</label><input required value={f.district || ''} onChange={(e) => set('district', e.target.value)} className="field" placeholder="District" /></div>
    </div>
  );
}
