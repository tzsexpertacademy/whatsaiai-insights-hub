import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { OnboardingExperience } from '@/components/onboarding/OnboardingExperience';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { EmotionalChart } from '@/components/dashboard/EmotionalChart';
import { LifeAreasMap } from '@/components/dashboard/LifeAreasMap';
import { PsychologicalProfile } from '@/components/dashboard/PsychologicalProfile';
import { SkillsCards } from '@/components/dashboard/SkillsCards';
import { InsightsAlerts } from '@/components/dashboard/InsightsAlerts';
import { AIAnalysisCard } from '@/components/dashboard/AIAnalysisCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Brain, Sparkles, Settings, BarChart3, Loader2, Zap, Clock, Target, Bot, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAIReportUpdate } from '@/hooks/useAIReportUpdate';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

export function DashboardMain() {
  const { isFirstVisit, completed, showDemo } = useOnboarding();
  const { data, isLoading } = useAnalysisData();
  const { config } = useClientConfig();
  const navigate = useNavigate();
  const { updateReport, isUpdating } = useAIReportUpdate();

  console.log('📊 DashboardMain - Estado atual:', {
    isFirstVisit,
    completed,
    showDemo,
    hasRealData: data.hasRealData,
    isLoading,
    openaiConfigured: !!config.openai?.apiKey
  });

  // Se é primeira visita, mostra experiência de onboarding
  if (isFirstVisit && !completed) {
    return <OnboardingExperience />;
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Carregando seu YumerMind...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status das configurações
  const isOpenAIConfigured = config.openai?.apiKey && config.openai.apiKey.startsWith('sk-');
  const isWhatsAppConfigured = config.whatsapp?.makeWebhookUrl || config.whatsapp?.atendechatApiKey;
  const isFirebaseConfigured = config.firebase?.projectId;

  // Formatação da data da última análise
  const lastUpdate = data.metrics.lastAnalysis ? 
    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

  // Se não tem dados reais ainda - Dashboard de boas-vindas
  if (!data.hasRealData) {
    return (
      <div className="w-full">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header de Boas-vindas */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                YumerMind da Consciência
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sua plataforma de análise comportamental está configurada e pronta para uso!
              </p>

              {/* Cartão de Análise por IA */}
              {isOpenAIConfigured && (
                <div className="flex justify-center pt-4">
                  <AIAnalysisCard />
                </div>
              )}
            </div>

            {/* Status das Configurações */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Status das Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${isOpenAIConfigured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isOpenAIConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="font-medium">OpenAI</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isOpenAIConfigured ? '✅ Configurado' : '⚠️ Pendente'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${isWhatsAppConfigured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isWhatsAppConfigured ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">WhatsApp</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isWhatsAppConfigured ? '✅ Configurado' : '📋 Opcional'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${isFirebaseConfigured ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${isFirebaseConfigured ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-medium">Firebase</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isFirebaseConfigured ? '✅ Configurado' : '📋 Opcional'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/chat')}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chat com Assistentes</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Converse com assistentes especializados em análise comportamental
                  </p>
                  <Button className="w-full" disabled={!isOpenAIConfigured}>
                    {isOpenAIConfigured ? 'Iniciar Chat' : 'Configure OpenAI'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/insights')}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Dashboard Completo</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Visualize métricas, gráficos e análises detalhadas
                  </p>
                  <Button variant="outline" className="w-full">
                    Ver Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Configure integrações e personalize o sistema
                  </p>
                  <Button variant="outline" className="w-full">
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Próximos Passos */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Próximos Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!isOpenAIConfigured && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <span className="text-sm">Configure sua API key da OpenAI para ativar os assistentes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{isOpenAIConfigured ? '1' : '2'}</div>
                    <span className="text-sm">Inicie uma conversa com os assistentes especializados</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{isOpenAIConfigured ? '2' : '3'}</div>
                    <span className="text-sm">Explore as análises geradas automaticamente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard com dados reais - análises completas
  // Preparar dados para gráficos COM ASSISTENTES CORRETOS
  const insightsWithCorrectAssistants = data.insightsWithAssistant || [];

  console.log('🔍 DASHBOARD - Verificando assistentes nos insights:', 
    insightsWithCorrectAssistants.map(i => ({ 
      id: i.id, 
      assistantName: i.assistantName, 
      assistantArea: i.assistantArea,
      type: i.insight_type 
    }))
  );

  // Distribuição por prioridade
  const priorityData = [
    { 
      prioridade: 'Alta', 
      quantidade: insightsWithCorrectAssistants.filter(i => i.priority === 'high').length,
      cor: '#EF4444'
    },
    { 
      prioridade: 'Média', 
      quantidade: insightsWithCorrectAssistants.filter(i => i.priority === 'medium').length,
      cor: '#F59E0B'
    },
    { 
      prioridade: 'Baixa', 
      quantidade: insightsWithCorrectAssistants.filter(i => i.priority === 'low').length,
      cor: '#10B981'
    }
  ].filter(item => item.quantidade > 0);

  // Distribuição por assistente CORRIGIDA
  const assistantData = insightsWithCorrectAssistants.reduce((acc, insight) => {
    const assistantName = insight.assistantName || 'Assistente Desconhecido';
    const existing = acc.find(item => item.assistente === assistantName);
    if (existing) {
      existing.insights++;
    } else {
      acc.push({
        assistente: assistantName.length > 15 ? assistantName.split(' ')[0] + '...' : assistantName, // Abreviar nomes longos
        insights: 1,
        area: insight.assistantArea || 'Geral',
        fullName: assistantName
      });
    }
    return acc;
  }, [] as Array<{ assistente: string; insights: number; area: string; fullName: string }>);

  console.log('📊 DASHBOARD - Dados dos assistentes para gráfico:', assistantData);

  // Evolução temporal COM ASSISTENTES CORRETOS
  const timelineData = insightsWithCorrectAssistants
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7)
    .map((insight, index) => {
      const date = new Date(insight.createdAt);
      return {
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: index + 1,
        assistente: insight.assistantName?.split(' ')[0] || 'Assistente',
        fullAssistantName: insight.assistantName || 'Assistente Desconhecido'
      };
    });

  return (
    <div className="w-full">
      <DashboardHeader />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header com dados e status CORRIGIDO */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">YumerMind da Consciência</h1>
            <p className="text-gray-600">Análises comportamentais baseadas em suas conversas</p>
            
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Badge className="bg-purple-100 text-purple-800">
                🤖 {data.metrics.assistantsActive} Assistentes Ativos
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                📊 {insightsWithCorrectAssistants.length} Insights Gerados
              </Badge>
              {lastUpdate && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUpdate}
                </Badge>
              )}
            </div>
            
            {/* Cartão de Análise por IA */}
            {isOpenAIConfigured && (
              <div className="flex justify-center pt-4">
                <AIAnalysisCard />
              </div>
            )}
          </div>

          {/* Gráficos de Análise COM ASSISTENTES CORRETOS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Distribuição por Prioridade */}
            {priorityData.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-orange-600" />
                    Por Prioridade
                  </CardTitle>
                  <p className="text-sm text-gray-600">Distribuição dos insights por nível de importância</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="quantidade"
                          label={false}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-medium">{data.prioridade}</p>
                                  <p className="text-sm">{data.quantidade} insights</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4 space-y-2">
                    {priorityData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }}></div>
                          <span>{item.prioridade}</span>
                        </div>
                        <span className="font-medium">{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Distribuição por Assistente CORRIGIDA */}
            {assistantData.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Por Assistente
                  </CardTitle>
                  <p className="text-sm text-gray-600">Contribuições de cada assistente especializado</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assistantData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" fontSize={10} />
                        <YAxis type="category" dataKey="assistente" fontSize={9} width={80} />
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-medium">{data.fullName}</p>
                                  <p className="text-sm">Área: {data.area}</p>
                                  <p className="text-sm">{data.insights} insights</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="insights" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Evolução Temporal COM ASSISTENTES CORRETOS */}
            {timelineData.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Evolução
                  </CardTitle>
                  <p className="text-sm text-gray-600">Crescimento acumulado de insights</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="data" fontSize={10} />
                        <YAxis fontSize={10} />
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded shadow-lg">
                                  <p className="font-medium">Data: {data.data}</p>
                                  <p className="text-sm">Total: {data.total} insights</p>
                                  <p className="text-sm">Último por: {data.fullAssistantName}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Métricas principais */}
          <MetricCards />

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmotionalChart />
            <LifeAreasMap />
          </div>

          {/* Perfil psicológico */}
          <PsychologicalProfile />

          {/* Habilidades */}
          <SkillsCards />

          {/* Insights e alertas */}
          <InsightsAlerts />

          {/* Insights Recentes COM ASSISTENTES CORRETOS */}
          {insightsWithCorrectAssistants.length > 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Análises Recentes dos Assistentes
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {insightsWithCorrectAssistants.length} insights gerados por {data.metrics.assistantsActive} assistentes especializados
                  {lastUpdate && ` • Última análise: ${lastUpdate}`}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insightsWithCorrectAssistants.slice(0, 3).map((insight) => {
                    const createdAt = new Date(insight.createdAt);
                    const formattedDate = createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const getPriorityColor = (priority: string) => {
                      switch (priority) {
                        case 'high': return 'border-red-200 bg-red-50';
                        case 'medium': return 'border-yellow-200 bg-yellow-50';
                        case 'low': return 'border-green-200 bg-green-50';
                        default: return 'border-gray-200 bg-gray-50';
                      }
                    };

                    console.log('📋 RENDERIZANDO INSIGHT:', {
                      id: insight.id,
                      assistantName: insight.assistantName,
                      title: insight.title?.substring(0, 30)
                    });

                    return (
                      <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{insight.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              🤖 {insight.assistantName}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.assistantArea}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Bot className="h-3 w-3" />
                            <span>Área: {insight.assistantArea}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {insightsWithCorrectAssistants.length > 3 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/dashboard/insights')}
                      className="text-sm"
                    >
                      Ver Todos os {insightsWithCorrectAssistants.length} Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
