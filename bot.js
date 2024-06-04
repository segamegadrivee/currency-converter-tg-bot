require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your actual Telegram Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Replace with your actual Exchangerate API key
const exchangerateApiKey = process.env.EXCHANGRATE_API_KEY;

// Available currencies
const currencies = ['UAH', 'USD', 'EUR', 'GBP', 'CHF', 'PLN'];
 
// Store user selection state
const userState = {};
 
// Function to generate currency selection keyboard
const generateCurrencyKeyboard = () => {
  return {
    keyboard: currencies.map((currency) => ([{ text: currency }])),
    one_time_keyboard: true,
  };
};
 
// Function to generate the confirm keyboard
const generateConfirmKeyboard = () => {
  return {
    keyboard: [
      [{ text: 'Confirm' }],
      [{ text: 'Change Currency Pair' }],
    ],
    one_time_keyboard: true,
  };
};
 
// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Currency Converter Bot! Please choose the base currency:', {
    reply_markup: generateCurrencyKeyboard(),
  });
});
 
// Handle text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
 
  // Check if user is selecting base currency
  if (!userState[chatId] || !userState[chatId].baseCurrency) {
    if (currencies.includes(text)) {
      userState[chatId] = { baseCurrency: text };
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
 
  // Check if user is selecting target currency
  if (userState[chatId].baseCurrency && !userState[chatId].targetCurrency) {
    if (currencies.includes(text) && text !== userState[chatId].baseCurrency) {
      userState[chatId].targetCurrency = text;
      bot.sendMessage(chatId, `You have selected ${userState[chatId].baseCurrency} to ${text}. Confirm or change the pair:`, {
        reply_markup: generateConfirmKeyboard(),
      });
    } else {
      bot.sendMessage(chatId, 'Please choose a valid target currency:', {
        reply_markup: generateCurrencyKeyboard(),
      });
    }
    return;
  }
 
  // Handle confirmation or changing currency pair
  if (text === 'Confirm') {
    bot.sendMessage(chatId, `Please enter the amount to convert from ${userState[chatId].baseCurrency} to ${userState[chatId].targetCurrency}:`);
  } else if (text === 'Change Currency Pair') {
    delete userState[chatId].targetCurrency;
    bot.sendMessage(chatId, 'Please choose the base currency:', {
      reply_markup: generateCurrencyKeyboard(),
    });
  } else if (userState[chatId].targetCurrency) {
    const amount = parseFloat(text);
 
    if (!isNaN(amount) && amount > 0) {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${userState[chatId].baseCurrency}`, {
          params: { apiKey: exchangerateApiKey },
        });
 
        const rates = response.data.rates;
        const convertedAmount = amount * rates[userState[chatId].targetCurrency];
        bot.sendMessage(chatId, `${amount} ${userState[chatId].baseCurrency} is equal to ${convertedAmount.toFixed(2)} ${userState[chatId].targetCurrency}`);
      } catch (error) {
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
      }
    } else {
      bot.sendMessage(chatId, 'Please enter a valid amount.');
    }
  }
});