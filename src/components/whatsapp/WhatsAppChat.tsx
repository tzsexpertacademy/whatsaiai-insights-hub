
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Phone, AlertCircle } from 'lucide-react';
import { useWPPConnect } from '@/hooks/useWPPConnect';
import { useToast } from "@/hooks/use-toast";

export function WhatsAppChat() {
  const { sessionStatus, loadRealChats, chats, sendMessage } = useWPPConnect();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o número e a mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendMessage(phoneNumber, message);
      if (success) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem enviada para ${phoneNumber}`
        });
        setMessage('');
      } else {
        throw new Error('Falha no envio');
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove tudo que não é número
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleaned.startsWith('0')) {
      return cleaned.substring(1);
    }
    
    // Se não começar com 55, adiciona
    if (!cleaned.startsWith('55')) {
      return '55' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(formatPhoneNumber(value));
  };

  if (!sessionStatus.isConnected) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            WhatsApp Chat
          </CardTitle>
          <CardDescription>
            Teste sua conexão WhatsApp enviando mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">WhatsApp não conectado</h3>
            <p className="text-gray-600 text-sm mb-4">
              Você precisa conectar seu WhatsApp primeiro na aba "Conexão"
            </p>
            <Badge className="bg-amber-100 text-amber-800">
              Conecte seu WhatsApp para usar o chat
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Teste de Envio de Mensagem
            <Badge className="bg-green-100 text-green-800">
              Conectado
            </Badge>
          </CardTitle>
          <CardDescription>
            Envie uma mensagem de teste para qualquer número WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número de WhatsApp (apenas números)
            </label>
            <Input
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="5511999999999"
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Formato: Código do país + DDD + número (ex: 5511999999999)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !phoneNumber.trim() || !message.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use números no formato internacional (55 + DDD + número)</li>
            <li>• Certifique-se de que o número tem WhatsApp ativo</li>
            <li>• A primeira mensagem pode demorar um pouco mais</li>
            <li>• Teste com seu próprio número primeiro</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
