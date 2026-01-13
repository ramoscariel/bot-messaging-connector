import 'dotenv/config';

interface Config {
  telegramBotToken: string;
  port: number;
  analystServiceUrl: string;
  whitelistedUserIds: number[];
  requestTimeout: number;
}

function parseWhitelistedUsers(envVar: string | undefined): number[] {
  if (!envVar) {
    throw new Error('WHITELISTED_USER_IDS is not defined in environment variables');
  }

  const userIds = envVar.split(',').map(id => {
    const parsed = parseInt(id.trim(), 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid user ID in WHITELISTED_USER_IDS: ${id}`);
    }
    return parsed;
  });

  if (userIds.length === 0) {
    throw new Error('WHITELISTED_USER_IDS must contain at least one user ID');
  }

  return userIds;
}

export const config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  port: parseInt(process.env.PORT || '3000', 10),
  analystServiceUrl: process.env.ANALYST_SERVICE_URL || 'http://localhost:8000',
  whitelistedUserIds: parseWhitelistedUsers(process.env.WHITELISTED_USER_IDS),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
};

// Validate required config on startup
if (!config.telegramBotToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

console.log('Configuration loaded:');
console.log(`- Analyst Service URL: ${config.analystServiceUrl}`);
console.log(`- Whitelisted User IDs: ${config.whitelistedUserIds.join(', ')}`);
console.log(`- Request Timeout: ${config.requestTimeout}ms`);
