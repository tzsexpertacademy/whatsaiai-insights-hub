
export interface GreenAPIConfig {
  instanceId: string;
  apiToken: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

export interface WhatsAppConfig {
  isConnected: boolean;
  authorizedNumber: string;
  qrCode: string;
  platform: string;
  autoSync: boolean;
  syncInterval: string;
  autoReply: boolean;
  lastImport: string;
  atendechatApiKey?: string;
  atendechatWebhookUrl?: string;
  makeWebhookUrl?: string;
  greenapi?: GreenAPIConfig;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL: string;
}

export interface ClientConfig {
  whatsapp: WhatsAppConfig;
  openai: OpenAIConfig;
  firebase: FirebaseConfig;
}

export const defaultConfig: ClientConfig = {
  whatsapp: {
    isConnected: false,
    authorizedNumber: '',
    qrCode: '',
    platform: 'greenapi',
    autoSync: false,
    syncInterval: 'daily',
    autoReply: false,
    lastImport: '',
    atendechatApiKey: '',
    atendechatWebhookUrl: '',
    makeWebhookUrl: '',
    greenapi: {
      instanceId: '',
      apiToken: '',
      phoneNumber: '',
      webhookUrl: ''
    }
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 400
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    databaseURL: ''
  }
};
