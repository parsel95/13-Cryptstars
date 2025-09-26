import { renderUsers } from './users.js';
import { createDataUser } from './user.js';
import { hideElement, hideElementDisplayNone } from './util.js';

// Элементы страницы
const userProfile = document.querySelector('.user-profile');
const container = document.querySelector('.container:has(.users-nav)');
const userTable = document.querySelector('.users-list__table-body');
const errorContainer = document.querySelector('.container:has(.message)');
const errorUserTable = document.querySelector('.container--lightbackground');
const tabsMapControls = document.querySelectorAll('.tabs--toggle-list-map .tabs__control');
const listButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Cписок');

// Показывает сообщение о том, что сервер недоступен
const showServerUnavailable = () => {
  hideElement(userProfile);
  hideElementDisplayNone(container);
  errorContainer.style.display = 'block';
};

// Показывает сообщение о том, что список пользователей пуст
const showEmptyList = () => {
  hideElementDisplayNone(userTable);
  if (listButton.classList.contains('is-active')) {
    errorUserTable.style.display = 'block';
  }
};

// Получение данных пользователей с сервера
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

// Получение данных пользователей и отрисовка их на странице
const getDataUsers = () => {
  getDataUsersArray(renderUsers);
};

// Получение данных одного пользователя с сервера
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

// Получение данных одного пользователя и заполнение шапки сайта
const getDataUser = () => {
  getDataUserObject(createDataUser);
};

export {getDataUsers, getDataUser, getDataUserObject, getDataUsersArray};
