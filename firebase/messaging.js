import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

const notificationsRef = collection(db, 'notifications');

export const subscribeNotifications = (userId, callback, onError = () => {}) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(notificationsRef, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
      callback(notifications);
    },
    onError
  );
};

export const createNotification = async ({
  userId,
  title,
  description,
  isTicket = true,
  ticketCode = null,
  ticketId = null,
  icon = 'notifications-outline',
}) => {
  if (!userId) throw new Error('A user ID is required for a notification.');
  const record = {
    userId,
    title: String(title || 'FixDesk update'),
    description: String(description || ''),
    isTicket,
    ticketCode,
    ticketId,
    icon,
    unread: true,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(notificationsRef, record);
  return { id: ref.id, ...record };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  if (!notificationId || !userId) return;
  const ref = doc(db, 'notifications', notificationId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().userId !== userId) return;
  await updateDoc(ref, { unread: false, readAt: serverTimestamp() });
};

export const clearAllNotifications = async (userId) => {
  if (!userId) return;
  const snapshot = await getDocs(query(notificationsRef, where('userId', '==', userId)));
  for (let start = 0; start < snapshot.docs.length; start += 450) {
    const batch = writeBatch(db);
    snapshot.docs.slice(start, start + 450).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
};
