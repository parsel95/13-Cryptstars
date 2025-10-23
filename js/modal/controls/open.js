/**
 * @file open.js
 * @description
 * Модуль для открытия модальных окон обмена.
 * Управляет инициализацией модальных окон, установкой обработчиков и валидацией форм.
 */

// @ts-nocheck

import { body } from './util.js';
import { cancelButtons, modalOverlays, onCloseModalClick, onEscKeyDown, modalBuy, modalSell } from './util.js';
import { state } from './state.js';
import { setUserInfo } from '../user-info.js';
import { setFormInputValues } from '../form-values.js';
import { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick } from '../amount-conversion.js';
import { setAllOnSubmitValidations, validateReceivingField, validateSendingField } from '../validation.js';
import { onPaymentMethodChange } from '../payment-methods.js';
import { onFormSubmit } from './form-submit.js';

/**
 * Отображает модальное окно и блокирует прокрутку страницы.
 * @param {HTMLElement} modal - Модальное окно для отображения.
 * @returns {void}
 */
const showModal = (modal) => {
  modal.style.display = 'block';
  body.classList.add('scroll-lock');
  modal.style.zIndex = '5000'; // Повышаем z-index для гарантированного отображения поверх других элементов
  modal.setAttribute('aria-hidden', 'false');
};

/**
 * Устанавливает обработчики закрытия модального окна.
 * Обрабатывает клики по кнопкам закрытия, оверлею и нажатие ESC.
 * @returns {void}
 */
const setCloseHandlers = () => {
  cancelButtons.forEach((button) => button.addEventListener('click', onCloseModalClick));
  modalOverlays.forEach((overlay) => overlay.addEventListener('click', onCloseModalClick));
  document.addEventListener('keydown', onEscKeyDown);
};

/**
 * Устанавливает обработчики для кнопок "Обменять всё".
 * @param {HTMLElement} modal - Модальное окно.
 * @param {Object} data - Данные контрагента.
 * @returns {void}
 */
const setExchangeAllHandlers = (modal, data) => {
  const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');
  state.handleExchangeAllClick = () => onExchangeAllClick(modal, data);
  exchangeAllButtons.forEach((button) =>
    button.addEventListener('click', state.handleExchangeAllClick)
  );
};

/**
 * Устанавливает обработчики ввода для полей суммы.
 * Сохраняет ссылки на активные элементы и обработчики в state.
 * @param {HTMLElement} modal - Модальное окно.
 * @param {Object} data - Данные контрагента.
 * @param {HTMLInputElement} sendingInput - Поле ввода отправляемой суммы.
 * @param {HTMLInputElement} receivingInput - Поле ввода получаемой суммы.
 * @returns {void}
 */
const setAmountHandlers = (modal, data, sendingInput, receivingInput) => {
  const sendHandler = () => onAmountSendingInput(modal, data);
  const receiveHandler = () => onAmountReceivingInput(modal, data);

  if (sendingInput && receivingInput) {
    sendingInput.addEventListener('input', sendHandler);
    receivingInput.addEventListener('input', receiveHandler);

    // Сохраняем ссылки для последующей очистки
    state.activeSendingAmountInput = sendingInput;
    state.activeSendingAmountHandler = sendHandler;
    state.activeReceivingAmountInput = receivingInput;
    state.activeReceivingAmountHandler = receiveHandler;
  }
};

/**
 * Устанавливает все обработчики для модального окна.
 * @param {HTMLElement} modal - Модальное окно.
 * @param {Object} data - Данные контрагента.
 * @param {HTMLInputElement} sendingInput - Поле ввода отправляемой суммы.
 * @param {HTMLInputElement} receivingInput - Поле ввода получаемой суммы.
 * @param {HTMLFormElement} form - Форма модального окна.
 * @returns {void}
 */
const setAllHandlers = (modal, data, sendingInput, receivingInput, form) => {
  setCloseHandlers();
  setExchangeAllHandlers(modal, data);
  setAmountHandlers(modal, data, sendingInput, receivingInput);

  form.addEventListener('submit', onFormSubmit);

  const modalFormSelect = modal.querySelector('select');
  modalFormSelect.addEventListener('change', (evt) => onPaymentMethodChange(evt, modal, data));
};

/**
 * Инициализирует экземпляры Pristine для валидации формы.
 * Создает два отдельных экземпляра для основной формы и полей суммы.
 * @param {HTMLFormElement} form - Форма для валидации.
 * @returns {void}
 */
const initPristine = (form) => {
  state.pristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  }, false);

  state.amountPristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  });
};

/**
 * Настраивает валидацию для полей формы.
 * @param {HTMLElement} modal - Модальное окно.
 * @param {Object} data - Данные контрагента.
 * @param {HTMLInputElement} sendingInput - Поле ввода отправляемой суммы.
 * @param {HTMLInputElement} receivingInput - Поле ввода получаемой суммы.
 * @returns {void}
 */
const setFormValidation = (modal, data, sendingInput, receivingInput) => {
  setAllOnSubmitValidations(state.pristine, modal, sendingInput);
  validateSendingField(state.amountPristine, data, sendingInput);
  validateReceivingField(state.amountPristine, data, receivingInput);
};

/**
 * Открывает модальное окно с данными контрагента.
 * Основная функция модуля - координирует всю инициализацию модального окна.
 * @param {Object} data - Данные контрагента для отображения.
 * @returns {void}
 */
const openUserModal = (data) => {
  const modal = data.status === 'seller' ? modalBuy : modalSell;
  const form = modal.querySelector('form');
  const sendingInput = modal.querySelector('[name="sendingAmount"]');
  const receivingInput = modal.querySelector('[name="receivingAmount"]');

  showModal(modal);
  setUserInfo(modal, data);
  setFormInputValues(modal, data);

  setAllHandlers(modal, data, sendingInput, receivingInput, form);
  initPristine(form);
  setFormValidation(modal, data, sendingInput, receivingInput);
};

export { openUserModal };
