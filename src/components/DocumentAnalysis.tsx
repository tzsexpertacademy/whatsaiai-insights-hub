
import React, { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Brain, TrendingUp, Target, AlertTriangle, CheckCircle, Eye, Download } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

interface DocumentInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  category: string;
  description: string;
  confidence: number;
  suggestions: string[];
}

interface AnalyzedDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'failed';
  wordCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  keyTopics: string[];
  insights: DocumentInsight[];
  summary: string;
}

export function DocumentAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents] = useState<AnalyzedDocument[]>([
    {
      id: '1',
      name: 'Conversa_WhatsApp_Janeiro.txt',
      type: 'chat',
      uploadDate: '2024-01-15',
      status: 'completed',
      wordCount: 2847,
      sentiment: 'positive',
      sentimentScore: 0.75,
      keyTopics: ['trabalho', 'família', 'projetos', 'saúde', 'objetivos'],
      summary: 'Documento contém discussões sobre evolução profissional, planejamento familiar e metas pessoais. Tom geral otimista com foco em crescimento.',
      insights: [
        {
          id: '1',
          type: 'strength',
          category: 'Comunicação',
          description: 'Demonstra excelente capacidade de articulação e clareza nas ideias',
          confidence: 85,
          suggestions: ['Continue desenvolvendo suas habilidades de comunicação', 'Considere liderar mais reuniões']
        },
        {
          id: '2',
          type: 'opportunity',
          category: 'Liderança',
          description: 'Identifica potencial para assumir mais responsabilidades de liderança',
          confidence: 78,
          suggestions: ['Busque oportunidades de mentoria', 'Participe de projetos cross-funcionais']
        }
      ]
    },
    {
      id: '2',
      name: 'Diário_Reflexões.docx',
      type: 'journal',
      uploadDate: '2024-01-10',
      status: 'completed',
      wordCount: 1523,
      sentiment: 'neutral',
      sentimentScore: 0.45,
      keyTopics: ['autoconhecimento', 'desafios', 'crescimento', 'relacionamentos'],
      summary: 'Reflexões pessoais sobre desafios enfrentados e estratégias de superação. Foco em desenvolvimento pessoal.',
      insights: [
        {
          id: '3',
          type: 'weakness',
          category: 'Autoestima',
          description: 'Padrão de autocrítica excessiva identificado',
          confidence: 82,
          suggestions: ['Pratique auto-compaixão', 'Mantenha um diário de conquistas diárias']
        }
      ]
    }
  ]);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    // Simular upload e processamento
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
    }, 3000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'weakness': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'threat': return <Target className="h-5 w-5 text-orange-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-green-100 text-green-800';
      case 'weakness': return 'bg-red-100 text-red-800';
      case 'opportunity': return 'bg-blue-100 text-blue-800';
      case 'threat': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Análise de Documentos"
        subtitle="Analise e extraia insights de seus documentos e textos"
      >
        <AIAnalysisButton />
      </PageHeader>
      
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Upload de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload de Documento
              </CardTitle>
              <CardDescription>
                Faça upload de conversas, diários, textos ou qualquer documento para análise comportamental
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  
                  {!selectedFile ? (
                    <>
                      <p className="text-gray-600 mb-4">
                        Arraste um arquivo aqui ou clique para selecionar
                      </p>
                      <input
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer">
                          Selecionar Arquivo
                        </Button>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Formatos aceitos: TXT, DOC, DOCX, PDF (máx. 10MB)
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{selectedFile.name}</span>
                      </div>
                      
                      <div className="flex gap-2 justify-center">
                        <Button 
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isUploading ? 'Processando...' : 'Analisar Documento'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedFile(null)}
                          disabled={isUploading}
                        >
                          Cancelar
                        </Button>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-2">
                          <Progress value={33} className="h-2" />
                          <p className="text-sm text-gray-600">
                            Analisando conteúdo e extraindo insights...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documentos</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Insights</p>
                    <p className="text-2xl font-bold">
                      {documents.reduce((acc, doc) => acc + doc.insights.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Palavras Analisadas</p>
                    <p className="text-2xl font-bold">
                      {documents.reduce((acc, doc) => acc + doc.wordCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sentiment Médio</p>
                    <p className="text-2xl font-bold">
                      {Math.round(documents.reduce((acc, doc) => acc + doc.sentimentScore, 0) / documents.length * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Analisados</CardTitle>
              <CardDescription>
                Histórico de documentos processados e seus insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((document) => (
                  <Card key={document.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <Tabs defaultValue="overview" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold">{document.name}</h4>
                              <p className="text-sm text-gray-600">
                                {document.wordCount.toLocaleString()} palavras • {document.uploadDate}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getSentimentColor(document.sentiment)}>
                              {document.sentiment}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>

                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                          <TabsTrigger value="insights">Insights</TabsTrigger>
                          <TabsTrigger value="topics">Tópicos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Resumo Executivo</h5>
                              <p className="text-gray-600 text-sm">{document.summary}</p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">Análise de Sentimento</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Score Geral</span>
                                  <span className={getSentimentColor(document.sentiment)}>
                                    {Math.round(document.sentimentScore * 100)}%
                                  </span>
                                </div>
                                <Progress value={document.sentimentScore * 100} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-3">
                          {document.insights.map((insight) => (
                            <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                {getInsightIcon(insight.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={getInsightColor(insight.type)}>
                                      {insight.category}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Confiança: {insight.confidence}%
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                                  
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Sugestões:</h6>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {insight.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-center gap-1">
                                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                          {suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </TabsContent>

                        <TabsContent value="topics" className="space-y-3">
                          <div>
                            <h5 className="font-medium mb-3">Tópicos Principais Identificados</h5>
                            <div className="flex flex-wrap gap-2">
                              {document.keyTopics.map((topic, index) => (
                                <Badge key={index} variant="outline">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
