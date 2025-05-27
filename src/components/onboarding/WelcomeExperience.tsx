
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Award,
  Play,
  ArrowRight,
  Eye,
  Heart,
  Zap
} from 'lucide-react';

export function WelcomeExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Assistentes Especializados",
      description: "7 assistentes IA analisam diferentes aspectos da sua personalidade",
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Evolução em Tempo Real",
      description: "Acompanhe seu crescimento pessoal com métricas precisas",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Target,
      title: "Insights Personalizados",
      description: "Recomendações específicas baseadas no seu perfil único",
      color: "from-orange-500 to-red-600"
    }
  ];

  const handleStartJourney = () => {
    localStorage.setItem('onboarding_step', '1');
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const userName = user?.email?.split('@')[0] || 'Explorador';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-bounce delay-75"></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-pink-400/20 rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-indigo-400/20 rounded-full animate-bounce delay-300"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          {/* Logo/Brand */}
          <div className={`inline-flex items-center gap-3 mb-6 transition-all duration-1000 ${isAnimating ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
            <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Eye className="size-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">Observatório</h1>
              <p className="text-blue-200 text-sm">Consciência Pessoal</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className={`transition-all duration-1000 delay-300 ${isAnimating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{userName}</span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Você está prestes a descobrir insights profundos sobre si mesmo através da análise inteligente de suas conversas
            </p>
          </div>

          {/* Features Preview */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-500 ${isAnimating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} mb-4`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${isAnimating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
            <Button 
              onClick={handleStartJourney}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Iniciar Minha Jornada
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={() => setCurrentStep(1)}
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>

          {/* Skip option */}
          <div className="mt-8">
            <Button 
              onClick={handleSkip}
              variant="ghost" 
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              Pular introdução
            </Button>
          </div>

          {/* Progress indicators */}
          <div className="mt-12 flex justify-center gap-2">
            {[0, 1, 2].map((step) => (
              <div 
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === currentStep ? 'bg-blue-400 w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Demo Modal/Overlay (quando currentStep > 0) */}
      {currentStep > 0 && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-white">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Preview do Seu Observatório</h3>
                <p className="text-gray-600 mb-6">
                  Veja como será sua experiência após a primeira análise
                </p>
                
                {/* Mini dashboard preview */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">87%</div>
                      <div className="text-xs text-gray-600">Inteligência Emocional</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">23</div>
                      <div className="text-xs text-gray-600">Insights Gerados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">5</div>
                      <div className="text-xs text-gray-600">Áreas Analisadas</div>
                    </div>
                  </div>
                  
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    🎯 Novo insight disponível: Você demonstra alta capacidade de liderança
                  </Badge>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={handleStartJourney} className="bg-blue-600 hover:bg-blue-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Começar Agora
                  </Button>
                  <Button onClick={() => setCurrentStep(0)} variant="outline">
                    Voltar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
