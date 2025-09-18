import { body } from './util.js';
import { cancelButtons, modalOverlays, handleCloseModal, onEscKeyDown, modalBuy, modalSell } from './util.js';
import { state } from './state.js';
import { setUserInfo } from '../user-info.js';
import { setFormInputValues } from '../form-values.js';
import { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick } from '../amount-conversion.js';
import { setAllOnSubmitValidations, validateReceivingField, validateSendingField } from '../validation.js';
import { onPaymentMethodChange } from '../payment-methods.js';
import { onFormSubmit } from './form-submit.js';

// // Отображение модального окна
// const showModal = (modal) => {
//   modal.style.display = 'block';
//   body.classList.add('scroll-lock');
//   modal.style.zIndex = '5000';
// };

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
  state.handleExchangeAllClick = () => onExchangeAllClick(modal, data);
  exchangeAllButtons.forEach((button) =>
    button.addEventListener('click', state.handleExchangeAllClick)
  );

  // Устанавливаем обработчики пересчета
  const sendHandler = (evt) => onAmountSendingInput(evt, modal, data);
  const receiveHandler = (evt) => onAmountReceivingInput(evt, modal, data);

  if (sendingInput && receivingInput) {
    sendingInput.addEventListener('input', sendHandler);
    receivingInput.addEventListener('input', receiveHandler);

    state.activeSendingAmountInput = sendingInput;
    state.activeSendingAmountHandler = sendHandler;
    state.activeReceivingAmountInput = receivingInput;
    state.activeReceivingAmountHandler = receiveHandler;
  }

  // Основной Pristine — для пароля и метода оплаты
  state.pristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  }, false);

  // Pristine для полей ввода суммы
  state.amountPristine = new Pristine(form, {
    classTo: 'custom-input--pristine',
    errorTextParent: 'custom-input--pristine',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
  });

  // Обработчик отправки формы
  form.addEventListener('submit', onFormSubmit);

  // Устанавливаем правила валидации
  setAllOnSubmitValidations(state.pristine, modal, sendingInput);
  validateSendingField (state.amountPristine, data, sendingInput);
  validateReceivingField(state.amountPristine, data, receivingInput);

  // Обработчик смены метода оплаты
  const paymentHandler = (evt) => onPaymentMethodChange(evt, modal, data);
  modalFormSelect.addEventListener('change', paymentHandler);
};

export { openUserModal };
