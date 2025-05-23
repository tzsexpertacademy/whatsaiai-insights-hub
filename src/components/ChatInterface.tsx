import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Phone, Wifi, WifiOff, AlertCircle, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact' | 'admin';
  timestamp: Date;
  phoneNumber: string;
  status?: 'sent' | 'delivered' | 'read';
  isAdminIntervention?: boolean;
}

interface Contact {
  phoneNumber: string;
  name?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isOnline?: boolean;
}

export function ChatInterface() {
  const { config } = useClientConfig();
  const { connectionState, sendMessage: sendWhatsAppMessage } = useWhatsAppConnection();
  const { isAdmin } = useAdmin();
  const whatsappConfig = config.whatsapp;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Simular carregamento de conversas do número conectado
  useEffect(() => {
    if (whatsappConfig.isConnected && whatsappConfig.authorizedNumber) {
      // Simular conversas espelhadas
      const mockContacts: Contact[] = [
        {
          phoneNumber: '+55 11 98765-4321',
          name: 'Cliente A',
          lastMessage: 'Obrigado pela consultoria!',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
          unreadCount: 0,
          isOnline: true
        },
        {
          phoneNumber: '+55 11 97654-3210',
          name: 'Cliente B', 
          lastMessage: 'Quando podemos conversar?',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          unreadCount: 2,
          isOnline: false
        },
        {
          phoneNumber: '+55 11 96543-2109',
          name: 'Cliente C',
          lastMessage: 'Preciso de ajuda com ansiedade',
          lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          unreadCount: 1,
          isOnline: true
        }
      ];
      
      setContacts(mockContacts);
      if (mockContacts.length > 0) {
        setActiveContact(mockContacts[0].phoneNumber);
        loadMessagesForContact(mockContacts[0].phoneNumber);
      }
    }
  }, [whatsappConfig.isConnected, whatsappConfig.authorizedNumber]);

  const loadMessagesForContact = (phoneNumber: string) => {
    // Simular carregamento de mensagens espelhadas
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Olá, gostaria de uma consulta sobre bem-estar emocional',
        sender: 'contact',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        phoneNumber: phoneNumber,
        status: 'read'
      },
      {
        id: '2', 
        text: 'Claro! Vou te ajudar com isso. Como você tem se sentido ultimamente?',
        sender: 'user',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        phoneNumber: whatsappConfig.authorizedNumber || '',
        status: 'read'
      },
      {
        id: '3',
        text: 'Tenho sentido muita ansiedade no trabalho',
        sender: 'contact', 
        timestamp: new Date(Date.now() - 40 * 60 * 1000),
        phoneNumber: phoneNumber,
        status: 'read'
      }
    ];
    
    setMessages(mockMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      phoneNumber: whatsappConfig.authorizedNumber || '',
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = newMessage;
    setNewMessage('');
    setIsTyping(true);

    // Enviar via Make.com
    try {
      const success = await sendWhatsAppMessage(activeContact, messageText);
      
      // Atualizar status da mensagem
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: success ? 'delivered' : 'sent' } 
          : msg
      ));

      if (success) {
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada via Make.com para ${activeContact}`,
        });
      } else {
        toast({
          title: "Erro no envio",
          description: "Verifique a configuração do Make.com",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar mensagem via Make.com",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const sendAdminIntervention = async () => {
    if (!adminMessage.trim() || !activeContact) return;

    const interventionMessage: Message = {
      id: Date.now().toString(),
      text: `[INTERVENÇÃO ADMIN] ${adminMessage}`,
      sender: 'admin',
      timestamp: new Date(),
      phoneNumber: whatsappConfig.authorizedNumber || '',
      status: 'sent',
      isAdminIntervention: true
    };

    setMessages(prev => [...prev, interventionMessage]);
    
    try {
      // Registrar intervenção no banco
      await supabase
        .from('whatsapp_messages')
        .insert({
          message_text: interventionMessage.text,
          sender_type: 'admin',
          ai_generated: false
        });

      // Enviar via WhatsApp se configurado
      const success = await sendWhatsAppMessage(activeContact, interventionMessage.text);
      
      if (success) {
        toast({
          title: "Intervenção enviada",
          description: "Mensagem administrativa enviada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar intervenção:', error);
    }

    setAdminMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAdminKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAdminIntervention();
    }
  };

  const handleContactSelect = (phoneNumber: string) => {
    setActiveContact(phoneNumber);
    loadMessagesForContact(phoneNumber);
    
    // Marcar como lido
    setContacts(prev => prev.map(contact => 
      contact.phoneNumber === phoneNumber 
        ? { ...contact, unreadCount: 0 }
        : contact
    ));
  };

  if (!whatsappConfig.isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Chat WhatsApp</h1>
          <p className="text-slate-600">Converse com seus contatos em tempo real</p>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WifiOff className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">WhatsApp não conectado</h3>
            <p className="text-gray-600 text-center mb-6">
              Você precisa conectar o WhatsApp primeiro para ver as conversas espelhadas.
            </p>
            <Button onClick={() => window.location.href = '/settings'}>
              Ir para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeContactInfo = contacts.find(c => c.phoneNumber === activeContact);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Chat WhatsApp</h1>
          <p className="text-slate-600">Conversas espelhadas do {whatsappConfig.authorizedNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">Conectado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de contatos */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Conversas ({contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.phoneNumber}
                  onClick={() => handleContactSelect(contact.phoneNumber)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeContact === contact.phoneNumber 
                      ? 'bg-blue-100 border border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium">{contact.name || contact.phoneNumber}</span>
                    </div>
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {contact.lastMessageTime?.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              
              {contacts.length === 0 && (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhuma conversa encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat principal */}
        <Card className="lg:col-span-3 bg-white/70 backdrop-blur-sm border-white/50">
          {activeContactInfo ? (
            <>
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activeContactInfo.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <span className="font-medium">{activeContactInfo.name}</span>
                      <p className="text-sm text-gray-500 font-normal">{activeContact}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {activeContactInfo.isOnline ? 'Online' : 'Offline'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' || message.sender === 'admin' 
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-red-500 text-white border-2 border-red-600'
                              : message.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {message.isAdminIntervention && (
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="h-3 w-3" />
                              <span className="text-xs font-bold">ADMIN</span>
                            </div>
                          )}
                          <p className="text-sm">{message.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {(message.sender === 'user' || message.sender === 'admin') && (
                              <span className="text-xs opacity-70">
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-gray-200 space-y-2">
                  {/* Intervenção administrativa */}
                  {isAdmin && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">Intervenção Administrativa</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite sua intervenção como administrador..."
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          onKeyPress={handleAdminKeyPress}
                          className="flex-1 border-red-300 focus:border-red-500"
                        />
                        <Button 
                          onClick={sendAdminIntervention} 
                          disabled={!adminMessage.trim()}
                          variant="destructive"
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Campo de mensagem normal */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Responder para ${activeContactInfo.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Mensagens enviadas através do {whatsappConfig.authorizedNumber}
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecione uma conversa para começar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
