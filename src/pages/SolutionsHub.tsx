import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  DollarSign, 
  Megaphone, 
  Calculator, 
  Cog, 
  Package, 
  Users, 
  Target,
  Crown,
  LogOut
} from 'lucide-react';

interface Solution {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  features: string[];
  status: 'active' | 'coming-soon' | 'available';
  route?: string;
}

const solutions: Solution[] = [
  {
    id: 'consciousness',
    title: 'Observatório da Consciência',
    subtitle: 'O Decodificador Humano',
    description: 'Análise comportamental avançada via WhatsApp',
    icon: Brain,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-blue-600',
    features: [
      'Análise de padrões comportamentais',
      'Perfil psicológico detalhado',
      'Insights sobre tomada de decisão',
      'Monitoramento emocional'
    ],
    status: 'active',
    route: '/dashboard'
  },
  {
    id: 'commercial',
    title: 'Cérebro Comercial',
    subtitle: 'O Gerador de Receita',
    description: 'Análise de funil, conversão e performance de vendas',
    icon: DollarSign,
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-600',
    features: [
      'Análise de funil de vendas',
      'Taxa de conversão por perfil',
      'Padrões de objeções',
      'Diagnóstico de abordagem'
    ],
    status: 'active',
    route: '/commercial'
  },
  {
    id: 'marketing',
    title: 'Cérebro de Marketing',
    subtitle: 'O Arquitetor de Atenção',
    description: 'Análise de copy, campanhas e engajamento',
    icon: Megaphone,
    color: 'text-pink-600',
    bgGradient: 'from-pink-500 to-rose-600',
    features: [
      'Performance de campanhas',
      'Análise de tom de voz',
      'Alinhamento de persona',
      'Padrões de retenção'
    ],
    status: 'coming-soon'
  },
  {
    id: 'financial',
    title: 'Cérebro Financeiro',
    subtitle: 'O Guardião dos Recursos',
    description: 'Análise de fluxo, margens e rentabilidade',
    icon: Calculator,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-600',
    features: [
      'Análise de fluxo de caixa',
      'Otimização de custos',
      'Detecção de desperdícios',
      'Sugestões de precificação'
    ],
    status: 'coming-soon'
  },
  {
    id: 'operations',
    title: 'Cérebro de Operações',
    subtitle: 'O Motor da Entrega',
    description: 'Análise de processos e produtividade',
    icon: Cog,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-amber-600',
    features: [
      'Análise de processos',
      'Detecção de gargalos',
      'Recomendações de automação',
      'Melhoria contínua'
    ],
    status: 'coming-soon'
  },
  {
    id: 'product',
    title: 'Cérebro de Produto/Serviço',
    subtitle: 'O Mestre da Experiência',
    description: 'Análise de feedbacks, NPS e satisfação',
    icon: Package,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-500 to-purple-600',
    features: [
      'Análise de NPS',
      'Gaps na entrega',
      'Percepção de valor',
      'Evolução de features'
    ],
    status: 'coming-soon'
  },
  {
    id: 'hr',
    title: 'Cérebro de RH',
    subtitle: 'O Cultivador de Talentos',
    description: 'Análise de clima, cultura e engajamento',
    icon: Users,
    color: 'text-teal-600',
    bgGradient: 'from-teal-500 to-green-600',
    features: [
      'Análise de clima organizacional',
      'Detecção de burnout',
      'Desenvolvimento humano',
      'Alinhamento cultural'
    ],
    status: 'coming-soon'
  },
  {
    id: 'strategy',
    title: 'Cérebro de Estratégia',
    subtitle: 'O Visionário',
    description: 'Leitura de tendências e oportunidades',
    icon: Target,
    color: 'text-red-600',
    bgGradient: 'from-red-500 to-pink-600',
    features: [
      'Análise de tendências',
      'Diagnóstico estratégico',
      'Diferenciação competitiva',
      'Visão de futuro'
    ],
    status: 'coming-soon'
  }
];

const superBrain = {
  id: 'super-brain',
  title: 'SUPER CÉREBRO',
  subtitle: 'O Conselheiro da Empresa',
  description: 'Visão macro, integrada e holística de todos os cérebros',
  icon: Crown,
  color: 'text-yellow-600',
  bgGradient: 'from-yellow-500 via-orange-500 to-red-500',
  features: [
    'Visão integrada de todos os cérebros',
    'Detecção de riscos sistêmicos',
    'Diagnóstico de desequilíbrios',
    'Conselheria estratégica completa'
  ],
  status: 'coming-soon' as const
};

export function SolutionsHub() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSolutionClick = (solution: Solution) => {
    if (solution.status === 'active' && solution.route) {
      navigate(solution.route);
    } else {
      // Aqui você pode implementar lógica para compra/contato
      console.log(`Interesse em: ${solution.title}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'coming-soon':
        return <Badge className="bg-orange-100 text-orange-800">Em Breve</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Disponível</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ecossistema Kairon</h1>
                <p className="text-sm text-gray-600">Inteligência Artificial Empresarial</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Cérebro</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada solução é um cérebro especializado que analisa, diagnostica e recomenda ações estratégicas para sua empresa
          </p>
        </div>

        {/* Super Cérebro */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${superBrain.bgGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <superBrain.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">{superBrain.title}</CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                {superBrain.subtitle}
              </CardDescription>
              <p className="text-gray-600">{superBrain.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {superBrain.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                {getStatusBadge(superBrain.status)}
                <Button 
                  disabled={superBrain.status === 'coming-soon'}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  {superBrain.status === 'coming-soon' ? 'Em Desenvolvimento' : 'Acessar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cérebros Principais */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {solutions.map((solution) => (
            <Card 
              key={solution.id}
              className={`bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 ${
                solution.status === 'active' ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${solution.bgGradient} rounded-xl flex items-center justify-center`}>
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  {getStatusBadge(solution.status)}
                </div>
                <CardTitle className="text-xl">{solution.title}</CardTitle>
                <CardDescription className="text-base font-medium text-gray-700">
                  {solution.subtitle}
                </CardDescription>
                <p className="text-sm text-gray-600">{solution.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  {solution.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => handleSolutionClick(solution)}
                  disabled={solution.status === 'coming-soon'}
                  className={`w-full bg-gradient-to-r ${solution.bgGradient} hover:opacity-90`}
                >
                  {solution.status === 'active' ? 'Acessar' : 
                   solution.status === 'coming-soon' ? 'Em Breve' : 'Contratar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            © {new Date().getFullYear()} Kairon Labs - Transformando dados em inteligência estratégica
          </p>
        </footer>
      </main>
    </div>
  );
}
