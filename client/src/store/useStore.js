/** client/src/store/useStore.js — Zustand global store */
import { create } from 'zustand';
import { DEMO_TRANSACTIONS, DEMO_RECIPIENTS } from '../services/mockData.js';

export const useStore = create((set, get) => ({
  // ── Transactions ───────────────────────────────────────────────────────────
  transactions: [...DEMO_TRANSACTIONS],
  addTransaction: (tx) => set(state => ({ transactions: [tx, ...state.transactions] })),
  updateTransaction: (id, updates) =>
    set(state => ({
      transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    })),
  getTransaction: (id) => get().transactions.find(t => t.id === id),

  // ── Recipients ─────────────────────────────────────────────────────────────
  recipients: [...DEMO_RECIPIENTS],
  addRecipient: (rec) => set(state => ({ recipients: [rec, ...state.recipients] })),
  updateRecipient: (id, updates) =>
    set(state => ({
      recipients: state.recipients.map(r => r.id === id ? { ...r, ...updates } : r),
    })),
  deleteRecipient: (id) =>
    set(state => ({ recipients: state.recipients.filter(r => r.id !== id) })),

  // ── UI State ───────────────────────────────────────────────────────────────
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  // ── Send Money wizard ──────────────────────────────────────────────────────
  sendMoneyDraft: null,
  setSendMoneyDraft: (draft) => set({ sendMoneyDraft: draft }),
  clearSendMoneyDraft: () => set({ sendMoneyDraft: null }),

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: [
    { id: 'n1', type: 'risk', message: 'CBR-2026-001245 flagged — High risk score (74)', time: '14:20', read: false },
    { id: 'n2', type: 'info', message: 'CBR-2026-001243 settlement processing via SWIFT', time: '12:05', read: false },
    { id: 'n3', type: 'success', message: 'CBR-2026-001242 completed — ₹1,65,800 delivered', time: '11:15', read: true },
  ],
  markNotificationRead: (id) =>
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,
}));
