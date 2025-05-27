
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Eye,
  Cpu,
  Network,
  Waves,
  Play,
  ArrowRight,
  Atom,
  Microscope,
  Lightbulb
} from 'lucide-react';

export function WelcomeExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [neuronIndex, setNeuronIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuronIndex(prev => (prev + 1) % 8);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStartJourney = () => {
    localStorage.setItem('onboarding_step', '1');
    navigate('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const userName = user?.email?.split('@')[0] || 'Explorador';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        {/* Neural Network Loading */}
        <div className="relative">
          <div className="w-32 h-32 border-4 border-blue-500/30 rounded-full animate-pulse">
            <div className="w-24 h-24 border-2 border-purple-500/50 rounded-full m-3 animate-spin">
              <div className="w-16 h-16 border-2 border-cyan-500/70 rounded-full m-3 animate-pulse">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full m-3 animate-bounce flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-4">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${50 + 40 * Math.cos(i * 30 * Math.PI / 180)}%`,
                  top: `${50 + 40 * Math.sin(i * 30 * Math.PI / 180)}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-1/4 text-center text-white">
          <div className="text-xl font-light mb-2">Sincronizando com sua consciência...</div>
          <div className="text-sm text-blue-300">Estabelecendo conexões neurais</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Neural Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1920 1080">
          {/* Neural Network Connections */}
          {[...Array(50)].map((_, i) => (
            <g key={i}>
              <line 
                x1={Math.random() * 1920} 
                y1={Math.random() * 1080}
                x2={Math.random() * 1920} 
                y2={Math.random() * 1080}
                stroke="url(#neuralGradient)"
                strokeWidth="1"
                opacity={Math.random() * 0.5}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <circle 
                cx={Math.random() * 1920} 
                cy={Math.random() * 1080}
                r={Math.random() * 4 + 1}
                fill={neuronIndex === i % 8 ? "#60A5FA" : "#8B5CF6"}
                opacity={neuronIndex === i % 8 ? 1 : 0.3}
                className="transition-all duration-500"
              />
            </g>
          ))}
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header with Brain Visualization */}
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-4 mb-8 group">
            {/* 3D Brain Icon with Holographic Effect */}
            <div className="relative">
              <div className="flex aspect-square size-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                <Eye className="size-10 text-white relative z-10" />
              </div>
              {/* Orbital Rings */}
              <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-2 border border-purple-400/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
            </div>
            
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Observatório
              </h1>
              <p className="text-blue-300 text-sm font-light tracking-wide">Consciência Pessoal</p>
            </div>
          </div>

          {/* Cinematic Title Sequence */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Bem-vindo ao 
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                Futuro da Mente
              </span>
            </h2>
            
            <div className="max-w-4xl mx-auto text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              <p className="mb-4">
                Você está prestes a embarcar numa jornada através dos <span className="text-cyan-400 font-medium">corredores da sua consciência</span>
              </p>
              <p>
                Nossos <span className="text-purple-400 font-medium">7 assistentes neurais especializados</span> irão mapear cada aspecto da sua mente
              </p>
            </div>
          </div>
        </div>

        {/* Neural Network Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Cpu,
              title: "Processamento Neural",
              description: "7 IAs especializadas analisam padrões únicos do seu pensamento",
              color: "from-blue-500 to-cyan-600",
              delay: "0s"
            },
            {
              icon: Network,
              title: "Sinapses Digitais",
              description: "Conexões em tempo real entre suas conversas e insights profundos",
              color: "from-purple-500 to-pink-600",
              delay: "0.2s"
            },
            {
              icon: Waves,
              title: "Ondas Cerebrais",
              description: "Monitoramento contínuo da sua evolução emocional e cognitiva",
              color: "from-green-500 to-emerald-600",
              delay: "0.4s"
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-700 hover:scale-105 group"
              style={{ animationDelay: feature.delay }}
            >
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-700"></div>
                
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${feature.color} mb-6 relative`}>
                  <feature.icon className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Holographic CTA Section */}
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Button 
              onClick={handleStartJourney}
              size="lg" 
              className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-110 border-0"
            >
              <div className="flex items-center gap-3">
                <Atom className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                Inicializar Conexão Neural
                <Zap className="w-6 h-6" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setCurrentPhase(1)}
              variant="outline" 
              size="lg"
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-4 text-lg backdrop-blur-sm"
            >
              <Microscope className="w-5 h-5 mr-2" />
              Prévia Neural
            </Button>
            
            <Button 
              onClick={handleSkip}
              variant="ghost" 
              className="text-blue-300 hover:text-white hover:bg-white/5"
            >
              Pular sequência de inicialização
            </Button>
          </div>

          {/* Consciousness Level Indicators */}
          <div className="flex justify-center gap-3 mt-12">
            {['Alpha', 'Beta', 'Gamma', 'Delta'].map((wave, index) => (
              <Badge 
                key={wave} 
                variant="outline" 
                className="border-blue-400/30 text-blue-300 bg-black/20 backdrop-blur-sm px-4 py-2"
              >
                <Waves className="w-4 h-4 mr-2" />
                {wave}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Neural Preview Modal */}
      {currentPhase === 1 && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border border-cyan-400/30">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <h3 className="text-3xl font-bold text-white">Preview do Observatório Neural</h3>
                </div>
                <p className="text-blue-200 text-lg">
                  Veja como será sua experiência após a sincronização completa
                </p>
              </div>
              
              {/* Neural Dashboard Preview */}
              <div className="bg-black/30 rounded-xl p-8 mb-8 border border-blue-400/20">
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[
                    { metric: "Inteligência Emocional", value: "94%", color: "text-green-400" },
                    { metric: "Insights Neurais", value: "847", color: "text-blue-400" },
                    { metric: "Padrões Cognitivos", value: "23", color: "text-purple-400" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.metric}</div>
                    </div>
                  ))}
                </div>
                
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/30 mb-4">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Insight Ativo: Você demonstra padrões excepcionais de liderança estratégica
                </Badge>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleStartJourney} 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-8 py-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Inicializar Sistema
                </Button>
                <Button 
                  onClick={() => setCurrentPhase(0)} 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
