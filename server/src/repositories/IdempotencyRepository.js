/**
 * server/src/repositories/IdempotencyRepository.js
 *
 * Stores processed idempotency keys to ensure identical requests return the cached response
 * and prevent accidental duplicate transfers.
 */

import { FileStorage } from './FileStorage.js';

export class IdempotencyRepository {
  constructor(storage = new FileStorage('idempotency', [])) {
    this.storage = storage;
  }

  async get(key) {
    if (!key) return null;
    const entry = this.storage.find(e => e.id === key);
    if (!entry) return null;

    // Optional expiration check (e.g. 24 hours)
    const ageMs = Date.now() - new Date(entry.createdAt).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      this.storage.delete(key);
      return null;
    }
    return entry;
  }

  async save(key, responseData) {
    if (!key) return null;
    return this.storage.save({
      id: key,
      response: responseData,
      createdAt: new Date().toISOString(),
    });
  }
}

export const idempotencyRepository = new IdempotencyRepository();
