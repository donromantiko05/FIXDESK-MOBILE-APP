import { useState, useEffect, useCallback } from 'react';
import {
  subscribeNotifications,
  markNotificationAsRead,
  clearAllNotifications,
  createNotification,
} from '../firebase/messaging';
import { auth } from '../firebase/config';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    const unsubscribe = subscribeNotifications(currentUserId, (list) => {
      setNotifications(list);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback(async (id) => {
    await markNotificationAsRead(id);
  }, []);

  const clearAll = useCallback(async () => {
    const currentUserId = auth.currentUser?.uid;
    await clearAllNotifications(currentUserId);
  }, []);

  const notify = useCallback(async (data) => {
    const currentUserId = auth.currentUser?.uid;
    return await createNotification({ userId: currentUserId, ...data });
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    clearAll,
    notify,
  };
}
