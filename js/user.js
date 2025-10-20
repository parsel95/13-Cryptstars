/**
 * @file user.js
 * @description
 * Модуль для отображения данных пользователя в шапке сайта.
 * Содержит DOM-ссылки на элементы с балансами и именем пользователя,
 * а также функцию для заполнения этих данных.
 */

// @ts-nocheck

// DOM-элементы для отображения балансов и имени пользователя
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userFiatBalance = document.querySelector('#user-fiat-balance');
const userName = document.querySelector('.user-profile__name span');

/**
 * Заполняет данные пользователя в шапке сайта.
 *
 * @param {Object} data - Объект с данными пользователя.
 * @param {string} data.userName - Имя пользователя.
 * @param {Array<{currency: string, amount: number}>} data.balances - Балансы пользователя по валютам.
 * @param {number} data.balances[].amount - Сумма баланса.
 * @param {string} data.balances[].currency - Валюта баланса, например 'KEKS' или 'RUB'.
 */
export const createDataUser = (data) => {
  userCryptoBalance.textContent = data.balances.find((balance) => balance.currency === 'KEKS').amount;
  userFiatBalance.textContent = data.balances.find((balance) => balance.currency === 'RUB').amount;
  userName.textContent = data.userName;
};
