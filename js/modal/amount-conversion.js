/**
 * @file amount-conversion.js
 * @description
 * Управляет пересчетом валют в модальных окнах (ввод сумм, кнопка "Обменять всё").
 * Включает логику округления, ограничений по длине ввода и оптимизацию с помощью debounce.
 */

// @ts-nocheck

import { roundToZeroDecimal, roundToTwoDecimal, setInputValue, debounce } from '../util.js';
import { limitInputLength } from './validation.js';
import { state } from './controls/state.js';

/**
 * @typedef {Object} ExchangeData
 * @property {'buyer'|'seller'} status - Статус пользователя (покупатель или продавец).
 * @property {number} exchangeRate - Курс обмена валют.
 * @property {{ amount: number }} balance - Баланс пользователя в текущей валюте.
 */

/**
 * Получает инпуты для ввода валюты внутри модального окна.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @returns {{sending: HTMLInputElement, receiving: HTMLInputElement}} Объект с полями ввода.
 */
const getInputs = (modal) => ({
  sending: modal.querySelector('[name="sendingAmount"]'),
  receiving: modal.querySelector('[name="receivingAmount"]'),
});

/**
 * Пересчитывает значение одной валюты в другую при вводе в поле.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @param {ExchangeData} data - Данные пользователя для пересчета.
 * @param {'sending'|'receiving'} type - Тип инпута, который редактируется пользователем.
 * @returns {void}
 */
const recalcAmount = (modal, data, type) => {
  const { sending, receiving } = getInputs(modal);
  const input = type === 'sending' ? sending : receiving;
  const field = type === 'sending' ? receiving : sending;

  limitInputLength(input);

  const value = Number(input.value);

  // Основная формула пересчета валюты:
  // Если вводят "sending":
  //  - покупатель: умножаем на курс
  //  - продавец: делим на курс
  // Если вводят "receiving":
  //  - покупатель: делим на курс
  //  - продавец: умножаем на курс
  const rawResult =
    // eslint-disable-next-line no-nested-ternary
    type === 'sending'
      ? (data.status === 'buyer' ? value * data.exchangeRate : value / data.exchangeRate)
      : (data.status === 'buyer' ? value / data.exchangeRate : value * data.exchangeRate);

  // Сохраняем сырое значение в data-* для валидации
  input.dataset.rawValue = value;
  field.dataset.rawValue = rawResult;

  // Округляем результат:
  // Нули — для отправки покупателем или получения продавцом,
  // Два знака — для остальных случаев
  const result =
    (type === 'sending' && data.status === 'buyer') ||
    (type === 'receiving' && data.status === 'seller')
      ? roundToZeroDecimal(rawResult)
      : roundToTwoDecimal(rawResult);

  // Оптимизированное обновление в следующем кадре анимации
  requestAnimationFrame(() => {
    field.value = String(result).replace(/\.$/, '');
    // Валидируем оба поля после пересчета
    state.amountPristine.validate(input);
    state.amountPristine.validate(field);
  });
};

/**
 * Обработчик кнопки "Обменять всё" — заполняет максимальную сумму для обмена.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @param {ExchangeData} data - Данные пользователя с балансом и статусом.
 * @returns {void}
 */
const onExchangeAllClick = (modal, data) => {
  const { sending, receiving } = getInputs(modal);
  const maxFiatUser = parseFloat(document.querySelector('#user-fiat-balance')?.textContent.replace(',', '.') || '0');
  const maxCryptoUser = parseFloat(document.querySelector('#user-crypto-balance')?.textContent.replace(',', '.') || '0');

  // Вычисляем максимальную сумму для отправки пользователем
  const maxSendingAmount =
    data.status === 'seller'
      ? data.balance.amount * data.exchangeRate - 1 // вычитаем 1 для предотвращения округления и переполнения
      : data.balance.amount / data.exchangeRate;

  // Заполняем поля в зависимости от типа пользователя
  if (data.status === 'seller') {
    // Продавец: проверяем максимально возможную сумму в фиатной валюте
    setInputValue(
      sending,
      roundToZeroDecimal(Math.min(maxFiatUser, maxSendingAmount))
    );
  } else {
    // Покупатель: проверяем максимально возможную сумму в криптовалюте
    if (maxCryptoUser < maxSendingAmount) {
      setInputValue(sending, maxCryptoUser);
    } else {
      setInputValue(receiving, data.balance.amount);
    }
  }
};

/**
 * Пересчитывает сумму отправки с задержкой (debounce).
 * Используется, чтобы пересчёт происходил только после того,
 * как пользователь прекратил ввод на 400 мс.
 * @param {HTMLElement} modal - Активное модальное окно.
 * @param {ExchangeData} data - Данные пользователя и курса валют.
 * @returns {void}
 */
const debouncedRecalcSending = debounce((modal, data) => recalcAmount(modal, data, 'sending'), 400);

/**
 * Пересчитывает сумму получения с задержкой (debounce).
 * Позволяет избежать лишних пересчётов при быстром вводе данных пользователем.
 * @param {HTMLElement} modal - Активное модальное окно.
 * @param {ExchangeData} data - Объект с данными о пользователе и курсе валют.
 * @returns {void}
 */
const debouncedRecalcReceiving = debounce((modal, data) => recalcAmount(modal, data, 'receiving'), 400);

/**
 * Обработчик ввода суммы для отправки валюты.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @param {ExchangeData} data - Данные пользователя для пересчета.
 * @returns {void}
 */
const onAmountSendingInput = (modal, data) => recalcAmount(modal, data, 'sending');

/**
 * Обработчик ввода суммы для получения валюты.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @param {ExchangeData} data - Данные пользователя для пересчета.
 * @returns {void}
 */
const onAmountReceivingInput = (modal, data) => recalcAmount(modal, data, 'receiving');

export {
  onAmountSendingInput,
  onAmountReceivingInput,
  onExchangeAllClick,
  debouncedRecalcSending,
  debouncedRecalcReceiving,
};
