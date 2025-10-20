/**
 * @file util.js
 * @description
 * Модуль вспомогательных утилит (UI + числовые хелперы).
 * Содержит набор небольших функций, используемых по всему приложению:
 * - проверки клавиш (isEscapeKey),
 * - округления чисел (roundToZeroDecimal / One / Two),
 * - нормализация и конвертация числовых значений (normalizeValue, getConvertedValue),
 * - работа с input (setInputValue),
 * - показ/скрытие UI-элементов (hideElement, showElement, hideElementDisplayNone, showElementDisplayBlock),
 * - показ сообщений модалки (showMessage),
 * - управляемый debounce / throttle,
 * - блокировка/разблокировка кнопки отправки.
 */

// @ts-nocheck

/**
 * Проверяет, нажата ли клавиша Escape.
 * @param {KeyboardEvent} evt - Событие клавиатуры.
 * @returns {boolean} `true`, если нажата клавиша Escape.
 */
const isEscapeKey = (evt) => evt.key === 'Escape';

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

/**
 * Устанавливает значение в input и триггерит событие `input`.
 * @param {HTMLInputElement} input - Элемент input.
 * @param {string|number} value - Новое значение.
 * @returns {void}
 */
const setInputValue = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Скрывает элемент с помощью `visibility: hidden` и `pointer-events: none`.
 * @param {HTMLElement} element - Элемент для скрытия.
 */
const hideElement = (element) => {
  element.style.visibility = 'hidden';
  element.style.pointerEvents = 'none';
};

/**
 * Показывает элемент, скрытый через `hideElement()`.
 * @param {HTMLElement} element - Элемент для отображения.
 */
const showElement = (element) => {
  element.style.visibility = 'visible';
  element.style.pointerEvents = 'auto';
};

/**
 * Скрывает элемент с помощью `display: none`.
 * @param {HTMLElement} element - Элемент для скрытия.
 */
const hideElementDisplayNone = (element) => {
  element.style.display = 'none';
};

/**
 * Показывает элемент с помощью `display: block`.
 * @param {HTMLElement} element - Элемент для отображения.
 */
const showElementDisplayBlock = (element) => {
  element.style.display = 'block';
};

/**
 * Показывает выбранное сообщение (успех или ошибка) и скрывает остальные.
 * @param {HTMLElement} messageElement - Элемент сообщения для отображения.
 * @param {number} [timeout=2000] - Время отображения сообщения в миллисекундах.
 * @returns {void}
 */
function showMessage (messageElement, timeout = 2000) {
  const allMessages = document.querySelectorAll('.modal__validation-message');

  allMessages.forEach((element) => {
    // @ts-ignore
    element.style.display = 'none';
  });

  messageElement.style.display = 'flex';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, timeout);
}

/**
 * Функция debounce для устранения дребезга.
 * Откладывает вызов функции до истечения задержки после последнего вызова.
 * @param {Function} callback - Функция для выполнения.
 * @param {number} timeoutDelay - Задержка в миллисекундах (по умолчанию 500).
 * @returns {Function} Обернутая функция с debounce.
 */
function debounce (callback, timeoutDelay = 500) {
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
    // @ts-ignore
    if (now - lastTime >= delayBetweenFrames) {
      callback.apply(this, rest);
      // @ts-ignore
      lastTime = now;
    }
  };
}

/**
 * Блокирует кнопку отправки формы, восстанавливая её текст.
 * @param {HTMLButtonElement} submitButton - Кнопка для блокировки.
 * @param {string} text - Текст для отображения на заблокированной кнопке.
 * @returns {void}
 */
const blockSubmitButton = (submitButton, text) => {
  submitButton.disabled = true;
  submitButton.textContent = text;
};

/**
 * Разблокирует кнопку отправки формы, восстанавливая её текст.
 * @param {HTMLButtonElement} submitButton - Кнопка для разблокировки.
 * @param {string} text - Текст для отображения на разблокированной кнопке.
 * @returns {void}
 */
const unblockSubmitButton = (submitButton, text) => {
  submitButton.disabled = false;
  submitButton.textContent = text;
};

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
  showMessage,
  hideElementDisplayNone,
  showElementDisplayBlock,
  debounce,
  throttle,
  blockSubmitButton,
  unblockSubmitButton
};
