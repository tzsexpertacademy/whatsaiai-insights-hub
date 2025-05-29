
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, Zap, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  minTokens: number;
  maxTokens: number;
  price: string;
  features: string[];
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'simple',
    name: 'Análise Simples',
    description: 'Análise básica e econômica',
    minTokens: 100,
    maxTokens: 250,
    price: 'Mais econômica',
    features: [
      'Insights básicos dos assistentes',
      'Análise rápida de padrões',
      'Recomendações essenciais'
    ]
  },
  {
    id: 'complete',
    name: 'Análise Completa',
    description: 'Análise equilibrada entre custo e profundidade',
    minTokens: 250,
    maxTokens: 500,
    price: 'Custo médio',
    features: [
      'Insights detalhados dos assistentes',
      'Análise de comportamento aprofundada',
      'Recomendações personalizadas',
      'Padrões emocionais identificados'
    ]
  },
  {
    id: 'detailed',
    name: 'Análise Detalhada',
    description: 'Análise mais profunda e completa',
    minTokens: 500,
    maxTokens: 800,
    price: 'Mais custosa',
    features: [
      'Insights completos de todos assistentes',
      'Análise psicológica profunda',
      'Recomendações estratégicas',
      'Mapeamento completo de padrões',
      'Projeções de desenvolvimento'
    ]
  }
];

interface AIAnalysisSelectorProps {
  onAnalyze: (analysisConfig: { type: string; maxTokens: number; temperature: number }) => void;
  isAnalyzing: boolean;
}

export function AIAnalysisSelector({ onAnalyze, isAnalyzing }: AIAnalysisSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('simple');

  const selectedAnalysis = analysisTypes.find(type => type.id === selectedType) || analysisTypes[0];

  const handleAnalyze = () => {
    const config = {
      type: selectedAnalysis.id,
      maxTokens: selectedAnalysis.maxTokens,
      temperature: selectedAnalysis.id === 'simple' ? 0.3 : selectedAnalysis.id === 'complete' ? 0.5 : 0.7
    };
    
    onAnalyze(config);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Configurar Análise por IA
        </CardTitle>
        <CardDescription>
          Escolha o tipo de análise que melhor atende suas necessidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="analysis-type">Tipo de Análise</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de análise" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {analysisTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.name}</span>
                    <span className="text-sm text-gray-500">
                      {type.minTokens}-{type.maxTokens} tokens • {type.price}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Detalhes da análise selecionada */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h4 className="font-semibold text-slate-800 mb-2">{selectedAnalysis.name}</h4>
          <p className="text-sm text-slate-600 mb-3">{selectedAnalysis.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="text-sm">
              <span className="font-medium text-slate-700">Tokens: </span>
              <span className="text-slate-600">{selectedAnalysis.minTokens}-{selectedAnalysis.maxTokens}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-slate-700">Custo: </span>
              <span className="text-slate-600">{selectedAnalysis.price}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-medium text-slate-700 text-sm">Recursos incluídos:</span>
            <ul className="text-xs text-slate-600 space-y-1">
              {selectedAnalysis.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Comece com análise simples para testes rápidos. 
            Use análise detalhada quando precisar de insights mais profundos.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analisando com IA...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Executar {selectedAnalysis.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
