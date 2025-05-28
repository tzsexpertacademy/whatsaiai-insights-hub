
import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { DemoDashboard } from '@/components/onboarding/DemoData';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Sparkles } from 'lucide-react';

export function DashboardMain() {
  const { showDemo, completed, isFirstVisit } = useOnboarding();
  const { data, isLoading } = useAnalysisData();

  console.log('📊 DashboardMain - Estado atual:', {
    showDemo,
    completed,
    isFirstVisit,
    hasRealData: data.hasRealData,
    isLoading
  });

  if (isLoading) {
    return (
      <ResponsiveLayout variant="content" className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Carregando seu observatório...</p>
        </div>
      </ResponsiveLayout>
    );
  }

  // Se deve mostrar demo
  if (showDemo && isFirstVisit) {
    return (
      <ResponsiveLayout variant="content">
        <DemoDashboard />
      </ResponsiveLayout>
    );
  }

  // Se completou onboarding mas não tem dados reais ainda
  if (completed && !data.hasRealData) {
    return (
      <ResponsiveLayout variant="content">
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-800 flex items-center justify-center gap-2">
                <Brain className="w-8 h-8" />
                Pronto para Análise!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-blue-600 text-lg">
                Seu Observatório da Consciência está configurado e aguardando suas conversas para análise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-5 h-5 mr-2" />
                  Fazer Upload de Conversas
                </Button>
                
                <Button variant="outline" size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ver Configurações
                </Button>
              </div>

              <div className="text-sm text-gray-500 space-y-2">
                <p>✅ Sistema configurado</p>
                <p>⏳ Aguardando suas conversas para gerar insights</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResponsiveLayout>
    );
  }

  // Se tem dados reais
  return (
    <ResponsiveLayout variant="content">
      <MetricCards />
    </ResponsiveLayout>
  );
}
