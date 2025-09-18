import { body } from './util.js';
import { getActiveModal, getActiveForm, handleCloseModal, onEscKeyDown, cancelButtons, modalOverlays } from './util.js';
import { state } from './state.js';

// DOM-элементы
const userWalletInputs = document.querySelectorAll('.custom-input__input');

// Скрытие модального окна
const hideModal = (modal) => {
  modal.style.display = 'none';
  body.classList.remove('scroll-lock');
};

// Сброс формы и pristine
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

// Очищает плейсхолдеры в полях ввода при закрытии модального окна
const clearInputPlaceholders = (modal) => {
  const inputCard = modal.querySelector('.custom-input--card input');

  inputCard.placeholder = '';
  userWalletInputs.forEach((user) => {
    user.placeholder = '';
  });
};

// Удаляет обработчики событий с полей ввода при закрытии модалльного окна
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

// Удаляет обработчики клика по кнопке "Обменять всё"
const removeExchangeAllHandlers = (modal) => {
  if (state.handleExchangeAllClick) {
    const exchangeAllButtons = modal.querySelectorAll('.custom-input__btn');
    exchangeAllButtons.forEach((button) =>
      button.removeEventListener('click', state.handleExchangeAllClick)
    );
    state.handleExchangeAllClick = null;
  }
};

// Удаляет обработчики закрытия модального окна
const removeCancelHandlers = () => {
  document.removeEventListener('keydown', onEscKeyDown);
  cancelButtons.forEach((button) => button.removeEventListener('click', handleCloseModal));
  modalOverlays.forEach((overlay) => overlay.removeEventListener('click', handleCloseModal));
};

// Удаляет все обработчики событий
const removeAllHandlers = (modal) => {
  removeAmountInputHandlers();
  removeExchangeAllHandlers(modal);
  removeCancelHandlers();
};

// Закрытие модального окна
const hideUserModal = () => {
  const modal = getActiveModal();
  const form = getActiveForm();

  clearInputPlaceholders(modal);
  hideModal(modal);
  resetFormAndPristine(form);
  removeAllHandlers(modal);
};

export { hideUserModal };
