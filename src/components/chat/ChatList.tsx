
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, MessageSquare, Pin, Users } from 'lucide-react';

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
            <Badge variant="secondary">{chats.length}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] lg:h-[600px]">
          {chats.map((chat) => (
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
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
