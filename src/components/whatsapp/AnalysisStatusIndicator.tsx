
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Brain, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisStatusIndicatorProps {
  isMarkedForAnalysis: boolean;
  isSavedToDatabase?: boolean;
  analysisPriority: 'high' | 'medium' | 'low';
}

export function AnalysisStatusIndicator({ 
  isMarkedForAnalysis, 
  isSavedToDatabase = false,
  analysisPriority 
}: AnalysisStatusIndicatorProps) {
  if (!isMarkedForAnalysis) return null;

  const getPriorityColor = () => {
    switch (analysisPriority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className={`text-xs ${getPriorityColor()}`}>
        <Brain className="h-3 w-3 mr-1" />
        IA
      </Badge>
      
      {isSavedToDatabase ? (
        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Salvo
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Salvando...
        </Badge>
      )}
    </div>
  );
}
