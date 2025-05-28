
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bot, 
  Send, 
  Smile,
  Heart,
  Brain,
  Target,
  Users,
  Sparkles
} from 'lucide-react';

export function ChatWithAssistants() {
  const [selectedAssistant, setSelectedAssistant] = useState('psicologo');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Olá! Eu sou seu assistente psicológico. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);

  const assistants = [
    {
      id: 'psicologo',
      name: 'Psicólogo Virtual',
      icon: Brain,
      description: 'Especialista em análise comportamental e emocional',
      color: 'bg-blue-500',
      active: true
    },
    {
      id: 'coach',
      name: 'Life Coach',
      icon: Target,
      description: 'Foco em desenvolvimento pessoal e objetivos',
      color: 'bg-green-500',
      active: true
    },
    {
      id: 'terapeuta',
      name: 'Terapeuta Emocional',
      icon: Heart,
      description: 'Suporte emocional e bem-estar mental',
      color: 'bg-red-500',
      active: true
    },
    {
      id: 'social',
      name: 'Analista Social',
      icon: Users,
      description: 'Relacionamentos e interações sociais',
      color: 'bg-purple-500',
      active: false
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular resposta do assistente
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'Entendo sua questão. Vou analisar isso com cuidado e te dar um feedback detalhado...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const selectedAssistantData = assistants.find(a => a.id === selectedAssistant);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Chat com Assistentes IA</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Converse diretamente com nossos assistentes especializados para análise personalizada
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Lista de Assistentes */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Assistentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assistants.map((assistant) => (
                <div
                  key={assistant.id}
                  onClick={() => assistant.active && setSelectedAssistant(assistant.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAssistant === assistant.id
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : assistant.active
                      ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${assistant.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <assistant.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {assistant.name}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {assistant.description}
                      </p>
                      <div className="mt-1">
                        {assistant.active ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">Em breve</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Principal */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* Header do Chat */}
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedAssistantData?.color} rounded-full flex items-center justify-center`}>
                  {selectedAssistantData?.icon && (
                    <selectedAssistantData.icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedAssistantData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAssistantData?.description}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
              </div>
            </CardHeader>

            {/* Área de Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input de Mensagem */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sugestões de Conversa */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Sugestões para Começar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Como posso melhorar minha autoestima?",
              "Estou tendo problemas no relacionamento",
              "Quero definir metas para minha carreira",
              "Como lidar com ansiedade?",
              "Preciso de ajuda com produtividade",
              "Como melhorar minha comunicação?"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3 text-sm text-purple-700 border-purple-200 hover:bg-purple-100"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
