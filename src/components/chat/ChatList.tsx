
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { RefreshCw, MessageSquare, Pin, Users, Search } from 'lucide-react';

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

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ChatList({ 
  chats, 
  selectedChat, 
  onChatSelect, 
  onRefresh, 
  isRefreshing 
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  return (
    <Card className="lg:w-1/3 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="secondary">{filteredChats.length}</Badge>
          </div>
        </div>
        
        {/* Barra de Pesquisa */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] lg:h-[600px]">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.chatId}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedChat?.chatId === chat.chatId ? 'bg-gray-50' : ''
                }`}
                onClick={() => onChatSelect(chat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {chat.name}
                      {chat.assignedAssistant && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                          🤖
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    {chat.unreadCount > 0 && (
                      <Badge variant="secondary">{chat.unreadCount}</Badge>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {chat.isPinned && <Pin className="h-3 w-3 text-gray-400" />}
                      {chat.isGroup && <Users className="h-3 w-3 text-gray-400" />}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
