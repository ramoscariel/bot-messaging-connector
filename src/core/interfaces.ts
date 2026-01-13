export enum PlatformType {
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  SIGNAL = 'signal'
}

export interface IncomingMessage {
  senderId: string;        // Platform-specific user ID
  conversationId: string;  // Chat/channel/room ID
  text: string;
  timestamp: Date;
  platformType: PlatformType;
}

export interface ImageAttachment {
  data: Buffer;
  caption?: string;
}

export interface OutgoingResponse {
  text?: string;
  images?: ImageAttachment[];
}

export type MessageHandler = (message: IncomingMessage) => Promise<void>;

export interface MessagingPlatform {
  // Platform identification
  getPlatformType(): PlatformType;

  // Lifecycle management
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Message handling
  onMessage(handler: MessageHandler): void;

  // Sending responses
  sendResponse(conversationId: string, response: OutgoingResponse): Promise<void>;

  // Status indicators
  sendTypingIndicator(conversationId: string): Promise<void>;

  // Authorization (platform-specific whitelist)
  isAuthorized(senderId: string): boolean;
}
