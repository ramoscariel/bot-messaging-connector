import { AnalystClient, AnalystServiceError } from '../services/analyst-client';
import { AnalysisResponse } from '../types/analyst.types';
import {
  IncomingMessage,
  OutgoingResponse,
  MessagingPlatform,
  ImageAttachment
} from './interfaces';

export class MessageProcessor {
  constructor(private analystClient: AnalystClient) {}

  async processMessage(
    message: IncomingMessage,
    platform: MessagingPlatform
  ): Promise<void> {
    console.log(`\n=== Processing message ===`);
    console.log(`Platform: ${message.platformType}`);
    console.log(`Sender ID: ${message.senderId}`);
    console.log(`Conversation ID: ${message.conversationId}`);
    console.log(`Message: ${message.text}`);

    // Validate message has text
    if (!message.text || message.text.trim().length === 0) {
      await platform.sendResponse(message.conversationId, {
        text: 'Por favor, envía una pregunta sobre los datos.'
      });
      return;
    }

    try {
      // Show typing indicator
      await platform.sendTypingIndicator(message.conversationId);

      // Call analyst service
      const analysisResponse = await this.analystClient.analyzePrompt(message.text);

      // Convert to platform-agnostic format
      const response = this.convertAnalysisResponse(analysisResponse);

      // Send through platform
      await platform.sendResponse(message.conversationId, response);

      console.log('=== Message processed successfully ===\n');
    } catch (error) {
      console.error('Error processing message:', error);
      await this.handleError(error, message.conversationId, platform);
      console.log('=== Message processed with error ===\n');
    }
  }

  private convertAnalysisResponse(analysis: AnalysisResponse): OutgoingResponse {
    const images: ImageAttachment[] = analysis.charts.map(chart => ({
      data: Buffer.from(chart.image_base64, 'base64'),
      caption: chart.title
    }));

    return {
      text: analysis.explanation,
      images
    };
  }

  private async handleError(
    error: unknown,
    conversationId: string,
    platform: MessagingPlatform
  ): Promise<void> {
    let errorMessage: string;

    if (error instanceof AnalystServiceError) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Ocurrió un error inesperado. Por favor, intenta más tarde.';
    }

    try {
      await platform.sendResponse(conversationId, { text: errorMessage });
    } catch (sendError) {
      console.error('Failed to send error message to user:', sendError);
    }
  }
}
