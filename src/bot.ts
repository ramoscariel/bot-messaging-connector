import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/config';
import { checkWhitelist } from './middleware/whitelist';
import { analystClient, AnalystServiceError } from './services/analyst-client';
import { TelegramService } from './services/telegram-service';

if (!config.telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Polling = simplest way to start
const bot = new TelegramBot(config.telegramBotToken, { polling: true });
const telegramService = new TelegramService(bot);

// Handle all incoming messages
bot.on('message', async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Log incoming message
  console.log(`\n=== New message received ===`);
  console.log(`User ID: ${msg.from?.id}`);
  console.log(`Chat ID: ${chatId}`);
  console.log(`Message: ${messageText}`);

  // Check if user is whitelisted
  const isAuthorized = await checkWhitelist(bot, msg);
  if (!isAuthorized) {
    return;
  }

  // Validate message has text
  if (!messageText || messageText.trim().length === 0) {
    await telegramService.sendErrorMessage(
      chatId,
      'Por favor, envía una pregunta sobre los datos.'
    );
    return;
  }

  try {
    // Show typing indicator
    await telegramService.sendTypingIndicator(chatId);

    // Call analyst service
    const analysisResponse = await analystClient.analyzePrompt(messageText);

    // Send response to user
    await telegramService.sendAnalysisResponse(chatId, analysisResponse);

    console.log('=== Message handled successfully ===\n');
  } catch (error) {
    console.error('Error handling message:', error);

    if (error instanceof AnalystServiceError) {
      await telegramService.sendErrorMessage(chatId, error.message);
    } else {
      await telegramService.sendErrorMessage(
        chatId,
        'Ocurrió un error inesperado. Por favor, intenta más tarde.'
      );
    }

    console.log('=== Message handled with error ===\n');
  }
});

console.log('Telegram bot is running and listening for messages...');

export default bot;
