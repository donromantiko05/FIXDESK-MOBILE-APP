import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Ticket received',
    description: 'TCK-2101 is being evaluated',
    time: 'just now',
    icon: 'document-text-outline',
    unread: true,
    isTicket: true,
    ticketCode: 'TCK-2101',
  },
  {
    id: '2',
    title: 'Technician assigned',
    description: 'James Cruz was assigned to your ticket',
    time: '3 min ago',
    icon: 'person-outline',
    unread: true,
    isTicket: true,
    ticketCode: 'TCK-2091',
  },
  {
    id: '3',
    title: 'Repair started',
    description: 'Repair started on TCK-2101',
    time: '18 min ago',
    icon: 'pulse-outline',
    unread: false,
    isTicket: true,
    ticketCode: 'TCK-2101',
  },
  {
    id: '4',
    title: 'Repair completed',
    description: 'Repair completed — please confirm',
    time: '1 hr ago',
    icon: 'checkmark-outline',
    unread: false,
    isTicket: true,
    ticketCode: 'TCK-2079',
  },
  {
    id: '5',
    title: 'Schedule updated',
    description: 'Weekly maintenance schedule updated',
    time: 'Yesterday',
    icon: 'calendar-outline',
    unread: false,
    isTicket: false,
  },
];

let localNotifications = [...INITIAL_NOTIFICATIONS];
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener([...localNotifications]);
    } catch (e) {}
  });
};

/**
 * Subscribe to notifications in real-time
 */
export const subscribeNotifications = (userId, callback) => {
  listeners.add(callback);
  callback([...localNotifications]);

  if (!userId) {
    return () => listeners.delete(callback);
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          localNotifications = list;
          notifyListeners();
        }
      },
      (error) => {
        if (__DEV__) console.warn('Notifications snapshot error:', error.message);
      }
    );

    return () => {
      listeners.delete(callback);
      unsubscribeFirestore();
    };
  } catch (e) {
    return () => listeners.delete(callback);
  }
};

/**
 * Create a new notification
 */
export const createNotification = async ({
  userId,
  title,
  description,
  isTicket = true,
  ticketCode = null,
  icon = 'notifications-outline',
}) => {
  const newNotif = {
    id: String(Date.now()),
    title,
    description,
    time: 'just now',
    icon,
    unread: true,
    isTicket,
    ticketCode,
    userId: userId || null,
  };

  localNotifications = [newNotif, ...localNotifications];
  notifyListeners();

  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...newNotif,
      createdAt: serverTimestamp(),
    });
    newNotif.id = docRef.id;
  } catch (e) {
    // Offline fallback
  }

  return newNotif;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  localNotifications = localNotifications.map((n) =>
    n.id === notificationId ? { ...n, unread: false } : n
  );
  notifyListeners();

  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { unread: false });
  } catch (e) {}
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (userId) => {
  localNotifications = [];
  notifyListeners();
};
