// Firestore rules tests. Needs Java and: npm i -D firebase-tools @firebase/rules-unit-testing
// Run: npx firebase emulators:exec --only firestore --project demo-um 'node scripts/firestore-rules.test.mjs'
import fs from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, addDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'demo-um',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8089 },
});
await env.withSecurityRulesDisabled(async (c) => {
  const d = c.firestore();
  await setDoc(doc(d, 'users/pat1'), { role: 'patient', name: 'P1', healthId: 'H1', aadhaar: '1' });
  await setDoc(doc(d, 'users/pat2'), { role: 'patient', name: 'P2' });
  await setDoc(doc(d, 'users/doc1'), { role: 'doctor', name: 'D1' });
  await setDoc(doc(d, 'users/hos1'), { role: 'hospital', name: 'H' });
  await setDoc(doc(d, 'users/care1'), { role: 'caretaker', name: 'C', caretakerPatientId: 'pat1' });
  await setDoc(doc(d, 'users/pat3'), { role: 'patient', caretakerAssignment: { caretakerId: 'care1', status: 'pending' } });
  await setDoc(doc(d, 'medicines/m1'), { patientId: 'pat1', name: 'x' });
  await setDoc(doc(d, 'medicines/m2'), { patientId: 'pat2', name: 'y' });
  await setDoc(doc(d, 'notifications/n1'), { to: 'pat1', read: false });
  await setDoc(doc(d, 'notifications/n2'), { to: 'role:doctor', read: false });
});
const as = (uid, email) => env.authenticatedContext(uid, email ? { email } : {}).firestore();
const anon = env.unauthenticatedContext().firestore();
let pass = 0, fail = 0;
const t = async (name, p) => { try { await p; pass++; console.log('PASS', name); } catch (e) { fail++; console.log('FAIL', name, String(e.message).slice(0, 90)); } };

// anonymous
await t('anon cannot read users', assertFails(getDoc(doc(anon, 'users/pat1'))));
await t('anon cannot write', assertFails(setDoc(doc(anon, 'medicines/zz'), { patientId: 'x' })));
// patient
const p1 = as('pat1');
await t('patient reads own doc', assertSucceeds(getDoc(doc(p1, 'users/pat1'))));
await t('patient cannot read another patient', assertFails(getDoc(doc(p1, 'users/pat2'))));
await t('patient lists doctors', assertSucceeds(getDocs(query(collection(p1, 'users'), where('role', '==', 'doctor')))));
await t('patient lists hospitals', assertSucceeds(getDocs(query(collection(p1, 'users'), where('role', '==', 'hospital')))));
await t('patient cannot list all patients', assertFails(getDocs(query(collection(p1, 'users'), where('role', '==', 'patient')))));
await t('patient own medicines query', assertSucceeds(getDocs(query(collection(p1, 'medicines'), where('patientId', '==', 'pat1')))));
await t('patient cannot query others medicines', assertFails(getDocs(query(collection(p1, 'medicines'), where('patientId', '==', 'pat2')))));
await t('patient cannot dump medicines', assertFails(getDocs(collection(p1, 'medicines'))));
await t('patient adds own medicine', assertSucceeds(addDoc(collection(p1, 'medicines'), { patientId: 'pat1', name: 'n' })));
await t('patient cannot add for another', assertFails(addDoc(collection(p1, 'medicines'), { patientId: 'pat2', name: 'n' })));
await t('patient notifications query', assertSucceeds(getDocs(query(collection(p1, 'notifications'), where('to', 'in', ['pat1', 'role:patient'])))));
await t('patient cannot change own role', assertFails(updateDoc(doc(p1, 'users/pat1'), { role: 'admin' })));
await t('patient edits own profile', assertSucceeds(updateDoc(doc(p1, 'users/pat1'), { phone: '1' })));
await t('patient cannot edit another user', assertFails(updateDoc(doc(p1, 'users/pat2'), { phone: '1' })));
await t('patient chat own thread', assertSucceeds(setDoc(doc(p1, 'threads/doc1_pat1'), { ids: ['doc1', 'pat1'] })));
await t('patient cannot read others thread', assertFails(getDoc(doc(p1, 'threads/doc1_pat2'))));
// registration
const np = as('newuser');
await t('register as patient', assertSucceeds(setDoc(doc(np, 'users/newuser'), { role: 'patient' })));
await t('cannot self-register as admin', assertFails(setDoc(doc(as('x1'), 'users/x1'), { role: 'admin' })));
await t('cannot create for another uid', assertFails(setDoc(doc(as('x2'), 'users/other'), { role: 'patient' })));
await t('admin email can create admin doc', assertSucceeds(setDoc(doc(as('adm', 'admin.official@mhdhospital.in'), 'users/adm'), { role: 'admin' })));
// doctor
const dd = as('doc1');
await t('doctor lists patients', assertSucceeds(getDocs(query(collection(dd, 'users'), where('role', '==', 'patient')))));
await t('doctor reads waiting cases', assertSucceeds(getDocs(query(collection(dd, 'cases'), where('status', '==', 'waiting')))));
await t('doctor reads notifications', assertSucceeds(getDocs(query(collection(dd, 'notifications'), where('to', 'in', ['doc1', 'role:doctor'])))));
await t('doctor writes patient medicine', assertSucceeds(addDoc(collection(dd, 'medicines'), { patientId: 'pat1', name: 'q' })));
await t('doctor updates patient (assignment)', assertSucceeds(updateDoc(doc(dd, 'users/pat1'), { caretakerAssignment: { caretakerId: 'care1' } })));
// caretaker
const cc = as('care1');
await t('caretaker reads assigned patient query', assertSucceeds(getDocs(query(collection(cc, 'users'), where('caretakerAssignment.caretakerId', '==', 'care1')))));
await t('caretaker reads linked patient doc', assertSucceeds(getDoc(doc(cc, 'users/pat1'))));
await t('caretaker cannot read unrelated patient', assertFails(getDoc(doc(cc, 'users/pat2'))));
await t('caretaker medicines for patients', assertSucceeds(getDocs(query(collection(cc, 'medicines'), where('patientId', 'in', ['pat1'])))));
// hospital
const hh = as('hos1');
await t('hospital lists patients', assertSucceeds(getDocs(query(collection(hh, 'users'), where('role', '==', 'patient')))));
await t('hospital reads hospital_requests', assertSucceeds(getDocs(collection(hh, 'hospital_requests'))));
// caretaker demo seed
await t('caretaker seeds demo patient', assertSucceeds(setDoc(doc(cc, 'users/caretaker-demo-patient'), { role: 'patient' })));
// locked collections
await t('webauthn locked', assertFails(getDoc(doc(dd, 'webauthnCredentials/a'))));
await t('unknown collection denied', assertFails(getDoc(doc(dd, 'secrets/a'))));

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
