/**
 * @file form-values.js
 * @description
 * Устанавливает значения скрытых полей формы внутри модального окна.
 * Используется для передачи технических данных обмена (ID контрагента, курс и валюты)
 * при отправке формы на сервер.
*/

// @ts-nocheck

/**
 * @param {HTMLElement} modal - Активное модальное окно, содержащее форму обмена.
 * @param {Object} data - Объект с данными контрагента и параметрами обмена.
 * @param {number} data.id - Уникальный идентификатор контрагента.
 * @param {number} data.exchangeRate - Текущий курс обмена валют.
 * @param {'buyer'|'seller'} data.status - Роль текущего пользователя: покупатель или продавец.
 * @returns {void}
 */
export const setFormInputValues = (modal, data) => {
  const form = modal.querySelector('form');

  form.querySelector('[name="contractorId"]').value = data.id;
  form.querySelector('[name="exchangeRate"]').value = data.exchangeRate;

  // Определяем валюты на основе роли пользователя:
  // - Продавец отправляет RUB и получает KEKS
  // - Покупатель отправляет KEKS и получает RUB
  const sendingCurrency = data.status === 'seller' ? 'RUB' : 'KEKS';
  const receivingCurrency = data.status === 'seller' ? 'KEKS' : 'RUB';

  form.querySelector('[name="sendingCurrency"]').value = sendingCurrency;
  form.querySelector('[name="receivingCurrency"]').value = receivingCurrency;
};
