import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './config';

export const subscribeTechnicians = (callback, onError = () => {}) =>
  onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'technician')),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError
  );

export const updateTechnician = async (uid, changes) => {
  if (!uid) throw new Error('Missing technician ID.');
  await updateDoc(doc(db, 'users', uid), changes);
};
