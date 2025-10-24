/**
 * @file map.js
 * @description
 * Модуль работы с картой Leaflet, создания маркеров пользователей и попапов.
 * Реализует логику переключения между картой и списком пользователей,
 * фильтрацию проверенных пользователей и отображение балунов с данными пользователя.
 */

// @ts-nocheck

import { Config } from './config.js';

import { getDataUsersArray} from './fetch.js';
import { renderUsers } from './users.js';
import { hideElement, showElement } from './util/dom.js';
import { checkedUsersButton } from './tabs.js';
import { openUserModal } from './modal/controls/open.js';

/** Элементы вкладок "Список" и "Карта" */
const tabsMapControls = document.querySelectorAll('.tabs--toggle-list-map .tabs__control');
const listButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Cписок');
const mapButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Карта');

/** Список пользователей и контейнеры для карты и списка */
const usersList = document.querySelector('.users-list');
const containers = document.querySelectorAll('.container');
const tabsListControls = document.querySelector('.tabs--toggle-buy-sell');
const mapContainer = [...containers].find((container) => container.querySelector('.map'));

/** Инициализация карты Leaflet */
const map = L.map('map')
  .setView(Config.MAP.DEFAULT_VIEW, Config.MAP.ZOOM);

L.tileLayer(
  Config.MAP.TILE_LAYER,
  {
    attribution: Config.MAP.ATTRIBUTION,
  },
).addTo(map);

/** Группа для маркеров */
const markerGroup = L.layerGroup().addTo(map);

/**
 * Создает иконку маркера в зависимости от статуса проверки пользователя.
 * @param {boolean} isVerified - Статус проверки пользователя.
 * @returns {L.Icon} - Иконка маркера для Leaflet.
 */
