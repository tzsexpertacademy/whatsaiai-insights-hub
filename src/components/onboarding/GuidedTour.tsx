
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Brain,
  Zap,
  Eye,
  Atom,
  Network,
  Waves,
  Cpu,
  Microscope
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  neuralType: 'cortex' | 'limbic' | 'frontal' | 'temporal' | 'occipital';
  brainWave: 'alpha' | 'beta' | 'gamma' | 'delta';
  insight: string;
}

const neuralSteps: TourStep[] = [
  {
    id: 'metrics',
    title: 'Córtex de Métricas Neurais',
    description: 'Esta região processa dados em tempo real sobre seu desenvolvimento cognitivo e emocional. Cada métrica representa uma sinapse ativa em seu crescimento.',
    target: '[data-tour="metrics"]',
    position: 'bottom',
    neuralType: 'cortex',
    brainWave: 'beta',
    insight: 'Atividade intensa detectada no córtex pré-frontal - indicativo de alta capacidade analítica.'
  },
  {
    id: 'areas',
    title: 'Mapeamento Límbico das Áreas Vitais',
    description: 'O sistema límbico processa suas emoções e memórias. Este mapa neural mostra como diferentes aspectos da vida se conectam em sua mente.',
    target: '[data-tour="areas"]',
    position: 'top',
    neuralType: 'limbic',
    brainWave: 'alpha',
    insight: 'Conexões sinápticas fortes entre carreira e realizacao pessoal identificadas.'
  },
  {
    id: 'emotional',
    title: 'Termômetro do Lobo Temporal',
    description: 'O lobo temporal processa suas variações emocionais. Este termômetro neural monitora flutuações em tempo real.',
    target: '[data-tour="emotional"]',
    position: 'top',
    neuralType: 'temporal',
    brainWave: 'gamma',
    insight: 'Padrões gamma detectados - estado de alta consciência emocional ativo.'
  },
  {
    id: 'insights',
    title: 'Central de Insights do Córtex Frontal',
    description: 'Aqui os 7 assistentes neurais depositam suas descobertas sobre sua personalidade. É como ter um laboratório de neurociência pessoal.',
    target: '[data-tour="insights"]',
    position: 'top',
    neuralType: 'frontal',
    brainWave: 'beta',
    insight: 'Atividade sincrônica entre múltiplas regiões cerebrais - indica processamento complexo.'
  },
  {
    id: 'ai-analysis',
    title: 'Portal de Sincronização Neural',
    description: 'Este é o portal onde suas conversas são transformadas em insights. Como um scanner de ressonância magnética para a personalidade.',
    target: '[data-tour="ai-analysis"]',
    position: 'bottom',
    neuralType: 'occipital',
    brainWave: 'delta',
    insight: 'Pronto para download de novas memórias e processamento neural profundo.'
  }
];

const brainWaveColors = {
  alpha: 'from-green-400 to-emerald-600',
  beta: 'from-blue-400 to-cyan-600', 
  gamma: 'from-purple-400 to-pink-600',
  delta: 'from-orange-400 to-red-600'
};

