
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, TrendingUp, Calendar, DollarSign, Target, Users, Award, Zap, CheckCircle } from 'lucide-react';

export function CommercialTimeline() {
  // Simulação de dados comerciais até ter dados reais
  const hasRealData = false; // Será true quando houver dados da IA
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo Comercial</h1>
          <p className="text-slate-600">Evolução da performance comercial e crescimento de vendas</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo Comercial</h1>
          <p className="text-slate-600">Evolução da performance comercial e crescimento de vendas</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Timeline Comercial Aguarda Dados</h3>
              <p className="text-gray-500 max-w-md">
                A evolução comercial será mapeada após análises de conversas e métricas de vendas.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises IA de conversas comerciais</p>
                <p>• A IA identificará padrões de conversão</p>
                <p>• Marcos de crescimento serão destacados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulação de marcos comerciais (será alimentado pela IA)
  const commercialMilestones = [
    {
      date: '2024-01-20',
      type: 'breakthrough',
      title: 'Implementação do Sistema IA',
      description: 'Início da automação inteligente de conversas comerciais.',
      category: 'Automação',
      icon: Zap,
      impact: 'high',
      metrics: ['Setup completo da IA', 'Integração WhatsApp ativa', 'Primeiros insights gerados'],
      results: { revenue: 0, conversion: 0, leads: 0 }
    },
    {
      date: '2024-02-05',
      type: 'improvement',
      title: 'Primeiro Pico de Conversões',
      description: 'IA otimizou abordagens resultando em aumento significativo de conversões.',
      category: 'Performance',
      icon: TrendingUp,
      impact: 'high',
      metrics: ['Taxa de conversão subiu 45%', 'Tempo de resposta reduzido 80%', 'Qualificação de leads melhorou'],
      results: { revenue: 15420, conversion: 23, leads: 67 }
    },
    {
      date: '2024-02-18',
      type: 'achievement',
      title: 'Marco: R$ 50K em Receita',
      description: 'Primeira meta importante alcançada com auxílio da IA comercial.',
      category: 'Receita',
      icon: DollarSign,
      impact: 'high',
      metrics: ['Meta mensal superada', 'ROI da IA: 340%', 'Cliente satisfação 94%'],
      results: { revenue: 52800, conversion: 31, leads: 142 }
    },
    {
      date: '2024-03-02',
      type: 'optimization',
      title: 'Otimização do Funil de Vendas',
      description: 'IA identificou gargalos e otimizou cada etapa do processo comercial.',
      category: 'Processo',
      icon: Target,
      impact: 'medium',
      metrics: ['Ciclo de vendas reduzido 25%', 'Taxa de abandono caiu 35%', 'Follow-up automatizado'],
      results: { revenue: 72100, conversion: 38, leads: 189 }
    },
    {
      date: '2024-03-20',
      type: 'expansion',
      title: 'Expansão da Equipe Comercial',
      description: 'Sucesso permitiu crescimento da equipe com foco em resultados.',
      category: 'Crescimento',
      icon: Users,
      impact: 'high',
      metrics: ['2 novos vendedores', 'Treinamento IA implementado', 'Metas individuais definidas'],
      results: { revenue: 94500, conversion: 42, leads: 267 }
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-green-500 bg-green-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breakthrough': return Zap;
      case 'achievement': return Award;
      case 'optimization': return Target;
      case 'expansion': return Users;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo Comercial</h1>
        <p className="text-slate-600">Evolução da performance comercial e crescimento de vendas</p>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-green-900 font-bold text-lg">R$ 94.5K</p>
                <p className="text-green-700 text-sm">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-blue-900 font-bold text-lg">42%</p>
                <p className="text-blue-700 text-sm">Taxa Conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-purple-900 font-bold text-lg">267</p>
                <p className="text-purple-700 text-sm">Leads Gerados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-orange-900 font-bold text-lg">60 dias</p>
                <p className="text-orange-700 text-sm">Operação Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Comercial */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Marcos do Crescimento Comercial
          </CardTitle>
          <CardDescription>
            Principais conquistas e otimizações identificadas pela IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-blue-500"></div>
            
            <div className="space-y-8">
              {commercialMilestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                const TypeIcon = getTypeIcon(milestone.type);
                
                return (
                  <div key={index} className="relative flex items-start gap-6">
                    {/* Círculo na linha */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-green-500 shadow-lg">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1">
                      <Card className={`${getImpactColor(milestone.impact)} border-2`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-5 w-5 text-gray-600" />
                              <Badge variant="outline" className="text-xs">
                                {milestone.category}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(milestone.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <Badge 
                              variant={milestone.impact === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {milestone.impact === 'high' ? 'Alto Impacto' : 'Médio Impacto'}
                            </Badge>
                          </div>
                          
                          <h3 className="font-bold text-lg text-gray-800 mb-2">
                            {milestone.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4">
                            {milestone.description}
                          </p>
                          
                          {/* Métricas do Marco */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Conquistas:</h4>
                              <ul className="space-y-1">
                                {milestone.metrics.map((metric, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    {metric}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {milestone.results.revenue > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-2">Resultados:</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Receita:</span>
                                    <span className="font-semibold text-green-600">
                                      R$ {milestone.results.revenue.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Conversão:</span>
                                    <span className="font-semibold text-blue-600">
                                      {milestone.results.conversion}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Leads:</span>
                                    <span className="font-semibold text-purple-600">
                                      {milestone.results.leads}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
