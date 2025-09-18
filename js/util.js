// Проверка нажатой Escape
const isEscapeKey = (evt) => evt.key === 'Escape';

// Округление до 0 знаков после запятой
const roundToZeroDecimal = (value) => value.toFixed(0);

// Округление до 1 знака после запятой
const roundToOneDecimal = (value) => value.toFixed(1);

// Округление до 2 знака после запятой
const roundToTwoDecimal = (value) => value.toFixed(2);

// Преобразует значение в число с плавающей точкой
const normalizeValue = (value) => parseFloat(value.toString().replace(',', '.')) || 0;

// Конвертирует значение из одной валюты в другую с помощью курса
const getConvertedValue = (value, rate) => normalizeValue(value) * rate;

// Универсальная функция для установки значения и вызова события
const setInputValue = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

// Скрыть элемент
const hideElement = (element) => {
  element.style.visibility = 'hidden';
  element.style.pointerEvents = 'none';
};

// Показать элемент
const showElement = (element) => {
  element.style.visibility = 'visible';
  element.style.pointerEvents = 'auto';
};

// Показывает одно сообщение (успех или ошибка) и скрывает остальные
function showMessage(messageElement, timeout = 2000) {
  const allMessages = document.querySelectorAll('.modal__validation-message');

  allMessages.forEach((element) => {
    element.style.display = 'none';
  });

  messageElement.style.display = 'flex';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, timeout);
}

export {
  isEscapeKey,
  roundToOneDecimal,
  roundToZeroDecimal,
  roundToTwoDecimal,
  normalizeValue,
  getConvertedValue,
  setInputValue,
  hideElement,
  showElement,
  showMessage
};
