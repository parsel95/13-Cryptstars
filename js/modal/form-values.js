// Устанавливает значения скрытых полей формы модального окна, чтобы передать данные при отправке
export const setFormInputValues = (modal, data) => {
  const form = modal.querySelector('form');

  form.querySelector('[name="contractorId"]').value = data.id;
  form.querySelector('[name="exchangeRate"]').value = data.exchangeRate;

  const sendingCurrency = data.status === 'seller' ? 'RUB' : 'KEKS';
  const receivingCurrency = data.status === 'seller' ? 'KEKS' : 'RUB';

  form.querySelector('[name="sendingCurrency"]').value = sendingCurrency;
  form.querySelector('[name="receivingCurrency"]').value = receivingCurrency;
};
