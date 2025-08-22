import { isEscapeKey } from '../util.js';
import { setAllOnSubmitValidations } from './validation.js';
import { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick } from './amount-conversion.js';
import { setUserInfo } from './user-info.js';
import { setFormInputValues } from './form-values.js';
import { onPaymentMethodChange } from './payment-methods.js';
import { validateReceivingField, validateSendingField } from './validation.js';

// DOM-элементы
const modalBuy = document.querySelector('.modal--buy');
const modalSell = document.querySelector('.modal--sell');
const body = document.body;

const cancelButtons = document.querySelectorAll('.modal__close-btn');
const modalOverlays = document.querySelectorAll('.modal__overlay');
const modalBuyForm = document.querySelector('.modal-buy');
const modalSellForm = document.querySelector('.modal-sell');
const userWalletInputs = document.querySelectorAll('.custom-input__input');

//Переменные для сохранения pristine вне функции
let pristine = null;
let amountPristine = null;

// Переменные для отслеживания текущих обработчиков и полей
let activeSendingAmountHandler = null;
let activeSendingAmountInput = null;
let activeReceivingAmountInput = null;
let activeReceivingAmountHandler = null;

// Получение текущего открытого модального окна и формы
const getActiveModal = () => modalBuy.style.display === 'block' ? modalBuy : modalSell;
const getActiveForm = () => modalBuy.style.display === 'block' ? modalBuyForm : modalSellForm;

// Удаляет обработчики событий с полей ввода при закрытии модалльного окна
const removeAmountInputHandlers = () => {
  if (activeSendingAmountInput && activeSendingAmountHandler) {
    activeSendingAmountInput.removeEventListener('input', activeSendingAmountHandler);
  }
  if (activeReceivingAmountInput && activeReceivingAmountHandler) {
    activeReceivingAmountInput.removeEventListener('input', activeReceivingAmountHandler);
  }

  activeSendingAmountInput = null;
  activeSendingAmountHandler = null;
  activeReceivingAmountInput = null;
  activeReceivingAmountHandler = null;
};

// Закрытие модального окна
const hideUserModal = () => {
  const modal = getActiveModal();
  const form = getActiveForm();
  const inputCard = modal.querySelector('.custom-input--card input');

  modal.style.display = 'none';
  form.reset();
  body.classList.remove('scroll-lock');

  // Сброс плейсхолдеров
  inputCard.placeholder = '';
  userWalletInputs.forEach((user) => {
    user.placeholder = '';
  });

  // Удаляем обработчики
  document.removeEventListener('keydown', onEscKeyDown);
  cancelButtons.forEach((button) => button.addEventListener('click', () => hideUserModal));
  modalOverlays.forEach((overlay) => overlay.addEventListener('click', () => hideUserModal));

  // Сбрасываем pristine
  if (pristine) {
    pristine.reset();
  }
  pristine = null;
  if (amountPristine) {
    amountPristine.reset();
  }
  amountPristine = null;

  removeAmountInputHandlers();
};

// Обработчик нажатия ESC для закрытия модального окна
function onEscKeyDown (evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    hideUserModal();
  }
}

function showZeroAmountError(input) {
  const parent = input.closest('.custom-input--pristine');
  let error = parent.querySelector('.custom-input__error');

  if (!error) {
    error = document.createElement('div');
    error.className = 'custom-input__error';
    parent.appendChild(error);
  }

  error.textContent = 'Сумма не должна равняться нулю';
  error.style.display = 'block';
  parent.classList.add('has-error');
}

const onFormSubmit = (evt) => {
  evt.preventDefault();
  const form = getActiveForm();
  const sendingInput = form.querySelector('[name="sendingAmount"]');

  const MainIsValid = pristine.validate();
  const AmountIsValid = amountPristine.validate();

  const sendingValue = parseFloat(sendingInput.value.trim().replace(',', '.'));

  if (sendingValue === 0) {
    showZeroAmountError(sendingInput);
    return;
  }

  if (MainIsValid && AmountIsValid) {
    console.log('Можно отправлять');
    // form.submit();
    // hideUserModal();
  } else {
    console.log('Форма невалидна');
  }
};

// Открытие модального окна с данными контрагента
const openUserModal = (data) => {
  const modal = data.status === 'seller' ? modalBuy : modalSell;
  const form = modal.querySelector('form');
  const sendingInput = modal.querySelector('[name="sendingAmount"]');
  const receivingInput = modal.querySelector('[name="receivingAmount"]');
  const modalFormSelect = modal.querySelector('select');
  const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');

  modal.style.display = 'block';
  body.classList.add('scroll-lock');
  modal.style.zIndex = '5000';
  document.addEventListener('keydown', onEscKeyDown);

  // Заполняем информацию в модалке
  setUserInfo(modal, data);
  setFormInputValues(modal, data);

  cancelButtons.forEach((button) => button.addEventListener('click', hideUserModal));
  modalOverlays.forEach((overlay) => overlay.addEventListener('click', hideUserModal));
  exchangeAllButtons.forEach((button) => button.addEventListener('click', () => onExchangeAllClick(modal, data)));

  // Устанавливаем обработчики пересчета
  const sendHandler = (evt) => onAmountSendingInput(evt, modal, data);
  const receiveHandler = (evt) => onAmountReceivingInput(evt, modal, data);

  if (sendingInput && receivingInput) {
    sendingInput.addEventListener('input', sendHandler);
    receivingInput.addEventListener('input', receiveHandler);

    activeSendingAmountInput = sendingInput;
    activeSendingAmountHandler = sendHandler;
    activeReceivingAmountInput = receivingInput;
    activeReceivingAmountHandler = receiveHandler;
  }

  // Основной Pristine — для пароля и метода оплаты
  pristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  }, false);

  // Pristine для полей ввода суммы
  amountPristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  });

  form.addEventListener('submit', onFormSubmit);

  setAllOnSubmitValidations(pristine, modal, sendingInput);
  validateSendingField (amountPristine, data, sendingInput);
  validateReceivingField(amountPristine, data, receivingInput);

  //
  const paymentHandler = (evt) => onPaymentMethodChange(evt, modal, data);
  modalFormSelect.addEventListener('change', paymentHandler);
};

export {openUserModal, pristine, amountPristine};
