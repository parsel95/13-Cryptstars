/* eslint-disable no-console */
/**
 * @file form-submit.js
 * @description
 * Модуль для обработки отправки формы обмена.
 * Управляет валидацией, отправкой данных на сервер и отображением результатов.
 */

// @ts-nocheck

import { apiClient } from '../../api/api-client.js';
import { Config } from '../../config.js';
import { getActiveModal, getActiveForm } from './util.js';
import { state } from './state.js';
import { showZeroAmountError } from '../validation.js';
import { throttle } from '../../util/time.js';
import { showMessage, blockSubmitButton, unblockSubmitButton } from '../../util/form.js';

/**
 * Проверяет, является ли значение валидным числом
 * @param {string} value - Значение для проверки
 * @returns {boolean} true если значение валидное число
 */
const isValidNumber = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return false;
  }

  const num = parseFloat(trimmedValue.replace(',', '.'));
  return !isNaN(num) && isFinite(num) && num >= 0;
};

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

  // Заменяем значения на сырые данные из data-атрибутов
  formData.set('sendingAmount', sendingInput.dataset.rawValue);
  formData.set('receivingAmount', receivingInput.dataset.rawValue);
  blockSubmitButton(submitButton, 'Обмениваю...');

  // Проверка числовых значений
  const sendingAmount = formData.get('sendingAmount');
  const receivingAmount = formData.get('receivingAmount');

  if (!isValidNumber(sendingAmount) || !isValidNumber(receivingAmount)) {
    console.error('Неверный формат числовых значений:', { sendingAmount, receivingAmount });
    showMessage(errorMessage);
    return;
  }


  try {
    await apiClient.submitExchange(formData);

    showMessage(successMessage);
    form.reset();
    state.pristine.reset();
    state.amountPristine.reset();

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
export const onFormSubmit = throttle(handleFormSubmit, Config.UI.THROTTLE_DELAY);
