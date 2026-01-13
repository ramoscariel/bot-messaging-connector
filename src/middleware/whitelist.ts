import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/config';

export function isUserWhitelisted(userId: number): boolean {
  return config.whitelistedUserIds.includes(userId);
}

export async function checkWhitelist(
  bot: TelegramBot,
  msg: TelegramBot.Message
): Promise<boolean> {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  if (!userId) {
    console.warn('Message received without user ID');
    await bot.sendMessage(chatId, 'Error: No se pudo identificar al usuario.');
    return false;
  }

  if (!isUserWhitelisted(userId)) {
    console.warn(`Unauthorized access attempt from user ID: ${userId}`);
    await bot.sendMessage(
      chatId,
      'No tienes autorización para usar este bot.'
    );
    return false;
  }

  console.log(`Authorized user: ${userId}`);
  return true;
}
