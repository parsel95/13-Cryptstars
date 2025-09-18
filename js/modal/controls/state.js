export const state = {
  // Основной экземпляр Pristine для валидации формы (пароль, метод оплаты)
  pristine: null,

  // Дополнительный экземпляр Pristine для валидации суммы
  amountPristine: null,

  // Текущий input поля "Отправляю"
  activeSendingAmountInput: null,

  // Обработчик события input для поля "Отправляю"
  activeSendingAmountHandler: null,

  // Текущий input поля "Получаю"
  activeReceivingAmountInput: null,

  // Обработчик события input для поля "Получаю"
  activeReceivingAmountHandler: null,

  // Общий обработчик для кнопок "Обменять всё"
  handleExchangeAllClick: null,
};
