import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './config';

const collectionRef = collection(db, 'equipment');

export const normalizeAssetId = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return (url.searchParams.get('assetId') || url.searchParams.get('id') ||
      url.pathname.split('/').filter(Boolean).pop() || raw).trim().toUpperCase();
  } catch {
    return raw.replace(/^fixdesk:/i, '').trim().toUpperCase();
  }
};

export const subscribeEquipment = (callback, onError = () => {}) =>
  onSnapshot(
    query(collectionRef, orderBy('name')),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError
  );

export const getEquipmentById = async (input) => {
  const assetId = normalizeAssetId(input);
  if (!assetId) return null;

  const direct = await getDoc(doc(db, 'equipment', assetId));
  if (direct.exists()) return { id: direct.id, ...direct.data() };

  const found = await getDocs(query(collectionRef, where('assetId', '==', assetId), limit(1)));
  if (found.empty) return null;
  const item = found.docs[0];
  return { id: item.id, ...item.data() };
};

export const createEquipment = async (values) => {
  const assetId = normalizeAssetId(values.assetId);
  if (!assetId) throw new Error('Enter an equipment ID.');
  const data = {
    ...values,
    assetId,
    name: String(values.name || '').trim(),
    location: String(values.location || '').trim(),
    installed: String(values.installed || '').trim(),
    status: values.status || 'low',
    history: Array.isArray(values.history) ? values.history : [],
    updatedAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid || null,
  };
  if (!data.name) throw new Error('Enter an equipment name.');
  await setDoc(doc(db, 'equipment', assetId), data);
  return { id: assetId, ...data };
};

export const updateEquipment = async (assetId, changes) => {
  const id = normalizeAssetId(assetId);
  await updateDoc(doc(db, 'equipment', id), { ...changes, updatedAt: serverTimestamp() });
};
