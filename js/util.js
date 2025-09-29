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

// Скрыть элемент (display: none)
const hideElementDisplayNone = (element) => {
  element.style.display = 'none';
};

// Показать элемент (display: block)
const showElementDisplayBlock = (element) => {
  element.style.display = 'block';
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

// Функция debounce для устранения дребезга
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

// Функция throttle для пропуска кадров

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

// Блокировка кнопки отправки формы
const blockSubmitButton = (submitButton, text) => {
  submitButton.disabled = true;
  submitButton.textContent = text;
};

// Разблокировка кнопки отправки формы
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
