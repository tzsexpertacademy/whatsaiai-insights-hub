
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

export function BehavioralProfile() {
  const { user } = useAuth();
  const { data } = useAnalysisData();
  
  console.log('🧠 BehavioralProfile - Dados disponíveis:', {
    hasRealData: data.hasRealData,
    behavioralProfile: data.behavioralProfile,
    insightsWithAssistant: data.insightsWithAssistant?.length || 0
  });

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
        🧠 Análise Psicológica
      </Badge>
      <AIAnalysisButton />
    </div>
  );

  if (!data.hasRealData) {
    return (
      <PageLayout
        title="Perfil Comportamental"
        description="Análise psicológica profunda pelos assistentes especializados"
        showBackButton={true}
        headerActions={headerActions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Perfil comportamental não mapeado
            </CardTitle>
            <CardDescription>
              Para criar seu perfil psicológico, os assistentes precisam analisar suas conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">• Execute a análise por IA no dashboard</p>
                <p className="text-sm text-gray-600">• Os assistentes irão mapear seu comportamento</p>
                <p className="text-sm text-gray-600">• Dados serão atualizados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Perfil Comportamental"
      description="Análise psicológica profunda pelos assistentes especializados"
      showBackButton={true}
      headerActions={headerActions}
    >
      {data.behavioralProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Análise Comportamental Ativa
            </CardTitle>
            <CardDescription>
              Perfil psicológico baseado em {data.insightsWithAssistant?.length || 0} insights dos assistentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(data.behavioralProfile).map(([trait, value]) => (
                <div key={trait} className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 capitalize mb-2">
                    {trait.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {typeof value === 'number' ? `${value}%` : String(value)}
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${typeof value === 'number' ? value : 50}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-gray-500" />
              Processando Análise Comportamental
            </CardTitle>
            <CardDescription>
              Os assistentes estão analisando seus padrões de comportamento
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Aguarde enquanto processamos sua análise...</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
