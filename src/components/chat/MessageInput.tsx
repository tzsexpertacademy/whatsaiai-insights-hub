
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  assistantConfigured: boolean;
}

export function MessageInput({ onSendMessage, assistantConfigured }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    const success = await onSendMessage(newMessage);
    setIsSending(false);

    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSending) {
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite uma mensagem..."
          onKeyPress={handleKeyPress}
          disabled={isSending}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {assistantConfigured && (
        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
          🤖 Assistente configurado para auto-resposta neste número
        </div>
      )}
    </div>
  );
}
