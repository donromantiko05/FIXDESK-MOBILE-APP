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
let localTickets = [...INITIAL_TICKETS];
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener([...localTickets]);
    } catch (e) {}
  });
};

export const subscribeTickets = (callback) => {
  listeners.add(callback);
  callback([...localTickets]);
  return () => {
    listeners.delete(callback);
  };
};

export const getTickets = async () => {
  try {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      localTickets = remote;
      notifyListeners();
      return remote;
    }
  } catch (e) {
    // offline or Firestore not ready yet, return local
  }
  return [...localTickets];
};

export const createTicket = async (ticketData) => {
  const nextNumber = 2100 + localTickets.length + 1;
  const code = `TCK-${nextNumber}`;
  const now = new Date();
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
    filedDate: dateStr,
    photos: ticketData.photos || [],
    timeline: [
      { title: 'Reported', time: `${dateStr} ${timeStr}`, done: true },
      {
        title: 'Priority Evaluated',
        time: `${dateStr} ${timeStr} (Auto)`,
        done: true,
      },
    ],
  };

  // Prepend to local memory store
  localTickets = [newTicket, ...localTickets];
  notifyListeners();

  // Also persist to Firestore if connected
  try {
    const docRef = await addDoc(collection(db, 'tickets'), {
      ...newTicket,
      createdAt: serverTimestamp(),
    });
    newTicket.id = docRef.id;
  } catch (e) {
    // offline mode is supported
  }

  return newTicket;
};

export const getTicketById = (idOrCode) => {
  return localTickets.find(
    (t) => t.id === idOrCode || t.code === idOrCode
  ) || null;
};
