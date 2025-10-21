/* eslint-disable no-console */
/**
 * @file fetch.js
 * @description
 * Модуль для работы с API сервера: получение данных пользователей и профиля.
 * Обрабатывает ошибки сети и отображает соответствующие сообщения.
 * Включает функции для отображения состояний "сервер недоступен" и "пустой список".
 */

// @ts-nocheck

import { renderUsers } from './users.js';
import { createDataUser } from './user.js';
import { hideElement, hideElementDisplayNone } from './util.js';

// DOM-элементы
const userProfile = document.querySelector('.user-profile');
const container = document.querySelector('.container:has(.users-nav)');
const userTable = document.querySelector('.users-list__table-body');
const errorContainer = document.querySelector('.container:has(.message)');
const errorUserTable = document.querySelector('.container--lightbackground');
const tabsMapControls = document.querySelectorAll('.tabs--toggle-list-map .tabs__control');
const listButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Cписок');

/**
 * Показывает сообщение о том, что сервер недоступен.
 * Скрывает основной контент и отображает сообщение об ошибке.
 * @returns {void}
 */
const showServerUnavailable = () => {
  hideElement(userProfile);
  hideElementDisplayNone(container);
  errorContainer.style.display = 'block';
  console.error('Ошибка: сервер недоступен или вернул некорректный ответ.');
};

/**
 * Показывает сообщение о том, что список пользователей пуст.
 * Скрывает таблицу пользователей и отображает сообщение о пустом списке.
 * @returns {void}
 */
const showEmptyList = () => {
  hideElementDisplayNone(userTable);
  if (listButton.classList.contains('is-active')) {
    errorUserTable.style.display = 'block';
  }
};

/**
 * Проверяет корректность структуры данных пользователя для списка (контрагенты).
 * @param {Object} user - Проверяемый объект пользователя.
 * @returns {boolean} true, если структура корректна.
 */
const isValidContractor = (user) => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  const requiredFields = ['userName', 'status', 'exchangeRate', 'balance'];
  return requiredFields.every((field) => field in user);
};

/**
 * Проверяет корректность структуры данных профиля текущего пользователя.
 * @param {Object} user - Проверяемый объект профиля пользователя.
 * @returns {boolean} true, если структура корректна.
 */
const isValidProfile = (user) => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  const requiredFields = ['userName', 'balances', 'wallet', 'paymentMethods'];
  return requiredFields.every((field) => field in user);
};

/**
 * Получает массив пользователей с сервера.
 * @param {Function} callback - Функция обратного вызова для обработки полученных данных.
 * @returns {Promise<void>}
 */
async function getDataUsersArray (callback) {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/contractors');

    // Проверяем статус ответа
    if (!response.ok) {
      console.error(`Ошибка HTTP: ${response.status}`);
      showServerUnavailable();
      return;
    }

    let users;
    try {
      users = await response.json();
    } catch (jsonError) {
      console.error('Ошибка парсинга JSON:', jsonError);
      showServerUnavailable();
      return;
    }

    // Проверка структуры
    if (!Array.isArray(users)) {
      console.error('Некорректный формат данных: ожидался массив пользователей, получено:', users);
      showServerUnavailable();
      return;
    }

    // Пустой список
    if (users.length === 0) {
      showEmptyList();
      return;
    }

    // Фильтруем некорректных пользователей
    const validUsers = users.filter(isValidContractor);

    if (validUsers.length === 0) {
      console.warn('Все пользователи имеют некорректную структуру:', users);
      showEmptyList();
      return;
    }

    callback(validUsers);
  } catch (error) {
    console.error('Ошибка при получении данных пользователей:', error);
    showServerUnavailable();
  }
}

/**
 * Получает данные пользователей и отрисовывает их на странице.
 * @returns {void}
 */
const getDataUsers = () => {
  getDataUsersArray(renderUsers);
};

/**
 * Получает данные одного пользователя с сервера.
 * @param {Function} callback - Функция обратного вызова для обработки полученных данных.
 * @returns {Promise<void>}
 */
async function getDataUserObject (callback) {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/user');

    if (!response.ok) {
      console.error(`Ошибка HTTP: ${response.status}`);
      showServerUnavailable();
      return;
    }

    let user;
    try {
      user = await response.json();
    } catch (jsonError) {
      console.error('Ошибка парсинга JSON профиля пользователя:', jsonError);
      showServerUnavailable();
      return;
    }

    // Проверка структуры данных
    if (!isValidProfile(user)) {
      console.error('Некорректная структура данных пользователя:', user);
      showServerUnavailable();
      return;
    }

    callback(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    showServerUnavailable();
  }
}

/**
 * Получает данные одного пользователя и заполняет шапку сайта.
 * @returns {void}
 */
const getDataUser = () => {
  getDataUserObject(createDataUser);
};

export {getDataUsers, getDataUser, getDataUserObject, getDataUsersArray};
