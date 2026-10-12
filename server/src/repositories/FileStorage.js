/**
 * server/src/repositories/FileStorage.js
 *
 * Simple file-backed persistence engine for development and local testing.
 * Automatically saves state to server/data/*.json so data survives restarts.
 *
 * LIMITATIONS:
 * - Single-instance file-backed storage (not distributed).
 * - Not intended for high-concurrency production deployments.
 * - Modular design ready to be replaced with PostgreSQL/Supabase repository in Phase 4.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export class FileStorage {
  constructor(collectionName, seedData = []) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.seedData = seedData;
    this._ensureDirectory();
    this.items = this._load();
  }

  _ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'object') return parsed;
      }
    } catch (err) {
      console.warn(`[FileStorage] Could not parse ${this.filePath}, falling back to seeds.`, err.message);
    }

    // Initialize with clone of seed data
    const initial = JSON.parse(JSON.stringify(this.seedData));
    this._persist(initial);
    return initial;
  }

  _persist(data) {
    try {
      this._ensureDirectory();
      const payload = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.filePath, payload, 'utf-8');
    } catch (err) {
      console.error(`[FileStorage] Error persisting ${this.collectionName}:`, err);
    }
  }

  getAll() {
    return [...this.items];
  }

  find(predicate) {
    return this.items.find(predicate);
  }

  filter(predicate) {
    return this.items.filter(predicate);
  }

  save(item) {
    const existingIndex = this.items.findIndex(x => x.id === item.id);
    if (existingIndex >= 0) {
      this.items[existingIndex] = { ...this.items[existingIndex], ...item };
    } else {
      this.items.unshift(item);
    }
    this._persist(this.items);
    return item;
  }

  delete(id) {
    const lenBefore = this.items.length;
    this.items = this.items.filter(x => x.id !== id);
    if (this.items.length !== lenBefore) {
      this._persist(this.items);
      return true;
    }
    return false;
  }
}
