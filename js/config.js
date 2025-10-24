/**
 * @file config.js
 * @description Конфигурационные параметры приложения
 */

export const Config = {
  API: {
    BASE_URL: 'https://cryptostar.grading.htmlacademy.pro',
    ENDPOINTS: {
      CONTRACTORS: '/contractors',
      USER: '/user',
      EXCHANGE: '/'
    },
    TIMEOUT: 10000
  },

  MAP: {
    DEFAULT_VIEW: {
      lat: 59.92749,
      lng: 30.31127
    },
    ZOOM: 10,
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },

  UI: {
    DEBOUNCE_DELAY: 500,
    MESSAGE_TIMEOUT: 2000,
    THROTTLE_DELAY: 1500
  },

  VALIDATION: {
    PASSWORD: '180712',
  }
};