const neuralIcons = {
  cortex: Cpu,
  limbic: Brain,
  frontal: Eye,
  temporal: Waves,
  occipital: Network
};

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [neuralActivity, setNeuralActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTooltipPosition = () => {
      const step = neuralSteps[currentStep];
      const target = document.querySelector(step.target);
      
      if (target) {
        const rect = target.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 300;
        
        let x = rect.left + rect.width / 2 - tooltipWidth / 2;
        let y = rect.top;
        
        switch (step.position) {
          case 'bottom':
            y = rect.bottom + 20;
            break;
          case 'top':
            y = rect.top - tooltipHeight - 20;
            break;
          case 'left':
            x = rect.left - tooltipWidth - 20;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'right':
            x = rect.right + 20;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
        }
        
        x = Math.max(20, Math.min(x, window.innerWidth - tooltipWidth - 20));
        y = Math.max(20, Math.min(y, window.innerHeight - tooltipHeight - 20));
        
        setTooltipPosition({ x, y });
        
        target.classList.add('neural-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (isVisible) {
      const timer = setTimeout(updateTooltipPosition, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    return () => {
      document.querySelectorAll('.neural-highlight').forEach(el => {
        el.classList.remove('neural-highlight');
      });
    };
  }, []);

  const handleNext = () => {
    const currentTarget = document.querySelector(neuralSteps[currentStep].target);
    if (currentTarget) {
      currentTarget.classList.remove('neural-highlight');
    }

    if (currentStep < neuralSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    const currentTarget = document.querySelector(neuralSteps[currentStep].target);
    if (currentTarget) {
      currentTarget.classList.remove('neural-highlight');
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    document.querySelectorAll('.neural-highlight').forEach(el => {
      el.classList.remove('neural-highlight');
    });
    
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    document.querySelectorAll('.neural-highlight').forEach(el => {
      el.classList.remove('neural-highlight');
    });
    
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const step = neuralSteps[currentStep];
  const NeuralIcon = neuralIcons[step.neuralType];
  const waveColor = brainWaveColors[step.brainWave];

  return (
    <>
      {/* Neural Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40">
        {/* Animated Neural Background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Neural Interface Tooltip */}
      <div 
        className="fixed z-50 w-96"
        style={{ 
          left: tooltipPosition.x, 
          top: tooltipPosition.y,
          transform: 'translateZ(0)'
        }}
      >
        <Card className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-2 border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
          <CardContent className="p-6">
            {/* Neural Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${waveColor} rounded-full flex items-center justify-center relative overflow-hidden`}>
                  <NeuralIcon className="w-6 h-6 text-white relative z-10" />
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    style={{
                      transform: `translateX(${neuralActivity}%)`,
                      transition: 'transform 0.05s linear'
                    }}
                  />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-400 mb-1">
                    Ondas {step.brainWave.toUpperCase()} • {step.neuralType.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-gray-400">
                    Etapa {currentStep + 1} de {neuralSteps.length}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleSkip}
                variant="ghost" 
                size="sm"
                className="p-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-red-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Neural Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Atom className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                {step.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {step.description}
              </p>
              
              {/* Neural Insight */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Microscope className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">INSIGHT NEURAL</span>
                </div>
                <p className="text-xs text-gray-300">{step.insight}</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                onClick={handlePrevious}
                variant="outline" 
                size="sm"
                disabled={currentStep === 0}
                className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-30"
              >
                <ArrowLeft className="w-3 h-3" />
                Anterior
              </Button>

              {/* Neural Progress */}
              <div className="flex gap-2">
                {neuralSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === currentStep 
                        ? `w-8 bg-gradient-to-r ${waveColor}` 
                        : index < currentStep
                        ? 'w-2 bg-cyan-400'
                        : 'w-2 bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext}
                size="sm"
                className={`bg-gradient-to-r ${waveColor} hover:opacity-90 flex items-center gap-2 border-0`}
              >
                {currentStep === neuralSteps.length - 1 ? (
                  <>
                    <Brain className="w-3 h-3" />
                    Sincronizar
                  </>
                ) : (
                  <>
                    Explorar
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </Button>
            </div>

            {/* Neural Activity Monitor */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Atividade Neural:</span>
                <span className="text-cyan-400">{Math.round(neuralActivity)}% processado</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${waveColor} transition-all duration-75`}
                  style={{ width: `${neuralActivity}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .neural-highlight {
          position: relative !important;
          z-index: 45 !important;
          box-shadow: 
            0 0 0 4px rgba(6, 182, 212, 0.5),
            0 0 20px rgba(6, 182, 212, 0.3),
            0 0 40px rgba(6, 182, 212, 0.1) !important;
          border-radius: 12px !important;
          transition: all 0.5s ease !important;
        }
        
        .neural-highlight::after {
          content: '';
          position: absolute;
          inset: -6px;
          border: 2px solid #06B6D4;
          border-radius: 16px;
          animation: neuralPulse 2s infinite;
          pointer-events: none;
        }
        
        @keyframes neuralPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}
