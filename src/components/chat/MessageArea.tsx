
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Pin, 
  PinOff, 
  Brain, 
  BrainCircuit, 
  MessageSquare,
  Users,
  Clock,
  Settings
} from 'lucide-react';
import { MessageInput } from './MessageInput';

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  isPinned: boolean;
  isMonitored: boolean;
  isGroup: boolean;
  assignedAssistant?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'customer';
  timestamp: string;
  platform?: string;
}

interface MessageAreaProps {
  selectedChat: Chat | null;
  messages: Record<string, Message[]>;
  onSendMessage: (chatId: string, message: string) => Promise<boolean>;
  onTogglePin: (chatId: string) => void;
  onToggleMonitor: (chatId: string) => void;
  onShowConfig: () => void;
  showAssistantConfig: boolean;
}

export function MessageArea({
  selectedChat,
  messages,
  onSendMessage,
  onTogglePin,
  onToggleMonitor,
  onShowConfig,
  showAssistantConfig
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChat]);

  const renderChatMessages = () => {
    if (!selectedChat?.chatId) return null;
    
    const chatMessages = messages[selectedChat.chatId] || [];

    return chatMessages.map((msg) => (
      <div
        key={msg.id}
        className={`mb-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-xl px-3 py-2 text-sm max-w-[75%] ${
            msg.sender === 'user' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {msg.text}
          <div className="text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3 inline-block mr-1" />
            {msg.timestamp}
          </div>
        </div>
      </div>
    ));
  };

  if (!selectedChat) {
    return (
      <Card className="lg:w-2/3 flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <p>Selecione uma conversa para começar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:w-2/3 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedChat.isGroup ? <Users className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              {selectedChat.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {selectedChat.isPinned && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
              {selectedChat.isMonitored && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Brain className="h-3 w-3 mr-1" />
                  Monitorado
                </Badge>
              )}
              {selectedChat.assignedAssistant && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  🤖 Assistente configurado
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowConfig}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTogglePin(selectedChat.chatId)}>
                  {selectedChat.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Desfixar
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Fixar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleMonitor(selectedChat.chatId)}>
                  {selectedChat.isMonitored ? (
                    <>
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Parar Monitoramento
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Monitorar para Análise
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {renderChatMessages()}
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4">
          <MessageInput
            onSendMessage={(message) => onSendMessage(selectedChat.chatId, message)}
            assistantConfigured={!!selectedChat.assignedAssistant}
          />
        </div>
      </CardContent>
    </Card>
  );
}
