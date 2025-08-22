import { checkedUsersButton, buyButton, sellButton } from './tabs.js';
import { openUserModal} from './modal/modal.js';
import { roundToZeroDecimal } from './util.js';

const container = document.querySelector('.users-list__table-body');
const userTemplate = document.querySelector('#user-table-row__template').content.querySelector('.users-list__table-row');

const createUser = (data) => {
  const userItem = userTemplate.cloneNode(true);
  const paymentMethodsContainer = userItem.querySelector('.users-list__badges-list');

  userItem.querySelector('.users-list__table-name span').textContent = data.userName;
  if (!data.isVerified) {
    userItem.querySelector('.users-list__table-name svg').remove();
  }
  userItem.querySelector('.users-list__table-currency').textContent = data.balance.currency;
  userItem.querySelector('.users-list__table-exchangerate').textContent = `${roundToZeroDecimal(data.exchangeRate)} ₽`;

  userItem.querySelector('.users-list__table-cashlimit').textContent =
    data.status === 'seller'
      ? `${data.minAmount}\u00A0₽\u00A0-\u00A0${roundToZeroDecimal(data.balance.amount * data.exchangeRate)}\u00A0₽`
      : `${data.minAmount}\u00A0₽\u00A0-\u00A0${roundToZeroDecimal(data.balance.amount)}\u00A0₽`;

  paymentMethodsContainer.innerHTML = '';
  if (data.status === 'seller') {
    data.paymentMethods.forEach((method) => {
      const li = document.createElement('li');
      li.classList.add('users-list__badges-item', 'badge');
      li.textContent = method.provider;
      paymentMethodsContainer.appendChild(li);
    });
  }

  userItem.querySelector('.btn--greenborder').addEventListener('click', () => {
    openUserModal(data);
  });

  return userItem;
};


// eslint-disable-next-line no-shadow
const renderUsers = (users) => {
  let usersData = users;

  container.querySelectorAll('.users-list__table-row').forEach((element) => element.remove());

  const userFragment = document.createDocumentFragment();
  if (checkedUsersButton.checked) {
    usersData = usersData.filter((user) => user.isVerified);
  }
  if (buyButton.classList.contains('is-active')) {
    usersData = usersData.filter((user) => user.status === 'seller');
  }
  if (sellButton.classList.contains('is-active')) {
    usersData = usersData.filter((user) => user.status === 'buyer');
  }

  usersData.forEach((userItem) => {
    const userElement = createUser(userItem);
    userFragment.append(userElement);
  });

  container.appendChild(userFragment);
};


export {renderUsers, createUser, container};
