import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/auth';
 
// Tracks the signed-in Firebase user and their Firestore profile (role).
// Returns: { user, profile, role, isAdmin, loading, error, refreshProfile }
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setError('');
        setLoading(false);
        return;
      }
      try {
        setProfile(await getUserProfile(firebaseUser.uid));
        setError('');
      } catch (e) {
        setProfile(null);
        setError('Could not load your profile.');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);
 
  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    const fresh = await getUserProfile(auth.currentUser.uid);
    setProfile(fresh);
    return fresh;
  }, []);
 
  const role = profile?.role ?? null;
 
  return {
    user,
    profile,
    role,
    isAdmin: role === 'admin',
    loading,
    error,
    refreshProfile,
  };
}