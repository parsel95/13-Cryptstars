/**
 * @file validation.js
 * @description
 * Модуль валидации форм обмена валют.
 * Включает валидацию пароля, платёжных методов, сумм отправки и получения,
 * ограничение длины ввода и отображение ошибок.
 *
 * Использует библиотеку Pristine для валидации форм.
 */

// @ts-nocheck

import { Config } from '../config.js';
import { roundToZeroDecimal, normalizeValue, getConvertedValue } from '../util/math.js';

/**
 * Валидация пароля для подтверждения операции.
 * Проверяет, что пароль либо пустой, либо соответствует требуемому значению.
 * @param {Pristine} pristine - Экземпляр Pristine для валидации.
 * @param {HTMLElement} modal - Модальное окно с формой.
 * @returns {void}
 */
const validatePassword = (pristine, modal) => {
  // Находим поле пароля в модальном окне
  const paymentPassword = modal.querySelector('[name="paymentPassword"]');

  // Добавляем валидатор для поля пароля
  pristine.addValidator(
    paymentPassword,
    (value) =>
      // Пароль либо пустой (необязательное поле), либо должен быть "180712"
      value.trim() === '' || value === Config.VALIDATION.PASSWORD,
    'Введён неверный пароль',
    1 // Приоритет валидации
  );
};

/**
 * Валидация выбора платёжного метода.
 * Проверяет, что выбран конкретный метод оплаты, а не placeholder.
 * @param {Pristine} pristine - Экземпляр Pristine для валидации.
 * @param {HTMLElement} modal - Модальное окно с формой.
 * @returns {void}
 */
const validatePaymentMethod = (pristine, modal) => {
  // Находим селект выбора платёжной системы
  const paymentMethod = modal.querySelector('[name="paymentMethod"]');

  pristine.addValidator(
    paymentMethod,
    (value) =>
      // Проверяем, что выбран не placeholder
      value !== 'Выберите платёжную систему'
    ,
    'Выберите способ оплаты',
    1
  );
};

/**
 * Валидация поля ввода суммы отправки.
 * Проверяет минимальную сумму, лимиты пользователя и доступность средств.
 * @param {Pristine} pristine - Экземпляр Pristine для валидации.
 * @param {Object} data - Данные пользователя и курса.
 * @param {HTMLInputElement} field - Поле ввода суммы отправки.
 * @returns {void}
 */
const validateSendingField = (pristine, data, field) => {
  // Валидация 1: Минимальная сумма (только для продавцов)
  pristine.addValidator(
    field,
    (value) => {
      // Для продавцов проверяем минимальную сумму, для покупателей - всегда true
      if (data.status === 'seller') {
        return normalizeValue(value) >= data.minAmount;
      } else {
        return true;
      }
    },
    'Сумма не должна быть меньше минимальной',
    2
  );

  // Валидация 2: Лимит пользователя (максимальная сумма сделки)
  pristine.addValidator(
    field,
    (value) => {
      if (data.status === 'seller') {
        // Для продавцов: сумма должна быть меньше баланса * курс
        return normalizeValue(value) < roundToZeroDecimal(data.balance.amount * data.exchangeRate);
      } else {
        return true;
      }
    },
    'Сумма превышает лимит пользователя',
    3,
  );

  // Валидация 3: Достаточность средств у текущего пользователя
  pristine.addValidator(
    field,
    (value) => {
      // Получаем актуальные балансы пользователя из интерфейса
      const maxFiatUser = parseFloat(document.querySelector('#user-fiat-balance').textContent.replace(',', '.')) || 0;
      const maxCryptoUser = parseFloat(document.querySelector('#user-crypto-balance').textContent.replace(',', '.')) || 0;

      // Проверяем в зависимости от статуса пользователя
      return data.status === 'seller'
        ? normalizeValue(value) <= maxFiatUser // Продавец: проверяем фиатный баланс
        : normalizeValue(value) <= maxCryptoUser; // Покупатель: проверяем крипто-баланс
    },
    'У вас недостаточно средств',
    4,
  );
};

