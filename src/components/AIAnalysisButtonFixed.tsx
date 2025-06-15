
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIAnalysisFixed } from '@/hooks/useAIAnalysisFixed';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { 
  Brain, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AIAnalysisButtonFixedProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  analysisType?: 'simple' | 'complete' | 'detailed';
}

export function AIAnalysisButtonFixed({ 
  variant = 'default', 
  size = 'default',
  analysisType = 'complete'
}: AIAnalysisButtonFixedProps) {
  const { executeAnalysis, isAnalyzing } = useAIAnalysisFixed();
  const { assistants } = useAssistantsConfig();
  const { config } = useClientConfig();

  const activeAssistants = assistants.filter(a => a.isActive);
  const hasOpenAIConfig = config?.openai?.apiKey && config.openai.apiKey.startsWith('sk-');

  const handleAnalysis = () => {
    executeAnalysis({ 
      type: analysisType,
      maxTokens: analysisType === 'simple' ? 800 : analysisType === 'complete' ? 1500 : 2000,
      temperature: 0.7
    });
  };

  const getButtonContent = () => {
    if (isAnalyzing) {
      return (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Analisando...
        </>
      );
    }

    return (
      <>
        <Brain className="h-4 w-4 mr-2" />
        Análise por IA
      </>
    );
  };

  const getStatusIndicator = () => {
    if (!hasOpenAIConfig) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          OpenAI não configurada
        </Badge>
      );
    }

    if (activeAssistants.length === 0) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Nenhum assistente ativo
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        {activeAssistants.length} assistente{activeAssistants.length !== 1 ? 's' : ''} ativo{activeAssistants.length !== 1 ? 's' : ''}
      </Badge>
    );
  };

  const isDisabled = isAnalyzing || !hasOpenAIConfig || activeAssistants.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAnalysis}
          disabled={isDisabled}
          variant={variant}
          size={size}
          className="relative"
        >
          {getButtonContent()}
        </Button>
        
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Sparkles className="h-3 w-3 mr-1" />
          {analysisType}
        </Badge>
      </div>
      
      {getStatusIndicator()}
    </div>
  );
}
