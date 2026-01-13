import TelegramBot from 'node-telegram-bot-api';
import {
  MessagingPlatform,
  PlatformType,
  IncomingMessage,
  OutgoingResponse,
  MessageHandler
} from '../../core/interfaces';

export class TelegramPlatform implements MessagingPlatform {
  private bot: TelegramBot;
  private messageHandler?: MessageHandler;
  private whitelistedUserIds: number[];

  constructor(token: string, whitelistedUserIds: number[]) {
    if (!token) {
      throw new Error('Telegram bot token is required');
    }
    if (!whitelistedUserIds || whitelistedUserIds.length === 0) {
      throw new Error('At least one whitelisted user ID is required');
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.whitelistedUserIds = whitelistedUserIds;
  }

  getPlatformType(): PlatformType {
    return PlatformType.TELEGRAM;
  }

  async initialize(): Promise<void> {
    // Set up Telegram bot event listeners
    this.bot.on('message', async (msg: TelegramBot.Message) => {
      if (!this.messageHandler) {
        console.warn('Message received but no handler registered');
        return;
      }

      // Convert Telegram message to platform-agnostic format
      const incomingMessage: IncomingMessage = {
        senderId: msg.from?.id?.toString() || '',
        conversationId: msg.chat.id.toString(),
        text: msg.text || '',
        timestamp: new Date(msg.date * 1000),
        platformType: PlatformType.TELEGRAM
      };

      // Invoke registered handler
      await this.messageHandler(incomingMessage);
    });

    this.bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error);
    });

    console.log('Telegram bot is listening for messages...');
  }

  async shutdown(): Promise<void> {
    await this.bot.stopPolling();
    console.log('Telegram bot stopped polling');
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  async sendResponse(conversationId: string, response: OutgoingResponse): Promise<void> {
    const chatId = parseInt(conversationId, 10);

    if (isNaN(chatId)) {
      throw new Error(`Invalid Telegram chat ID: ${conversationId}`);
    }

    // Send text if present
    if (response.text) {
      try {
        await this.bot.sendMessage(chatId, response.text);
      } catch (error) {
        console.error('Failed to send text message:', error);
        throw error;
      }
    }

    // Send images if present
    if (response.images && response.images.length > 0) {
      for (const image of response.images) {
        try {
          await this.bot.sendPhoto(chatId, image.data, {
            caption: image.caption
          });
          console.log(`Chart sent successfully: ${image.caption}`);
        } catch (error) {
          console.error(`Failed to send image "${image.caption}":`, error);
          // Continue with next image - don't fail entire response
        }
      }
    }
  }

  async sendTypingIndicator(conversationId: string): Promise<void> {
    const chatId = parseInt(conversationId, 10);

    if (isNaN(chatId)) {
      throw new Error(`Invalid Telegram chat ID: ${conversationId}`);
    }

    try {
      await this.bot.sendChatAction(chatId, 'typing');
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
      // Non-critical error, don't throw
    }
  }

  isAuthorized(senderId: string): boolean {
    const userId = parseInt(senderId, 10);

    if (isNaN(userId)) {
      console.warn(`Invalid Telegram user ID format: ${senderId}`);
      return false;
    }

    return this.whitelistedUserIds.includes(userId);
  }
}
