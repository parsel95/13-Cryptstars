/**
  * @file form.js
 * @description
 * Утилиты для управления состоянием кнопок форм и отображением сообщений.
 */

// @ts-nocheck

import { Config } from '../config.js';

/**
 * Блокирует кнопку отправки формы, восстанавливая её текст.
 * @param {HTMLButtonElement} submitButton - Кнопка для блокировки.
 * @param {string} text - Текст для отображения на заблокированной кнопке.
 * @returns {void}
 */
const blockSubmitButton = (submitButton, text) => {
  submitButton.disabled = true;
  submitButton.textContent = text;
};

/**
 * Разблокирует кнопку отправки формы, восстанавливая её текст.
 * @param {HTMLButtonElement} submitButton - Кнопка для разблокировки.
 * @param {string} text - Текст для отображения на разблокированной кнопке.
 * @returns {void}
 */
const unblockSubmitButton = (submitButton, text) => {
  submitButton.disabled = false;
  submitButton.textContent = text;
};

/**
 * Показывает выбранное сообщение (успех или ошибка) и скрывает остальные.
 * @param {HTMLElement} messageElement - Элемент сообщения для отображения.
 * @param {number} [timeout=2000] - Время отображения сообщения в миллисекундах.
 * @returns {void}
 */
const showMessage = (messageElement, timeout = Config.UI.MESSAGE_TIMEOUT) => {
  const allMessages = document.querySelectorAll('.modal__validation-message');

  allMessages.forEach((element) => {
    element.style.display = 'none';
  });

  messageElement.style.display = 'flex';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, timeout);
};

export {
  blockSubmitButton,
  unblockSubmitButton,
  showMessage,
};
