
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CommercialAIAnalysisButton } from './CommercialAIAnalysisButton';

export function SalesPerformance() {
  const [hasCommercialData, setHasCommercialData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const checkCommercialData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando dados de performance para usuário:', user.id);
        
        // Verificar se existem métricas de vendas
        const { data: metricsData, error: metricsError } = await supabase
          .from('sales_metrics')
          .select('*')
          .eq('user_id', user.id);

        if (metricsError) {
          console.error('❌ Erro ao verificar métricas de vendas:', metricsError);
        }

        const hasData = metricsData && metricsData.length > 0;
        console.log('📊 Dados de performance encontrados:', hasData);
        
        setHasCommercialData(hasData);
        if (hasData) {
          // Simular dados de performance individual baseados nas métricas reais
          const mockPerformanceData = [
            { name: 'Equipe Comercial', role: 'Geral', closed: metricsData[0]?.conversions || 0, revenue: metricsData[0]?.revenue_generated || 0, conversion: metricsData[0]?.conversion_rate || 0, meetings: metricsData[0]?.qualified_leads || 0 }
          ];
          setSalesData(mockPerformanceData);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar dados de performance:', error);
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Performance de Vendas</h1>
            <p className="text-slate-600">Análise individual e coletiva da equipe</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>Carregando dados de performance...</p>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Performance de Vendas</h1>
            <p className="text-slate-600">Análise individual e coletiva da equipe</p>
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
              Performance de Vendas Vazia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado de performance encontrado</h3>
              <p className="text-gray-600 mb-6">
                Para visualizar a performance de vendas, você precisa:
              </p>
              <div className="text-left max-w-md mx-auto space-y-2">
                <p className="text-sm text-gray-600">• Gerar conversas comerciais</p>
                <p className="text-sm text-gray-600">• Executar análise por IA</p>
                <p className="text-sm text-gray-600">• Aguardar geração das métricas</p>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Performance de Vendas</h1>
          <p className="text-slate-600">Análise individual e coletiva da equipe</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">Com Dados</Badge>
          <CommercialAIAnalysisButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe Comercial</CardTitle>
          <CardDescription>Métricas baseadas em dados reais processados por IA</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipe/Vendedor</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Fechamentos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Taxa Conversão</TableHead>
                <TableHead>Reuniões</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((seller, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {seller.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{seller.closed}</TableCell>
                  <TableCell>
                    {seller.revenue > 0 ? `R$ ${seller.revenue.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={seller.conversion >= 15 ? 'default' : seller.conversion >= 10 ? 'secondary' : 'destructive'}>
                      {seller.conversion.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{seller.meetings}</TableCell>
                  <TableCell>
                    <Badge variant={seller.conversion >= 15 ? 'default' : 'secondary'}>
                      {seller.conversion >= 15 ? 'Acima da Meta' : 'Na Meta'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
