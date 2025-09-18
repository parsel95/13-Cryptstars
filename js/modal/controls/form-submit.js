import { getActiveForm } from './util.js';
import { state } from './state.js';
import { showZeroAmountError } from '../validation.js';
import { showMessage } from '../../util.js';


// Обработчик отправки формы обмена
export const onFormSubmit = async (evt) => {
  evt.preventDefault();
  const form = getActiveForm();
  const sendingInput = form.querySelector('[name="sendingAmount"]');
  const receivingInput = form.querySelector('[name="receivingAmount"]');
  const successMessage = form.querySelector('.modal__validation-message--success');
  const errorMessage = form.querySelector('.modal__validation-message--error');

  const MainIsValid = state.pristine.validate();
  const AmountIsValid = state.amountPristine.validate();

  const sendingValue = parseFloat(sendingInput.value.trim().replace(',', '.'));

  if (sendingValue === 0) {
    showZeroAmountError(sendingInput);
    return;
  }

  if (!MainIsValid || !AmountIsValid) {
    showMessage(errorMessage);
    return;
  }

  const formData = new FormData(evt.target);

  formData.set('sendingAmount', sendingInput.dataset.rawValue);
  formData.set('receivingAmount', receivingInput.dataset.rawValue);

  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/', {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('Ответ сервера:', response.status, responseText);

    if (response.ok) {
      showMessage(successMessage);
      form.reset();
    } else {
      showMessage(errorMessage);
    }
  } catch (err) {
    console.error('Ошибка сети:', err);
    showMessage(errorMessage);
  }
};
