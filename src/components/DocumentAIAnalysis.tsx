
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Upload, Brain, Loader2, CheckCircle, AlertCircle, FileQuestion } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCacheManager } from '@/hooks/useCacheManager';

export function DocumentAIAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateDataHash } = useCacheManager();
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<string>('document');

  // Carregar configurações do usuário do client_configs
  const [userConfig, setUserConfig] = useState<any>(null);

  useEffect(() => {
    const fetchUserConfig = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('client_configs')
          .select('openai_config')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Erro ao carregar configuração:', error);
          return;
        }
        
        setUserConfig(data);
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };
    
    fetchUserConfig();
  }, [user?.id]);

  // Carregar assistentes do insights (usando os dados reais)
  useEffect(() => {
    const fetchAssistants = async () => {
      if (!user?.id) return;
      
      try {
        // Buscar insights únicos por tipo para mapear assistentes reais
        const { data: insightsData, error } = await supabase
          .from('insights')
          .select('insight_type, metadata')
          .eq('user_id', user.id)
          .eq('status', 'active');
          
        if (error) {
          console.error('Erro ao buscar insights:', error);
          return;
        }
        
        // Extrair assistentes únicos dos metadados
        const uniqueAssistants = new Map();
        insightsData?.forEach(insight => {
          const metadata = insight.metadata as any;
          if (metadata?.assistant_name && metadata?.assistant_id) {
            uniqueAssistants.set(metadata.assistant_id, {
              id: metadata.assistant_id,
              name: metadata.assistant_name,
              area: insight.insight_type,
              status: 'active'
            });
          }
        });
        
        const assistantsList = Array.from(uniqueAssistants.values());
        setAssistants(assistantsList);
        
        // Selecionar automaticamente o primeiro assistente
        if (assistantsList.length > 0) {
          setSelectedAssistants([assistantsList[0].id]);
        }
      } catch (error) {
        console.error('Erro ao carregar assistentes:', error);
      }
    };
    
    fetchAssistants();
  }, [user?.id]);

  // Manipular upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    
    try {
      // Ler conteúdo do arquivo
      const text = await uploadedFile.text();
      setDocumentContent(text);
      
      // Estimar tokens (aproximadamente 4 caracteres = 1 token)
      const estimatedTokenCount = Math.ceil(text.length / 4);
      setEstimatedTokens(estimatedTokenCount);
      
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível ler o conteúdo do arquivo.",
        variant: "destructive"
      });
    }
  };

  // Alternar seleção de assistente
  const toggleAssistant = (assistantId: string) => {
    setSelectedAssistants(current => 
      current.includes(assistantId)
        ? current.filter(id => id !== assistantId)
        : [...current, assistantId]
    );
  };

  // Analisar documento
  const handleAnalyzeDocument = async () => {
    if (!documentContent || selectedAssistants.length === 0) {
      toast({
        title: "Dados insuficientes",
        description: "Selecione um documento e pelo menos um assistente.",
        variant: "destructive"
      });
      return;
    }
    
    if (!userConfig?.openai_config?.apiKey) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua chave API do OpenAI nas configurações.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Obter detalhes dos assistentes selecionados
      const selectedAssistantDetails = assistants.filter(assistant => 
        selectedAssistants.includes(assistant.id)
      );
      
      // Gerar hash do documento para cache
      const documentHash = generateDataHash(documentContent);
      
      // Preparar dados para análise
      const analysisData = {
        userId: user?.id,
        openaiConfig: {
          apiKey: userConfig.openai_config.apiKey,
          model: selectedModel,
          temperature: 0.5,
          maxTokens: 1000
        },
        assistants: selectedAssistantDetails,
        analysisType: `document_${analysisType}`,
        documentContent: documentContent,
        documentName: fileName,
        documentHash: documentHash,
        timestamp: new Date().toISOString()
      };
      
      // Chamar função Edge para análise
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na análise do documento');
      }
      
      const result = await response.json();
      
      // Processar resultados
      setAnalysisResults(result);
      
      toast({
        title: "Análise concluída",
        description: `${result.insights?.length || 0} insights gerados pelos assistentes.`,
        variant: "default"
      });
      
    } catch (error: any) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar o documento.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Análise de Documentos</h1>
        <p className="text-slate-600">Extraia insights valiosos de documentos com assistentes IA especializados</p>
      </div>
      
      {/* Upload Section */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Upload className="h-5 w-5" />
            Carregar Documento
          </CardTitle>
          <CardDescription>
            Suporta arquivos de texto (.txt, .md, .csv)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document">Selecione um arquivo</Label>
            <Input 
              id="document" 
              type="file" 
              accept=".txt,.md,.csv,.json"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Section */}
      {documentContent && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="h-5 w-5" />
              Documento Carregado: {fileName}
            </CardTitle>
            <CardDescription>
              {estimatedTokens} tokens estimados • Modelo: {selectedModel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {documentContent.substring(0, 1000)}
                {documentContent.length > 1000 && '...\n\n[Documento truncado para visualização]'}
              </pre>
            </div>

            {/* Analysis Controls */}
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="model">Modelo de IA</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger id="model" className="w-full">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Mais rápido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="analysis-type">Tipo de Análise</Label>
                <Select 
                  value={analysisType} 
                  onValueChange={setAnalysisType}
                >
                  <SelectTrigger id="analysis-type" className="w-full">
                    <SelectValue placeholder="Selecione o tipo de análise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Resumo Executivo</SelectItem>
                    <SelectItem value="insights">Insights Detalhados</SelectItem>
                    <SelectItem value="recommendations">Recomendações</SelectItem>
                    <SelectItem value="critique">Análise Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Assistentes para Análise</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {assistants.map(assistant => (
                    <div 
                      key={assistant.id}
                      className={`flex items-center space-x-2 p-2 rounded-md border ${
                        selectedAssistants.includes(assistant.id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Checkbox 
                        id={`assistant-${assistant.id}`}
                        checked={selectedAssistants.includes(assistant.id)}
                        onCheckedChange={() => toggleAssistant(assistant.id)}
                      />
                      <Label 
                        htmlFor={`assistant-${assistant.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {assistant.name}
                        <span className="block text-xs text-gray-500">{assistant.area}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Analysis Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Pronto para análise • {estimatedTokens} tokens
                </div>
                <Button 
                  onClick={handleAnalyzeDocument}
                  disabled={isAnalyzing || !selectedAssistants.length}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Documento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {analysisResults && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <CheckCircle className="h-5 w-5" />
              Resultados da Análise
            </CardTitle>
            <CardDescription>
              {analysisResults.insights?.length || 0} insights gerados • 
              {analysisResults.fromCache ? ' Recuperado do cache' : ' Nova análise'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="insights">
              <TabsList className="mb-4">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="space-y-4">
                {analysisResults.insights?.map((insight: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {insight.assistant_name}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.generated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{insight.content}</p>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="summary">
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {analysisResults.summary || "Nenhum resumo disponível."}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Processamento</h3>
                      <p className="text-sm text-gray-600">
                        Tempo: {analysisResults.processingTime}ms
                      </p>
                      <p className="text-sm text-gray-600">
                        Custo estimado: ${analysisResults.costEstimate?.toFixed(5) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Assistentes</h3>
                      <p className="text-sm text-gray-600">
                        Utilizados: {analysisResults.assistantsUsed?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cache: {analysisResults.fromCache ? "Sim" : "Não"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!documentContent && !isAnalyzing && !analysisResults && (
        <Card className="border-gray-200 bg-gray-50/30">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <FileQuestion className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Nenhum Documento Carregado</h3>
              <p className="text-gray-500 max-w-md">
                Carregue um documento de texto para começar a análise com os assistentes IA.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
