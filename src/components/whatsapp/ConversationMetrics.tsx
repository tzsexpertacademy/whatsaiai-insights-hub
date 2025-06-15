
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Brain,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ConversationMetricsProps {
  protectedStats: {
    totalInsights: number;
    assistantCounts: Record<string, number>;
    lastAnalysis: string | null;
    systemIntegrity: boolean;
    assistantsActive: number;
  };
}

export function ConversationMetrics({ protectedStats }: ConversationMetricsProps) {
  const {
    totalInsights,
    assistantCounts,
    lastAnalysis,
    systemIntegrity,
    assistantsActive
  } = protectedStats;

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Status do Sistema de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{totalInsights}</p>
              <p className="text-sm text-purple-700">Total de Insights</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{assistantsActive}</p>
              <p className="text-sm text-blue-700">Assistentes Ativos</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              {systemIntegrity ? (
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${systemIntegrity ? 'text-green-600' : 'text-red-600'}`}>
                {systemIntegrity ? 'OK' : 'ERRO'}
              </p>
              <p className={`text-sm ${systemIntegrity ? 'text-green-700' : 'text-red-700'}`}>
                Sistema
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">
                {lastAnalysis ? new Date(lastAnalysis).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
              <p className="text-sm text-yellow-700">Última Análise</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Desempenho dos Assistentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(assistantCounts).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(assistantCounts).map(([assistantName, count]) => (
                <div key={assistantName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">{assistantName}</span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {count} insights
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum insight gerado ainda</p>
              <p className="text-sm">Execute análises para ver métricas detalhadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalInsights}</div>
              <div className="text-sm text-gray-600">Insights Totais</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{assistantsActive}</div>
              <div className="text-sm text-gray-600">Assistentes</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${systemIntegrity ? 'text-green-600' : 'text-red-600'}`}>
                {systemIntegrity ? '100%' : '0%'}
              </div>
              <div className="text-sm text-gray-600">Integridade</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
