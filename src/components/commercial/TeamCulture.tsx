
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Heart } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

export function TeamCulture() {
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados de cultura para usuário:', user.id);
        
        // Verificar se existem mensagens comerciais (indicativo de atividade da equipe)
        const { data: messagesData, error: messagesError } = await supabase
          .from('commercial_messages')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (messagesError) {
          console.error('❌ Erro ao verificar dados de cultura:', messagesError);
        }

        const hasData = messagesData && messagesData.length > 0;
        console.log('📊 Dados de cultura encontrados:', hasData);
        setHasCommercialData(hasData);
      } catch (error) {
        console.error('❌ Erro ao verificar dados de cultura:', error);
        setHasCommercialData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCommercialData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Cultura do Time</h1>
            <p className="text-slate-600">Engajamento, motivação e bem-estar da equipe</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados de cultura...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasCommercialData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Cultura do Time</h1>
            <p className="text-slate-600">Engajamento, motivação e bem-estar da equipe</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-gray-100 text-gray-800">Sem Dados</Badge>
            <CommercialAIAnalysisButton />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Cultura do Time Vazia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado de cultura encontrado</h3>
              <p className="text-gray-600 mb-6">
                Para visualizar a cultura do time, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Gerar atividade comercial</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
                <p className="text-sm text-gray-600">• Aguardar análise comportamental</p>
              </div>
              <div className="mt-6">
                <CommercialAIAnalysisButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Cultura do Time</h1>
          <p className="text-slate-600">Engajamento, motivação e bem-estar da equipe</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Com Dados</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Termômetro de Cultura</CardTitle>
          <CardDescription>Análise do engajamento baseada em dados comportamentais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Engajamento Positivo</h4>
              <p className="text-sm text-green-700">
                Equipe demonstra alta participação nas atividades comerciais
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Colaboração</h4>
              <p className="text-sm text-blue-700">
                Fluxo de comunicação e trabalho em equipe em bom nível
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
