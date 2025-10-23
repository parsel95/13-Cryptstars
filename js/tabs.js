/**
 * @file tabs.js
 * @description
 * Модуль управления вкладками списка пользователей и карты.
 * Обрабатывает переключение между вкладками "Купить"/"Продать",
 * а также блокировку кнопки карты при необходимости.
 */

// @ts-nocheck

import { getDataUsers, getDataUsersArray } from './fetch.js';
import { addMarkersToMap } from './map.js';

/** Чекбокс фильтра "Только проверенные пользователи" */
const checkedUsersButton = document.querySelector('#checked-users');

/** Контролы вкладок "Купить" / "Продать" */
const tabsListControls = document.querySelectorAll('.tabs--toggle-buy-sell .tabs__control');
const buyButton = Array.from(tabsListControls).find((button) => button.textContent === 'Купить');
const sellButton = Array.from(tabsListControls).find((button) => button.textContent === 'Продать');

/** Контролы вкладок "Список" / "Карта" */
const tabsMapControls = document.querySelectorAll('.tabs--toggle-list-map .tabs__control');
const mapButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Карта');

/**
 * Универсальная функция обновления списка пользователей и карты.
 * Вызывается при изменении фильтра или вкладки.
 */
const updateUsers = () => {
  getDataUsers();
  getDataUsersArray((users) => addMarkersToMap(users, checkedUsersButton.checked));
};

// Обработчик изменения чекбокса "Только проверенные пользователи"
checkedUsersButton.addEventListener('change', updateUsers);

/**
 * Переключает активную вкладку списка пользователей.
 * Добавляет класс is-active к выбранной вкладке и убирает с неактивной.
 * Также блокирует кнопку карты при выборе вкладки "Продать".
 *
 * @param {HTMLElement} activeBtn - Активная вкладка, по которой кликнули.
 * @param {HTMLElement} inactiveBtn - Неактивная вкладка, которую нужно деактивировать.
 */
const toggleListTabs = (activeBtn, inactiveBtn) => {
  requestAnimationFrame(() => {
    activeBtn.classList.add('is-active');
    inactiveBtn.classList.remove('is-active');

    activeBtn.style.transform = 'scale(0.95)';
    requestAnimationFrame(() => {
      activeBtn.style.transform = 'scale(1)';
      activeBtn.style.transition = 'transform 0.2s ease';
    });
  });

  getDataUsers();

  // Блокировка кнопки карты, если выбрана вкладка "Продать"
  if (activeBtn === sellButton) {
    mapButton.disabled = true;
  } else {
    mapButton.disabled = false;
  }
};

// Обработчики кликов по кнопкам
buyButton.addEventListener('click', () => toggleListTabs(buyButton, sellButton));
sellButton.addEventListener('click', () => toggleListTabs(sellButton, buyButton));

export {checkedUsersButton, buyButton, sellButton };
