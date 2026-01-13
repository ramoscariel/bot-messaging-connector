import 'dotenv/config';

export interface TelegramConfig {
  enabled: boolean;
  token: string;
  whitelistedUserIds: number[];
}

export interface PlatformConfig {
  telegram?: TelegramConfig;
  // Future platforms:
  // whatsapp?: WhatsAppConfig;
  // signal?: SignalConfig;
}

export interface Config {
  port: number;
  analystServiceUrl: string;
  requestTimeout: number;
  platforms: PlatformConfig;
}

function parseWhitelistedUsers(envVar: string | undefined): number[] {
  if (!envVar) {
    throw new Error('TELEGRAM_WHITELISTED_USER_IDS is not defined in environment variables');
  }

  const userIds = envVar.split(',').map(id => {
    const parsed = parseInt(id.trim(), 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid user ID in TELEGRAM_WHITELISTED_USER_IDS: ${id}`);
    }
    return parsed;
  });

  if (userIds.length === 0) {
    throw new Error('TELEGRAM_WHITELISTED_USER_IDS must contain at least one user ID');
  }

  return userIds;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  analystServiceUrl: process.env.ANALYST_SERVICE_URL || 'http://localhost:8000',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  platforms: {
    telegram: {
      enabled: process.env.TELEGRAM_ENABLED !== 'false', // Enabled by default
      token: process.env.TELEGRAM_BOT_TOKEN || '',
      whitelistedUserIds: parseWhitelistedUsers(process.env.TELEGRAM_WHITELISTED_USER_IDS)
    }
  }
};

// Validate Telegram config if enabled
if (config.platforms.telegram?.enabled) {
  if (!config.platforms.telegram.token) {
    throw new Error('TELEGRAM_BOT_TOKEN is required when Telegram is enabled');
  }
}

console.log('Configuration loaded:');
console.log(`- Port: ${config.port}`);
console.log(`- Analyst Service URL: ${config.analystServiceUrl}`);
console.log(`- Request Timeout: ${config.requestTimeout}ms`);
console.log(`- Telegram Enabled: ${config.platforms.telegram?.enabled}`);
if (config.platforms.telegram?.enabled) {
  console.log(`- Telegram Whitelisted Users: ${config.platforms.telegram.whitelistedUserIds.join(', ')}`);
}
