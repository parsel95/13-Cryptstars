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

export {isEscapeKey, roundToOneDecimal, roundToZeroDecimal, roundToTwoDecimal, normalizeValue, getConvertedValue, setInputValue};
