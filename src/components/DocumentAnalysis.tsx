
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Brain, 
  Sparkles, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useConversationUpload } from '@/hooks/useConversationUpload';

export function DocumentAnalysis() {
  const [conversationText, setConversationText] = useState('');
  const [progress, setProgress] = useState(0);
  const { uploadAndAnalyze, isUploading } = useConversationUpload();

  const handleUpload = async () => {
    if (!conversationText.trim()) return;
    
    try {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const result = await uploadAndAnalyze(new File([conversationText], 'conversation.txt', { type: 'text/plain' }));
      
      clearInterval(interval);
      setProgress(100);
      
      if (result.success) {
        setConversationText('');
        setTimeout(() => setProgress(0), 1000);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setProgress(0);
    }
  };

  const analysisSteps = [
    { icon: FileText, title: "Upload de Documentos", description: "Adicione suas conversas e textos" },
    { icon: Brain, title: "Processamento IA", description: "Nossa IA analisa o conteúdo" },
    { icon: Sparkles, title: "Extração de Insights", description: "Identificamos padrões e características" },
    { icon: BarChart3, title: "Geração de Relatórios", description: "Criamos análises detalhadas" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Análise de Documentos</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Faça upload de suas conversas, textos e documentos para análise psicológica avançada
        </p>
      </div>

      {/* Como Funciona */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-blue-800">Como Funciona a Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analysisSteps.map((step, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload de Conversas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Conversas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cole sua conversa aqui:
            </label>
            <Textarea
              placeholder="Cole aqui o texto de suas conversas do WhatsApp, Telegram, ou qualquer outro texto que deseja analisar..."
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!conversationText.trim() || isUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isUploading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analisar Conversa
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status da Análise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Documentos Processados</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-green-600">Análises concluídas</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800">Em Processamento</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-blue-600">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800">Insights Gerados</h3>
            <p className="text-2xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-yellow-600">Descobertas disponíveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-800">💡 Dicas para Melhores Análises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Tipos de Texto Aceitos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Conversas do WhatsApp</li>
                <li>• Mensagens do Telegram</li>
                <li>• E-mails pessoais</li>
                <li>• Diários e reflexões</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Para Melhores Resultados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Textos com pelo menos 500 palavras</li>
                <li>• Conversas naturais e espontâneas</li>
                <li>• Conteúdo em português</li>
                <li>• Remova informações sensíveis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
