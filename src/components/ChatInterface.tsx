
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from 'lucide-react';
import { AssistantSelector } from './AssistantSelector';
import { AssistantChatConfig } from './AssistantChatConfig';
import { ChatList } from './chat/ChatList';
import { MessageArea } from './chat/MessageArea';
import { useOptimizedChat } from './chat/useOptimizedChat';
import { useGreenAPI } from '@/hooks/useGreenAPI';

export function ChatInterface() {
  const {
    greenAPIState,
    chats,
    messages,
    selectedChat,
    showAssistantConfig,
    isRefreshing,
    handleChatSelect,
    handleSendMessage,
    handleRefreshChats,
    handleTogglePin,
    handleToggleMonitor,
    handleShowConfig,
    assignAssistantToChat
  } = useOptimizedChat();

  const { selectedAssistant, setSelectedAssistant } = useGreenAPI();

  if (!greenAPIState.isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp não conectado</h3>
          <p className="text-gray-600 mb-4">
            Conecte seu WhatsApp Business nas configurações para acessar as conversas
          </p>
          <Button onClick={() => window.location.href = '/settings'}>
            Ir para Configurações
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Configuração de Assistente para Chat Selecionado */}
      {selectedChat && showAssistantConfig && (
        <AssistantChatConfig
          chatId={selectedChat.chatId}
          chatName={selectedChat.name}
          assignedAssistant={selectedChat.assignedAssistant}
          onAssistantChange={assignAssistantToChat}
        />
      )}

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Lista de Conversas */}
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          onRefresh={handleRefreshChats}
          isRefreshing={isRefreshing}
        />

        {/* Área de Chat */}
        <MessageArea
          selectedChat={selectedChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTogglePin={handleTogglePin}
          onToggleMonitor={handleToggleMonitor}
          onShowConfig={handleShowConfig}
          showAssistantConfig={showAssistantConfig}
        />
      </div>

      {/* Seletor de Assistente Global - pode ser movido para outro local se necessário */}
      <div className="mt-3">
        <AssistantSelector
          selectedAssistant={selectedAssistant}
          onAssistantChange={setSelectedAssistant}
        />
      </div>
    </div>
  );
}
