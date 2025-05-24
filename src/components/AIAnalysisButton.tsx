
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from 'lucide-react';
import { useAIReportUpdate } from '@/hooks/useAIReportUpdate';
import { cn } from '@/lib/utils';

interface AIAnalysisButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showText?: boolean;
}

export function AIAnalysisButton({ 
  variant = 'default', 
  size = 'default', 
  className,
  showText = true 
}: AIAnalysisButtonProps) {
  const { updateReport, isUpdating } = useAIReportUpdate();

  return (
    <Button
      onClick={updateReport}
      disabled={isUpdating}
      variant={variant}
      size={size}
      className={cn("flex items-center gap-2", className)}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      {showText && (
        <span>
          {isUpdating ? 'Atualizando...' : 'Atualizar Relatório'}
        </span>
      )}
    </Button>
  );
}
