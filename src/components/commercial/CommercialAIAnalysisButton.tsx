
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useCommercialAIAnalysis } from '@/hooks/useCommercialAIAnalysis';

export function CommercialAIAnalysisButton() {
  const { isAnalyzing, triggerCommercialAnalysis } = useCommercialAIAnalysis();

  return (
    <Button 
      onClick={triggerCommercialAnalysis}
      disabled={isAnalyzing}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analisando Dados Comerciais...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Análise Comercial por IA
        </>
      )}
    </Button>
  );
}
