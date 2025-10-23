/**
 * @file close.js
 * @description
 * Модуль для закрытия модальных окон обмена.
 * Управляет очисткой состояния, удалением обработчиков и сбросом валидации.
 */

// @ts-nocheck

import { body } from './util.js';
import {
  getActiveModal,
  getActiveForm,
  onCloseModalClick,
  onEscKeyDown,
  cancelButtons,
  modalOverlays
} from './util.js';
import { state } from './state.js';

/**
 * Все инпуты в кошельке пользователя (используются для очистки плейсхолдеров при закрытии модального окна)
 * @type {NodeListOf<HTMLInputElement>}
 */
const userWalletInputs = document.querySelectorAll('.custom-input__input');

/**
 * Скрывает модальное окно и разблокирует прокрутку страницы.
 * @param {HTMLElement} modal - Модальное окно, которое нужно скрыть.
 * @returns {void}
 */
const hideModal = (modal) => {
  modal.style.display = 'none';
  body.classList.remove('scroll-lock');
  modal.setAttribute('aria-hidden', 'true');
};

/**
 * Сбрасывает состояние формы и pristine-валидаторов.
 * @param {HTMLFormElement} form - Активная форма модального окна.
 * @returns {void}
 */
const resetFormAndPristine = (form) => {
  if (state.pristine) {
    state.pristine.reset();
  }
  state.pristine = null;

  if (state.amountPristine) {
    state.amountPristine.reset();
  }
  state.amountPristine = null;

  form.reset();
};

/**
 * Очищает плейсхолдеры в полях ввода при закрытии модального окна.
 * @param {HTMLElement} modal - Активное модальное окно.
 * @returns {void}
 */
const clearInputPlaceholders = (modal) => {
  const inputCard = modal.querySelector('.custom-input--card input');

  if (inputCard) {
    inputCard.placeholder = '';
  }
  userWalletInputs.forEach((user) => {
    user.placeholder = '';
  });
};

/**
 * Удаляет обработчики событий для полей ввода суммы при закрытии модального окна.
 * @returns {void}
 */
const removeAmountInputHandlers = () => {
  if (state.activeSendingAmountInput && state.activeSendingAmountHandler) {
    state.activeSendingAmountInput.removeEventListener('input', state.activeSendingAmountHandler);
  }
  if (state.activeReceivingAmountInput && state.activeReceivingAmountHandler) {
    state.activeReceivingAmountInput.removeEventListener('input', state.activeReceivingAmountHandler);
  }

  state.activeSendingAmountInput = null;
  state.activeSendingAmountHandler = null;
  state.activeReceivingAmountInput = null;
  state.activeReceivingAmountHandler = null;
};

/**
 * Удаляет обработчики кликов по кнопке "Обменять всё" внутри модального окна.
 * @param {HTMLElement} modal - Активное модальное окно.
 * @returns {void}
 */
const removeExchangeAllHandlers = (modal) => {
  if (state.handleExchangeAllClick) {
    const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');
    exchangeAllButtons.forEach((button) =>
      button.removeEventListener('click', state.handleExchangeAllClick)
    );
    state.handleExchangeAllClick = null;
  }
};

/**
 * Удаляет обработчики закрытия модального окна (по Esc, по кнопке, по клику на overlay).
 * @returns {void}
 */
const removeCancelHandlers = () => {
  document.removeEventListener('keydown', onEscKeyDown);
  cancelButtons.forEach((button) => button.removeEventListener('click', onCloseModalClick));
  modalOverlays.forEach((overlay) => overlay.removeEventListener('click', onCloseModalClick));
};

/**
 * Удаляет все обработчики событий, связанные с модальным окном.
 * @param {HTMLElement} modal - Активное модальное окно.
 * @returns {void}
 */
const removeAllHandlers = (modal) => {
  removeAmountInputHandlers();
  removeExchangeAllHandlers(modal);
  removeCancelHandlers();
};

/**
 * Полностью закрывает модальное окно:
 * - очищает поля и плейсхолдеры,
 * - сбрасывает валидацию,
 * - убирает обработчики событий.
 * @returns {void}
 */
const closeUserModal = () => {
  const modal = getActiveModal();
  const form = getActiveForm();

  clearInputPlaceholders(modal);
  hideModal(modal);
  resetFormAndPristine(form);
  removeAllHandlers(modal);
};

export { closeUserModal };
