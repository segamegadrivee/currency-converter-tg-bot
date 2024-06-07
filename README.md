# Currency Converter Bot

This is a Telegram bot built using Node.js that allows users to convert currencies using the Exchangerate API.

## Document

[Design document](https://docs.google.com/document/d/11LTgn07fzrv01w5jYhAgwhH2svPYCNWCXZN2IBAhaao/edit?hl=ru)

## Features

- Choose base and target currencies from a predefined list.
- Input an amount to convert between the selected currencies.
- Retrieve and display the converted amount based on the latest exchange rates.

## Setup

### Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)
- A Telegram Bot Token from BotFather
- An Exchangerate API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/currency-converter-bot.git
   cd currency-converter-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Telegram Bot Token and Exchangerate API key:

   ```plaintext
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   EXCHANGRATE_API_KEY=your_exchangerate_api_key
   ```

4. Start the bot:

   ```bash
   node bot.js
   ```

## Test

Start the test:

 ```bash
   node test
   ```


## Usage

1. Start a chat with your bot on Telegram.
2. Type `/start` to initiate the bot.
3. Follow the prompts to choose a base currency, a target currency, and input the amount you wish to convert.
4. The bot will display the converted amount based on the latest exchange rates.

## Code Explanation

### Main Components

- **Dependencies**: The bot uses `dotenv` for environment variables, `node-telegram-bot-api` for interacting with the Telegram Bot API, and `axios` for making HTTP requests to the Exchangerate API.

  ```javascript
  require('dotenv').config();
  const TelegramBot = require('node-telegram-bot-api');
  const axios = require('axios');
  ```

- **Environment Variables**: The bot token and Exchangerate API key are loaded from the `.env` file.

  ```javascript
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const exchangerateApiKey = process.env.EXCHANGRATE_API_KEY;
  ```

- **Currency Flags**: A mapping of currency codes to their respective flags.

  ```javascript
  const currencyFlags = {
    UAH: '🇺🇦',
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    CHF: '🇨🇭',
    PLN: '🇵🇱'
  };
  ```

- **User State**: An object to keep track of each user's selected currencies and conversion state.

  ```javascript
  const userState = {};
  ```

- **Keyboards**: Functions to generate various keyboards for user interaction.

  ```javascript
  const generateCurrencyKeyboard = () => { /* ... */ };
  const generateConfirmKeyboard = () => { /* ... */ };
  const generateInputAmountKeyboard = () => { /* ... */ };
  ```

- **Bot Event Handlers**: Handling `/start` command and user messages to guide the user through the conversion process.

  ```javascript
  bot.onText(/\/start/, (msg) => { /* ... */ });
  bot.on('message', async (msg) => { /* ... */ });
  ```

### Conversion Logic

1. **Base Currency Selection**: The user is prompted to choose a base currency.
2. **Target Currency Selection**: The user is prompted to choose a target currency.
3. **Confirmation**: The user is asked to confirm the selected currency pair.
4. **Amount Input**: The user is prompted to enter an amount to convert.
5. **Conversion**: The bot fetches the latest exchange rates from the Exchangerate API and calculates the converted amount.

### Error Handling

- The bot includes basic error handling for invalid currency selections, invalid amounts, and API errors.

  ```javascript
  if (!isNaN(amount) && amount > 0) { /* ... */ } else {
    bot.sendMessage(chatId, 'Please enter a valid amount.', { /* ... */ });
  }
  ```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Acknowledgements

- [Node Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- [Exchangerate API](https://www.exchangerate-api.com/)

