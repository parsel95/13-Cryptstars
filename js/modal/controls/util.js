/**
 * @file modal-utils.js
 * @description
 * Модуль утилит для работы с модальными окнами обмена.
 * Содержит функции для получения активных модальных окон, обработки закрытия
 * и управления DOM-элементами модальных окон.
 */

// @ts-nocheck

import { isEscapeKey } from '../../util/dom.js';
import { closeUserModal } from './close.js';

// DOM-элементы
const modalBuy = document.querySelector('.modal--buy');
const modalSell = document.querySelector('.modal--sell');
const cancelButtons = document.querySelectorAll('.modal__close-btn');
const modalOverlays = document.querySelectorAll('.modal__overlay');
const body = document.body;

/**
 * Получает текущее активное модальное окно.
 * @returns {HTMLElement} Активное модальное окно.
 */
const getActiveModal = () => modalBuy.style.display === 'block' ? modalBuy : modalSell;

/**
 * Получает форму внутри активного модального окна.
 * @returns {HTMLFormElement} Форма активного модального окна.
 */
const getActiveForm = () => getActiveModal().querySelector('form');

/**
 * Обработчик клика по кнопке закрытия модального окна.
 * @returns {void}
 */
function onCloseModalClick() {
  closeUserModal();
}

/**
 * Обработчик нажатия ESC для закрытия модального окна.
 * @param {KeyboardEvent} evt - Событие клавиатуры.
 * @returns {void}
 */
function onEscKeyDown(evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeUserModal();
  }
}

export {
  cancelButtons,
  modalOverlays,
  body,
  modalBuy,
  modalSell,
  getActiveModal,
  getActiveForm,
  onCloseModalClick,
  onEscKeyDown,
};
