import 'dotenv/config';
import express, { Request, Response } from 'express';
import { config } from './config/config';
import { MessagingApp } from './core/messaging-app';
import { AnalystClient } from './services/analyst-client';
import { TelegramPlatform } from './platforms/telegram/telegram-platform';

const app = express();

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Initialize messaging app
const analystClient = new AnalystClient();
const messagingApp = new MessagingApp(analystClient);

// Register enabled platforms
if (config.platforms.telegram?.enabled) {
  try {
    const telegramPlatform = new TelegramPlatform(
      config.platforms.telegram.token,
      config.platforms.telegram.whitelistedUserIds
    );

    messagingApp.registerPlatform(telegramPlatform);
  } catch (error) {
    console.error('Failed to register Telegram platform:', error);
    process.exit(1);
  }
}

// Verify at least one platform is registered
if (messagingApp.getPlatforms().length === 0) {
  console.error('No messaging platforms enabled. Enable at least one platform in configuration.');
  process.exit(1);
}

// Start all platforms
messagingApp.start()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`\n✓ Server running on port ${config.port}`);
      console.log(`✓ Active platforms: ${messagingApp.getPlatforms().join(', ')}\n`);
    });
  })
  .catch((error) => {
    console.error('Failed to start messaging platforms:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nReceived SIGINT, shutting down gracefully...');
  await messagingApp.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nReceived SIGTERM, shutting down gracefully...');
  await messagingApp.shutdown();
  process.exit(0);
});
