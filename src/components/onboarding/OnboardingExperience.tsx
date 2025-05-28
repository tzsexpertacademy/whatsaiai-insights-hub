
import React from 'react';
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
  BarChart3
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

export function OnboardingExperience() {
  const { currentStep, nextStep, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleStartChat = () => {
    completeOnboarding();
    navigate('/chat');
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      nextStep();
    } else {
      handleStartChat();
    }
  };

  const steps = [
    {
      title: "Bem-vindo ao Observatório da Consciência",
      subtitle: "Sua jornada de autoconhecimento começa aqui",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uma plataforma de análise psicológica avançada que utiliza Inteligência Artificial 
            para mapear sua personalidade, comportamentos e evolução pessoal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Análise Emocional</h4>
              <p className="text-sm text-blue-600">Mapeamento do seu estado emocional</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Áreas da Vida</h4>
              <p className="text-sm text-purple-600">Análise completa das suas prioridades</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Insights Personalizados</h4>
              <p className="text-sm text-green-600">Descobertas únicas sobre você</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como Funciona",
      subtitle: "Processo simples e inteligente",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Converse com Assistentes IA</h4>
                  <p className="text-gray-600 text-sm">Interaja naturalmente com nossos assistentes especializados</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Análise Automática</h4>
                  <p className="text-gray-600 text-sm">Nossa IA processa suas conversas e identifica padrões</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Insights Personalizados</h4>
                  <p className="text-gray-600 text-sm">Receba análises profundas sobre sua personalidade</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-800 mb-2">100% Privado e Seguro</h4>
                <p className="text-gray-600 text-sm">
                  Suas conversas são processadas com segurança máxima. 
                  Nenhum dado é compartilhado ou armazenado permanentemente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Seu Observatório Pessoal",
      subtitle: "Veja o que você terá acesso",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Dashboard</h4>
                <p className="text-xs text-blue-600">Visão geral completa</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-red-800">Termômetro</h4>
                <p className="text-xs text-red-600">Estados emocionais</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Áreas da Vida</h4>
                <p className="text-xs text-green-600">Mapeamento completo</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800">Insights</h4>
                <p className="text-xs text-purple-600">Descobertas da IA</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 rounded-lg border border-indigo-200">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-indigo-800 mb-2">
                Pronto para começar sua jornada?
              </h4>
              <p className="text-indigo-600">
                Vamos para o chat onde você fará suas primeiras interações com nossos assistentes especializados.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  if (!currentStepData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-center mb-6">
          <Badge className="bg-blue-100 text-blue-800 mb-4">
            Etapa {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Main content */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 text-lg">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {currentStepData.content}
            
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                {currentStep < 3 ? (
                  <>
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Começar no Chat
                    <MessageSquare className="w-5 h-5 ml-2" />
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