const createMarkerIcon = (isVerified) => {
  const iconUrl = isVerified ? 'img/pin-verified.svg' : 'img/pin.svg';
  return L.icon({
    iconUrl,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
};

/**
 * Применяет стили к попапу карты.
 */
const styleMapPopup = () => {
  requestAnimationFrame(() => {
    const userCard = document.querySelector('.user-card');
    if (userCard) {
      userCard.style.display = 'grid';

      requestAnimationFrame(() => {
        const currencyItem = document.querySelector('.user-card__cash-item--currency');
        const exchangeItem = document.querySelector('.user-card__cash-item--exchangerate');
        const badgesList = document.querySelector('.user-card__badges-list');
        const changeBtn = document.querySelector('.user-card__change-btn');

        if (currencyItem) {
          currencyItem.style.gridColumn = '1 / 2';
        }
        if (exchangeItem) {
          exchangeItem.style.gridColumn = '2 / 3';
          exchangeItem.style.justifySelf = 'end';
        }
        if (badgesList) {
          badgesList.style.gridColumn = '1 / 1';
        }
        if (changeBtn) {
          changeBtn.style.gridColumn = '1 / 1';
        }
      });
    }
  });
};

/**
 * Заполняет данные пользователя в попапе карты.
 * @param {HTMLElement} popupElement - DOM-элемент попапа.
 * @param {Object} data - Данные пользователя.
 * @param {string} data.userName - Имя пользователя.
 * @param {Object} data.balance - Баланс пользователя.
 * @param {string} data.balance.currency - Валюта баланса.
 * @param {number} data.balance.amount - Сумма баланса.
 * @param {number} data.exchangeRate - Курс обмена.
 * @param {'buyer'|'seller'} data.status - Роль пользователя.
 * @param {boolean} data.isVerified - Статус проверки пользователя.
 * @param {number} data.minAmount - Минимальная сумма обмена.
 */
const populateUserCardData = (popupElement, data) => {
  requestAnimationFrame(() => {
    if (!data.isVerified) {
      const svg = popupElement.querySelector('.user-card__user-name svg');
      if (svg) {
        svg.remove();
      }
    }

    const nameSpan = popupElement.querySelector('.user-card__user-name span');
    if (nameSpan) {
      nameSpan.textContent = data.userName;
    }

    // Остальные обновления тоже в rAF
    requestAnimationFrame(() => {
      const currencyElement = popupElement.querySelector('.user-card__cash-item--currency .user-card__cash-data');
      const exchangeElement = popupElement.querySelector('.user-card__cash-item--exchangerate .user-card__cash-data');
      const limitElement = popupElement.querySelector('.user-card__cash-item--limit .user-card__cash-data');

      if (currencyElement) {
        currencyElement.textContent = data.balance.currency;
      }
      if (exchangeElement) {
        exchangeElement.textContent = `${Math.round(data.exchangeRate)} ₽`;
      }

      const limitText = data.status === 'seller'
        ? `${data.minAmount}\u00A0₽ - ${Math.round(data.balance.amount * data.exchangeRate)}\u00A0₽`
        : `${data.minAmount}\u00A0₽ - ${Math.round(data.balance.amount)}\u00A0₽`;

      if (limitElement) {
        limitElement.textContent = limitText;
      }
    });
  });
};

/**
 * Заполняет список способов оплаты в попапе.
 * @param {HTMLElement} popupElement - DOM-элемент попапа.
 * @param {Object} data - Данные пользователя.
 */
const populatePaymentMethods = (popupElement, data) => {
  const paymentMethodsContainer = popupElement.querySelector('.user-card__badges-list');
  paymentMethodsContainer.innerHTML = '';

  if (data.status === 'seller') {
    data.paymentMethods.forEach((method) => {
      const li = document.createElement('li');
      li.classList.add('users-list__badges-item', 'badge');
      li.textContent = method.provider;
      paymentMethodsContainer.appendChild(li);
    });
  }
};

/**
 * Заполняет список способов оплаты в попапе.
 * @param {HTMLElement} popupElement - DOM-элемент попапа.
 * @param {Object} data - Данные пользователя.
 */
const setPopupEvents = (popupElement, data) => {
  const changeButton = popupElement.querySelector('.user-card__change-btn');
  changeButton.addEventListener('click', () => {
    openUserModal(data);
  });
};

/**
 * Создает DOM-элемент попапа для карты с данными пользователя.
 * @param {Object} data - Данные пользователя.
 * @returns {HTMLElement} - DOM-элемент попапа.
 */
const createMapPopup = (data) => {
  const template = document.querySelector('#map-baloon__template').content.querySelector('.user-card');
  const popupElement = template.cloneNode(true);

  populateUserCardData(popupElement, data);
  populatePaymentMethods(popupElement, data);
  setPopupEvents(popupElement, data);

  return popupElement;
};

/** Проверяет валидность координат пользователя.
 * @param {Object} coords - Координаты пользователя.
 * @param {number} coords.lat - Широта.
 * @param {number} coords.lng - Долгота.
 * @returns {boolean} - true, если координаты валидны, иначе false.
 */
const isValidCoords = (coords) => coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    coords.lat >= -90 && coords.lat <= 90 &&
    coords.lng >= -180 && coords.lng <= 180;

/**
 * Создает маркер на карте для пользователя с привязанным попапом.
 * @param {Object} user - Данные пользователя.
 */
const createMarker = (user) => {
  if (!user.coords) {
    return;
  }

  // Проверка валидности координат
  if (!isValidCoords(user.coords)) {
    // eslint-disable-next-line no-console
    console.warn('Пропуск пользователя с невалидными координатами:', user.userName);
    return;
  }

  requestAnimationFrame(() => {
    const marker = L.marker(
      [user.coords.lat, user.coords.lng],
      { icon: createMarkerIcon(user.isVerified) },
    );

    marker.addTo(markerGroup);

    // Отложенное создание попапа
    requestAnimationFrame(() => {
      marker.bindPopup(createMapPopup(user));
    });

    marker.on('popupopen', () => {
      requestAnimationFrame(() => {
        styleMapPopup();
      });
    });
  });
};

/**
 * Добавляет маркеры пользователей на карту.
 * @param {Array<Object>} users - Массив пользователей.
 * @param {boolean} [onlyVerified=false] - Фильтровать только проверенных пользователей.
 */
const addMarkersToMap = (users, onlyVerified = false) => {
  requestAnimationFrame(() => {
    markerGroup.clearLayers();

    if (!Array.isArray(users) || users.length === 0) {
      return;
    }

    let filtered = users;
    if (onlyVerified) {
      filtered = filtered.filter((user) => user.isVerified && user.coords);
    }

    filtered.forEach((user) => {
      requestAnimationFrame(() => {
        createMarker(user);
      });
    });
  });
};

/**
 * Переключает активную вкладку между картой и списком.
 * @param {HTMLElement} activeBtn - Активная вкладка.
 * @param {HTMLElement} inactiveBtn - Неактивная вкладка.
 */
const toggleMapTabs = (activeBtn, inactiveBtn) => {
  activeBtn.classList.add('is-active');
  inactiveBtn.classList.remove('is-active');
};

/**
 * Обработчик клика по кнопке "Список пользователей" — показывает список вместо карты.
 * Переключает активные вкладки, скрывает карту, отображает таблицу пользователей.
 * Загружает и отображает данные пользователей, обрабатывает пустой список.
 * @returns {void}
 */
listButton.addEventListener('click', () => {
  toggleMapTabs(listButton, mapButton);

  requestAnimationFrame(() => {
    mapContainer.style.display = 'none';
    showElement(tabsListControls);
  });

  const usersTable = document.querySelector('.users-list__table-body');
  const emptyMessage = document.querySelector('.container--lightbackground');

  getDataUsersArray((users) => {
    requestAnimationFrame(() => {
      if (users.length === 0) {
        usersTable.style.display = 'none';
        if (emptyMessage) {
          emptyMessage.style.display = 'block';
        }
      } else {
        usersTable.style.display = 'block';
        if (emptyMessage) {
          emptyMessage.style.display = 'none';
        }
        renderUsers(users);
      }
    });
    usersList.style.display = 'block';
  });
});

/**
 * Обработчик клика по кнопке "Карта" — показывает карту вместо списка.
 * Переключает активные вкладки, скрывает список, отображает карту.
 * Загружает данные пользователей и добавляет маркеры на карту.
 * @returns {void}
 */
mapButton.addEventListener('click', () => {
  toggleMapTabs(mapButton, listButton);

  requestAnimationFrame(() => {
    usersList.style.display = 'none';
    hideElement(tabsListControls);
  });

  const emptyMessage = document.querySelector('.container--lightbackground');
  if (emptyMessage) {
    requestAnimationFrame(() => {
      emptyMessage.style.display = 'none';
    });
  }

  requestAnimationFrame(() => {
    mapContainer.style.display = 'block';
    map.invalidateSize();
  });

  getDataUsersArray((users) => {
    requestAnimationFrame(() => {
      if (!users || users.length === 0) {
        addMarkersToMap([]);
        map.invalidateSize();
        emptyMessage.style.display = 'none';
      } else {
        addMarkersToMap(users, checkedUsersButton.checked);
      }
    });
  });
});

export { addMarkersToMap };
