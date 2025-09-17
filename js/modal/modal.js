import { isEscapeKey, showMessage } from '../util.js';
import { setAllOnSubmitValidations, validateReceivingField, validateSendingField } from './validation.js';
import { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick } from './amount-conversion.js';
import { setUserInfo } from './user-info.js';
import { setFormInputValues } from './form-values.js';
import { onPaymentMethodChange } from './payment-methods.js';

// DOM-элементы
const modalBuy = document.querySelector('.modal--buy');
const modalSell = document.querySelector('.modal--sell');
const body = document.body;
const cancelButtons = document.querySelectorAll('.modal__close-btn');
const modalOverlays = document.querySelectorAll('.modal__overlay');
const userWalletInputs = document.querySelectorAll('.custom-input__input');

//Переменные для сохранения pristine вне функции
let pristine = null;
let amountPristine = null;

// Переменные для отслеживания текущих обработчиков и полей
let activeSendingAmountHandler = null;
let activeSendingAmountInput = null;
let activeReceivingAmountInput = null;
let activeReceivingAmountHandler = null;

// Общий обработчик для "Обменять всё"
let handleExchangeAllClick = null;

// Получение текущего открытого модального окна и формы
const getActiveModal = () => modalBuy.style.display === 'block' ? modalBuy : modalSell;
const getActiveForm = () => getActiveModal().querySelector('form');

// Сброс формы и pristine
const resetFormAndPristine = (form) => {
  if (pristine) {
    pristine.reset();
  }
  pristine = null;

  if (amountPristine) {
    amountPristine.reset();
  }
  amountPristine = null;

  form.reset();
};

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

// Отображение модального окна
const showModal = (modal) => {
  modal.style.display = 'block';
  body.classList.add('scroll-lock');
  modal.style.zIndex = '5000';
};

// Скрытие модального окна
const hideModal = (modal) => {
  modal.style.display = 'none';
  body.classList.remove('scroll-lock');
};

// Удаляет обработчики клика по кнопке "Обменять всё"
const removeExchangeAllHandlers = (modal) => {
  if (handleExchangeAllClick) {
    const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');
    exchangeAllButtons.forEach((button) =>
      button.removeEventListener('click', handleExchangeAllClick)
    );
    handleExchangeAllClick = null;
  }
};

// Закрытие модального окна
const hideUserModal = () => {
  const modal = getActiveModal();
  const form = getActiveForm();
  const inputCard = modal.querySelector('.custom-input--card input');

  inputCard.placeholder = '';
  userWalletInputs.forEach((user) => {
    user.placeholder = '';
  });

  document.removeEventListener('keydown', onEscKeyDown);
  cancelButtons.forEach((button) => button.removeEventListener('click', handleCloseModal));
  modalOverlays.forEach((overlay) => overlay.removeEventListener('click', handleCloseModal));

  hideModal(modal);
  resetFormAndPristine(form);
  removeAmountInputHandlers();
  removeExchangeAllHandlers(modal);
};

// Обработчик клика по кнопке закрытия
function handleCloseModal () {
  hideUserModal();
}

// Обработчик нажатия ESC для закрытия модального окна
function onEscKeyDown (evt) {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    hideUserModal();
  }
}

// Показывает ошибку валидации для поля суммы, если пользователь ввёл значение, равное нулю
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

// Обработчик отправки формы обмена
const onFormSubmit = async (evt) => {
  evt.preventDefault();
  const form = getActiveForm();
  const sendingInput = form.querySelector('[name="sendingAmount"]');
  const receivingInput = form.querySelector('[name="receivingAmount"]');
  const successMessage = form.querySelector('.modal__validation-message--success');
  const errorMessage = form.querySelector('.modal__validation-message--error');

  const MainIsValid = pristine.validate();
  const AmountIsValid = amountPristine.validate();

  const sendingValue = parseFloat(sendingInput.value.trim().replace(',', '.'));

  if (sendingValue === 0) {
    showZeroAmountError(sendingInput);
    return;
  }

  if (!MainIsValid || !AmountIsValid) {
    showMessage(errorMessage);
    return;
  }

  const formData = new FormData(evt.target);

  formData.set('sendingAmount', sendingInput.dataset.rawValue);
  formData.set('receivingAmount', receivingInput.dataset.rawValue);

  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/', {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('Ответ сервера:', response.status, responseText);

    if (response.ok) {
      showMessage(successMessage);
      form.reset();
    } else {
      showMessage(errorMessage);
    }
  } catch (err) {
    console.error('Ошибка сети:', err);
    showMessage(errorMessage);
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

  // Отображаем модальное окно
  modal.style.display = 'block';
  body.classList.add('scroll-lock');
  modal.style.zIndex = '5000';
  document.addEventListener('keydown', onEscKeyDown);

  // Заполняем информацию в модалке
  setUserInfo(modal, data);
  setFormInputValues(modal, data);

  // Устанавливаем обработчики закрытия
  cancelButtons.forEach((button) => button.addEventListener('click', handleCloseModal));
  modalOverlays.forEach((overlay) => overlay.addEventListener('click', handleCloseModal));

  // Кнопка "Обменять всё"
  handleExchangeAllClick = () => onExchangeAllClick(modal, data);
  exchangeAllButtons.forEach((button) =>
    button.addEventListener('click', handleExchangeAllClick)
  );

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

  // Обработчик отправки формы
  form.addEventListener('submit', onFormSubmit);

  // Устанавливаем правила валидации
  setAllOnSubmitValidations(pristine, modal, sendingInput);
  validateSendingField (amountPristine, data, sendingInput);
  validateReceivingField(amountPristine, data, receivingInput);

  // Обработчик смены метода оплаты
  const paymentHandler = (evt) => onPaymentMethodChange(evt, modal, data);
  modalFormSelect.addEventListener('change', paymentHandler);
};

export {openUserModal, pristine, amountPristine};
