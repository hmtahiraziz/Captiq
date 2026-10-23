export interface ApiErrorBody {
  success: false;
  error: {
    code?: string;
    message: string;
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessBody<T> | ApiErrorBody;

export interface User {
  id: string;
  email: string;
  createdAt?: string;
  consentVersion?: string | null;
  consentedAt?: string | null;
  needsConsent?: boolean;
  currentConsentVersion?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Scan {
  id: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  model: string;
  createdAt: string;
}

export interface ScanListResponse {
  items: Scan[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface QuotaUsage {
  usageDate: string;
  scansUsed: number;
  scansLimit: number;
  scansRemaining: number;
  messagesUsed: number;
  messagesLimit: number;
  messagesRemaining: number;
}
