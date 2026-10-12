/**
 * client/src/store/useStore.js — Zustand global store connected to backend API
 */
import { create } from 'zustand';
import { DEMO_TRANSACTIONS, DEMO_RECIPIENTS } from '../services/mockData.js';
import { transactionService } from '../services/transactionService.js';
import { recipientService } from '../services/recipientService.js';

export const useStore = create((set, get) => ({
  // ── Transactions ───────────────────────────────────────────────────────────
  transactions: [...DEMO_TRANSACTIONS],
  isLoadingTransactions: false,
  transactionError: null,

  fetchTransactions: async (filters = {}) => {
    set({ isLoadingTransactions: true, transactionError: null });
    try {
      const data = await transactionService.getTransactions(filters);
      if (Array.isArray(data)) {
        set({ transactions: data, isLoadingTransactions: false });
      }
    } catch (err) {
      console.warn('Backend fetchTransactions error:', err.message);
      set({ isLoadingTransactions: false, transactionError: err.message });
    }
  },

  addTransaction: async (txPayload, idempotencyKey = null) => {
    // Attempt backend creation as single source of truth
    try {
      const created = await transactionService.createTransaction(txPayload, idempotencyKey);
      set(state => {
        // Deduplicate in local state if replay
        const exists = state.transactions.some(t => t.id === created.id);
        const updated = exists
          ? state.transactions.map(t => (t.id === created.id ? created : t))
          : [created, ...state.transactions];
        return { transactions: updated };
      });
      return created;
    } catch (err) {
      // Re-throw so UI can handle error cleanly without silent fallback
      throw err;
    }
  },

  updateTransaction: async (id, updates) => {
    // Optimistic local update
    set(state => ({
      transactions: state.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
    // Sync status with backend if status is being updated
    if (updates.status) {
      try {
        await transactionService.updateStatus(id, updates.status, updates.reason);
      } catch (err) {
        console.warn('Backend updateStatus error:', err.message);
      }
    }
  },

  getTransaction: (id) => get().transactions.find(t => t.id === id),

  // ── Recipients ─────────────────────────────────────────────────────────────
  recipients: [...DEMO_RECIPIENTS],
  isLoadingRecipients: false,

  fetchRecipients: async () => {
    set({ isLoadingRecipients: true });
    try {
      const data = await recipientService.getRecipients();
      if (Array.isArray(data)) {
        set({ recipients: data, isLoadingRecipients: false });
      }
    } catch (err) {
      console.warn('Backend fetchRecipients error:', err.message);
      set({ isLoadingRecipients: false });
    }
  },

  addRecipient: async (rec) => {
    try {
      const created = await recipientService.createRecipient(rec);
      set(state => ({ recipients: [created, ...state.recipients] }));
      return created;
    } catch (err) {
      console.warn('Backend addRecipient error, falling back locally:', err.message);
      set(state => ({ recipients: [rec, ...state.recipients] }));
      return rec;
    }
  },

  updateRecipient: async (id, updates) => {
    try {
      const updated = await recipientService.updateRecipient(id, updates);
      set(state => ({
        recipients: state.recipients.map(r => (r.id === id ? updated : r)),
      }));
      return updated;
    } catch (err) {
      set(state => ({
        recipients: state.recipients.map(r => (r.id === id ? { ...r, ...updates } : r)),
      }));
    }
  },

  deleteRecipient: async (id) => {
    try {
      await recipientService.deleteRecipient(id);
    } catch (err) {
      console.warn('Backend deleteRecipient error:', err.message);
    }
    set(state => ({
      recipients: state.recipients.filter(r => r.id !== id),
    }));
  },

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
