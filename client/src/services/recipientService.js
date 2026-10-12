/**
 * client/src/services/recipientService.js
 *
 * Recipient API client.
 */

import { apiClient } from './apiClient.js';

export const recipientService = {
  async getRecipients() {
    return apiClient.get('/recipients');
  },

  async getRecipientById(id) {
    return apiClient.get(`/recipients/${id}`);
  },

  async createRecipient(data) {
    return apiClient.post('/recipients', data);
  },

  async updateRecipient(id, data) {
    return apiClient.put(`/recipients/${id}`, data);
  },

  async deleteRecipient(id) {
    return apiClient.delete(`/recipients/${id}`);
  },
};
