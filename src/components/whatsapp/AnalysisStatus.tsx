
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface AnalysisStatusProps {
  conversations: Array<{
    id: string;
    analysis_status: string;
    priority: 'high' | 'medium' | 'low';
    contact_name: string;
    contact_phone: string;
    marked_at: string;
    last_analyzed_at?: string;
  }>;
  isLoading: boolean;
}

export function AnalysisStatus({ conversations, isLoading }: AnalysisStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-red-200 text-red-700 bg-red-50';
      case 'medium': return 'border-yellow-200 text-yellow-700 bg-yellow-50';
      case 'low': return 'border-blue-200 text-blue-700 bg-blue-50';
      default: return 'border-gray-200 text-gray-700 bg-gray-50';
    }
  };

  const completedConversations = conversations.filter(c => c.analysis_status === 'completed');
  const pendingConversations = conversations.filter(c => c.analysis_status === 'pending');
  const processingConversations = conversations.filter(c => c.analysis_status === 'processing');
  const failedConversations = conversations.filter(c => c.analysis_status === 'failed');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando status das análises...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CheckCircle className="h-5 w-5" />
          Status da Análise
        </CardTitle>
        <CardDescription>
          Resumo do progresso das análises de conversas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{conversations.length}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingConversations.length}</div>
            <div className="text-sm text-yellow-700">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{processingConversations.length}</div>
            <div className="text-sm text-blue-700">Processando</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedConversations.length}</div>
            <div className="text-sm text-green-700">Concluídas</div>
          </div>
        </div>

        {conversations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Conversas Recentes:</h4>
            {conversations.slice(0, 3).map((conversation) => (
              <div key={conversation.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(conversation.analysis_status)}
                  <div>
                    <h5 className="font-medium">{conversation.contact_name}</h5>
                    <p className="text-sm text-gray-500">{conversation.contact_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(conversation.priority as 'high' | 'medium' | 'low')}
                  >
                    {conversation.priority}
                  </Badge>
                  
                  <Badge variant="outline">
                    {getStatusText(conversation.analysis_status)}
                  </Badge>
                </div>
              </div>
            ))}
            
            {conversations.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                E mais {conversations.length - 3} conversas...
              </p>
            )}
          </div>
        )}

        {conversations.length === 0 && (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Nenhuma conversa marcada para análise</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
