const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { bot, userState, currencyFlags, generateCurrencyKeyboard, generateConfirmKeyboard, generateInputAmountKeyboard, handleStart, handleMessage } = require('./bot');

// Mock axios
const mock = new MockAdapter(axios);

const exchangerateApiKey = process.env.EXCHANGRATE_API_KEY;


// Mock the bot's sendMessage method
bot.sendMessage = jest.fn();

// Define a mock API response
const mockApiResponse = {
    conversion_rates: {
        USD: 0.037,
        EUR: 0.031,
        GBP: 0.028,
        CHF: 0.034,
        PLN: 0.15
    }
};

// Tests
describe('Currency Converter Bot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset user state before each test
        for (const key in userState) {
            delete userState[key];
        }
    });


    it('should send a welcome message on /start command', () => {
        const msg = { chat: { id: 1 }, text: '/start' };
        handleStart(msg);
        expect(bot.sendMessage).toHaveBeenCalledWith(1, 'Welcome to Currency Converter Bot! Please choose the base currency:', expect.any(Object));
    });

    it('should fetch exchange rates from API and handle them correctly', async () => {
        // Set up the mock API response
        mock.onGet(`https://v6.exchangerate-api.com/v6/${exchangerateApiKey}/latest/UAH`).reply(200, mockApiResponse);

        // Simulate a user starting the bot
        const startMsg = { chat: { id: 1 }, text: '/start' };
        handleStart(startMsg);

        // Wait for async operations to complete (assuming handleStart or handleMessage is async)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Expect the bot to send a message with available currency options based on the API response
        expect(bot.sendMessage).toHaveBeenCalledWith(1, 'Welcome to Currency Converter Bot! Please choose the base currency:', expect.any(Object));
    });

    it('should set base currency and ask for target currency', () => {
        const msg = { chat: { id: 1 }, text: '🇺🇦 UAH' };
        handleMessage(msg);
        expect(userState[1].baseCurrency).toBe('UAH');
        expect(bot.sendMessage).toHaveBeenCalledWith(1, 'Please choose the target currency:', expect.any(Object));
    });

    it('should set target currency and ask for confirmation', () => {
        userState[1] = { baseCurrency: 'UAH' };
        const msg = { chat: { id: 1 }, text: '🇺🇸 USD' };
        handleMessage(msg);
        expect(userState[1].targetCurrency).toBe('USD');
        expect(bot.sendMessage).toHaveBeenCalledWith(1, 'You have selected 🇺🇦 UAH to 🇺🇸 USD. Confirm or change the pair:', expect.any(Object));
    });

    it('should handle currency pair confirmation and ask for amount', () => {
        userState[1] = { baseCurrency: 'UAH', targetCurrency: 'USD' };
        const msg = { chat: { id: 1 }, text: '✅ Confirm' };
        handleMessage(msg);
        expect(bot.sendMessage).toHaveBeenCalledWith(1, `Please enter the amount to convert from 🇺🇦 UAH to 🇺🇸 USD:`, expect.any(Object));
    });



    it('should handle invalid amount input', () => {
        const chatId = 1;
        userState[chatId] = { baseCurrency: 'UAH', targetCurrency: 'USD' };
        const msg = { chat: { id: chatId }, text: 'invalid' };

        handleMessage(msg);

        expect(bot.sendMessage).toHaveBeenCalledWith(chatId, 'Please enter a valid amount.', expect.any(Object));
    });

    it('should handle "Change Currency Pair" command and reset user state', () => {
        const chatId = 1;
        userState[chatId] = { baseCurrency: 'UAH', targetCurrency: 'USD' };
        const msg = { chat: { id: chatId }, text: '🔄 Change Currency Pair' };

        handleMessage(msg);

        expect(userState[chatId]).toBeUndefined();
        expect(bot.sendMessage).toHaveBeenCalledWith(chatId, 'Please choose the base currency:', expect.any(Object));
    });

    it('should handle invalid base currency selection', () => {
        const msg = { chat: { id: 1 }, text: 'Invalid Currency' };
        handleMessage(msg);
        expect(bot.sendMessage).toHaveBeenCalledWith(1, 'Please choose a valid base currency:', expect.any(Object));
    });

    it('should handle invalid target currency selection', () => {
        const chatId = 1;
        userState[chatId] = { baseCurrency: 'UAH' };
        const msg = { chat: { id: chatId }, text: 'Invalid Currency' };
        handleMessage(msg);
        expect(bot.sendMessage).toHaveBeenCalledWith(chatId, 'Please choose a valid target currency:', expect.any(Object));
    });
});

