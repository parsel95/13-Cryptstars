/**
 * @file user-info.js
 * @description
 * Модуль для установки информации о пользователе в модальных окнах обмена.
 * Заполняет данные о контрагенте: имя, курс, лимиты, платёжные методы и адрес кошелька.
 * Автоматически рассчитывает максимальные длины полей ввода на основе балансов.
 */

// @ts-nocheck

import { getDataUserObject } from '../fetch.js';
import { populateSelect } from './payment-methods.js';
import { roundToZeroDecimal, roundToTwoDecimal } from '../util.js';

/**
 * Устанавливает имя пользователя с иконкой верификации, если пользователь верифицирован.
 * @param {HTMLElement} modal - Модальное окно, в котором устанавливается имя.
 * @param {string} name - Имя пользователя.
 * @param {boolean} isVerified - Флаг верификации пользователя.
 * @returns {void}
 */
const setUserName = (modal, name, isVerified) => {
  // Находим блок для имени пользователя в модальном окне
  const nameBlock = modal.querySelector('.transaction-info__item--name .transaction-info__data');

  // SVG иконка звезды для верифицированных пользователей
  const svg = '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>';

  // Устанавливаем HTML: для верифицированных добавляем иконку
  nameBlock.innerHTML = isVerified ? `${svg}${name}` : name;
};

/**
 * Устанавливает курс обмена валют в модальном окне.
 * @param {HTMLElement} modal - Модальное окно, в котором устанавливается курс.
 * @param {number} exchangeRate - Курс обмена валют.
 * @returns {void}
 */
const setRate = (modal, exchangeRate) => {
  // Находим блок для курса и устанавливаем округлённое значение с символом рубля
  modal.querySelector('.transaction-info__item--exchangerate .transaction-info__data')
    .textContent = `${roundToZeroDecimal(exchangeRate)} ₽`;
};

/**
 * Устанавливает максимальную длину ввода для полей суммы на основе балансов пользователей.
 * Рассчитывает maxlength с учётом доступных средств и курса обмена.
 * @param {HTMLElement} modal - Модальное окно с полями ввода.
 * @param {{amount: number, currency: string}} balance - Баланс контрагента.
 * @param {number} exchangeRate - Курс обмена валют.
 * @param {'buyer'|'seller'} status - Статус контрагента.
 * @returns {void}
 */
const setInputMaxLength = (modal, balance, exchangeRate, status) => {
  // Получаем поля ввода сумм отправки и получения
  const sendingInput = modal.querySelector('[name="sendingAmount"]');
  const receivingInput = modal.querySelector('[name="receivingAmount"]');

  // Получаем актуальные балансы текущего пользователя из интерфейса
  const maxFiatUser = document.querySelector('#user-fiat-balance').textContent;
  const maxCryptoUser = document.querySelector('#user-crypto-balance').textContent;

  // Рассчитываем максимально возможные суммы для операций
  const maxSending = roundToZeroDecimal(balance.amount * exchangeRate); // Макс. отправка для продавца
  const maxReceiving = roundToZeroDecimal(balance.amount); // Макс. получение для продавца
  const maxBuyerSending = roundToTwoDecimal(balance.amount / exchangeRate); // Макс. отправка для покупателя

  // Устанавливаем maxlength в зависимости от статуса пользователя
  if (status === 'seller') {
    // Для продавца: отправка в фиате, получение в крипто
    sendingInput.dataset.maxlength = String(
      maxFiatUser >= maxSending ? maxSending : maxFiatUser
    ).length;

    receivingInput.dataset.maxlength = String(
      maxFiatUser >= maxSending ? maxReceiving : maxCryptoUser
    ).length + 3; // +3 для учёта десятичных знаков
  } else {
    // Для покупателя: отправка в крипто, получение в фиате
    sendingInput.dataset.maxlength = String(
      maxCryptoUser >= maxReceiving ? maxBuyerSending : maxCryptoUser
    ).length;

    receivingInput.dataset.maxlength = String(
      // @ts-ignore
      maxCryptoUser >= maxBuyerSending ? maxReceiving : maxCryptoUser * exchangeRate
    ).length;
  }
};

/**
 * Устанавливает лимиты сделки (минимальную и максимальную суммы) в модальном окне.
 * @param {HTMLElement} modal - Модальное окно, в котором устанавливаются лимиты.
 * @param {number} minAmount - Минимальная сумма сделки.
 * @param {{amount: number, currency: string}} balance - Баланс контрагента.
 * @param {number} exchangeRate - Курс обмена валют.
 * @param {'buyer'|'seller'} status - Статус контрагента.
 * @returns {void}
 */
const setLimits = (modal, minAmount, balance, exchangeRate, status) => {
  // Рассчитываем максимальную сумму в зависимости от статуса
  const max = status === 'seller'
    ? balance.amount * exchangeRate // Для продавца: баланс в крипто * курс
    : balance.amount; // Для покупателя: баланс в фиате

  // Форматируем максимальную сумму (округляем до целого)
  const maxString = String(roundToZeroDecimal(max));

  // Устанавливаем текст с лимитами (с неразрывными пробелами)
  modal.querySelector('.transaction-info__item--cashlimit .transaction-info__data')
    .textContent = `${minAmount}\u00A0₽\u00A0-\u00A0${maxString}\u00A0₽`;
};

/**
 * Устанавливает адрес кошелька в поле placeholder для модалки покупки.
 * @param {HTMLElement} modal - Модальное окно, в котором устанавливается адрес.
 * @param {Object} data - Данные пользователя, содержащие адрес кошелька.
 * @param {string} data.wallet.address - Адрес кошелька.
 * @returns {void}
 */
const setWalletAdress = (modal, data) => {
  // Находим поле ввода и устанавливаем адрес кошелька как placeholder
  modal.querySelector('.custom-input__input').placeholder = data.wallet.address;
};

/**
 * Основная функция установки всей информации о пользователе в модальном окне.
 * Координирует вызов всех вспомогательных функций для заполнения данных.
 * @param {HTMLElement} modal - Модальное окно, которое нужно заполнить данными.
 * @param {Object} data - Данные контрагента для отображения.
 * @param {string} data.userName - Имя пользователя.
 * @param {number} data.exchangeRate - Курс обмена.
 * @param {number} data.minAmount - Минимальная сумма сделки.
 * @param {{amount: number, currency: string}} data.balance - Баланс пользователя.
 * @param {'buyer'|'seller'} data.status - Статус пользователя.
 * @param {boolean} data.isVerified - Флаг верификации.
 * @param {Array<Object>} data.paymentMethods - Список платёжных методов.
 * @returns {void}
 */
const setUserInfo = (modal, data) => {
  // Деструктурируем данные для удобства работы
  const { userName, exchangeRate, minAmount, balance, status, isVerified, paymentMethods } = data;

  // Устанавливаем базовую информацию
  setUserName(modal, userName, isVerified);
  setRate(modal, exchangeRate);
  setLimits(modal, minAmount, balance, exchangeRate, status);
  setInputMaxLength(modal, balance, exchangeRate, status);

  // Устанавливаем специфичные данные в зависимости от статуса
  if (status === 'seller') {
    // Для продавца: получаем данные текущего пользователя для адреса кошелька
    // и используем методы оплаты контрагента
    getDataUserObject((userData) => setWalletAdress(modal, userData));
    populateSelect(modal, paymentMethods);
  } else {
    // Для покупателя: используем адрес кошелька контрагента
    // и получаем методы оплаты текущего пользователя
    setWalletAdress(modal, data);
    getDataUserObject((userData) => populateSelect(modal, userData.paymentMethods));
  }
};

export { setUserInfo };
