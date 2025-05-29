
import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Smartphone,
  Download,
  Key,
  Settings,
  Zap,
  Shield,
  Users,
  Award,
  Lightbulb,
  Monitor
} from 'lucide-react';

export function WelcomeTour() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const navigate = useNavigate();

  // Detectar se PWA pode ser instalado
  useEffect(() => {
    const checkInstallPrompt = () => {
      if ('serviceWorker' in navigator) {
        setShowInstallPrompt(true);
      }
    };
    checkInstallPrompt();
  }, []);

  const handleNext = () => {
    if (currentStep < 4) {
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
    localStorage.setItem('welcome_tour_completed', 'true');
    localStorage.removeItem('show_welcome_tour');
    navigate('/dashboard');
  };

  const handleInstallApp = () => {
    // Instruções para adicionar à tela inicial
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      instructions = 'No Safari: Toque no botão Compartilhar e selecione "Adicionar à Tela de Início"';
    } else if (userAgent.includes('android')) {
      instructions = 'No Chrome: Toque no menu (⋮) e selecione "Adicionar à tela inicial"';
    } else {
      instructions = 'No seu navegador: Procure pela opção "Instalar aplicativo" ou "Adicionar à área de trabalho"';
    }
    
    alert(`Para adicionar o YumerMind à sua tela inicial:\n\n${instructions}`);
  };

  const steps = [
    {
      title: "🎉 Bem-vindo ao YumerMind da Consciência",
      subtitle: "A revolução da análise psicológica chegou",
      content: (
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <Brain className="w-16 h-16 text-white animate-bounce" />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              🚀 Prepare-se para uma experiência <span className="font-bold text-purple-600">transformadora</span> de autoconhecimento.
              Nossa IA avançada vai revolucionar como você entende sua mente e comportamentos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-blue-800 mb-3 text-lg">Análise Emocional Profunda</h4>
                <p className="text-blue-700 text-sm">Decodificamos seus padrões emocionais com precisão científica</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-purple-800 mb-3 text-lg">Mapeamento de Vida</h4>
                <p className="text-purple-700 text-sm">Visualize suas prioridades e objetivos como nunca antes</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-green-800 mb-3 text-lg">Insights Revolucionários</h4>
                <p className="text-green-700 text-sm">Descobertas que vão transformar sua perspectiva pessoal</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🤖 O Poder da IA YumerMind",
      subtitle: "8 Assistentes Especializados ao seu serviço",
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cada assistente é especializado em uma área específica da sua vida, 
              oferecendo análises precisas e personalizadas.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "💼 Carreira", color: "from-blue-500 to-blue-600" },
              { name: "❤️ Relacionamentos", color: "from-pink-500 to-red-500" },
              { name: "💰 Finanças", color: "from-green-500 to-green-600" },
              { name: "🏋️ Saúde", color: "from-orange-500 to-red-500" },
              { name: "🎯 Objetivos", color: "from-purple-500 to-purple-600" },
              { name: "🧠 Mindset", color: "from-indigo-500 to-purple-500" },
              { name: "⚡ Produtividade", color: "from-yellow-500 to-orange-500" },
              { name: "🌱 Crescimento", color: "from-teal-500 to-green-500" }
            ].map((assistant, index) => (
              <div
                key={index}
                className={`p-4 bg-gradient-to-r ${assistant.color} rounded-lg text-white text-center hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <p className="font-semibold text-sm">{assistant.name}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-200 mt-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="w-12 h-12 text-indigo-600" />
              <div>
                <h4 className="text-xl font-bold text-indigo-800">100% Privado e Seguro</h4>
                <p className="text-indigo-600">Seus dados nunca são compartilhados</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Criptografia Avançada</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Zero Compartilhamento</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Você é o Dono dos Dados</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "📱 Instale o YumerMind",
      subtitle: "Tenha acesso instantâneo ao seu crescimento pessoal",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 Adicione à sua Tela Inicial
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Transforme o YumerMind em um app nativo! Acesso instantâneo, 
              notificações personalizadas e uma experiência mobile otimizada.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-blue-800 text-lg">Desktop</h4>
              </div>
              <p className="text-blue-700 mb-4 text-sm">
                No Chrome/Edge: Clique no ícone de instalação na barra de endereços
              </p>
              <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                💡 Procure pelo ícone de instalação (+) ou "Instalar YumerMind"
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-green-800 text-lg">Mobile</h4>
              </div>
              <p className="text-green-700 mb-4 text-sm">
                iPhone: Safari → Compartilhar → "Adicionar à Tela de Início"<br/>
                Android: Chrome → Menu → "Adicionar à tela inicial"
              </p>
              <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
                📱 Funciona como um app nativo!
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleInstallApp}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Ver Instruções de Instalação
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "🔑 Configure sua Chave OpenAI",
      subtitle: "Ative o poder completo da Inteligência Artificial",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Key className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ⚡ Libere Todo o Potencial
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Para ter acesso completo às análises de IA mais avançadas, 
              você precisa configurar sua chave pessoal da OpenAI.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl border-2 border-yellow-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h4 className="font-semibold text-yellow-800 mb-2">Crie sua Conta</h4>
                <p className="text-sm text-yellow-700">Acesse platform.openai.com e crie uma conta gratuita</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h4 className="font-semibold text-orange-800 mb-2">Gere sua Chave</h4>
                <p className="text-sm text-orange-700">Vá em API Keys e clique em "Create new secret key"</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h4 className="font-semibold text-red-800 mb-2">Configure Aqui</h4>
                <p className="text-sm text-red-700">Cole sua chave nas configurações do YumerMind</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-start gap-4">
              <Award className="w-8 h-8 text-indigo-600 mt-1" />
              <div>
                <h4 className="font-bold text-indigo-800 mb-2">💡 Por que você precisa disso?</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>✅ Análises 10x mais profundas e personalizadas</li>
                  <li>✅ Conversas ilimitadas com os 8 assistentes</li>
                  <li>✅ Insights exclusivos baseados em seu perfil único</li>
                  <li>✅ Relatórios detalhados de crescimento pessoal</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => navigate('/dashboard/settings')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configurar Agora
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Você pode configurar depois em Configurações → OpenAI
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full transition-all duration-500 ${
                    index + 1 <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-110 shadow-lg' 
                      : 'bg-gray-300'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-3 rounded-full transition-all duration-500 ${
                      index + 1 < currentStep 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base px-6 py-3 shadow-lg">
            Passo {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Main content */}
        <Card className="bg-white/95 backdrop-blur-sm border-white/50 shadow-2xl">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 text-xl lg:text-2xl">
              {currentStepData.subtitle}
            </p>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 lg:p-16">
            <div className="animate-fade-in">
              {currentStepData.content}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-16">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-lg border-2 hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                {currentStep < 4 ? (
                  <>
                    Próximo
                    <ArrowRight className="w-6 h-6" />
                  </>
                ) : (
                  <>
                    Começar Jornada
                    <Zap className="w-6 h-6" />
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
