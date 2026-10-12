/**
 * server/src/repositories/TransactionRepository.js
 *
 * Repository abstraction for transactions.
 */

import { FileStorage } from './FileStorage.js';
import { SEED_TRANSACTIONS } from './seeds.js';

export class TransactionRepository {
  constructor(storage = new FileStorage('transactions', SEED_TRANSACTIONS)) {
    this.storage = storage;
  }

  async findAll(filters = {}) {
    let list = this.storage.getAll();
    if (filters.status && filters.status !== 'all') {
      list = list.filter(t => t.status === filters.status);
    }
    if (filters.route && filters.route !== 'all') {
      list = list.filter(t => t.route === filters.route);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t =>
        t.id?.toLowerCase().includes(q) ||
        t.senderName?.toLowerCase().includes(q) ||
        t.recipientName?.toLowerCase().includes(q) ||
        t.recipientUpi?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  async findById(id) {
    return this.storage.find(t => t.id === id) || null;
  }

  async create(transaction) {
    return this.storage.save(transaction);
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this.storage.save(merged);
  }

  async getNextId() {
    const list = this.storage.getAll();
    let maxNum = 42;
    for (const t of list) {
      if (t.id && t.id.startsWith('TXN-D-')) {
        const n = parseInt(t.id.replace('TXN-D-', ''), 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }
    return `TXN-D-${String(maxNum + 1).padStart(4, '0')}`;
  }
}

export const transactionRepository = new TransactionRepository();
