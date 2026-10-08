// Ticket storage and helpers with Firestore support and offline fallback.
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config';

export const INITIAL_TICKETS = [
  {
    id: '1',
    code: 'TCK-2091',
    title: 'AC not cooling',
    fullTitle: 'AC not cooling — Fl. 3 east wing',
    priority: 'high',
    status: 'assigned',
    category: 'HVAC',
    location: 'Fl. 3, East Wing',
    reporter: 'Maria Reyes (Accounting)',
    filedDate: 'Sep 9, 2026',
    description:
      'AC unit in the east wing is blowing warm air. Temperature in office area is 78F.',
    photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&q=80',
    ],
    timeline: [
      { title: 'Reported', time: 'Sep 9, 2026 10:14 AM', done: true },
      {
        title: 'Priority Evaluated',
        time: 'Sep 9, 2026 10:15 AM (Auto)',
        done: true,
      },
      { title: 'Assigned', subtitle: 'James Cruz assigned', done: true },
      {
        title: 'Repair in Progress',
        subtitle: 'Started today 2:14 PM',
        done: true,
      },
    ],
  },
  {
    id: '2',
    code: 'TCK-2087',
    title: 'Flickering light',
    fullTitle: 'Flickering light — Fl. 2 Conf Room B',
    priority: 'medium',
    status: 'in_progress',
    category: 'Electrical',
    location: 'Fl. 2, Conference Room B',
    reporter: 'Alex Johnson (Marketing)',
    filedDate: 'Sep 8, 2026',
    description:
      'Ceiling fluorescent fixture flickers intermittently during presentations.',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80',
    ],
    timeline: [
      { title: 'Reported', time: 'Sep 8, 2026 3:20 PM', done: true },
      {
        title: 'Priority Evaluated',
        time: 'Sep 8, 2026 3:22 PM (Auto)',
        done: true,
      },
      { title: 'Assigned', subtitle: 'Sarah Lin assigned', done: true },
      { title: 'Repair in Progress', subtitle: 'In progress', done: true },
    ],
  },
  {
    id: '3',
    code: 'TCK-2079',
    title: 'Squeaky door hinge',
    fullTitle: 'Squeaky door hinge — Fl. 1 Main Entrance',
    priority: 'low',
    status: 'completed',
    category: 'Furniture',
    location: 'Fl. 1, Main Entrance',
    reporter: 'David Kim (HR)',
    filedDate: 'Sep 6, 2026',
    description:
      'Main glass entrance door emits loud squeaking noise when swinging open.',
    photos: [],
    timeline: [
      { title: 'Reported', time: 'Sep 6, 2026 9:00 AM', done: true },
      {
        title: 'Priority Evaluated',
        time: 'Sep 6, 2026 9:02 AM (Auto)',
        done: true,
      },
      { title: 'Assigned', subtitle: 'James Cruz assigned', done: true },
      {
        title: 'Completed',
        subtitle: 'Lubricated hinges and aligned frame',
        done: true,
      },
    ],
  },
  {
    id: '4',
    code: 'TCK-2065',
    title: 'Broken blinds',
    fullTitle: 'Broken blinds — Fl. 3 West Wing',
    priority: 'low',
    status: 'completed',
    category: 'Furniture',
    location: 'Fl. 3, West Wing',
    reporter: 'Maria Reyes (Accounting)',
    filedDate: 'Sep 4, 2026',
    description: 'Horizontal window blind tilt mechanism is stuck.',
    photos: [],
    timeline: [
      { title: 'Reported', time: 'Sep 4, 2026 1:15 PM', done: true },
      {
        title: 'Priority Evaluated',
        time: 'Sep 4, 2026 1:17 PM (Auto)',
        done: true,
      },
      { title: 'Assigned', subtitle: 'Carlos Mendez assigned', done: true },
      {
        title: 'Completed',
        subtitle: 'Replaced cord tilt mechanism',
        done: true,
      },
    ],
  },
];

// In-memory cache for fast local access
let localTickets = [];
const listeners = new Map();

const filterTicketsFor = (tickets, scope = {}) => {
  if (scope.role === 'admin') return [...tickets];
  if (!scope.userId) return [];
  if (scope.role === 'technician') return tickets.filter((ticket) => ticket.assignedTo === scope.userId);
  return tickets.filter((ticket) => ticket.reporterId === scope.userId);
};

const notifyListeners = () => {
  listeners.forEach((scope, listener) => {
    try {
      listener(filterTicketsFor(localTickets, scope));
    } catch (e) {}
  });
};

