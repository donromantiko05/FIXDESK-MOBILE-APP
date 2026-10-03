import { useState, useEffect, useCallback } from 'react';
import { subscribeTickets, getTickets } from '../firebase/tickets';

export default function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to memory cache changes immediately
    const unsubscribe = subscribeTickets((list) => {
      setTickets(list);
      setLoading(false);
    });

    // Try fetching fresh Firestore data in background
    getTickets().catch(() => {});

    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getTickets();
    setTickets(data);
    setLoading(false);
  }, []);

  return { tickets, loading, refresh };
}
