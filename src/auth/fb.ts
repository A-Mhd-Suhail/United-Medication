/* Everything that needs Firebase, in one module. session.ts loads it with a dynamic
 * import so the landing page never downloads the Firebase SDK until it is needed. */
export { auth, db } from '../firebase';
export {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence, signOut, onAuthStateChanged,
} from 'firebase/auth';
export { doc, setDoc, getDoc } from 'firebase/firestore';
export { loginWithFingerprint } from '../lib/fingerprint';
