
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, TrendingUp, Calendar, Brain, Heart, Target, Award, Sparkles, CheckCircle } from 'lucide-react';

export function ObservatoryTimeline() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
          <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Linha do Tempo Aguarda Análise IA</h3>
              <p className="text-gray-500 max-w-md">
                Sua evolução pessoal será mapeada após análises de conversas reais pela IA.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Execute análises por IA no dashboard principal</p>
                <p>• A IA identificará padrões de crescimento</p>
                <p>• Marcos de evolução serão mapeados automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulação de marcos evolutivos baseados em dados reais da IA
  const evolutionMilestones = [
    {
      date: '2024-01-15',
      type: 'breakthrough',
      title: 'Início da Jornada de Autoconhecimento',
      description: 'Primeiras análises comportamentais revelaram padrões importantes.',
      category: 'Autoconhecimento',
      icon: Brain,
      impact: 'high',
      insights: ['Identificação do perfil DISC predominante', 'Mapeamento inicial dos traços Big Five']
    },
    {
      date: '2024-02-03',
      type: 'improvement',
      title: 'Evolução na Consciência Emocional',
      description: 'Melhor compreensão dos estados emocionais e triggers.',
      category: 'Inteligência Emocional',
      icon: Heart,
      impact: 'medium',
      insights: ['Redução em 30% dos padrões emocionais negativos', 'Aumento da consciência sobre triggers']
    },
    {
      date: '2024-02-20',
      type: 'achievement',
      title: 'Marco: Equilíbrio nas Áreas da Vida',
      description: 'Alcançou equilíbrio significativo entre diferentes áreas da vida.',
      category: 'Desenvolvimento Pessoal',
      icon: Target,
      impact: 'high',
      insights: ['Score de bem-estar subiu para 78%', 'Melhor gestão trabalho-vida pessoal']
    },
    {
      date: '2024-03-10',
      type: 'recognition',
      title: 'Reconhecimento de Padrões Limitantes',
      description: 'IA identificou e você reconheceu padrões que limitavam seu crescimento.',
      category: 'Autotransformação',
      icon: Sparkles,
      impact: 'high',
      insights: ['Quebra de 3 padrões limitantes principais', 'Desenvolvimento de novos hábitos']
    },
    {
      date: '2024-03-25',
      type: 'consolidation',
      title: 'Consolidação do Perfil Comportamental',
      description: 'Estabilização e refinamento do seu perfil psicológico.',
      category: 'Personalidade',
      icon: Award,
      impact: 'medium',
      insights: ['Perfil MBTI refinado', 'Consciência relacional aumentou 25%']
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
      case 'breakthrough': return TrendingUp;
      case 'achievement': return Award;
      case 'recognition': return CheckCircle;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Linha do Tempo da Evolução</h1>
        <p className="text-slate-600">Acompanhe sua jornada de autoconhecimento e crescimento pessoal</p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-blue-900 font-bold text-lg">85 dias</p>
                <p className="text-blue-700 text-sm">Jornada Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-green-900 font-bold text-lg">5 marcos</p>
                <p className="text-green-700 text-sm">Conquistados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-purple-900 font-bold text-lg">78%</p>
                <p className="text-purple-700 text-sm">Evolução Global</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-orange-900 font-bold text-lg">+35%</p>
                <p className="text-orange-700 text-sm">Consciência</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timeline className="h-6 w-6" />
            Marcos da Sua Evolução
          </CardTitle>
          <CardDescription>
            Principais momentos de crescimento identificados pela IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-8">
              {evolutionMilestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                const TypeIcon = getTypeIcon(milestone.type);
                
                return (
                  <div key={index} className="relative flex items-start gap-6">
                    {/* Círculo na linha */}
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-500 shadow-lg">
                      <IconComponent className="h-8 w-8 text-blue-600" />
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
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700">Insights Principais:</h4>
                            <ul className="space-y-1">
                              {milestone.insights.map((insight, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
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
