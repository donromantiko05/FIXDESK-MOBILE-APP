import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const firebaseConfig = {
  // KEEP YOUR EXISTING VALUES HERE (apiKey, authDomain, projectId, ...)
  apiKey: "AIzaSyBHulAm2EZnlQFdu-odfCGNbqshiJl4MLs",
  authDomain: "fix-desk-work-place.firebaseapp.com",
  projectId: "fix-desk-work-place",
  storageBucket: "fix-desk-work-place.firebasestorage.app",
  messagingSenderId: "229303051382",
  appId: "1:229303051382:web:2fb299a420234533ce6b57",
  measurementId: "G-QPNG81KYM3"
};
 
const app = initializeApp(firebaseConfig);
 
// On phones, keep the user signed in between app restarts.
// On web (Expo web), the default browser persistence is used.
// initializeAuth throws if it runs twice (Fast Refresh), so fall back to getAuth.
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    if (__DEV__) console.warn('Auth persistence not set up:', e?.message);
    authInstance = getAuth(app);
  }
}
 
export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);