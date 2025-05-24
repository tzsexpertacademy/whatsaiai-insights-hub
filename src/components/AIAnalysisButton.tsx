
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

interface AIAnalysisButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function AIAnalysisButton({ 
  variant = "default", 
  size = "default", 
  showText = true 
}: AIAnalysisButtonProps) {
  const { isAnalyzing, triggerAIAnalysis } = useAIAnalysis();

  return (
    <Button 
      onClick={triggerAIAnalysis}
      disabled={isAnalyzing}
      variant={variant}
      size={size}
      className={variant === "outline" ? "" : "bg-purple-600 hover:bg-purple-700 text-white"}
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {showText && "Analisando..."}
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          {showText && "Análise por IA"}
        </>
      )}
    </Button>
  );
}
