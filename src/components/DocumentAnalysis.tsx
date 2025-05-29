
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, MessageSquare, Bot, Upload, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function DocumentAnalysis() {
  const { data, isLoading } = useAnalysisData();

  // Filtrar insights relacionados a documentos e análise textual
  const documentInsights = data.insightsWithAssistant?.filter(insight => 
    insight.description.toLowerCase().includes('documento') ||
    insight.description.toLowerCase().includes('texto') ||
    insight.description.toLowerCase().includes('análise') ||
    insight.description.toLowerCase().includes('conteúdo')
  ) || [];

  const hasRealData = data.hasRealData && documentInsights.length > 0;

  // Dados de sentimento baseados nos insights reais
  const sentimentData = hasRealData ? [
    { name: 'Positivo', value: documentInsights.filter(i => i.priority === 'low').length, color: '#10B981' },
    { name: 'Neutro', value: documentInsights.filter(i => i.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Negativo', value: documentInsights.filter(i => i.priority === 'high').length, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  // Dados de tópicos baseados nas áreas dos assistentes
  const topicsData = hasRealData ? 
    data.insightsWithAssistant
      .reduce((acc, insight) => {
        const area = insight.assistantArea || 'Geral';
        const existing = acc.find(item => item.topic === area);
        if (existing) {
          existing.frequency++;
        } else {
          acc.push({ topic: area, frequency: 1 });
        }
        return acc;
      }, [] as Array<{ topic: string; frequency: number }>)
      .slice(0, 5) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Análise de Documentos"
          subtitle="Análise de sentimentos e insights de documentos"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Carregando análise de documentos dos assistentes...</p>
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
          title="Análise de Documentos"
          subtitle="Análise de sentimentos e insights de documentos"
        >
          <AIAnalysisButton />
        </PageHeader>
        
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Análise de Documentos Aguarda Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aguardando Análise dos Assistentes</h3>
                  <p className="text-gray-600 mb-6">
                    As análises de documentos serão geradas após análises dos assistentes IA
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-2 mb-6">
                    <p className="text-sm text-gray-600">• Execute análises IA das suas conversas</p>
                    <p className="text-sm text-gray-600">• Os assistentes analisarão padrões textuais</p>
                    <p className="text-sm text-gray-600">• Relatórios de sentimento serão gerados</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Análise de Documentos"
        subtitle="Análise de sentimentos e insights de documentos"
      >
        <Badge className="bg-blue-100 text-blue-800">
          🔮 {documentInsights.length} Análises dos Assistentes
        </Badge>
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Análises</p>
                    <p className="text-2xl font-bold">{documentInsights.length}</p>
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
                    <p className="text-sm text-gray-600">Insights Positivos</p>
                    <p className="text-2xl font-bold">{sentimentData.find(s => s.name === 'Positivo')?.value || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tópicos</p>
                    <p className="text-2xl font-bold">{topicsData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assistentes Ativos</p>
                    <p className="text-2xl font-bold">{data.metrics.assistantsActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Abas de Análise */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="topics">Tópicos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Análise de Sentimento */}
                {sentimentData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-600" />
                        Análise de Sentimento
                      </CardTitle>
                      <CardDescription>
                        Distribuição baseada nos insights dos assistentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={sentimentData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                            >
                              {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Distribuição de Tópicos */}
                {topicsData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Tópicos Principais
                      </CardTitle>
                      <CardDescription>
                        Áreas mais analisadas pelos assistentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topicsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="frequency" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Insights dos Assistentes</CardTitle>
                  <CardDescription>
                    Análises detalhadas baseadas nos documentos processados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documentInsights.map((insight) => (
                      <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {insight.assistantName}
                              </Badge>
                              <Badge variant="outline">
                                {insight.assistantArea || insight.category}
                              </Badge>
                              <Badge className={
                                insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-600">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tópicos</CardTitle>
                  <CardDescription>
                    Temas mais frequentes identificados pelos assistentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topicsData.map((topic, index) => (
                      <div key={topic.topic} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{topic.topic}</h4>
                            <p className="text-sm text-gray-600">{topic.frequency} menções</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Math.round((topic.frequency / documentInsights.length) * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
