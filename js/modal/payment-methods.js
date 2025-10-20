/**
 * @file payment-methods.js
 * @description
 * Управляет выбором и отображением способов оплаты в модальном окне.
 * Включает логику динамического заполнения списка `select`
 * и обновления плейсхолдера банковской карты при смене провайдера.
 */

// @ts-nocheck

import { getDataUserObject } from '../fetch.js';

/**
 * Очищает список доступных способов оплаты в select
 * и добавляет новые варианты на основе переданных данных.
 *
 * @param {HTMLElement} modal - Активное модальное окно, содержащее select.
 * @param {Array<{provider: string}>} methods - Список способов оплаты, полученный с сервера.
 */
const populateSelect = (modal, methods) => {
  if (!Array.isArray(methods)) {
    return;
  }

  const select = modal.querySelector('select');
  // Удаляем все опции, кроме первой (placeholder)
  select.querySelectorAll('option:not(:first-child)').forEach((opt) => opt.remove());

  // Добавляем новые опции
  methods.forEach(({ provider }) => {
    const option = document.createElement('option');
    option.value = provider;
    option.textContent = provider;
    select.appendChild(option);
  });
};

/**
 * Обработчик изменения способа оплаты.
 * Меняет плейсхолдер у поля ввода номера карты
 * в зависимости от выбранного провайдера и роли пользователя.
 *
 * @param {Event} evt - Событие `change` от элемента select.
 * @param {HTMLElement} modal - Модальное окно с формой обмена.
 * @param {Object} data - Данные пользователя и контрагента.
 * @param {'buyer'|'seller'} data.status - Роль пользователя (покупатель или продавец).
 * @param {Array<{provider: string, accountNumber: string}>} [data.paymentMethods] - Способы оплаты контрагента.
 */
const onPaymentMethodChange = (evt, modal, data) => {
  const inputCard = modal.querySelector('.custom-input--card input');
  const selectedProvider = evt.target.value;

  // Если выбран способ "Наличные при встрече" — очищаем плейсхолдер
  if (selectedProvider === 'Cash in person') {
    inputCard.placeholder = '';
    return;
  }

  // Получаем данные пользователя (для покупателя)
  getDataUserObject((userData) => {
    const methods = data.status === 'seller' ? data.paymentMethods : userData.paymentMethods;
    const selectedMethod = methods?.find((method) => method.provider === selectedProvider);
    inputCard.placeholder = selectedMethod?.accountNumber || '';
  });
};

export { populateSelect, onPaymentMethodChange };