/**
 * Валидация поля ввода суммы получения.
 * Проверяет минимальную сумму, ненулевое значение и лимиты пользователя.
 * @param {Pristine} pristine - Экземпляр Pristine для валидации.
 * @param {Object} data - Данные пользователя и курса.
 * @param {HTMLInputElement} field - Поле ввода суммы получения.
 * @returns {void}
 */
const validateReceivingField = (pristine, data, field) => {
  // Валидация 1: Минимальная сумма и ненулевое значение (для покупателей)
  pristine.addValidator(
    field,
    (value) => {
      if (data.status !== 'seller') {
        // Для покупателей: сумма должна быть не меньше минимальной и не равна 0
        return normalizeValue(value) >= data.minAmount && normalizeValue(value) !== 0;
      } else {
        return true;
      }
    },
    'Сумма не должна быть меньше минимальной',
    2
  );

  // Валидация 2: Ненулевое значение после конвертации (для продавцов)
  pristine.addValidator(
    field,
    (value) => {
      if (data.status === 'seller') {
        // Для продавцов: конвертированная сумма не должна быть равна 0
        return getConvertedValue(value, data.exchangeRate) !== 0;
      } else {
        return true;
      }
    },
    'Сумма должна быть больше нуля',
    3
  );

  // Валидация 3: Лимит пользователя (для покупателей)
  pristine.addValidator(
    field,
    (value) => {
      if (data.status !== 'seller') {
        // Для покупателей: сумма не должна превышать баланс контрагента
        return normalizeValue(value) <= data.balance.amount;
      } else {
        return true;
      }
    },
    'Сумма превышает лимит пользователя',
    4,
  );
};

/**
 * Показывает ошибку валидации для поля суммы, если пользователь ввёл значение, равное нулю.
 * Создаёт или обновляет элемент с ошибкой в родительском контейнере.
 * @param {HTMLInputElement} input - Поле ввода, для которого показывается ошибка.
 * @returns {void}
 */
function showZeroAmountError(input) {
  // Находим родительский контейнер поля ввода
  const parent = input.closest('.custom-input--pristine');

  // Ищем существующий элемент ошибки или создаём новый
  let error = parent.querySelector('.custom-input__error');
  if (!error) {
    error = document.createElement('div');
    error.className = 'custom-input__error';
    parent.appendChild(error);
  }

  // Устанавливаем текст ошибки и показываем её
  error.textContent = 'Сумма не должна равняться нулю';
  error.style.display = 'block';

  // Добавляем класс для стилизации ошибки
  parent.classList.add('has-error');
}

/**
 * Ограничивает ввод в поле по data-maxlength атрибуту.
 * Обрезает значение поля, если его длина превышает максимально допустимую.
 * @param {HTMLInputElement} field - Поле ввода для ограничения длины.
 * @returns {void}
 */
function limitInputLength(field) {
  // Получаем максимальную длину из data-атрибута
  const maxLength = field.dataset.maxlength;

  // Если длина превышена - обрезаем значение
  if (maxLength && field.value.length > maxLength) {
    field.value = field.value.slice(0, maxLength);
  }
}

/**
 * Устанавливает все валидации, которые проверяются при отправке формы.
 * Включает валидацию пароля и платёжного метода.
 * @param {Pristine} pristine - Экземпляр Pristine для валидации.
 * @param {HTMLElement} modal - Модальное окно с формой.
 * @returns {void}
 */
const setAllOnSubmitValidations = (pristine, modal) => {
  validatePassword(pristine, modal);
  validatePaymentMethod(pristine, modal);
};

export {
  setAllOnSubmitValidations,
  validateReceivingField,
  validateSendingField,
  limitInputLength,
  showZeroAmountError
};
