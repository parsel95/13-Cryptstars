import { roundToZeroDecimal, normalizeValue, getConvertedValue } from '../util.js';

// Валидация пароля
const validatePassword = (pristine, modal) => {
  const paymentPassword = modal.querySelector('[name="paymentPassword"]');

  pristine.addValidator(
    paymentPassword,
    (value) => value.trim() === '' || value === '180712',
    'Введён неверный пароль',
    1
  );
};

// Валидация метода оплаты
const validatePaymentMethod = (pristine, modal) => {
  const paymentMethod = modal.querySelector('[name="paymentMethod"]');

  pristine.addValidator(
    paymentMethod,
    (value) => value !== 'Выберите платёжную систему',
    'Выберите способ оплаты',
    1
  );
};

// Валидация поля оплата
const validateSendingField = (pristine, data, field) => {
  pristine.addValidator(
    field,
    (value) => {
      if (data.status === 'seller') {
        return normalizeValue(value) >= data.minAmount;
      } else {
        return true;
      }
    },
    'Сумма не должна быть меньше минимальной',
    2
  );

  pristine.addValidator(
    field,
    (value) => {
      if (data.status === 'seller') {
        return normalizeValue(value) < roundToZeroDecimal(data.balance.amount * data.exchangeRate);
      } else {
        return true;
      }
    },
    'Сумма превышает лимит пользователя',
    3,
  );

  pristine.addValidator(
    field,
    (value) => {
      const maxFiatUser = parseFloat(document.querySelector('#user-fiat-balance').textContent.replace(',', '.')) || 0;
      const maxCryptoUser = parseFloat(document.querySelector('#user-crypto-balance').textContent.replace(',', '.')) || 0;

      return data.status === 'seller'
        ? normalizeValue(value) <= maxFiatUser
        : normalizeValue(value) <= maxCryptoUser;
    },
    'У вас недостаточно средств',
    4,
  );
};

// Валидация поля зачилсение
const validateReceivingField = (pristine, data, field) => {
  pristine.addValidator(
    field,
    (value) => {
      if (data.status !== 'seller') {
        return normalizeValue(value) >= data.minAmount && normalizeValue(value) !== 0;
      } else {
        return true;
      }
    },
    'Сумма не должна быть меньше минимальной',
    2
  );

  pristine.addValidator(
    field,
    (value) => {
      if (data.status === 'seller') {
        return getConvertedValue(value, data.exchangeRate) !== 0;
      } else {
        return true;
      }
    },
    'Сумма должна быть больше нуля',
    3
  );

  pristine.addValidator(
    field,
    (value) => {
      if (data.status !== 'seller') {
        return normalizeValue(value) <= data.balance.amount;
      } else {
        return true;
      }
    },
    'Сумма превышает лимит пользователя',
    4,
  );
};

// Показывает ошибку валидации для поля суммы, если пользователь ввёл значение, равное нулю
function showZeroAmountError(input) {
  const parent = input.closest('.custom-input--pristine');
  let error = parent.querySelector('.custom-input__error');

  if (!error) {
    error = document.createElement('div');
    error.className = 'custom-input__error';
    parent.appendChild(error);
  }

  error.textContent = 'Сумма не должна равняться нулю';
  error.style.display = 'block';
  parent.classList.add('has-error');
}

// Ограничивает ввод в поле по data-maxlength
function limitInputLength(field) {
  const maxLength = field.dataset.maxlength;
  if (maxLength && field.value.length > maxLength) {
    field.value = field.value.slice(0, maxLength);
  }
}

// Установка всех валидаций на отправку формы
const setAllOnSubmitValidations = (pristine, modal) => {
  validatePassword(pristine, modal);
  validatePaymentMethod(pristine, modal);
};

export { setAllOnSubmitValidations, validateReceivingField, validateSendingField, limitInputLength, showZeroAmountError };
