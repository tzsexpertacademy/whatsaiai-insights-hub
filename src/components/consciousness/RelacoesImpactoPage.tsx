
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Eye, TrendingUp, Heart, Star } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function RelacoesImpactoPage() {
  const { data } = useAnalysisData();

  // Filtrar insights relacionados a relações e impacto social
  const socialInsights = data.insightsWithAssistant?.filter(
    insight => insight.assistantArea?.toLowerCase().includes('social') ||
               insight.assistantArea?.toLowerCase().includes('relações') ||
               insight.assistantArea?.toLowerCase().includes('comunicação') ||
               insight.title?.toLowerCase().includes('relação') ||
               insight.description?.toLowerCase().includes('comunicação')
  ) || [];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="bg-blue-100 text-blue-800">
        👥 {socialInsights.length} Insights Ativos
      </Badge>
    </div>
  );

  return (
    <PageLayout
      title="Relações e Impacto Social"
      description="Análise da sua comunicação, influência e impacto nas relações"
      headerActions={headerActions}
      showBackButton={true}
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualidade Comunicação</p>
                  <p className="text-xl font-bold text-blue-700">Alta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percepção Social</p>
                  <p className="text-xl font-bold text-purple-700">Positiva</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Influência</p>
                  <p className="text-xl font-bold text-green-700">Crescente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conexões Profundas</p>
                  <p className="text-xl font-bold text-red-700">Sólidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Sociais */}
        {socialInsights.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Insights sobre Relações e Impacto Social
              </CardTitle>
              <p className="text-sm text-gray-600">
                Análises especializadas em dinâmicas relacionais e influência social
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialInsights.slice(0, 5).map((insight) => {
                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case 'high': return 'border-red-200 bg-red-50';
                      case 'medium': return 'border-yellow-200 bg-yellow-50';
                      case 'low': return 'border-green-200 bg-green-50';
                      default: return 'border-gray-200 bg-gray-50';
                    }
                  };

                  return (
                    <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-800">{insight.title}</h4>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {insight.assistantName}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Área: {insight.assistantArea}</span>
                        <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Padrões de Comunicação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Análise do seu estilo comunicativo e impacto nas relações interpessoais.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estilo Dominante</span>
                  <Badge className="bg-blue-100 text-blue-800">Assertivo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Empatia</span>
                  <Badge className="bg-green-100 text-green-800">Alta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clareza de Expressão</span>
                  <Badge className="bg-purple-100 text-purple-800">Excelente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Imagem Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Como você é percebido e o impacto que gera no ambiente social.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confiabilidade</span>
                  <Badge className="bg-green-100 text-green-800">Muito Alta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Liderança</span>
                  <Badge className="bg-blue-100 text-blue-800">Natural</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Influência Positiva</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Crescente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
