const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userFiatBalance = document.querySelector('#user-fiat-balance');
const userName = document.querySelector('.user-profile__name span');

// Функция для заполнения данных пользователя в шапке сайта
export const createDataUser = (data) => {
  userCryptoBalance.textContent = data.balances.find((balance) => balance.currency === 'KEKS').amount;
  userFiatBalance.textContent = data.balances.find((balance) => balance.currency === 'RUB').amount;
  userName.textContent = data.userName;
};
