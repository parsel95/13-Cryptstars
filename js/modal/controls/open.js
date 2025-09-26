import { body } from './util.js';
import { cancelButtons, modalOverlays, onCloseModalClick, onEscKeyDown, modalBuy, modalSell } from './util.js';
import { state } from './state.js';
import { setUserInfo } from '../user-info.js';
import { setFormInputValues } from '../form-values.js';
import { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick } from '../amount-conversion.js';
import { setAllOnSubmitValidations, validateReceivingField, validateSendingField } from '../validation.js';
import { onPaymentMethodChange } from '../payment-methods.js';
import { onFormSubmit } from './form-submit.js';

// Отображение модального окна
const showModal = (modal) => {
  modal.style.display = 'block';
  body.classList.add('scroll-lock');
  modal.style.zIndex = '5000';
};

// Установка обработчиков закрытия модального окна
const setCloseHandlers = () => {
  cancelButtons.forEach((button) => button.addEventListener('click', onCloseModalClick));
  modalOverlays.forEach((overlay) => overlay.addEventListener('click', onCloseModalClick));
  document.addEventListener('keydown', onEscKeyDown);
};

// Установка обработчиков клика по кнопке "Обменять всё"
const setExchangeAllHandlers = (modal, data) => {
  const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');
  state.handleExchangeAllClick = () => onExchangeAllClick(modal, data);
  exchangeAllButtons.forEach((button) =>
    button.addEventListener('click', state.handleExchangeAllClick)
  );
};

// Установка обработчиков ввода в поля суммы
const setAmountHandlers = (modal, data, sendingInput, receivingInput) => {
  const sendHandler = () => onAmountSendingInput(modal, data);
  const receiveHandler = () => onAmountReceivingInput(modal, data);

  if (sendingInput && receivingInput) {
    sendingInput.addEventListener('input', sendHandler);
    receivingInput.addEventListener('input', receiveHandler);

    state.activeSendingAmountInput = sendingInput;
    state.activeSendingAmountHandler = sendHandler;
    state.activeReceivingAmountInput = receivingInput;
    state.activeReceivingAmountHandler = receiveHandler;
  }
};

// Установка всех обработчиков модального окна
const setAllHandlers = (modal, data, sendingInput, receivingInput, form) => {
  setCloseHandlers();
  setExchangeAllHandlers(modal, data);
  setAmountHandlers(modal, data, sendingInput, receivingInput);

  form.addEventListener('submit', onFormSubmit);

  const modalFormSelect = modal.querySelector('select');
  modalFormSelect.addEventListener('change', (evt) => onPaymentMethodChange(evt, modal, data));
};

// Инициализация pristine для формы
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

// Привязка валидации и обработчиков формы
const setFormValidation = (modal, data, sendingInput, receivingInput) => {
  setAllOnSubmitValidations(state.pristine, modal, sendingInput);
  validateSendingField(state.amountPristine, data, sendingInput);
  validateReceivingField(state.amountPristine, data, receivingInput);
};

// Открытие модального окна с данными контрагента
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
