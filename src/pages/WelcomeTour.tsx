
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  Heart,
  Target,
  BarChart3,
  Bot,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

export function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinishTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishTour = () => {
    // Marcar o tour como completado
    localStorage.setItem('welcome_tour_completed', 'true');
    localStorage.removeItem('show_welcome_tour');
    
    // Redirecionar para o dashboard
    navigate('/dashboard');
  };

  const steps = [
    {
      title: "Bem-vindo ao YumerMind da Consciência",
      subtitle: "Sua jornada de autoconhecimento começa aqui",
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma de análise psicológica avançada que utiliza Inteligência Artificial 
            para mapear sua personalidade, comportamentos e evolução pessoal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <Heart className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-800 mb-2">Análise Emocional</h4>
              <p className="text-sm text-blue-600">Mapeamento completo do seu estado emocional e padrões comportamentais</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <Target className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-purple-800 mb-2">Áreas da Vida</h4>
              <p className="text-sm text-purple-600">Análise detalhada das suas prioridades e objetivos pessoais</p>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <BarChart3 className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-green-800 mb-2">Insights Personalizados</h4>
              <p className="text-sm text-green-600">Descobertas únicas sobre você baseadas em IA avançada</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como Funciona o YumerMind",
      subtitle: "Processo simples e revolucionário",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Converse com Assistentes IA</h4>
                  <p className="text-gray-600">Interaja naturalmente com nossos 8 assistentes especializados em diferentes áreas da sua vida</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Análise Automática Avançada</h4>
                  <p className="text-gray-600">Nossa IA processa suas conversas e identifica padrões profundos de comportamento</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-2">Insights Transformadores</h4>
                  <p className="text-gray-600">Receba análises profundas e recomendações personalizadas para seu crescimento</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-6" />
                <h4 className="font-bold text-gray-800 mb-4 text-xl">100% Privado e Seguro</h4>
                <p className="text-gray-600 leading-relaxed">
                  Suas conversas são processadas com segurança máxima. 
                  Nenhum dado é compartilhado. Sua privacidade é nossa prioridade.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Seu Dashboard Personalizado",
      subtitle: "Tudo que você precisa em um só lugar",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-800 mb-1">Dashboard</h4>
                <p className="text-xs text-blue-600">Visão geral completa</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6 text-center">
                <Heart className="w-10 h-10 text-red-600 mx-auto mb-3" />
                <h4 className="font-semibold text-red-800 mb-1">Termômetro</h4>
                <p className="text-xs text-red-600">Estados emocionais</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Target className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-800 mb-1">Áreas da Vida</h4>
                <p className="text-xs text-green-600">Mapeamento completo</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Brain className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-800 mb-1">Insights</h4>
                <p className="text-xs text-purple-600">Descobertas da IA</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-cyan-50 p-8 rounded-xl border border-green-200">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-green-800 mb-4">
                Tudo Pronto para Começar!
              </h4>
              <p className="text-green-600 text-lg leading-relaxed max-w-2xl mx-auto">
                Agora você pode acessar seu dashboard personalizado e começar a conversar 
                com nossos assistentes especializados para iniciar sua jornada de autoconhecimento.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index + 1 <= currentStep 
                      ? 'bg-blue-600 scale-110' 
                      : 'bg-gray-300'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                      index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-center mb-8">
          <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
            Passo {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Main content */}
        <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 text-xl">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          <CardContent className="p-8 sm:p-12">
            {currentStepData.content}
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-12">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 flex items-center gap-2"
              >
                {currentStep < 3 ? (
                  <>
                    Próximo
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Acessar Dashboard
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
