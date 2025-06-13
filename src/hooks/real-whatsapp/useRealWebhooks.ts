
import { useState } from 'react';

interface Webhooks {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  autoReplyWebhook: string;
}

export function useRealWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhooks>({
    qrWebhook: '',
    statusWebhook: '',
    sendMessageWebhook: '',
    autoReplyWebhook: ''
  });

  const updateWebhooks = (newWebhooks: Partial<Webhooks>) => {
    setWebhooks(prev => ({ ...prev, ...newWebhooks }));
  };

  return {
    webhooks,
    setWebhooks,
    updateWebhooks
  };
}
