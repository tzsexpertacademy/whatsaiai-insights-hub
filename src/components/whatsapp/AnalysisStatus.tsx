
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisConversations } from '@/hooks/useAnalysisConversations';
import { 
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Star,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export function AnalysisStatus() {
  const { 
    conversations, 
    isLoading, 
    loadAnalysisConversations,
    updateAnalysisStatus 
  } = useAnalysisConversations();

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const pendingCount = conversations.filter(c => c.analysis_status === 'pending').length;
  const processingCount = conversations.filter(c => c.analysis_status === 'processing').length;
  const completedCount = conversations.filter(c => c.analysis_status === 'completed').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            Status da Análise IA
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalysisConversations}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Pendentes: {pendingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <span>Processando: {processingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Concluídas: {completedCount}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <Brain className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhuma conversa marcada para análise</p>
            <p className="text-xs mt-1">Marque conversas no WhatsApp Mirror para análise IA</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(conv.priority)}
                    {getStatusIcon(conv.analysis_status)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{conv.contact_name}</p>
                    <p className="text-xs text-gray-500">{conv.contact_phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(conv.analysis_status) as any}>
                    {conv.analysis_status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {conv.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
