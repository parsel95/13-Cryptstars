import { getDataUsers, getDataUsersArray} from './fetch.js';
import { roundToZeroDecimal, hideElement, showElement } from './util.js';
import { checkedUsersButton } from './tabs.js';
import { openUserModal } from './modal/modal.js';

const tabsMapControls = document.querySelectorAll('.tabs--toggle-list-map .tabs__control');
const listButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Cписок');
const mapButton = Array.from(tabsMapControls).find((button) => button.textContent === 'Карта');
const usersList = document.querySelector('.users-list');
const containers = document.querySelectorAll('.container');
const tabsListControls = document.querySelector('.tabs--toggle-buy-sell');
const mapContainer = [...containers].find((container) => container.querySelector('.map'));


const map = L.map('map')
  .setView({
    lat: 59.92749,
    lng: 30.31127,
  }, 10);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
).addTo(map);

const markerGroup = L.layerGroup().addTo(map);

// Создание иконки для маркера
const createMarkerIcon = (isVerified) => {
  const iconUrl = isVerified ? 'img/pin-verified.svg' : 'img/pin.svg';
  return L.icon({
    iconUrl,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
};

//Правка стилей в балуне
const styleMapPopup = () => {
  document.querySelector('.user-card').style.display = 'grid';
  document.querySelector('.user-card__cash-item--currency').style.gridColumn = '1 / 2';
  document.querySelector('.user-card__cash-item--exchangerate').style.gridColumn = '2 / 3';
  document.querySelector('.user-card__cash-item--exchangerate').style.justifySelf = 'end';
  document.querySelector('.user-card__badges-list').style.gridColumn = '1 / 1';
  document.querySelector('.user-card__change-btn').style.gridColumn = '1 / 1';
};

// Создание балуна
const createMapPopup = (data) => {
  const balloonTemplate = document.querySelector('#map-baloon__template').content.querySelector('.user-card');
  const popupElement = balloonTemplate.cloneNode(true);
  const paymentMethodsContainer = popupElement.querySelector('.user-card__badges-list');

  if (!data.isVerified) {
    popupElement.querySelector('.user-card__user-name svg').remove();
  }
  popupElement.querySelector('.user-card__user-name span').textContent = data.userName;

  popupElement.querySelector('.user-card__cash-item--currency .user-card__cash-data').textContent = data.balance.currency;
  popupElement.querySelector('.user-card__cash-item--exchangerate .user-card__cash-data').textContent = `${roundToZeroDecimal(data.exchangeRate)} ₽`;

  popupElement.querySelector('.user-card__cash-item--limit .user-card__cash-data').textContent =
    data.status === 'seller'
      ? `${data.minAmount}\u00A0₽\u00A0-\u00A0${roundToZeroDecimal(data.balance.amount * data.exchangeRate)}\u00A0₽`
      : `${data.minAmount}\u00A0₽\u00A0-\u00A0${roundToZeroDecimal(data.balance.amount)}\u00A0₽`;

  paymentMethodsContainer.innerHTML = '';
  if (data.status === 'seller') {
    data.paymentMethods.forEach((method) => {
      const li = document.createElement('li');
      li.classList.add('users-list__badges-item', 'badge');
      li.textContent = method.provider;
      paymentMethodsContainer.appendChild(li);
    });
  }

  popupElement.querySelector('.user-card__change-btn').addEventListener('click', () => {
    openUserModal(data);
  });

  return popupElement;
};

// Создание маркера с балуном
const createMarker = (user) => {
  if (!user.coords) {
    return;
  }
  const marker = L.marker(
    [user.coords.lat, user.coords.lng],
    { icon: createMarkerIcon(user.isVerified) },
  );

  marker.addTo(markerGroup);
  marker.bindPopup(createMapPopup(user));

  marker.on('popupopen', () => {
    styleMapPopup();
  });
};

// Добавление маркеров на карту
const addMarkersToMap = (users, onlyVerified = false) => {
  markerGroup.clearLayers();
  let filtered = users;

  if (onlyVerified) {
    filtered = filtered.filter((user) => user.isVerified && user.coords);
  }

  filtered.forEach(createMarker);
};

// Логика открытия и закрытия карты и списка пользователей
const toggleMapTabs = (activeBtn, inactiveBtn) => {
  activeBtn.classList.add('is-active');
  inactiveBtn.classList.remove('is-active');
};

listButton.addEventListener('click', () => {
  toggleMapTabs(listButton, mapButton);
  mapContainer.style.display = 'none';
  usersList.style.display = 'block';
  showElement(tabsListControls);
  
  getDataUsers();
});

mapButton.addEventListener('click', () => {
  toggleMapTabs(mapButton, listButton);
  usersList.style.display = 'none';
  mapContainer.style.display = 'block';
  hideElement(tabsListControls);

  map.invalidateSize();
  getDataUsersArray((users) => addMarkersToMap(users, checkedUsersButton.checked));
});

export { addMarkersToMap };
