/**
  * @file time.js
 * @description
 * Утилиты для работы со временем: функции debounce и throttle.
 */

// @ts-nocheck

import { Config } from '../config.js';

/**
 * Функция debounce для устранения дребезга.
 * Откладывает вызов функции до истечения задержки после последнего вызова.
 * @param {Function} callback - Функция для выполнения.
 * @param {number} timeoutDelay - Задержка в миллисекундах (по умолчанию 500).
 * @returns {Function} Обернутая функция с debounce.
 */
function debounce (callback, timeoutDelay = Config.UI.DEBOUNCE_DELAY) {
  // Используем замыкания, чтобы id таймаута у нас навсегда приклеился
  // к возвращаемой функции с setTimeout, тогда мы его сможем перезаписывать
  let timeoutId;

  return (...rest) => {
    // Перед каждым новым вызовом удаляем предыдущий таймаут,
    // чтобы они не накапливались
    clearTimeout(timeoutId);

    // Затем устанавливаем новый таймаут с вызовом колбэка на ту же задержку
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);

    // Таким образом цикл «поставить таймаут - удалить таймаут» будет выполняться,
    // пока действие совершается чаще, чем переданная задержка timeoutDelay
  };
}

/**
 * Функция throttle для ограничения частоты вызовов.
 * Гарантирует, что функция будет вызываться не чаще указанного интервала.
 * @param {Function} callback - Функция для выполнения.
 * @param {number} delayBetweenFrames - Минимальный интервал между вызовами в миллисекундах.
 * @returns {Function} Обернутая функция с throttle.
 */
function throttle (callback, delayBetweenFrames) {
  // Используем замыкания, чтобы время "последнего кадра" навсегда приклеилось
  // к возвращаемой функции с условием, тогда мы его сможем перезаписывать
  let lastTime = 0;

  return (...rest) => {
    // Получаем текущую дату в миллисекундах,
    // чтобы можно было в дальнейшем
    // вычислять разницу между кадрами
    const now = new Date();

    // Если время между кадрами больше задержки,
    // вызываем наш колбэк и перезаписываем lastTime
    // временем "последнего кадра"
    if (now - lastTime >= delayBetweenFrames) {
      callback.apply(this, rest);
      lastTime = now;
    }
  };
}

export {
  debounce,
  throttle,
};
