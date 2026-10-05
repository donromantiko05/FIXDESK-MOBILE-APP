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
  const userId = auth.currentUser?.uid || null;

  useEffect(() => {
    setLoading(true);
    return subscribeNotifications(
      userId,
      (list) => {
        setNotifications(list);
        setLoading(false);
      },
      () => {
        setNotifications([]);
        setLoading(false);
      }
    );
  }, [userId]);

  const markAsRead = useCallback(
    (id) => markNotificationAsRead(id, userId),
    [userId]
  );

  const clearAll = useCallback(
    () => clearAllNotifications(userId),
    [userId]
  );

  const notify = useCallback(
    (data) => createNotification({ userId, ...data }),
    [userId]
  );

  const unreadCount = notifications.filter((item) => item.unread).length;

  return { notifications, loading, unreadCount, markAsRead, clearAll, notify };
}
