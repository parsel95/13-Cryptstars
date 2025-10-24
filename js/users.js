/**
 * @file users.js
 * @description
 * Модуль для отрисовки и фильтрации списка пользователей на странице P2P-обмена.
 * Отвечает за создание карточек пользователей, отображение их платёжных методов,
 * фильтрацию по активным вкладкам ("Купить", "Продать", "Проверенные") и
 * открытие модального окна обмена при нажатии кнопки "Обменять".
 *
 * Использует шаблон `.users-list__table-row` для генерации карточек.
 */

// @ts-nocheck

import { checkedUsersButton, buyButton, sellButton } from './tabs.js';
import { openUserModal} from './modal/controls/open.js';
import { roundToZeroDecimal } from './util/math.js';

// DOM-элементы
const container = document.querySelector('.users-list__table-body');
const userTemplate = document.querySelector('#user-table-row__template').content.querySelector('.users-list__table-row');

/**
 * Форматирует лимит наличных в зависимости от типа пользователя.
 * @param {Object} data - Данные пользователя.
 * @param {'buyer'|'seller'} data.status - Роль пользователя.
 * @param {number} data.minAmount - Минимальная сумма сделки.
 * @param {{amount: number, currency: string}} data.balance - Баланс пользователя.
 * @param {number} data.exchangeRate - Курс обмена.
 * @returns {string} Отформатированный текст лимита.
 */
const formatCashLimit = (data) => data.status === 'seller'
  ? `${data.minAmount} ₽ - ${roundToZeroDecimal(data.balance.amount * data.exchangeRate)} ₽`
  : `${data.minAmount} ₽ - ${roundToZeroDecimal(data.balance.amount)} ₽`;

/**
 * Отрисовывает список платёжных методов пользователя в виде бейджей.
 * @param {HTMLElement} paymentContainer - Контейнер, куда добавляются методы оплаты.
 * @param {Array<{provider: string}>} methods - Массив объектов с названиями провайдеров.
 */
const renderPaymentMethods = (paymentContainer, methods) => {
  paymentContainer.innerHTML = '';
  methods.forEach((method) => {
    const li = document.createElement('li');
    li.classList.add('users-list__badges-item', 'badge');
    li.textContent = method.provider;
    paymentContainer.appendChild(li);
  });
};

/**
 * Создаёт DOM-элемент карточки пользователя на основе данных и шаблона.
 * @param {Object} data - Объект с данными пользователя.
 * @param {string} data.userName - Имя пользователя.
 * @param {boolean} data.isVerified - Флаг верификации пользователя.
 * @param {'buyer'|'seller'} data.status - Роль пользователя.
 * @param {number} data.exchangeRate - Курс обмена.
 * @param {{amount: number, currency: string}} data.balance - Баланс пользователя.
 * @param {Array<{provider: string}>} data.paymentMethods - Список платёжных методов.
 * @returns {HTMLElement} Готовый DOM-элемент строки таблицы пользователя.
 */
const createUser = (data) => {
  const userItem = userTemplate.cloneNode(true);
  const paymentMethodsContainer = userItem.querySelector('.users-list__badges-list');

  userItem.querySelector('.users-list__table-name span').textContent = data.userName;
  if (!data.isVerified) {
    userItem.querySelector('.users-list__table-name svg').remove();
  }
  userItem.querySelector('.users-list__table-currency').textContent = data.balance.currency;
  userItem.querySelector('.users-list__table-exchangerate').textContent = `${roundToZeroDecimal(data.exchangeRate)} ₽`;

  userItem.querySelector('.users-list__table-cashlimit').textContent = formatCashLimit(data);

  if (data.status === 'seller') {
    renderPaymentMethods(paymentMethodsContainer, data.paymentMethods);
  } else {
    paymentMethodsContainer.innerHTML = '';
  }

  // Обработчик кнопки "Обменять"
  userItem.querySelector('.btn--greenborder').addEventListener('click', () => {
    openUserModal(data);
  });

  return userItem;
};

/**
 * Фильтрует список пользователей в зависимости от активных вкладок и чекбоксов.
 * @param {Array<Object>} users - Исходный массив пользователей.
 * @returns {Array<Object>} Отфильтрованный массив пользователей.
 */
const filterUsers = (users) => {
  let filtered = users;

  if (checkedUsersButton.checked) {
    filtered = filtered.filter((user) => user.isVerified);
  }
  if (buyButton.classList.contains('is-active')) {
    filtered = filtered.filter((user) => user.status === 'seller');
  }
  if (sellButton.classList.contains('is-active')) {
    filtered = filtered.filter((user) => user.status === 'buyer');
  }

  return filtered;
};

/**
 * Отрисовывает список пользователей в таблице на основе шаблона и фильтрации.
 * @param {Array<Object>} users - Массив данных пользователей.
 */
const renderUsers = (users) => {
  container.querySelectorAll('.users-list__table-row').forEach((element) => element.remove());

  const userFragment = document.createDocumentFragment();
  filterUsers(users).forEach((user) => {
    userFragment.append(createUser(user));
  });

  container.appendChild(userFragment);
};


export {renderUsers, createUser, container};
