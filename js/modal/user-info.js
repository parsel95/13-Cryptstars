import { getDataUserObject } from '../fetch.js';
import { populateSelect } from './payment-methods.js';
import { roundToZeroDecimal, roundToTwoDecimal } from '../util.js';

// Устанавливает имя пользователя с иконкой, если верифицирован
const setUserName = (modal, name, isVerified) => {
  const nameBlock = modal.querySelector('.transaction-info__item--name .transaction-info__data');
  const svg = '<svg width="20" height="20" aria-hidden="true"><use xlink:href="#icon-star"></use></svg>';
  nameBlock.innerHTML = isVerified ? `${svg}${name}` : name;
};

// Устанавливает курс
const setRate = (modal, exchangeRate) => {
  modal.querySelector('.transaction-info__item--exchangerate .transaction-info__data').textContent = `${roundToZeroDecimal(exchangeRate)} ₽`;
};

// Устанавливает max length для полей ввода с учётом баланса пользователя
const setInputMaxLength = (modal, balance, exchangeRate, status) => {
  const sendingInput = modal.querySelector('[name="sendingAmount"]');
  const receivingInput = modal.querySelector('[name="receivingAmount"]');

  const maxFiatUser = document.querySelector('#user-fiat-balance').textContent;
  const maxCryptoUser = document.querySelector('#user-crypto-balance').textContent;

  const maxSending = roundToZeroDecimal(balance.amount * exchangeRate);
  const maxReceiving = roundToZeroDecimal(balance.amount);
  const maxBuyerSending = roundToTwoDecimal(balance.amount / exchangeRate);

  // Определяем maxlength для sendingInput
  if (status === 'seller') {
    sendingInput.dataset.maxlength = String(
      maxFiatUser >= maxSending ? maxSending : maxFiatUser
    ).length;

    receivingInput.dataset.maxlength = String(
      maxFiatUser >= maxSending ? maxReceiving : maxCryptoUser
    ).length + 3;
  } else {
    sendingInput.dataset.maxlength = String(
      maxCryptoUser >= maxReceiving ? maxBuyerSending : maxCryptoUser
    ).length;

    receivingInput.dataset.maxlength = String(
      maxCryptoUser >= maxBuyerSending ? maxReceiving : maxCryptoUser * exchangeRate
    ).length;
  }
};


// Устанавливает лимиты
const setLimits = (modal, minAmount, balance, exchangeRate, status) => {
  const max = status === 'seller'
    ? balance.amount * exchangeRate
    : balance.amount;
  const maxString = String(roundToZeroDecimal(max));

  modal
    .querySelector('.transaction-info__item--cashlimit .transaction-info__data')
    .textContent = `${minAmount}\u00A0₽\u00A0-\u00A0${maxString}\u00A0₽`;
};

// Устанавливает адрес кошелька в модалке покупки
const setWalletAdress = (modal, data) => {
  modal.querySelector('.custom-input__input').placeholder = data.wallet.address;
};

// Основная функция установки информации о пользователе
const setUserInfo = (modal, data) => {
  const { userName, exchangeRate, minAmount, balance, status, isVerified, paymentMethods } = data;

  setUserName(modal, userName, isVerified);
  setRate(modal, exchangeRate);
  setLimits(modal, minAmount, balance, exchangeRate, status);
  setInputMaxLength(modal, balance, exchangeRate, status);

  if (status === 'seller') {
    getDataUserObject((userData) => setWalletAdress(modal, userData));
    populateSelect(modal, paymentMethods);
  } else {
    setWalletAdress(modal, data);
    getDataUserObject((userData) => populateSelect(modal, userData.paymentMethods));
  }
};

export { setUserInfo };
