
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Phone, Volume2 } from 'lucide-react';

interface WPPConversation {
  id: string;
  contact: { phone: string; name: string };
  messages: any[];
}

interface ConversationListProps {
  conversations: WPPConversation[];
  selectedConversation: string | null;
  markedConversations: any;
  isLoading: boolean;
  audioCount: (conversation: WPPConversation) => number;
  onSelectConversation: (chatId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversation,
  markedConversations,
  isLoading,
  audioCount,
  onSelectConversation
}: ConversationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Carregando conversas...</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {conversations.map(conversation => {
                const audioMessages = audioCount(conversation);
                const selectedCount = markedConversations[conversation.id]?.messageIds.length || 0;
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      selectedConversation === conversation.id ? 'bg-blue-100 font-medium' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {conversation.contact.name}
                      </div>
                      <div className="flex flex-col text-xs text-gray-500">
                        {audioMessages > 0 && (
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <Volume2 className="w-3 h-3" />
                            {audioMessages} áudios
                          </span>
                        )}
                        {selectedCount > 0 && (
                          <span className="text-green-600 font-medium">
                            {selectedCount} selecionadas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
