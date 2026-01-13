import TelegramBot from 'node-telegram-bot-api';
import { AnalysisResponse } from '../types/analyst.types';

export class TelegramService {
  constructor(private bot: TelegramBot) {}

  async sendTypingIndicator(chatId: number): Promise<void> {
    await this.bot.sendChatAction(chatId, 'typing');
  }

  async sendAnalysisResponse(
    chatId: number,
    analysisResponse: AnalysisResponse
  ): Promise<void> {
    // Send explanation first
    await this.bot.sendMessage(chatId, analysisResponse.explanation);

    // Send each chart as a photo
    for (const chart of analysisResponse.charts) {
      try {
        const imageBuffer = Buffer.from(chart.image_base64, 'base64');

        await this.bot.sendPhoto(chatId, imageBuffer, {
          caption: chart.title,
        });

        console.log(`Chart sent successfully: ${chart.title}`);
      } catch (error) {
        console.error(`Failed to send chart "${chart.title}":`, error);
        // Continue with next chart - don't fail the entire response
      }
    }
  }

  async sendErrorMessage(chatId: number, errorMessage: string): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, errorMessage);
    } catch (error) {
      console.error('Failed to send error message to user:', error);
    }
  }
}
