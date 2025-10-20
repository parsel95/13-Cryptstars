/**
 * @file form-submit.js
 * @description
 * Модуль для обработки отправки формы обмена.
 * Управляет валидацией, отправкой данных на сервер и отображением результатов.
 */

// @ts-nocheck

import { getActiveModal, getActiveForm } from './util.js';
import { state } from './state.js';
import { showZeroAmountError } from '../validation.js';
import { showMessage, throttle, blockSubmitButton, unblockSubmitButton } from '../../util.js';

/**
 * Основной обработчик отправки формы.
 * Выполняет валидацию, отправку данных на сервер и обработку ответа.
 * @param {Event} evt - Событие отправки формы.
 * @returns {Promise<void>}
 */
const handleFormSubmit = async (evt) => {
  evt.preventDefault();

  const form = getActiveForm();
  const sendingInput = form.querySelector('[name="sendingAmount"]');
  const receivingInput = form.querySelector('[name="receivingAmount"]');
  const successMessage = form.querySelector('.modal__validation-message--success');
  const errorMessage = form.querySelector('.modal__validation-message--error');
  const submitButton = getActiveModal().querySelector('.modal__submit');

  const MainIsValid = state.pristine.validate();
  const AmountIsValid = state.amountPristine.validate();
  const API_URL = 'https://cryptostar.grading.htmlacademy.pro/';

  // Используем сырые значения для избежания проблем с округление
  const sendingValue = parseFloat(sendingInput.value.trim().replace(',', '.'));

  // Проверка на нулевую сумму
  if (sendingValue === 0) {
    showZeroAmountError(sendingInput);
    return;
  }

  // Проверка общей валидности формы
  if (!MainIsValid || !AmountIsValid) {
    showMessage(errorMessage);
    return;
  }

  const formData = new FormData(evt.target);

  // Заменяем значения на сырые данные из data-атрибуто
  formData.set('sendingAmount', sendingInput.dataset.rawValue);
  formData.set('receivingAmount', receivingInput.dataset.rawValue);
  blockSubmitButton(submitButton, 'Обмениваю...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {

      showMessage(successMessage);
      form.reset();
      state.pristine.reset();
      state.amountPristine.reset();
    } else {

      showMessage(errorMessage);
    }
  } catch (error) {
    showMessage(errorMessage);
  } finally {
    unblockSubmitButton(submitButton, 'Обменять');
  }
};

/**
 * Обработчик отправки формы с защитой от множественных нажатий (throttle).
 * @type {Function}
 */
export const onFormSubmit = throttle(handleFormSubmit, 1500);
