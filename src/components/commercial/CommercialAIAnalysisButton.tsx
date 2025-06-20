
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Zap } from 'lucide-react';
import { useCommercialAIAnalysisFixed } from '@/hooks/useCommercialAIAnalysisFixed';
import { Badge } from '@/components/ui/badge';

export function CommercialAIAnalysisButton() {
  const { isAnalyzing, triggerCommercialAnalysis, cacheStats } = useCommercialAIAnalysisFixed();

  return (
    <div className="space-y-2">
      <Button 
        onClick={triggerCommercialAnalysis}
        disabled={isAnalyzing}
        className="bg-green-600 hover:bg-green-700 text-white relative"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analisando com IA...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            <Zap className="h-3 w-3 mr-1" />
            Análise Comercial Inteligente
          </>
        )}
      </Button>
      
      {cacheStats && (
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="text-green-600">
            💾 {cacheStats.cachedConversations} em cache
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            🆕 {cacheStats.newConversations + cacheStats.modifiedConversations} para analisar
          </Badge>
          {cacheStats.estimatedSavings > 0 && (
            <Badge variant="outline" className="text-orange-600">
              💰 {cacheStats.estimatedSavings}% economia
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
