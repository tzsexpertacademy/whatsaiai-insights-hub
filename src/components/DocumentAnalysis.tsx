
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Brain, AlertCircle } from 'lucide-react';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function DocumentAnalysis() {
  const { assistants, isLoading } = useAssistantsConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const analyzeDocument = async () => {
    if (!selectedFile || !selectedAssistant || !user?.id) return;

    setIsAnalyzing(true);
    
    try {
      // Ler conteúdo do arquivo
      const fileContent = await readFileContent(selectedFile);
      
      // Buscar o assistente selecionado
      const assistant = assistants.find(a => a.id === selectedAssistant);
      if (!assistant) throw new Error('Assistente não encontrado');

      // Buscar configuração do OpenAI
      const { data: config } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      const openaiApiKey = config?.openai_config?.api_key;
      
      if (!openaiApiKey) {
        toast({
          title: "API Key não configurada",
          description: "Configure sua API Key do OpenAI nas configurações",
          variant: "destructive",
        });
        return;
      }

      // Fazer análise via OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: assistant.model || 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `${assistant.prompt}\n\nVocê receberá um documento para análise. Forneça insights detalhados da sua área de especialidade.` 
            },
            { 
              role: 'user', 
              content: `Analise o seguinte documento:\n\n${fileContent}` 
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na análise do documento');
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      setAnalysisResult(analysis);
      
      toast({
        title: "Análise concluída",
        description: `${assistant.name} analisou seu documento com sucesso`,
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o documento",
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
              disabled={!selectedFile || !selectedAssistant || isAnalyzing}
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
