
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Brain, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function DocumentAnalysis() {
  const { assistants, isLoading } = useAssistantsConfig();
  const { config, connectionStatus } = useClientConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Use the connection status from the client config context
  const apiStatus = connectionStatus.openai ? 'valid' : (config.openai.apiKey ? 'invalid' : 'unknown');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de texto suportado
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, selecione um arquivo de texto (.txt, .md)",
          variant: "destructive",
        });
      }
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const truncateContent = (content: string, maxTokens: number = 20000): string => {
    // Estimativa mais conservadora: 1 token ≈ 4 caracteres
    const maxChars = maxTokens * 3; // Ainda mais conservador
    
    if (content.length <= maxChars) {
      return content;
    }
    
    // Truncar e adicionar indicação
    return content.substring(0, maxChars) + "\n\n[DOCUMENTO TRUNCADO DEVIDO AO TAMANHO]";
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !selectedAssistant || !user?.id) {
      console.log('❌ Parâmetros inválidos:', { 
        hasFile: !!selectedFile, 
        hasAssistant: !!selectedAssistant, 
        hasUser: !!user?.id 
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('📄 Iniciando análise do documento...');
      console.log('🔑 API Key presente:', !!config.openai?.apiKey);
      console.log('🔗 Status OpenAI:', connectionStatus.openai);
      console.log('🤖 Assistente ID:', selectedAssistant);
      
      // Verificar se a API está configurada
      if (!config.openai?.apiKey) {
        console.log('❌ API Key não encontrada');
        toast({
          title: "API Key não configurada",
          description: "Configure sua API Key do OpenAI na aba 'Configurações > OpenAI'",
          variant: "destructive",
        });
        return;
      }

      if (!connectionStatus.openai) {
        console.log('❌ Conexão OpenAI falhou');
        toast({
          title: "Problema com a conexão",
          description: "Teste a conexão OpenAI na aba 'Configurações > OpenAI'",
          variant: "destructive",
        });
        return;
      }
      
      // Ler conteúdo do arquivo
      console.log('📖 Lendo arquivo...');
      const fileContent = await readFileContent(selectedFile);
      console.log('📖 Arquivo lido:', fileContent.length, 'caracteres');
      
      // Truncar conteúdo se muito grande
      const truncatedContent = truncateContent(fileContent);
      if (truncatedContent !== fileContent) {
        console.log('✂️ Conteúdo truncado para:', truncatedContent.length, 'caracteres');
        toast({
          title: "Documento grande",
          description: "O documento foi truncado para análise devido ao tamanho",
        });
      }
      
      // Buscar o assistente selecionado
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) {
        console.log('❌ Assistente não encontrado');
        throw new Error('Assistente não encontrado');
      }

      console.log('🤖 Assistente encontrado:', assistant.name);
      console.log('📊 Enviando', truncatedContent.length, 'caracteres para OpenAI');

      // Construir mensagens para OpenAI
      const messages = [
        { 
          role: 'system' as const, 
          content: `${assistant.prompt}\n\nVocê receberá um documento para análise. Forneça insights detalhados da sua área de especialidade. Seja conciso mas informativo.` 
        },
        { 
          role: 'user' as const, 
          content: `Analise o seguinte documento da perspectiva de ${assistant.area}:\n\n${truncatedContent}` 
        }
      ];

      console.log('🚀 Fazendo chamada para OpenAI...');

      // Fazer análise via OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: assistant.model || 'gpt-4o-mini',
          messages: messages,
          temperature: config.openai.temperature || 0.7,
          max_tokens: Math.min(config.openai.maxTokens || 1500, 1500)
        }),
      });

      console.log('📡 Resposta OpenAI status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        let errorMessage = 'Erro na análise do documento';
        if (response.status === 401) {
          errorMessage = 'API Key inválida - verifique nas configurações';
        } else if (response.status === 429) {
          errorMessage = 'Limite de rate excedido - tente novamente em alguns minutos';
        } else if (response.status === 400) {
          errorMessage = 'Documento muito grande ou formato inválido';
        }
        
        throw new Error(`${errorMessage} (${response.status})`);
      }

      const data = await response.json();
      console.log('📥 Resposta OpenAI recebida:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content
      });
      
      const analysis = data.choices?.[0]?.message?.content;
      
      if (!analysis) {
        console.log('❌ Resposta vazia da OpenAI');
        throw new Error('Resposta vazia da OpenAI');
      }
      
      console.log('✅ Análise concluída:', analysis.length, 'caracteres');
      
      setAnalysisResult(analysis);
      
      toast({
        title: "Análise concluída",
        description: `${assistant.name} analisou seu documento com sucesso`,
      });

    } catch (error) {
      console.error('❌ Erro completo na análise:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível analisar o documento",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando assistentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Análise de Documentos</h2>
        <p className="text-slate-600">Faça upload de documentos e escolha um assistente para análise especializada</p>
      </div>

      {/* Status da API OpenAI - Simplificado */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Status da API OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {apiStatus === 'valid' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">API conectada e funcionando</span>
              </>
            )}
            {apiStatus === 'invalid' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Problema com a API Key</span>
              </>
            )}
            {apiStatus === 'unknown' && (
              <>
                <AlertCircle className="h-5 w-5 text-gray-500" />
                <span className="text-gray-600 font-medium">API Key não configurada</span>
              </>
            )}
          </div>

          {!config.openai?.apiKey && (
            <div className="p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                Configure sua API Key do OpenAI na aba "Configurações > OpenAI" para usar este recurso.
              </p>
            </div>
          )}

          {apiStatus !== 'valid' && config.openai?.apiKey && (
            <div className="p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">
                Há um problema com sua API Key. Teste a conexão na aba "Configurações > OpenAI".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload e Configuração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Documento
            </CardTitle>
            <CardDescription>
              Selecione um arquivo de texto para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Arquivo de Texto</Label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,text/plain"
                onChange={handleFileSelect}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">{selectedFile.name}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div>
              <Label>Assistente para Análise</Label>
              <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Escolha um assistente" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.filter(a => a.isActive).map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      <div className="flex items-center gap-2">
                        <span>{assistant.icon}</span>
                        <span>{assistant.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {assistant.area}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={analyzeDocument}
              disabled={!selectedFile || !selectedAssistant || isAnalyzing || apiStatus !== 'valid'}
              className="w-full"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analisando...' : 'Analisar Documento'}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado da Análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Resultado da Análise
            </CardTitle>
            <CardDescription>
              Insights do assistente sobre seu documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um arquivo e assistente para ver a análise aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Análise de {assistants.find(a => a.id === selectedAssistant)?.name}
                  </h4>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setAnalysisResult(null)}
                  className="w-full"
                >
                  Nova Análise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assistentes Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Assistentes Disponíveis</CardTitle>
          <CardDescription>
            Cada assistente oferece uma perspectiva especializada na análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assistants.filter(a => a.isActive).map((assistant) => (
              <div key={assistant.id} className="p-3 border rounded-md hover:bg-gray-50">
                <div className="text-center">
                  <div className="text-2xl mb-2">{assistant.icon}</div>
                  <h4 className="font-semibold text-sm">{assistant.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{assistant.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {assistant.area}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
