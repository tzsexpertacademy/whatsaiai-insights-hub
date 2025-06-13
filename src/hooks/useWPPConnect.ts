
import { useWPPConfig } from './wpp/useWPPConfig';
import { useWPPStatus } from './wpp/useWPPStatus';
import { useWPPChats } from './wpp/useWPPChats';
import { useWPPMessages } from './wpp/useWPPMessages';
import { useWPPLiveMode } from './wpp/useWPPLiveMode';

export function useWPPConnect() {
  const { getWPPConfig, saveWPPConfig } = useWPPConfig();
  const { 
    sessionStatus, 
    setSessionStatus,
    getConnectionStatus, 
    checkConnectionStatus, 
    generateQRCode, 
    disconnectWhatsApp 
  } = useWPPStatus();
  
  const { isLiveMode, currentChatId, startLiveMode, stopLiveMode } = useWPPLiveMode();
  
  const { 
    chats, 
    setChats,
    contacts, 
    setContacts,
    isLoadingChats, 
    loadRealChats 
  } = useWPPChats(sessionStatus.isConnected, isLiveMode);
  
  const { 
    messages, 
    setMessages,
    isLoadingMessages, 
    messageHistoryLimit,
    loadRealMessages, 
    sendMessage, 
    updateMessageHistoryLimit 
  } = useWPPMessages(chats);

  const startLiveModeWithCallbacks = (chatId: string) => {
    startLiveMode(chatId, loadRealMessages, loadRealChats);
  };

  return {
    // Status
    sessionStatus,
    getConnectionStatus,
    checkConnectionStatus,
    generateQRCode,
    disconnectWhatsApp,
    
    // Chats
    chats,
    contacts,
    isLoadingChats,
    loadRealChats,
    
    // Messages
    messages,
    isLoadingMessages,
    messageHistoryLimit,
    loadRealMessages,
    sendMessage,
    updateMessageHistoryLimit,
    
    // Live Mode
    isLiveMode,
    currentChatId,
    startLiveMode: startLiveModeWithCallbacks,
    stopLiveMode,
    
    // Config
    getWPPConfig,
    saveWPPConfig
  };
}

// Export types for compatibility
export type {
  WPPConnectMessage,
  WPPConnectChat,
  WPPConnectContact
} from './wpp/useWPPMessages';

export type { WPPConfig } from './wpp/useWPPConfig';
