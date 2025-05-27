import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Lightbulb,
  Target,
  Trophy,
  Sparkles
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'metrics',
    title: 'Suas Métricas Principais',
    description: 'Aqui você vê um resumo do seu progresso em tempo real. Essas métricas são atualizadas a cada nova análise.',
    target: '[data-tour="metrics"]',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'areas',
    title: 'Mapa das Áreas da Vida',
    description: 'Visualize como você está evoluindo em diferentes aspectos: carreira, relacionamentos, saúde e mais.',
    target: '[data-tour="areas"]',
    position: 'top'
  },
  {
    id: 'emotional',
    title: 'Termômetro Emocional',
    description: 'Acompanhe suas variações emocionais ao longo do tempo e identifique padrões importantes.',
    target: '[data-tour="emotional"]',
    position: 'top'
  },
  {
    id: 'insights',
    title: 'Insights dos Assistentes',
    description: 'Seus assistentes IA especialistas geram insights personalizados baseados nas suas conversas.',
    target: '[data-tour="insights"]',
    position: 'top'
  },
  {
    id: 'ai-analysis',
    title: 'Análise por IA',
    description: 'Clique aqui para fazer upload de conversas e gerar novas análises. É aqui que a mágica acontece!',
    target: '[data-tour="ai-analysis"]',
    position: 'bottom',
    highlight: true
  }
];

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedTour({ onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateTooltipPosition = () => {
      const step = tourSteps[currentStep];
      const target = document.querySelector(step.target);
      
      if (target) {
        const rect = target.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 200;
        
        let x = rect.left + rect.width / 2 - tooltipWidth / 2;
        let y = rect.top;
        
        switch (step.position) {
          case 'bottom':
            y = rect.bottom + 10;
            break;
          case 'top':
            y = rect.top - tooltipHeight - 10;
            break;
          case 'left':
            x = rect.left - tooltipWidth - 10;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'right':
            x = rect.right + 10;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
        }
        
        // Keep tooltip in viewport
        x = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10));
        y = Math.max(10, Math.min(y, window.innerHeight - tooltipHeight - 10));
        
        setTooltipPosition({ x, y });
        
        // Highlight target element
        target.classList.add('tour-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    if (isVisible) {
      const timer = setTimeout(updateTooltipPosition, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    // Cleanup highlights when tour ends
    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, []);

  const handleNext = () => {
    // Remove highlight from current element
    const currentTarget = document.querySelector(tourSteps[currentStep].target);
    if (currentTarget) {
      currentTarget.classList.remove('tour-highlight');
    }

    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    // Remove highlight from current element
    const currentTarget = document.querySelector(tourSteps[currentStep].target);
    if (currentTarget) {
      currentTarget.classList.remove('tour-highlight');
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    // Remove all highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" />
      
      {/* Tooltip */}
      <div 
        className="fixed z-50 w-80"
        style={{ 
          left: tooltipPosition.x, 
          top: tooltipPosition.y,
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <Card className="bg-white shadow-2xl border-2 border-blue-200">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} de {tourSteps.length}
                </Badge>
              </div>
              <Button 
                onClick={handleSkip}
                variant="ghost" 
                size="sm"
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {step.highlight && <Sparkles className="w-4 h-4 text-yellow-500" />}
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                onClick={handlePrevious}
                variant="outline" 
                size="sm"
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Anterior
              </Button>

              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep ? 'bg-blue-500 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button 
                onClick={handleNext}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Trophy className="w-3 h-3" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </Button>
            </div>

            {/* Special CTA for last step */}
            {step.highlight && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center font-medium">
                  💡 Dica: Este é o coração da plataforma - onde você gera seus insights!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .tour-highlight::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #3B82F6;
          border-radius: 12px;
          animation: pulse 2s infinite;
          pointer-events: none;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
