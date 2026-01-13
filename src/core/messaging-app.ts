import { AnalystClient } from '../services/analyst-client';
import { MessageProcessor } from './message-processor';
import { MessagingPlatform, PlatformType } from './interfaces';

export class MessagingApp {
  private platforms: Map<PlatformType, MessagingPlatform> = new Map();
  private messageProcessor: MessageProcessor;

  constructor(analystClient: AnalystClient) {
    this.messageProcessor = new MessageProcessor(analystClient);
  }

  registerPlatform(platform: MessagingPlatform): void {
    const type = platform.getPlatformType();

    if (this.platforms.has(type)) {
      throw new Error(`Platform ${type} is already registered`);
    }

    this.platforms.set(type, platform);

    // Register message handler
    platform.onMessage(async (message) => {
      // Check authorization first (platform-specific)
      if (!platform.isAuthorized(message.senderId)) {
        console.warn(`Unauthorized access attempt: ${message.senderId} on ${type}`);
        await platform.sendResponse(message.conversationId, {
          text: 'No tienes autorización para usar este bot.'
        });
        return;
      }

      console.log(`Authorized user: ${message.senderId} on ${type}`);

      // Process message (platform-agnostic)
      await this.messageProcessor.processMessage(message, platform);
    });

    console.log(`✓ ${type} platform registered`);
  }

  async start(): Promise<void> {
    console.log('\n=== Starting messaging platforms ===');

    if (this.platforms.size === 0) {
      throw new Error('No platforms registered. Register at least one platform before starting.');
    }

    for (const [type, platform] of this.platforms.entries()) {
      try {
        await platform.initialize();
        console.log(`✓ ${type} platform initialized`);
      } catch (error) {
        console.error(`✗ Failed to initialize ${type} platform:`, error);
        throw error;
      }
    }

    console.log('=== All platforms started successfully ===\n');
  }

  async shutdown(): Promise<void> {
    console.log('\n=== Shutting down messaging platforms ===');

    for (const [type, platform] of this.platforms.entries()) {
      try {
        await platform.shutdown();
        console.log(`✓ ${type} platform shut down`);
      } catch (error) {
        console.error(`✗ Failed to shut down ${type} platform:`, error);
      }
    }

    console.log('=== All platforms shut down ===\n');
  }

  getPlatforms(): PlatformType[] {
    return Array.from(this.platforms.keys());
  }
}
