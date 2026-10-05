import { useState, useEffect, useCallback } from 'react';
import { subscribeTickets, getTickets } from '../firebase/tickets';
import useAuth from './useAuth';

export default function useTickets() {
  const { user, role } = useAuth();
  const userId = user?.uid || null;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const scope = { userId, role };
    const unsubscribe = subscribeTickets(
      (list) => { setTickets(list); setLoading(false); },
      () => { setTickets([]); setLoading(false); },
      scope
    );
    return unsubscribe;
  }, [userId, role]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTickets({ userId, role });
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  return { tickets, loading, refresh };
}
