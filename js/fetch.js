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
 * Получает массив пользователей с сервера.
 * @param {Function} callback - Функция обратного вызова для обработки полученных данных.
 * @returns {Promise<void>}
 */
async function getDataUsersArray (callback) {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/contractors');
    const users = await response.json();

    if (!response.ok) {
      showServerUnavailable();
      return;
    }

    if (Array.isArray(users) && users.length === 0) {
      showEmptyList();
      return;
    }

    callback(users);


  } catch (error) {
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
    const user = await response.json();

    callback(user);

    if (!response.ok) {
      showServerUnavailable();
      return;
    }
  } catch (error) {
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
