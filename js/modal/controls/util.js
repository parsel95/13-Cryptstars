import { isEscapeKey } from '../../util.js';
import { hideUserModal } from './close.js';

// DOM-элементы
const modalBuy = document.querySelector('.modal--buy');
const modalSell = document.querySelector('.modal--sell');
const cancelButtons = document.querySelectorAll('.modal__close-btn');
const modalOverlays = document.querySelectorAll('.modal__overlay');
const body = document.body;

// Получение текущего открытого модального окна и формы
const getActiveModal = () => modalBuy.style.display === 'block' ? modalBuy : modalSell;
const getActiveForm = () => getActiveModal().querySelector('form');

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

export {
  cancelButtons,
  modalOverlays,
  body,
  modalBuy,
  modalSell,
  getActiveModal,
  getActiveForm,
  handleCloseModal,
  onEscKeyDown,
};
