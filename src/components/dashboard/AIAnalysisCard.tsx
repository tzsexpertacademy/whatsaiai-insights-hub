
import React from 'react';
import { AIAnalysisSelector } from '@/components/AIAnalysisSelector';
import { useAIReportUpdate } from '@/hooks/useAIReportUpdate';

export function AIAnalysisCard() {
  const { updateReport, isUpdating } = useAIReportUpdate();

  return (
    <AIAnalysisSelector 
      onAnalyze={updateReport}
      isAnalyzing={isUpdating}
    />
  );
}
