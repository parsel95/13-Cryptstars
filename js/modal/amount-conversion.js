import { roundToZeroDecimal, roundToTwoDecimal, setInputValue, debounce } from '../util.js';
import { limitInputLength } from './validation.js';
import { state } from './controls/state.js';

//  Получение инпутов
const getInputs = (modal) => ({
  sending: modal.querySelector('[name="sendingAmount"]'),
  receiving: modal.querySelector('[name="receivingAmount"]'),
});

// Универсальная функция пересчёта
const recalcAmount = (modal, data, type) => {
  const { sending, receiving } = getInputs(modal);
  const input = type === 'sending' ? sending : receiving;
  const field = type === 'sending' ? receiving : sending;

  limitInputLength(input);

  const value = Number(input.value);
  const rawResult =
    // eslint-disable-next-line no-nested-ternary
    type === 'sending'
      ? (data.status === 'buyer' ? value * data.exchangeRate : value / data.exchangeRate)
      : (data.status === 'buyer' ? value / data.exchangeRate : value * data.exchangeRate);

  input.dataset.rawValue = value;
  field.dataset.rawValue = rawResult;

  const result =
    (type === 'sending' && data.status === 'buyer') ||
    (type === 'receiving' && data.status === 'seller')
      ? roundToZeroDecimal(rawResult)
      : roundToTwoDecimal(rawResult);

  field.value = String(result).replace(/\.$/, '');

  state.amountPristine.validate(input);
  state.amountPristine.validate(field);
};

// Обработчик для кнопки "Обменять всё"
const onExchangeAllClick = (modal, data) => {
  const { sending, receiving } = getInputs(modal);
  const maxFiatUser = parseFloat(document.querySelector('#user-fiat-balance').textContent.replace(',', '.')) || 0;
  const maxCryptoUser = parseFloat(document.querySelector('#user-crypto-balance').textContent.replace(',', '.')) || 0;

  const maxSendingAmount =
    (data.status === 'seller') ?
      data.balance.amount * data.exchangeRate - 1 :
      data.balance.amount / data.exchangeRate;

  if (data.status === 'seller') {
    setInputValue(
      sending,
      roundToZeroDecimal(Math.min(maxFiatUser, maxSendingAmount))
    );
  } else {
    if (maxCryptoUser < maxSendingAmount) {
      setInputValue(sending, maxCryptoUser);
    } else {
      setInputValue(receiving, data.balance.amount);
    }
  }
};

// Функция для дебаунса
const debouncedRecalcSending = debounce((modal, data) => recalcAmount(modal, data, 'sending'), 400);
const debouncedRecalcReceiving = debounce((modal, data) => recalcAmount(modal, data, 'receiving'), 400);

// Входные функции
const onAmountSendingInput = (modal, data) =>
  debouncedRecalcSending(modal, data);

const onAmountReceivingInput = (modal, data) =>
  debouncedRecalcReceiving(modal, data);

export { onAmountSendingInput, onAmountReceivingInput, onExchangeAllClick };
