
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Sparkles,
  ArrowRight,
  Zap,
  Eye,
  DollarSign
} from 'lucide-react';

export function SolutionsHub() {
  const navigate = useNavigate();

  const solutions = [
    {
      id: 'observatory',
      title: 'Observatório da Consciência',
      description: 'Mapeamento completo da sua mente, comportamentos e evolução pessoal',
      icon: Brain,
      color: 'from-purple-500 to-blue-600',
      features: ['Termômetro Emocional', 'Radar de Áreas da Vida', 'Padrões Cognitivos', 'Timeline da Evolução'],
      route: '/dashboard',
      status: 'Operacional'
    },
    {
      id: 'commercial',
      title: 'Cérebro Comercial',
      description: 'Centro de comando neural da operação de receita e vendas',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      features: ['Análise de Funil', 'Performance de Vendas', 'Métricas Comportamentais', 'Cultura do Time'],
      route: '/commercial',
      status: 'Operacional'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">Hub de Soluções Yumer</h1>
              <p className="text-sm sm:text-base text-slate-600">Powered by Yumer IA™</p>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
            Escolha sua jornada de crescimento e transformação
          </p>
          
          <Badge className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 sm:px-6 py-2 text-sm sm:text-base">
            <Zap className="w-4 h-4 mr-2" />
            Inteligência Artificial Avançada
          </Badge>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
          {solutions.map((solution) => (
            <Card 
              key={solution.id} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105 overflow-hidden"
            >
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${solution.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <solution.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs sm:text-sm w-fit">
                    {solution.status}
                  </Badge>
                </div>
                
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {solution.title}
                </CardTitle>
                
                <CardDescription className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  {solution.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {solution.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm sm:text-base text-slate-700">
                      <Target className="w-4 h-4 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="break-words">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => navigate(solution.route)}
                  className={`w-full bg-gradient-to-r ${solution.color} hover:opacity-90 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                >
                  <span className="mr-2 sm:mr-3">Acessar {solution.title}</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[
            { label: 'Análises Realizadas', value: '10K+', icon: BarChart3 },
            { label: 'Insights Gerados', value: '50K+', icon: Brain },
            { label: 'Usuários Ativos', value: '2K+', icon: Users },
            { label: 'Taxa de Evolução', value: '95%', icon: TrendingUp }
          ].map((stat, index) => (
            <Card key={index} className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-0 hover:bg-white/80 transition-all duration-300">
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-blue-600" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-600 break-words">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6 leading-tight">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Escolha sua solução e comece sua jornada de crescimento pessoal e profissional hoje mesmo.
          </p>
          
          <Button 
            onClick={() => navigate('/observatory')}
            size="lg" 
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 sm:px-8 lg:px-12 py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            <span>Descobrir o Observatório</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
