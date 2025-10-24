/**
 * @file api-client.js
 * @description Унифицированный клиент для работы с API
 */

import { Config } from '../config.js';

class ApiClient {
  constructor() {
    this.baseURL = Config.API.BASE_URL;
    this.timeout = Config.API.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  // Специфичные методы API
  async getContractors() {
    return this.get(Config.API.ENDPOINTS.CONTRACTORS);
  }

  async getUser() {
    return this.get(Config.API.ENDPOINTS.USER);
  }

  async submitExchange(formData) {
    return this.post(Config.API.ENDPOINTS.EXCHANGE, formData);
  }
}

export const apiClient = new ApiClient();
