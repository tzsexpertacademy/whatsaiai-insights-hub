
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
  specificContactFilter?: string;
  greenapi?: {
    instanceId: string;
    apiToken: string;
    webhookUrl?: string;
  };
  wppconnect?: {
    serverUrl: string;
    sessionName: string;
    webhookUrl?: string;
  };
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
    platform: 'wppconnect', // Mudando padrão para WPPConnect
    autoSync: false,
    syncInterval: 'daily',
    autoReply: false,
    lastImport: '',
    atendechatApiKey: '',
    atendechatWebhookUrl: '',
    makeWebhookUrl: '',
    specificContactFilter: '',
    greenapi: {
      instanceId: '',
      apiToken: '',
      webhookUrl: ''
    },
    wppconnect: {
      serverUrl: 'http://localhost:21465',
      sessionName: 'crm-session',
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
