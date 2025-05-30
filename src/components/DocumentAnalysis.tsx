
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, FileText, Upload, Search, AlertCircle, CheckCircle, Clock, Bot } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function DocumentAnalysis() {
  const { data, isLoading } = useAnalysisData();

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm">
        📄 Análise de Documentos
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout
        title="Análise de Documentos"
        description="Análise inteligente de documentos e textos"
        showBackButton={true}
        headerActions={headerActions}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </PageLayout>
    );
  }

  // Apenas insights reais relacionados a documentos
  const documentInsights = data.insightsWithAssistant.filter(insight => {
    const metadata = insight.metadata as any;
    return metadata && typeof metadata === 'object' && 
           (metadata.source === 'document' || insight.category === 'document');
  });

  if (!data.hasRealData || documentInsights.length === 0) {
    return (
      <PageLayout
        title="Análise de Documentos"
        description="Análise inteligente de documentos e textos"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Nenhum documento analisado
            </CardTitle>
            <CardDescription>
              Execute a análise por IA para que os assistentes processem documentos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão processar documentos</p>
                <p className="text-sm text-gray-600">• Insights de documentos aparecerão aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Análise de Documentos"
      description="Análise inteligente de documentos e textos"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Métricas baseadas apenas em dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insights de Documentos</p>
                <p className="text-2xl font-bold text-gray-800">{documentInsights.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assistentes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{data.metrics.assistantsActive}</p>
              </div>
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Última Análise</p>
                <p className="text-sm text-gray-600">
                  {data.metrics.lastAnalysis ? 
                    new Date(data.metrics.lastAnalysis).toLocaleDateString('pt-BR') : 
                    'Nenhuma'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de insights de documentos reais */}
      <div className="space-y-4">
        {documentInsights.map((insight) => (
          <Card key={insight.id} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Assistente: {insight.assistantName}</span>
                      <span>Data: {new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analisado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
