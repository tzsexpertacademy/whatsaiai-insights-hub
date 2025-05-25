
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Zap } from 'lucide-react';
import { useAIAnalysisFixed } from '@/hooks/useAIAnalysisFixed';
import { Badge } from '@/components/ui/badge';

export function AIAnalysisButtonFixed() {
  const { isAnalyzing, triggerAIAnalysis, cacheStats } = useAIAnalysisFixed();

  return (
    <div className="space-y-2">
      <Button 
        onClick={triggerAIAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-600 hover:bg-blue-700 text-white relative"
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
            Análise Observatório Inteligente
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
