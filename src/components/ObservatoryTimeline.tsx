
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target, Award, AlertTriangle, CheckCircle, Clock, Bot } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  // Usar APENAS dados reais dos assistentes
  const hasRealData = data.hasRealData && data.insightsWithAssistant && data.insightsWithAssistant.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Linha do Tempo"
          subtitle="Acompanhe sua evolução e marcos importantes ao longo do tempo"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p>Carregando linha do tempo dos assistentes...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Linha do Tempo"
          subtitle="Acompanhe sua evolução e marcos importantes ao longo do tempo"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Linha do Tempo Aguarda Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Eventos dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    A linha do tempo será construída com base nos insights dos seus assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes identificarão marcos importantes</p>
                    <p className="text-sm text-gray-600">• Eventos serão organizados cronologicamente</p>
                  </div>
                  <AIAnalysisButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Criar eventos da timeline baseados APENAS nos insights dos assistentes
  const timelineEvents = data.insightsWithAssistant.map((insight) => ({
    id: insight.id,
    date: new Date(insight.created_at || insight.createdAt),
    title: insight.title,
    description: insight.description,
    type: getEventType(insight.insight_type),
    category: getCategoryFromAssistant(insight.assistantArea),
    impact: getImpactFromPriority(insight.priority),
    assistantName: insight.assistantName,
    assistantArea: insight.assistantArea
  })).sort((a, b) => b.date.getTime() - a.date.getTime());

  function getEventType(insightType: string) {
    const typeMap: { [key: string]: string } = {
      'emotional': 'insight',
      'behavioral': 'challenge',
      'growth': 'goal',
      'achievement': 'achievement',
      'milestone': 'milestone'
    };
    return typeMap[insightType] || 'insight';
  }

  function getCategoryFromAssistant(assistantArea: string) {
    const categoryMap: { [key: string]: string } = {
      'psicologia': 'crescimento-pessoal',
      'saude': 'saude',
      'estrategia': 'carreira',
      'relacionamentos': 'relacionamentos',
      'financeiro': 'financas',
      'proposito': 'crescimento-pessoal',
      'criatividade': 'crescimento-pessoal'
    };
    return categoryMap[assistantArea] || 'crescimento-pessoal';
  }

  function getImpactFromPriority(priority: string) {
    const impactMap: { [key: string]: string } = {
      'high': 'negative',
      'medium': 'neutral',
      'low': 'positive'
    };
    return impactMap[priority] || 'neutral';
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-600" />;
      case 'milestone':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'insight':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'goal':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'challenge':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saude': return 'bg-green-100 text-green-800';
      case 'carreira': return 'bg-blue-100 text-blue-800';
      case 'relacionamentos': return 'bg-pink-100 text-pink-800';
      case 'crescimento-pessoal': return 'bg-purple-100 text-purple-800';
      case 'financas': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'border-l-green-500 bg-green-50';
      case 'negative': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const positiveEvents = timelineEvents.filter(e => e.impact === 'positive').length;
  const totalEvents = timelineEvents.length;
  const progressPercentage = totalEvents > 0 ? Math.round((positiveEvents / totalEvents) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Linha do Tempo"
        subtitle="Acompanhe sua evolução e marcos importantes ao longo do tempo"
      >
        <Badge className="bg-purple-100 text-purple-800">
          🔮 Eventos dos Assistentes - {timelineEvents.length} marcos
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Estatísticas baseadas nos dados dos assistentes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Eventos</p>
                    <p className="text-2xl font-bold">{totalEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Eventos Positivos</p>
                    <p className="text-2xl font-bold">{positiveEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Insights</p>
                    <p className="text-2xl font-bold">
                      {timelineEvents.filter(e => e.type === 'insight').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progresso Geral</p>
                    <p className="text-2xl font-bold">{progressPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha do Tempo dos Assistentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Sua Jornada de Evolução (Assistentes IA)
                <Badge variant="outline" className="text-xs">
                  Baseado em {timelineEvents.length} insights
                </Badge>
              </CardTitle>
              <CardDescription>
                Eventos importantes identificados pelos seus assistentes IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-start gap-4">
                      {/* Ícone do evento */}
                      <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${getImpactColor(event.impact)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      {/* Conteúdo do evento */}
                      <Card className={`flex-1 border-l-4 ${getImpactColor(event.impact)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{event.title}</h4>
                                <Badge className={getCategoryColor(event.category)}>
                                  {event.category}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800">
                                  🤖 {event.assistantName}
                                </Badge>
                                <Badge variant="outline">
                                  {event.assistantArea}
                                </Badge>
                              </div>
                              
                              <p className="text-gray-600 mb-2">{event.description}</p>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                {event.date.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Categoria - Baseado nos dados dos assistentes */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Área da Vida (Assistentes)</CardTitle>
              <CardDescription>
                Distribuição dos insights por categoria identificada pelos assistentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['saude', 'carreira', 'relacionamentos', 'crescimento-pessoal', 'financas'].map(category => {
                  const categoryEvents = timelineEvents.filter(e => e.category === category);
                  const positiveCount = categoryEvents.filter(e => e.impact === 'positive').length;
                  
                  return (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{category.replace('-', ' ')}</h4>
                        <Badge className={getCategoryColor(category)}>
                          {categoryEvents.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        {positiveCount} positivos
                      </div>
                      {categoryEvents.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Assistentes: {[...new Set(categoryEvents.map(e => e.assistantName))].join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
