import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useConversationSaver } from '@/hooks/useConversationSaver';
import { ConversationList } from './conversation/ConversationList';
import { MessageItem } from './conversation/MessageItem';

interface WPPMessage {
  id: string;
  timestamp: number;
  fromMe: boolean;
  senderName: string;
  body: string;
  type: string;
  hasMedia: boolean;
  mediaUrl?: string;
  transcription?: string;
}

interface WPPContact {
  phone: string;
  name: string;
}

interface WPPConversation {
  id: string;
  contact: WPPContact;
  messages: WPPMessage[];
}

interface MarkedConversationState {
  [chatId: string]: {
    messageIds: string[];
  };
}

export function WPPConnectMirror() {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<WPPConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [markedConversations, setMarkedConversations] = useState<MarkedConversationState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { saveMarkedConversationToDatabase } = useConversationSaver();
  const [audioTranscriptions, setAudioTranscriptions] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Simulação com mensagens de áudio mais realistas
      const mockConversations: WPPConversation[] = [
        {
          id: 'chatId1',
          contact: { phone: '+5511999999999', name: 'Maria Silva' },
          messages: [
            { 
              id: '1', 
              timestamp: Date.now() / 1000 - 60 * 60, 
              fromMe: false, 
              senderName: 'Maria', 
              body: 'Olá! Como posso te ajudar hoje?', 
              type: 'text', 
              hasMedia: false 
            },
            { 
              id: '2', 
              timestamp: Date.now() / 1000 - 30 * 60, 
              fromMe: true, 
              senderName: 'Você', 
              body: 'Preciso de informações sobre os novos produtos.', 
              type: 'text', 
              hasMedia: false 
            },
            { 
              id: '3', 
              timestamp: Date.now() / 1000 - 15 * 60, 
              fromMe: false, 
              senderName: 'Maria', 
              body: 'Temos ótimas novidades! Deixe-me apresentar...', 
              type: 'text', 
              hasMedia: false 
            },
            { 
              id: '4', 
              timestamp: Date.now() / 1000 - 10 * 60, 
              fromMe: true, 
              senderName: 'Você', 
              body: 'SGVsbG8gV29ybGQgdGhpcyBpcyBhIHNhbXBsZSBhdWRpbyBtZXNzYWdl', // Base64 simulado para áudio
              type: 'audio', 
              hasMedia: true 
            },
            { 
              id: '5', 
              timestamp: Date.now() / 1000 - 5 * 60, 
              fromMe: false, 
              senderName: 'Maria', 
              body: 'VGVzdGUgZGUgw6F1ZGlvIGVtIHBvcnR1Z3XDqnM=', // Base64 simulado para áudio
              type: 'audio', 
              hasMedia: true 
            }
          ]
        },
        {
          id: 'chatId2',
          contact: { phone: '+5521888888888', name: 'João Santos' },
          messages: [
            { 
              id: '6', 
              timestamp: Date.now() / 1000 - 2 * 60 * 60, 
              fromMe: false, 
              senderName: 'João', 
              body: 'Gostaria de saber mais sobre os serviços de consultoria.', 
              type: 'text', 
              hasMedia: false 
            },
            { 
              id: '7', 
              timestamp: Date.now() / 1000 - 45 * 60, 
              fromMe: true, 
              senderName: 'Você', 
              body: 'Nossa consultoria é especializada em...', 
              type: 'text', 
              hasMedia: false 
            },
            { 
              id: '8', 
              timestamp: Date.now() / 1000 - 30 * 60, 
              fromMe: false, 
              senderName: 'João', 
              body: 'UGVyZmVpdG8sIGVudGVuZGkgdHVkbyE=', // Base64 simulado para áudio
              type: 'audio', 
              hasMedia: true 
            },
            { 
              id: '9', 
              timestamp: Date.now() / 1000 - 20 * 60, 
              fromMe: false, 
              senderName: 'João', 
              body: 'Entendo. Quais são os próximos passos?', 
              type: 'text', 
              hasMedia: false 
            }
          ]
        }
      ];

      setConversations(mockConversations);
      setIsConnected(true);
      
      console.log('🎵 Conversas carregadas com áudios:', {
        totalConversations: mockConversations.length,
        totalMessages: mockConversations.reduce((acc, conv) => acc + conv.messages.length, 0),
        audioMessages: mockConversations.reduce((acc, conv) => 
          acc + conv.messages.filter(msg => msg.type === 'audio').length, 0
        )
      });
      
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (chatId: string) => {
    setSelectedConversation(chatId);
  };

  const toggleMessageSelection = (chatId: string, messageId: string) => {
    setMarkedConversations(prev => {
      const isSelected = prev[chatId]?.messageIds.includes(messageId) || false;
      
      if (isSelected) {
        const updatedMessageIds = prev[chatId].messageIds.filter(id => id !== messageId);
        
        if (updatedMessageIds.length === 0) {
          const { [chatId]: removedChat, ...rest } = prev;
          return rest;
        } else {
          return {
            ...prev,
            [chatId]: {
              messageIds: updatedMessageIds
            }
          };
        }
      } else {
        return {
          ...prev,
          [chatId]: {
            messageIds: [...(prev[chatId]?.messageIds || []), messageId]
          }
        };
      }
    });
  };

  const handleAudioTranscription = (messageId: string, transcription: string) => {
    console.log('📝 Transcrição de áudio recebida:', { messageId, transcription });
    
    setAudioTranscriptions(prev => ({
      ...prev,
      [messageId]: transcription
    }));

    setConversations(prevConversations => 
      prevConversations.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                transcription, 
                body: msg.type === 'audio' 
                  ? `${msg.body} [Transcrição: ${transcription}]`
                  : msg.body
              }
            : msg
        )
      }))
    );

    toast({
      title: "🎵 Áudio transcrito",
      description: `Transcrição adicionada à conversa para análise`,
    });
  };

  const isAudioMessage = (message: WPPMessage): boolean => {
    if (message.type === 'audio') {
      console.log('🎵 Áudio detectado por tipo:', message.id);
      return true;
    }
    
    if (message.hasMedia && message.body) {
      const isBase64Pattern = /^[A-Za-z0-9+/]+=*$/.test(message.body);
      if (isBase64Pattern && message.body.length > 20) {
        console.log('🎵 Áudio detectado por base64:', message.id);
        return true;
      }
    }
    
    if (message.body?.includes('audio:') || message.body?.includes('voice:')) {
      console.log('🎵 Áudio detectado por indicador:', message.id);
      return true;
    }
    
    return false;
  };

  const getAudioCount = (conversation: WPPConversation) => {
    return conversation.messages.filter(msg => isAudioMessage(msg)).length;
  };

  const handleSaveConversation = async (chatId: string) => {
    const conversation = conversations.find(conv => conv.id === chatId);
    if (!conversation) return;

    const markedMessages = conversation.messages.filter(msg => 
      markedConversations[chatId]?.messageIds.includes(msg.id)
    );

    if (markedMessages.length === 0) {
      toast({
        title: "⚠️ Nenhuma mensagem selecionada",
        description: "Clique nas mensagens para selecioná-las antes de salvar",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Salvando conversa com transcrições:', {
      chatId,
      totalMessages: markedMessages.length,
      audioMessages: markedMessages.filter(msg => isAudioMessage(msg)).length,
      transcriptions: Object.keys(audioTranscriptions).length
    });

    // Incluir transcrições nas mensagens salvas
    const messagesWithTranscriptions = markedMessages.map(msg => ({
      ...msg,
      body: audioTranscriptions[msg.id] 
        ? `${msg.body} [Transcrição: ${audioTranscriptions[msg.id]}]`
        : msg.body
    }));

    const success = await saveMarkedConversationToDatabase(
      chatId,
      conversation.contact.name,
      conversation.contact.phone,
      messagesWithTranscriptions.map(msg => ({
        id: msg.id,
        text: msg.body || '',
        sender: msg.fromMe ? 'user' : 'contact',
        timestamp: new Date(msg.timestamp * 1000).toISOString(),
        fromMe: msg.fromMe
      }))
    );

    if (success) {
      setMarkedConversations(prev => {
        const newMarked = { ...prev };
        delete newMarked[chatId];
        return newMarked;
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              WPPConnect - Espelho com Reprodução de Áudio
              {!isConnected && (
                <Badge variant="destructive" className="ml-2">
                  Desconectado
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="text-green-600 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Conectado! {Object.keys(audioTranscriptions).length} áudios transcritos
            </div>
          ) : (
            <div className="text-red-600 font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          markedConversations={markedConversations}
          isLoading={isLoading}
          audioCount={getAudioCount}
          onSelectConversation={setSelectedConversation}
        />

        {/* Visualizar Conversa */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {selectedConversation ? (
                  <>
                    {conversations.find(conv => conv.id === selectedConversation)?.contact.name}
                    <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">
                      {Object.keys(audioTranscriptions).length} áudios transcritos
                    </Badge>
                  </>
                ) : (
                  'Selecione uma conversa'
                )}
              </CardTitle>
              
              {selectedConversation && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveConversation(selectedConversation)}
                    disabled={isSaving || !markedConversations[selectedConversation]?.messageIds.length}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Selecionadas ({markedConversations[selectedConversation]?.messageIds.length || 0})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {selectedConversation ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-700">
                    🎵 Clique nas mensagens para selecioná-las. Áudios são reproduzíveis e automaticamente transcritos.
                  </div>
                  
                  {(() => {
                    const conversation = conversations.find(conv => conv.id === selectedConversation);
                    if (!conversation) return null;

                    return conversation.messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isMarked={markedConversations[selectedConversation]?.messageIds.includes(message.id) || false}
                        isAudio={isAudioMessage(message)}
                        transcription={audioTranscriptions[message.id]}
                        onToggleSelection={() => toggleMessageSelection(selectedConversation, message.id)}
                        onTranscriptionComplete={handleAudioTranscription}
                      />
                    ));
                  })()}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Conversas Carregadas</p>
              <p className="font-bold text-gray-800">{conversations.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Mensagens Totais</p>
              <p className="font-bold text-gray-800">
                {conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Áudios Detectados</p>
              <p className="font-bold text-orange-600">
                {conversations.reduce((acc, conv) => 
                  acc + conv.messages.filter(msg => isAudioMessage(msg)).length, 0
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Transcrições Feitas</p>
              <p className="font-bold text-green-600">{Object.keys(audioTranscriptions).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
