/**
  * @file form.js
 * @description
 * Утилиты для математических операций и форматирования чисел.
 */

// @ts-nocheck

/**
 * Округляет число до 0 знаков после запятой.
 * @param {number} value - Число для округления.
 * @returns {string} Округлённое значение в виде строки.
 */
const roundToZeroDecimal = (value) => value.toFixed(0);

/**
 * Округляет число до 1 знака после запятой.
 * @param {number} value - Число для округления.
 * @returns {string} Округлённое значение в виде строки.
 */
const roundToOneDecimal = (value) => value.toFixed(1);

/**
 * Округляет число до 2 знаков после запятой.
 * @param {number} value - Число для округления.
 * @returns {string} Округлённое значение в виде строки.
 */
const roundToTwoDecimal = (value) => value.toFixed(2);

/**
 * Преобразует строку в число с плавающей точкой.
 * Заменяет запятую на точку и возвращает `0`, если значение некорректно.
 * @param {string|number} value - Входное значение.
 * @returns {number} Число с плавающей точкой.
 */
const normalizeValue = (value) => parseFloat(value.toString().replace(',', '.')) || 0;

/**
 * Конвертирует значение из одной валюты в другую по указанному курсу.
 * @param {string|number} value - Исходное значение.
 * @param {number} rate - Курс обмена.
 * @returns {number} Сконвертированное значение.
 */
const getConvertedValue = (value, rate) => normalizeValue(value) * rate;

export {
  roundToOneDecimal,
  roundToZeroDecimal,
  roundToTwoDecimal,
  normalizeValue,
  getConvertedValue,
};
