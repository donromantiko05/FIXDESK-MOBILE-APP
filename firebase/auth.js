import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Sends the Firebase password reset email to the given address.
export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email.trim());

// Reads the profile document at users/{uid}. Returns null if it doesn't exist.
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Signs in and loads the profile (which holds the role).
// Signs back out and throws if the account has no profile document.
export const signIn = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    await signOut(auth);
    const err = new Error('No profile found for this account.');
    err.code = 'app/no-profile';
    throw err;
  }
  return { user: cred.user, profile };
};

// Creates the Firebase Auth user, then the users/{uid} profile.
// New accounts are ALWAYS employees. Admins are set manually in Firestore.
export const signUp = async ({ fullName, email, department, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const profile = {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    department,
    role: 'employee',
    createdAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, 'users', cred.user.uid), profile);
  } catch (e) {
    // Don't leave an Auth user behind without a profile.
    await cred.user.delete().catch(() => {});
    throw e;
  }
  return { user: cred.user, profile: { id: cred.user.uid, ...profile } };
};

export const signOutUser = () => signOut(auth);

// Turns a Firebase error into a message safe to show the user.
export const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Enter a valid work email.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'app/no-profile':
      return 'This account has no profile. Contact an administrator.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to do that.';
    default:
      return 'Something went wrong. Please try again.';
  }
};