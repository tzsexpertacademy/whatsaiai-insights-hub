
/**
 * COMPONENTE DE STATUS DO SISTEMA BLINDADO
 * 
 * Mostra o status de integridade do sistema de análise por IA
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useProtectedAnalysisData } from '@/hooks/useProtectedAnalysisData';

export function AnalysisSystemStatus() {
  const { systemIntegrity, protectedStats, revalidateSystem, isLoading } = useProtectedAnalysisData();
  const [isRevalidating, setIsRevalidating] = React.useState(false);

  const handleRevalidate = async () => {
    setIsRevalidating(true);
    await revalidateSystem();
    setIsRevalidating(false);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Sistema de Análise Protegido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status de Integridade */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status do Sistema:</span>
          <Badge 
            variant={systemIntegrity ? "default" : "destructive"}
            className={systemIntegrity ? "bg-green-100 text-green-800" : ""}
          >
            {systemIntegrity ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Protegido
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Comprometido
              </>
            )}
          </Badge>
        </div>

        {/* Estatísticas Protegidas */}
        {systemIntegrity && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Insights Validados:</span>
              <div className="font-semibold">{protectedStats.totalInsights}</div>
            </div>
            <div>
              <span className="text-gray-500">Assistentes Ativos:</span>
              <div className="font-semibold">{protectedStats.assistantsActive}</div>
            </div>
          </div>
        )}

        {/* Assistentes em Uso */}
        {systemIntegrity && Object.keys(protectedStats.assistantCounts).length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Assistentes Gerando Dados:</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(protectedStats.assistantCounts).map(([assistant, count]) => (
                <Badge key={assistant} variant="outline" className="text-xs px-1 py-0">
                  🔮 {assistant.split(' ')[0]} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Revalidação */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevalidate}
          disabled={isRevalidating || isLoading}
          className="w-full text-xs"
        >
          {isRevalidating ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Revalidando...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Revalidar Sistema
            </>
          )}
        </Button>

        {/* Aviso se sistema comprometido */}
        {!systemIntegrity && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="text-xs text-red-800">
              ⚠️ Sistema de análise comprometido. Entre em contato com o suporte.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
