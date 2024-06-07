require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your actual Telegram Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Replace with your actual Exchangerate API key
const exchangerateApiKey = process.env.EXCHANGRATE_API_KEY;

// Available currencies and their respective flag emojis
const currencyFlags = {
    UAH: '🇺🇦',
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    CHF: '🇨🇭',
    PLN: '🇵🇱'
};

// Store user selection state
const userState = {};

// Function to generate currency selection keyboard
const generateCurrencyKeyboard = () => {
    return {
        keyboard: Object.keys(currencyFlags).map((currency) => ([{
            text: `${currencyFlags[currency]} ${currency}`
        }])),
        one_time_keyboard: true,
    };
};

// Function to generate the confirm keyboard
const generateConfirmKeyboard = () => {
    return {
        keyboard: [
            [{ text: '✅ Confirm' }],
            [{ text: '🔄 Change Currency Pair' }],
        ],
        one_time_keyboard: true,
    };
};

// Function to generate the input amount keyboard
const generateInputAmountKeyboard = () => {
    return {
        keyboard: [
            [{ text: '🔄 Change Currency Pair' }],
        ],
        one_time_keyboard: true,
    };
};

// Handle /start command
const handleStart = (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Currency Converter Bot! Please choose the base currency:', {
        reply_markup: generateCurrencyKeyboard(),
    });
};

// Handle text messages
const handleMessage = async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle currency pair changes
    if (text === '🔄 Change Currency Pair') {
        delete userState[chatId];
        bot.sendMessage(chatId, 'Please choose the base currency:', {
            reply_markup: generateCurrencyKeyboard(),
        });
        return;
    }

    // Check if user is selecting base currency
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

    // Check if user is selecting target currency
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

    // Handle confirmation of currency pair
    if (text === '✅ Confirm') {
        bot.sendMessage(chatId, `Please enter the amount to convert from ${currencyFlags[userState[chatId].baseCurrency]} ${userState[chatId].baseCurrency} to ${currencyFlags[userState[chatId].targetCurrency]} ${userState[chatId].targetCurrency}:`, {
            reply_markup: generateInputAmountKeyboard(),
        });
        return;
    }

    // Handle amount input
    if (userState[chatId].targetCurrency) {
        const amount = parseFloat(text);

        if (!isNaN(amount) && amount > 0) {
            try {
                const response = await axios.get(`https://v6.exchangerate-api.com/v6/${exchangerateApiKey}/latest/${userState[chatId].baseCurrency}`);

                const rates = response.data.conversion_rates;
                const rate = rates[userState[chatId].targetCurrency];
                const reverseRate = 1 / rate;
                const convertedAmount = amount * rate;

                const message = `
  ${currencyFlags[userState[chatId].baseCurrency]} ${amount} ${userState[chatId].baseCurrency} is equal to ${currencyFlags[userState[chatId].targetCurrency]} ${convertedAmount.toFixed(2)} ${userState[chatId].targetCurrency}
  Exchange Rate: 1 ${userState[chatId].baseCurrency} = ${rate.toFixed(6)} ${userState[chatId].targetCurrency}
  Reverse Rate: 1 ${userState[chatId].targetCurrency} = ${reverseRate.toFixed(6)} ${userState[chatId].baseCurrency}
  `;

                bot.sendMessage(chatId, message, {
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
};

// Setup bot command and message handlers
bot.onText(/\/start/, handleStart);
bot.on('message', handleMessage);

// Export functions and variables for testing
module.exports = {
    bot,
    userState,
    currencyFlags,
    generateCurrencyKeyboard,
    generateConfirmKeyboard,
    generateInputAmountKeyboard,
    handleStart,
    handleMessage
};
