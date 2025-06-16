
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { 
  Clock, 
  Brain, 
  Trash2, 
  TrendingUp, 
  Zap,
  User,
  MessageSquare,
  BarChart3,
  RefreshCw,
  History
} from 'lucide-react';

interface AnalysisHistoryViewerProps {
  conversationAnalysisId: string;
}

export function AnalysisHistoryViewer({ conversationAnalysisId }: AnalysisHistoryViewerProps) {
  const { 
    analysisHistory, 
    isLoading, 
    loadAnalysisHistory, 
    deleteAnalysisFromHistory,
    getAnalysisStats 
  } = useAnalysisHistory();

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisHistory(conversationAnalysisId);
  }, [conversationAnalysisId, loadAnalysisHistory]);

  const stats = getAnalysisStats();
  const selectedAnalysis = analysisHistory.find(entry => entry.id === selectedHistoryId);

  const getAnalysisTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'commercial':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'custom':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'Comportamental';
      case 'commercial':
        return 'Comercial';
      case 'custom':
        return 'Personalizada';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando histórico de análises...</p>
        </CardContent>
      </Card>
    );
  }

  if (analysisHistory.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Nenhuma análise no histórico</h3>
          <p className="text-gray-500">Execute análises para ver o histórico aqui</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas do Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Estatísticas do Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAnalyses}</div>
              <div className="text-sm text-gray-600">Total de Análises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${stats.totalCost.toFixed(4)}</div>
              <div className="text-sm text-gray-600">Custo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalTokens.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tokens Usados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgProcessingTime)}ms</div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista do Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Histórico de Análises ({analysisHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {analysisHistory.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedHistoryId === entry.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedHistoryId(entry.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Brain className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getAnalysisTypeColor(entry.analysis_type)}>
                                {getAnalysisTypeLabel(entry.analysis_type)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {entry.assistant_name || entry.assistant_id}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(entry.created_at).toLocaleString('pt-BR')}
                              </span>
                              <span className="text-xs text-gray-500">
                                <MessageSquare className="h-3 w-3 inline mr-1" />
                                {entry.analysis_results?.length || 0} insights
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnalysisFromHistory(entry.id);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes da Análise Selecionada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Detalhes da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getAnalysisTypeColor(selectedAnalysis.analysis_type)}>
                    {getAnalysisTypeLabel(selectedAnalysis.analysis_type)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    por {selectedAnalysis.assistant_name || selectedAnalysis.assistant_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Mensagens Analisadas:</span>
                    <div className="text-gray-600">{selectedAnalysis.messages_analyzed}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tokens Usados:</span>
                    <div className="text-gray-600">{selectedAnalysis.tokens_used.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Custo:</span>
                    <div className="text-gray-600">${selectedAnalysis.cost_estimate.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tempo:</span>
                    <div className="text-gray-600">{selectedAnalysis.processing_time_ms}ms</div>
                  </div>
                </div>

                {selectedAnalysis.analysis_prompt && (
                  <div>
                    <span className="font-medium text-sm">Prompt Usado:</span>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                      {selectedAnalysis.analysis_prompt}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium text-sm">Insights Gerados ({selectedAnalysis.analysis_results?.length || 0}):</span>
                  <ScrollArea className="max-h-64 mt-2">
                    <div className="space-y-2">
                      {selectedAnalysis.analysis_results?.map((result, index) => (
                        <Card key={index} className="bg-blue-50 border-blue-200">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-blue-500 mt-1" />
                              <div className="flex-1">
                                <h5 className="font-medium text-blue-900 text-sm">{result.title}</h5>
                                {result.description && (
                                  <p className="text-xs text-blue-700 mt-1">{result.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )) || (
                        <p className="text-gray-500 text-sm">Nenhum insight gerado nesta análise</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma análise para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
