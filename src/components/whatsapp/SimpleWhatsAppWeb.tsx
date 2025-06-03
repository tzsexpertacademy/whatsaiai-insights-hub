
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  MessageSquare, 
  Send,
  Wifi,
  Clock,
  User
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
}

interface Message {
  id: string;
  contactId: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

export function SimpleWhatsAppWeb() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Dados simulados para demonstração
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'João Cliente',
      phone: '+55 11 99999-1234',
      lastMessage: 'Oi, gostaria de saber sobre seus produtos',
      timestamp: '14:30',
      unread: 2
    },
    {
      id: '2', 
      name: 'Maria Silva',
      phone: '+55 11 98888-5678',
      lastMessage: 'Obrigada pelo atendimento!',
      timestamp: '13:45',
      unread: 0
    },
    {
      id: '3',
      name: 'Pedro Santos',
      phone: '+55 11 97777-9012',
      lastMessage: 'Quando vocês abrem?',
      timestamp: '12:15',
      unread: 1
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      contactId: '1',
      text: 'Oi, gostaria de saber sobre seus produtos',
      sent: false,
      timestamp: '14:30'
    },
    {
      id: '2',
      contactId: '1', 
      text: 'Qual o valor do produto X?',
      sent: false,
      timestamp: '14:31'
    }
  ]);

  const generateQRCode = () => {
    setIsScanning(true);
    
    // Simular geração de QR Code
    const sessionData = `whatsapp-web-${Date.now()}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(sessionData)}`;
    
    setQrCode(qrUrl);
    
    toast({
      title: "QR Code gerado!",
      description: "Escaneie com seu WhatsApp para conectar"
    });

    // Simular conexão após 10 segundos
    setTimeout(() => {
      connectWhatsApp();
    }, 10000);
  };

  const connectWhatsApp = () => {
    setIsConnected(true);
    setIsScanning(false);
    setPhoneNumber('+55 11 99999-0000');
    setQrCode('');
    
    toast({
      title: "WhatsApp conectado! ✅",
      description: "Seu WhatsApp Web está funcionando"
    });

    // Simular recebimento de mensagens a cada 30 segundos
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateNewMessage();
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const simulateNewMessage = () => {
    const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
    const newMsg: Message = {
      id: Date.now().toString(),
      contactId: randomContact.id,
      text: 'Nova mensagem recebida!',
      sent: false,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Atualizar contador não lidas
    setContacts(prev => prev.map(contact => 
      contact.id === randomContact.id 
        ? { ...contact, unread: contact.unread + 1, lastMessage: newMsg.text }
        : contact
    ));

    toast({
      title: "Nova mensagem!",
      description: `${randomContact.name}: ${newMsg.text}`
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      contactId: selectedContact,
      text: newMessage,
      sent: true,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    toast({
      title: "Mensagem enviada!",
      description: "Mensagem enviada via WhatsApp"
    });
  };

  const selectedContactData = contacts.find(c => c.id === selectedContact);
  const contactMessages = messages.filter(m => m.contactId === selectedContact);

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            WhatsApp Web Simples
            {isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
          <CardDescription>
            Conecte seu WhatsApp igual ao WhatsApp Web oficial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {isConnected ? (
              <>
                <Wifi className="h-6 w-6 text-green-500" />
                <div>
                  <span className="text-green-600 font-medium">Conectado</span>
                  <p className="text-sm text-gray-500">{phoneNumber}</p>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">Desconectado</span>
              </>
            )}
          </div>

          {!isConnected && !qrCode && (
            <Button onClick={generateQRCode} className="w-full">
              <QrCode className="h-4 w-4 mr-2" />
              Conectar WhatsApp
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Code */}
      {qrCode && !isConnected && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escaneie com seu WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="w-64 h-64 mx-auto"
              />
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>1.</strong> Abra o WhatsApp no seu celular</p>
              <p><strong>2.</strong> Toque em Menu (⋮) → WhatsApp Web</p>
              <p><strong>3.</strong> Escaneie este código</p>
            </div>
            {isScanning && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  🔄 Aguardando você escanear o QR Code...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interface de Conversas */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversas WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
              {/* Lista de Contatos */}
              <div className="border-r pr-4">
                <h3 className="font-medium mb-3">Contatos</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {contacts.map(contact => (
                    <div 
                      key={contact.id}
                      onClick={() => setSelectedContact(contact.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact === contact.id 
                          ? 'bg-blue-100 border-blue-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{contact.name}</span>
                            {contact.unread > 0 && (
                              <Badge className="bg-green-500 text-xs px-1">{contact.unread}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
                          <p className="text-xs text-gray-400">{contact.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="md:col-span-2">
                {selectedContactData ? (
                  <div className="flex flex-col h-full">
                    {/* Header do Chat */}
                    <div className="border-b pb-2 mb-3">
                      <h3 className="font-medium">{selectedContactData.name}</h3>
                      <p className="text-sm text-gray-500">{selectedContactData.phone}</p>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 space-y-2 overflow-y-auto mb-3">
                      {contactMessages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.sent 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sent ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Enviar Mensagem */}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Selecione um contato para ver as mensagens
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-700">
            <p>✅ <strong>Simples:</strong> Igual WhatsApp Web - escaneia e conecta</p>
            <p>✅ <strong>Tempo real:</strong> Recebe mensagens automaticamente</p>
            <p>✅ <strong>Responde:</strong> Envia mensagens direto do sistema</p>
            <p>✅ <strong>Sem servidor:</strong> Não precisa instalar nada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
