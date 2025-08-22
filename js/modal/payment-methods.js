import { getDataUserObject } from '../fetch.js';

// Очищает и заполняет select новыми способами оплаты
const populateSelect = (modal, methods) => {
  const select = modal.querySelector('select');
  select.querySelectorAll('option:not(:first-child)').forEach((opt) => opt.remove());

  methods.forEach(({ provider }) => {
    const option = document.createElement('option');
    option.value = provider;
    option.textContent = provider;
    select.appendChild(option);
  });
};

// Меняет номер банковской карты
const onPaymentMethodChange = (evt, modal, data) => {
  const inputCard = modal.querySelector('.custom-input--card input');
  const selectedProvider = evt.target.value;

  if (selectedProvider === 'Cash in person') {
    inputCard.placeholder = '';
    return;
  }

  getDataUserObject((userData) => {
    const methods = data.status === 'seller' ? data.paymentMethods : userData.paymentMethods;
    const selectedMethod = methods && methods.find((method) => method.provider === selectedProvider);
    inputCard.placeholder = selectedMethod && selectedMethod.accountNumber || '';
  });
};

export { populateSelect, onPaymentMethodChange};
