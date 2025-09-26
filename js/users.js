import { checkedUsersButton, buyButton, sellButton } from './tabs.js';
import { openUserModal} from './modal/controls/open.js';
import { roundToZeroDecimal } from './util.js';

// DOM-элементы
const container = document.querySelector('.users-list__table-body');
const userTemplate = document.querySelector('#user-table-row__template').content.querySelector('.users-list__table-row');

// Форматирует лимит наличных в зависимости от типа пользователя
const formatCashLimit = (data) => data.status === 'seller'
  ? `${data.minAmount} ₽ - ${roundToZeroDecimal(data.balance.amount * data.exchangeRate)} ₽`
  : `${data.minAmount} ₽ - ${roundToZeroDecimal(data.balance.amount)} ₽`;

// Отрисовка платёжных методов
const renderPaymentMethods = (paymentContainer, methods) => {
  paymentContainer.innerHTML = '';
  methods.forEach((method) => {
    const li = document.createElement('li');
    li.classList.add('users-list__badges-item', 'badge');
    li.textContent = method.provider;
    paymentContainer.appendChild(li);
  });
};

// Функция создания карточки пользователя
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
  userItem.querySelector('.btn--greenborder').addEventListener('click', () => {
    openUserModal(data);
  });

  return userItem;
};

// Функция фильтрации пользователей по активным вкладкам
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

// Функция рендера списка пользователей
const renderUsers = (users) => {
  container.querySelectorAll('.users-list__table-row').forEach((element) => element.remove());

  const userFragment = document.createDocumentFragment();
  filterUsers(users).forEach((user) => {
    userFragment.append(createUser(user));
  });

  container.appendChild(userFragment);
};


export {renderUsers, createUser, container};
