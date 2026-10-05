import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { DEFAULT_PREFERENCES, normalizePreferences } from '../firebase/preferences';

export default function useUserPreferences() {
  const uid = auth.currentUser?.uid || null;
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (!uid) return undefined;
    let mounted = true;
    const storageKey = 'fixdesk.preferences.' + uid;

    AsyncStorage.getItem(storageKey)
      .then((value) => {
        if (mounted && value) setPreferences(normalizePreferences(JSON.parse(value)));
      })
      .catch(() => {});

    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (snapshot) => {
        if (!mounted || !snapshot.exists()) return;
        const profile = snapshot.data();
        if (!profile.preferences) return;
        const next = normalizePreferences(profile.preferences);
        setPreferences(next);
        setSyncError('');
        await AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
      },
      () => {
        if (mounted) setSyncError('Preferences are saved on this device but could not sync to Firebase.');
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [uid]);

  const setPreference = useCallback(async (key, value) => {
    const next = normalizePreferences({ ...preferences, [key]: value });
    setPreferences(next);
    setSyncError('');
    const storageKey = 'fixdesk.preferences.' + (uid || 'guest');
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
    if (!uid) return false;
    try {
      await setDoc(doc(db, 'users', uid), { preferences: next }, { merge: true });
      return true;
    } catch {
      setSyncError('Preference kept on this device; Firebase sync was denied.');
      return false;
    }
  }, [preferences, uid]);

  return { preferences, setPreference, syncError };
}
