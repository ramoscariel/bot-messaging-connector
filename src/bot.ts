import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Polling = simplest way to start
const bot = new TelegramBot(token, { polling: true });

// Respond to any message with the same response
bot.on('message', (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot is running xdddd.');
});

export default bot;
