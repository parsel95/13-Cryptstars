import { getDataUsers, getDataUsersArray } from './fetch.js';
import { addMarkersToMap } from './map.js';

// Элементы управления вкладками
const checkedUsersButton = document.querySelector('#checked-users');
const tabsListControls = document.querySelectorAll('.tabs--toggle-buy-sell .tabs__control');
const buyButton = Array.from(tabsListControls).find((button) => button.textContent === 'Купить');
const sellButton = Array.from(tabsListControls).find((button) => button.textContent === 'Продать');

// Универсальная функция обновления списка и карты
const updateUsers = () => {
  getDataUsers();
  getDataUsersArray((users) => addMarkersToMap(users, checkedUsersButton.checked));
};

// Обработчик изменения чекбокса
checkedUsersButton.addEventListener('change', updateUsers);

// Функция переключения активной вкладки
const toggleListTabs = (activeBtn, inactiveBtn) => {
  activeBtn.classList.add('is-active');
  inactiveBtn.classList.remove('is-active');
  getDataUsers();
};

// Обработчики кликов по кнопкам
buyButton.addEventListener('click', () => toggleListTabs(buyButton, sellButton));
sellButton.addEventListener('click', () => toggleListTabs(sellButton, buyButton));

export {checkedUsersButton, buyButton, sellButton };
