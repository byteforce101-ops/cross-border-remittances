/**
 * client/src/services/apiClient.js
 *
 * Central HTTP client for the RemittanceOS API.
 * Handles base URLs, error extraction, and idempotency headers.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = data?.error?.message || `Request failed with status ${res.status}`;
      const errCode = data?.error?.code || `HTTP_${res.status}`;
      throw new ApiError(errMsg, res.status, errCode, data?.error?.details);
    }

    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message || 'Network connection to backend server failed. Make sure the API server is running on port 4000.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const apiClient = {
  get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  },

  getBaseUrl() {
    return API_BASE_URL;
  },
};
