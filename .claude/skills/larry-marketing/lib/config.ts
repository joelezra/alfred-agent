/**
 * Larry Marketing - Configuration Types and Defaults
 */

export interface AppProfile {
  name: string;
  description: string;
  audience: string;
  problem: string;
  differentiator: string;
  appStoreUrl?: string;
  websiteUrl?: string;
  category: 'health' | 'fitness' | 'beauty' | 'home' | 'productivity' | 'food' | 'other';
  isMobileApp: boolean;
}

export interface ImageGenConfig {
  provider: 'nano-banana-pro' | 'nano-banana-2' | 'local';
  apiKey: string;
  model: string;
  basePrompt: string;
  useBatchAPI: boolean;
}

export interface PostizConfig {
  apiKey: string;
  integrationIds: {
    tiktok: string;
    instagram?: string;
    youtube?: string;
    threads?: string;
  };
}

export interface RevenueCatConfig {
  enabled: boolean;
  v2SecretKey?: string;
  projectId?: string;
}

export interface PostingConfig {
  privacyLevel: 'SELF_ONLY' | 'PUBLIC_TO_EVERYONE';
  schedule: string[];
  crossPost: string[];
  timezone: string;
}

export interface LarryConfig {
  app: AppProfile;
  imageGen: ImageGenConfig;
  postiz: PostizConfig;
  revenuecat: RevenueCatConfig;
  posting: PostingConfig;
  competitors: string;
  strategy: string;
}

export const DEFAULT_CONFIG: Partial<LarryConfig> = {
  imageGen: {
    provider: 'nano-banana-pro',
    apiKey: '',
    model: 'gemini-3-pro-image-preview',
    basePrompt: '',
    useBatchAPI: false,
  },
  posting: {
    privacyLevel: 'SELF_ONLY',
    schedule: ['07:30', '16:30', '21:00'],
    crossPost: [],
    timezone: 'Asia/Kuala_Lumpur',
  },
  revenuecat: {
    enabled: false,
  },
};

// Nano Banana Pro API endpoint
export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Postiz API endpoint
export const POSTIZ_API_BASE = 'https://api.postiz.com';

// Image dimensions for TikTok portrait (9:16)
export const SLIDE_WIDTH = 1024;
export const SLIDE_HEIGHT = 1536;
