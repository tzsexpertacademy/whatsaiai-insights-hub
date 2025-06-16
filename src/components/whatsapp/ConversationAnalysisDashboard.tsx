
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisConversations } from '@/hooks/useAnalysisConversations';
import { useAuth } from '@/contexts/AuthContext';
import { IndividualConversationAnalysis } from './IndividualConversationAnalysis';
import { AnalysisStatus } from './AnalysisStatus';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  Target,
  AlertTriangle
} from 'lucide-react';

interface AnalysisConversation {
  id: string;
  chat_id: string;
  contact_name: string;
  contact_phone: string;
  priority: 'high' | 'medium' | 'low';
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  marked_at: string;
  last_analyzed_at?: string;
  analysis_results: any[];
  marked_for_analysis: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function ConversationAnalysisDashboard() {
  const { user } = useAuth();
  const { 
    conversations, 
    isLoading, 
    loadAnalysisConversations,
    updateAnalysisStatus 
  } = useAnalysisConversations();

  const [selectedConversation, setSelectedConversation] = useState<AnalysisConversation | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAnalysisConversations();
    }
  }, [user?.id, loadAnalysisConversations]);

  const handleAnalysisUpdate = () => {
    loadAnalysisConversations();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Carregando conversas marcadas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <AnalysisStatus />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Conversas Marcadas para Análise ({conversations.length})
            </CardTitle>
            <CardDescription>
              Selecione uma conversa para realizar análise individual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhuma conversa marcada</p>
                <p className="text-sm">Vá para o WhatsApp Chat e marque conversas para análise</p>
                <Button 
                  onClick={loadAnalysisConversations}
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Lista
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversations.map((conversation) => {
                  // Garantir que a conversa tem todas as propriedades necessárias
                  const fullConversation: AnalysisConversation = {
                    ...conversation,
                    created_at: conversation.created_at || new Date().toISOString(),
                    updated_at: conversation.updated_at || new Date().toISOString(),
                    user_id: conversation.user_id || user?.id || ''
                  };

                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedConversation(fullConversation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{conversation.contact_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(conversation.priority)}>
                            {conversation.priority}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(conversation.analysis_status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{conversation.contact_phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(conversation.marked_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 capitalize">
                          Status: {conversation.analysis_status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Analysis Panel */}
        <div className="space-y-4">
          {selectedConversation ? (
            <IndividualConversationAnalysis 
              conversation={selectedConversation}
              onAnalysisUpdate={handleAnalysisUpdate}
            />
          ) : (
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Selecione uma Conversa
                </h3>
                <p className="text-gray-500 text-center">
                  Escolha uma conversa da lista ao lado para realizar análise individual detalhada
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
