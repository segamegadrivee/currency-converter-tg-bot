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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Currency Converter Bot! Please choose the currency:', {
        reply_markup: {
            inline_keyboard: [
                currencies.map((currency) => ({
                    text: currency,
                    callback_data: currency,
                })),
            ],
        },
    });
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const currency = query.data;

    try {
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${currency}`,
            { params: { apiKey: exchangerateApiKey } }
        );

        const rates = response.data.rates;
        let message = `Exchange rates for 1 ${currency}:\n`;

        currencies.forEach((cur) => {
            if (cur !== currency) {
                message += `${cur}: ${rates[cur]}\n`;
            }
        });

        bot.sendMessage(chatId, message);
    } catch (error) {
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});
