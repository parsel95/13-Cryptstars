/**
 * @file dom.js
 * @description
 * Утилиты для работы с DOM-элементами и событиями.
 */

// @ts-nocheck

/**
 * Проверяет, нажата ли клавиша Escape.
 * @param {KeyboardEvent} evt - Событие клавиатуры.
 * @returns {boolean} `true`, если нажата клавиша Escape.
 */
const isEscapeKey = (evt) => evt.key === 'Escape';

/**
 * Устанавливает значение в input и триггерит событие `input`.
 * @param {HTMLInputElement} input - Элемент input.
 * @param {string|number} value - Новое значение.
 * @returns {void}
 */
const setInputValue = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Скрывает элемент с помощью `visibility: hidden` и `pointer-events: none`.
 * @param {HTMLElement} element - Элемент для скрытия.
 */
const hideElement = (element) => {
  element.style.visibility = 'hidden';
  element.style.pointerEvents = 'none';
};

/**
 * Показывает элемент, скрытый через `hideElement()`.
 * @param {HTMLElement} element - Элемент для отображения.
 */
const showElement = (element) => {
  element.style.visibility = 'visible';
  element.style.pointerEvents = 'auto';
};

/**
 * Скрывает элемент с помощью `display: none`.
 * @param {HTMLElement} element - Элемент для скрытия.
 */
const hideElementDisplayNone = (element) => {
  element.style.display = 'none';
};

/**
 * Показывает элемент с помощью `display: block`.
 * @param {HTMLElement} element - Элемент для отображения.
 */
const showElementDisplayBlock = (element) => {
  element.style.display = 'block';
};

export {
  isEscapeKey,
  setInputValue,
  hideElement,
  showElement,
  hideElementDisplayNone,
  showElementDisplayBlock,
};
