/**
 * server/src/repositories/RecipientRepository.js
 *
 * Repository abstraction for demo recipients.
 */

import { FileStorage } from './FileStorage.js';
import { SEED_RECIPIENTS } from './seeds.js';

export class RecipientRepository {
  constructor(storage = new FileStorage('recipients', SEED_RECIPIENTS)) {
    this.storage = storage;
  }

  async findAll() {
    return this.storage.getAll();
  }

  async findById(id) {
    return this.storage.find(r => r.id === id) || null;
  }

  async create(recipient) {
    const id = recipient.id || `rec-${Date.now().toString().slice(-6)}`;
    const full = {
      id,
      country: 'India',
      verified: recipient.verified ?? false,
      totalTransfers: recipient.totalTransfers || 0,
      totalVolumeINR: recipient.totalVolumeINR || 0,
      createdAt: new Date().toISOString(),
      ...recipient,
    };
    return this.storage.save(full);
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this.storage.save(merged);
  }

  async delete(id) {
    return this.storage.delete(id);
  }
}

export const recipientRepository = new RecipientRepository();
