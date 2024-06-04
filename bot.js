require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your actual Telegram Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Replace with your actual Exchangerate API key
const exchangerateApiKey = process.env.EXCHANGRATE_API_KEY;

const currencyFlags = {
  UAH: '🇺🇦',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  PLN: '🇵🇱'
};
 
const userState = {};
 
const generateCurrencyKeyboard = () => {
  return {
    keyboard: Object.keys(currencyFlags).map((currency) => ([{
      text: `${currencyFlags[currency]} ${currency}`
    }])),
    one_time_keyboard: true,
  };
};
 
const generateConfirmKeyboard = () => {
  return {
    keyboard: [
      [{ text: '✅ Confirm' }],
      [{ text: '🔄 Change Currency Pair' }],
    ],
    one_time_keyboard: true,
  };
};
 
const generateInputAmountKeyboard = () => {
  return {
    keyboard: [
      [{ text: '🔄 Change Currency Pair' }],
    ],
    one_time_keyboard: true,
  };
};
 
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Currency Converter Bot! Please choose the base currency:', {
    reply_markup: generateCurrencyKeyboard(),
  });
});
 
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
 
  if (text === '🔄 Change Currency Pair') {
    delete userState[chatId];
    bot.sendMessage(chatId, 'Please choose the base currency:', {
      reply_markup: generateCurrencyKeyboard(),
    });
    return;
  }
 
  if (!userState[chatId] || !userState[chatId].baseCurrency) {
    const baseCurrency = Object.keys(currencyFlags).find(currency => text.includes(currency));
    if (baseCurrency) {
      userState[chatId] = { baseCurrency };
      bot.sendMessage(chatId, 'Please choose the target currency:', {
        reply_markup: generateCurrencyKeyboard(),
      });
    } else {
      bot.sendMessage(chatId, 'Please choose a valid base currency:', {
        reply_markup: generateCurrencyKeyboard(),
      });
    }
    return;
  }
 
  if (userState[chatId].baseCurrency && !userState[chatId].targetCurrency) {
    const targetCurrency = Object.keys(currencyFlags).find(currency => text.includes(currency));
    if (targetCurrency && targetCurrency !== userState[chatId].baseCurrency) {
      userState[chatId].targetCurrency = targetCurrency;
      bot.sendMessage(chatId, `You have selected ${currencyFlags[userState[chatId].baseCurrency]} ${userState[chatId].baseCurrency} to ${currencyFlags[targetCurrency]} ${targetCurrency}. Confirm or change the pair:`, {
        reply_markup: generateConfirmKeyboard(),
      });
    } else {
      bot.sendMessage(chatId, 'Please choose a valid target currency:', {
        reply_markup: generateCurrencyKeyboard(),
      });
    }
    return;
  }
 
  if (text === '✅ Confirm') {
    bot.sendMessage(chatId, `Please enter the amount to convert from ${currencyFlags[userState[chatId].baseCurrency]} ${userState[chatId].baseCurrency} to ${currencyFlags[userState[chatId].targetCurrency]} ${userState[chatId].targetCurrency}:`, {
      reply_markup: generateInputAmountKeyboard(),
    });
    return;
  }
 
  if (userState[chatId].targetCurrency) {
    const amount = parseFloat(text);
 
    if (!isNaN(amount) && amount > 0) {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${userState[chatId].baseCurrency}`, {
          params: { apiKey: exchangerateApiKey },
        });
 
        const rates = response.data.rates;
        const convertedAmount = amount * rates[userState[chatId].targetCurrency];
        bot.sendMessage(chatId, `${amount} ${currencyFlags[userState[chatId].baseCurrency]} ${userState[chatId].baseCurrency} is equal to ${convertedAmount.toFixed(2)} ${currencyFlags[userState[chatId].targetCurrency]} ${userState[chatId].targetCurrency}`, {
          reply_markup: generateInputAmountKeyboard(),
        });
      } catch (error) {
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.', {
          reply_markup: generateInputAmountKeyboard(),
        });
      }
    } else {
      bot.sendMessage(chatId, 'Please enter a valid amount.', {
        reply_markup: generateInputAmountKeyboard(),
      });
    }
  }
});