const ticketsQuery = (scope) => {
  const ticketCollection = collection(db, 'tickets');
  if (scope?.role === 'admin') return query(ticketCollection, orderBy('createdAt', 'desc'));
  if (scope?.role === 'technician') return query(ticketCollection, where('assignedTo', '==', scope.userId));
  return query(ticketCollection, where('reporterId', '==', scope?.userId));
};

export const subscribeTickets = (callback, onError = () => {}, scope = {}) => {
  listeners.set(callback, scope);
  callback(filterTicketsFor(localTickets, scope));
  if (!scope.userId) return () => listeners.delete(callback);
  const firestoreUnsubscribe = onSnapshot(
    ticketsQuery(scope),
    (snapshot) => {
      const remote = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      localTickets = [...remote, ...localTickets.filter((ticket) => !remote.some((item) => item.id === ticket.id))];
      callback(remote.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    },
    onError
  );
  return () => {
    listeners.delete(callback);
    firestoreUnsubscribe();
  };
};

export const getTickets = async (scope = {}) => {
  if (!scope.userId) return [];
  try {
    const snapshot = await getDocs(ticketsQuery(scope));
    const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    localTickets = [...remote, ...localTickets.filter((ticket) => !remote.some((item) => item.id === ticket.id))];
    notifyListeners();
    return remote.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  } catch (e) {
    // Keep the current in-memory list available while offline.
  }
  return filterTicketsFor(localTickets, scope);
};

export const createTicket = async (ticketData) => {
  const now = new Date();
  const code = `TCK-${now.getTime()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const newTicket = {
    id: String(Date.now()),
    code,
    title: ticketData.title || `${ticketData.category || 'General'} Issue`,
    fullTitle:
      ticketData.fullTitle ||
      `${ticketData.title || ticketData.category || 'Issue'} — ${ticketData.location || 'Location'}`,
    category: ticketData.category || 'Other',
    location: ticketData.location || 'General Area',
    description: ticketData.description || '',
    priority: ticketData.priority || 'medium',
    status: ticketData.status || 'evaluating',
    reporter: ticketData.reporter || 'Current User',
    reporterId: ticketData.reporterId || null,
    equipmentId: ticketData.equipmentId || null,
    equipmentName: ticketData.equipmentName || null,
    filedDate: dateStr,
    photos: ticketData.photos || [],
    priorityScore: ticketData.priorityScore ?? null,
    priorityFactors: ticketData.priorityFactors || [],
    timeline: [
      { title: 'Reported', time: `${dateStr} ${timeStr}`, done: true },
      {
        title: 'Priority Evaluated',
        time: `${dateStr} ${timeStr} (Auto)`,
        done: true,
      },
    ],
  };

  const docRef = await addDoc(collection(db, 'tickets'), {
    ...newTicket,
    createdAt: serverTimestamp(),
  });
  newTicket.id = docRef.id;
  localTickets = [newTicket, ...localTickets];
  notifyListeners();

  return newTicket;
};

export const updateTicket = async (idOrCode, changes = {}) => {
  let ticketRef = doc(db, 'tickets', String(idOrCode));
  let ticketSnap = await getDoc(ticketRef);

  if (!ticketSnap.exists()) {
    const match = await getDocs(
      query(collection(db, 'tickets'), where('code', '==', String(idOrCode)), limit(1))
    );
    if (match.empty) throw new Error('Ticket not found.');
    ticketSnap = match.docs[0];
    ticketRef = ticketSnap.ref;
  }

  const { timelineEntry, ...fields } = changes;
  const update = { ...fields, updatedAt: serverTimestamp() };
  if (timelineEntry) update.timeline = arrayUnion(timelineEntry);
  await updateDoc(ticketRef, update);

  const prior = ticketSnap.data();
  const updatedTicket = {
    id: ticketSnap.id,
    ...prior,
    ...fields,
    timeline: timelineEntry ? [...(prior.timeline || []), timelineEntry] : prior.timeline || [],
  };
  localTickets = localTickets.map((ticket) =>
    ticket.id === String(idOrCode) || ticket.code === String(idOrCode) || ticket.id === ticketSnap.id
      ? updatedTicket
      : ticket
  );
  notifyListeners();
  return updatedTicket;
};

export const getTicketById = (idOrCode) => {
  return localTickets.find(
    (t) => t.id === idOrCode || t.code === idOrCode
  ) || null;
};

export const fetchTicketById = async (idOrCode) => {
  if (!idOrCode) return null;
  const ref = doc(db, 'tickets', String(idOrCode));
  const direct = await getDoc(ref);
  if (direct.exists()) return { id: direct.id, ...direct.data() };
  const match = await getDocs(
    query(collection(db, 'tickets'), where('code', '==', String(idOrCode)), limit(1))
  );
  return match.empty ? null : { id: match.docs[0].id, ...match.docs[0].data() };
};
