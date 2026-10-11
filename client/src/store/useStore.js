/**
 * client/src/store/useStore.js — Zustand global store with localStorage persistence
 */
import { create } from 'zustand';
import { DEMO_TRANSACTIONS, DEMO_RECIPIENTS } from '../services/mockData.js';

const TX_STORAGE_KEY = 'remit_ledger_transactions_v1';
const REC_STORAGE_KEY = 'remit_ledger_recipients_v1';

const loadStoredTransactions = () => {
  try {
    const saved = localStorage.getItem(TX_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load stored transactions', e);
  }
  return [...DEMO_TRANSACTIONS];
};

const loadStoredRecipients = () => {
  try {
    const saved = localStorage.getItem(REC_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load stored recipients', e);
  }
  return [...DEMO_RECIPIENTS];
};

export const useStore = create((set, get) => ({
  // ── Transactions ───────────────────────────────────────────────────────────
  transactions: loadStoredTransactions(),

  addTransaction: (tx) =>
    set(state => {
      const updated = [tx, ...state.transactions];
      try {
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { transactions: updated };
    }),

  updateTransaction: (id, updates) =>
    set(state => {
      const updated = state.transactions.map(t => (t.id === id ? { ...t, ...updates } : t));
      try {
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { transactions: updated };
    }),

  getTransaction: (id) => get().transactions.find(t => t.id === id),

  resetTransactions: () => {
    try {
      localStorage.removeItem(TX_STORAGE_KEY);
    } catch (e) {}
    set({ transactions: [...DEMO_TRANSACTIONS] });
  },

  // ── Recipients ─────────────────────────────────────────────────────────────
  recipients: loadStoredRecipients(),

  addRecipient: (rec) =>
    set(state => {
      const updated = [rec, ...state.recipients];
      try {
        localStorage.setItem(REC_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { recipients: updated };
    }),

  updateRecipient: (id, updates) =>
    set(state => {
      const updated = state.recipients.map(r => (r.id === id ? { ...r, ...updates } : r));
      try {
        localStorage.setItem(REC_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { recipients: updated };
    }),

  deleteRecipient: (id) =>
    set(state => {
      const updated = state.recipients.filter(r => r.id !== id);
      try {
        localStorage.setItem(REC_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return { recipients: updated };
    }),

  // ── UI State ───────────────────────────────────────────────────────────────
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: [
    { id: 'n1', type: 'warn', message: 'TXN-D-0038 running 2h 10m past estimate on IMPS', time: '10 min ago', read: false },
    { id: 'n2', type: 'info', message: 'TXN-D-0041 recipient name verification pending', time: '45 min ago', read: false },
    { id: 'n3', type: 'ok', message: 'TXN-D-0042 completed — ₹47,880.00 delivered via UPI', time: '1 hour ago', read: true },
  ],
  markNotificationRead: (id) =>
    set(state => ({
      notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
    })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));

