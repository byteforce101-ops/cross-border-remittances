/**
 * server/src/services/recipientService.js
 *
 * Recipient business logic service.
 */

import { recipientRepository } from '../repositories/RecipientRepository.js';

export class RecipientService {
  async getRecipients() {
    return recipientRepository.findAll();
  }

  async getRecipientById(id) {
    const rec = await recipientRepository.findById(id);
    if (!rec) {
      throw new Error(`Recipient with ID "${id}" was not found.`);
    }
    return rec;
  }

  async createRecipient(data) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Recipient name is required.');
    }
    if (!data.upiId || typeof data.upiId !== 'string' || !data.upiId.includes('@')) {
      throw new Error('A valid UPI ID is required (e.g. name@bank).');
    }

    return recipientRepository.create({
      name: data.name.trim(),
      upiId: data.upiId.trim(),
      bankName: data.bankName ? data.bankName.trim() : 'Indian Partner Bank',
      phoneMask: data.phoneMask || '•••• ' + Math.floor(1000 + Math.random() * 9000),
      verified: Boolean(data.verified),
    });
  }

  async updateRecipient(id, updates) {
    await this.getRecipientById(id); // Ensure exists
    return recipientRepository.update(id, updates);
  }

  async deleteRecipient(id) {
    await this.getRecipientById(id); // Ensure exists
    return recipientRepository.delete(id);
  }
}

export const recipientService = new RecipientService();
