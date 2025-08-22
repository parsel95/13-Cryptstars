import { getDataUsers, getDataUsersArray } from './fetch.js';
import { addMarkersToMap } from './map.js';

const checkedUsersButton = document.querySelector('#checked-users');
const tabsListControls = document.querySelectorAll('.tabs--toggle-buy-sell .tabs__control');
const buyButton = Array.from(tabsListControls).find((button) => button.textContent === 'Купить');
const sellButton = Array.from(tabsListControls).find((button) => button.textContent === 'Продать');

checkedUsersButton.addEventListener('change', () => {
  getDataUsers();
  getDataUsersArray((users) => addMarkersToMap(users, checkedUsersButton.checked));
});

const toggleListTabs = (activeBtn, inactiveBtn) => {
  activeBtn.classList.add('is-active');
  inactiveBtn.classList.remove('is-active');
  getDataUsers();
};

buyButton.addEventListener('click', () => {
  toggleListTabs(buyButton, sellButton);
});

sellButton.addEventListener('click', () => {
  toggleListTabs(sellButton, buyButton);
});

export {checkedUsersButton, buyButton, sellButton };
