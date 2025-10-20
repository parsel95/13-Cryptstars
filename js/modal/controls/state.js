/**
 * @file state.js
 * @description
 * Модуль для управления состоянием валидации и обработчиков событий в модальных окнах.
 * Содержит экземпляры Pristine для валидации форм и ссылки на активные элементы.
 */

/**
 * Объект состояния приложения для управления валидацией и обработчиками.
 * @type {Object}
 * @property {Pristine|null} pristine - Основной экземпляр Pristine для валидации формы.
 * @property {Pristine|null} amountPristine - Экземпляр Pristine для валидации суммы.
 * @property {HTMLInputElement|null} activeSendingAmountInput - Текущий input поля "Отправляю".
 * @property {Function|null} activeSendingAmountHandler - Обработчик события input для поля "Отправляю".
 * @property {HTMLInputElement|null} activeReceivingAmountInput - Текущий input поля "Получаю".
 * @property {Function|null} activeReceivingAmountHandler - Обработчик события input для поля "Получаю".
 * @property {Function|null} handleExchangeAllClick - Обработчик для кнопок "Обменять всё".
 */
export const state = {
  pristine: null,
  amountPristine: null,
  activeSendingAmountInput: null,
  activeSendingAmountHandler: null,
  activeReceivingAmountInput: null,
  activeReceivingAmountHandler: null,
  handleExchangeAllClick: null,
};
