
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

  // Simular documentos analisados baseados nos dados
  const documents = data.hasRealData ? [
    {
      id: 1,
      name: 'Relatório de Bem-estar.pdf',
      type: 'PDF',
      uploadDate: '2024-01-15',
      status: 'analyzed',
      insights: 5,
      summary: 'Documento contém análises sobre padrões de bem-estar emocional e sugestões de melhoria.'
    },
    {
      id: 2,
      name: 'Diário Pessoal.docx',
      type: 'DOCX',
      uploadDate: '2024-01-14',
      status: 'processing',
      insights: 0,
      summary: 'Análise em andamento...'
    },
    {
      id: 3,
      name: 'Notas de Terapia.txt',
      type: 'TXT',
      uploadDate: '2024-01-13',
      status: 'analyzed',
      insights: 8,
      summary: 'Identificados padrões comportamentais e progressos no desenvolvimento pessoal.'
    }
  ] : [];

  if (!data.hasRealData) {
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
              Faça upload de documentos para análise inteligente pelos assistentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Faça upload de PDFs, DOCs ou TXTs</p>
                <p className="text-sm text-gray-600">• Os assistentes irão analisar o conteúdo</p>
                <p className="text-sm text-gray-600">• Insights serão extraídos automaticamente</p>
              </div>
              <Button className="mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertCircle;
      default: return FileText;
    }
  };

  return (
    <PageLayout
      title="Análise de Documentos"
      description="Análise inteligente de documentos e textos"
      showBackButton={true}
      headerActions={headerActions}
    >
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documentos</p>
                <p className="text-2xl font-bold text-gray-800">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analisados</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'analyzed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insights Extraídos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {documents.reduce((sum, doc) => sum + doc.insights, 0)}
                </p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processando</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'processing').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações principais */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Novo Upload
          </Button>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-4">
        {documents.map((document) => {
          const StatusIcon = getStatusIcon(document.status);
          return (
            <Card key={document.id} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{document.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{document.summary}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Tipo: {document.type}</span>
                        <span>Upload: {new Date(document.uploadDate).toLocaleDateString('pt-BR')}</span>
                        {document.insights > 0 && (
                          <span className="text-purple-600">{document.insights} insights extraídos</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(document.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {document.status === 'analyzed' ? 'Analisado' : 
                       document.status === 'processing' ? 'Processando' : 'Erro'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights dos documentos */}
      {documents.some(d => d.insights > 0) && (
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 mt-6">
          <CardHeader>
            <CardTitle>Insights Recentes</CardTitle>
            <CardDescription>Principais descobertas da análise de documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">📊 Padrão Identificado</h4>
                <p className="text-sm text-blue-700">
                  Análise dos documentos indica uma evolução positiva no bem-estar emocional ao longo do tempo.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">🎯 Recomendação</h4>
                <p className="text-sm text-green-700">
                  Baseado nos documentos analisados, recomenda-se continuar com as práticas de journaling diário.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">🔮 Insight dos Assistentes</h4>
                <p className="text-sm text-purple-700">
                  Os assistentes identificaram correlações entre atividades físicas e estados emocionais positivos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
