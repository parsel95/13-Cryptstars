import { roundToZeroDecimal, roundToTwoDecimal, setInputValue } from '../util.js';
import { limitInputLength } from './validation.js';
import { amountPristine } from './modal.js';

// Обработчик для кнопки "Обменять всё"
const onExchangeAllClick = (modal, data) => {
  const sendingInput = modal.querySelector('[name="sendingAmount"]');
  const receivingInput = modal.querySelector('[name="receivingAmount"]');
  const maxFiatUser = parseFloat(document.querySelector('#user-fiat-balance').textContent.replace(',', '.')) || 0;
  const maxCryptoUser = parseFloat(document.querySelector('#user-crypto-balance').textContent.replace(',', '.')) || 0;

  const maxSendingAmount = (data.status === 'seller') ?
    data.balance.amount * data.exchangeRate - 1 :
    data.balance.amount / data.exchangeRate;

  if (data.status === 'seller') {
    setInputValue(
      sendingInput,
      roundToZeroDecimal(Math.min(maxFiatUser, maxSendingAmount))
    );
  } else {
    if (maxCryptoUser < maxSendingAmount) {
      setInputValue(sendingInput, maxCryptoUser);
    } else {
      setInputValue(receivingInput, data.balance.amount);
    }
  }
};

// Пересчет суммы при вводе отправляемой валюты
const onAmountSendingInput = (evt, modal, data) => {
  const field = modal.querySelector('[name="receivingAmount"]');
  limitInputLength(evt.target);

  const value = Number(evt.target.value);
  const rawResult = data.status === 'buyer'
    ? value * data.exchangeRate
    : value / data.exchangeRate;

  evt.target.dataset.rawValue = value;
  field.dataset.rawValue = rawResult;

  const result = data.status === 'buyer'
    ? roundToZeroDecimal(rawResult)
    : roundToTwoDecimal(rawResult);

  field.value = String(result).replace(/\.$/, '');

  amountPristine.validate(evt.target);
  amountPristine.validate(field);
};

// Пересчет суммы при вводе получаемой валюты
const onAmountReceivingInput = (evt, modal, data) => {
  const field = modal.querySelector('[name="sendingAmount"]');
  limitInputLength(evt.target);

  const value = Number(evt.target.value);
  const rawResult = data.status === 'buyer'
    ? value / data.exchangeRate
    : value * data.exchangeRate;

  evt.target.dataset.rawValue = value;
  field.dataset.rawValue = rawResult;

  const result = data.status === 'buyer'
    ? roundToTwoDecimal(rawResult)
    : roundToZeroDecimal(rawResult);

  field.value = String(result).replace(/\.$/, '');

  amountPristine.validate(evt.target);
  amountPristine.validate(field);
};

export { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick };
