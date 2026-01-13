import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Polling = simplest way to start
const bot = new TelegramBot(token, { polling: true });

// /start command
bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot is running xdddd.');
});

export default bot;
