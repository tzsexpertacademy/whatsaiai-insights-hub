
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useParallax } from '@/hooks/useParallax';
import { CursorEffect } from '@/components/effects/CursorEffect';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Eye, 
  Zap, 
  Target, 
  TrendingUp, 
  Compass, 
  Sparkles,
  ArrowRight,
  Users,
  Star,
  Quote,
  Activity,
  Map,
  BarChart3,
  Calendar,
  Lightbulb,
  Search,
  Flame,
  Rocket,
  Shield,
  Clock,
  Play,
  CircuitBoard,
  Scan,
  Network
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();

  // Animação de rede neural mais sofisticada
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar nós da rede neural
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, index) => {
        // Movimento suave
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        // Rebater nas bordas
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Manter dentro dos limites
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Pulso do nó
        const intensity = (Math.sin(node.pulse) + 1) * 0.5;
        const alpha = 0.3 + intensity * 0.4;

        // Desenhar nó com glow suave
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(139, 92, 246, ${alpha})`;
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Conectar nós próximos
        nodes.forEach((otherNode, otherIndex) => {
          if (index !== otherIndex) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
              const connectionAlpha = (1 - distance / 150) * 0.15;
              ctx.strokeStyle = `rgba(59, 130, 246, ${connectionAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleActivateYumerMind = () => {
    console.log('🧠 Ativando YumerMind', { isAuthenticated });
    
    if (isAuthenticated) {
      toast({
        title: "Bem-vindo de volta ao YumerMind!",
        description: "Redirecionando para seu segundo cérebro...",
        duration: 2000
      });
      navigate('/dashboard');
    } else {
      console.log('🎯 Redirecionando para cadastro do YumerMind');
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Termômetro Emocional",
      description: "Seus estados emocionais mapeados em tempo real"
    },
    {
      icon: Compass,
      title: "Radar de Áreas da Vida", 
      description: "Visualize onde você está forte e onde precisa evoluir"
    },
    {
      icon: Brain,
      title: "Mapeador de Padrões Cognitivos",
      description: "Descubra seus loops mentais e crenças limitantes"
    },
    {
      icon: Calendar,
      title: "Linha do Tempo de Consciência",
      description: "Acompanhe sua jornada de autoconhecimento"
    }
  ];

  const processSteps = [
    {
      number: "1",
      title: "Você se expressa.",
      description: "Fala, escreve, pergunta, desabafa.",
      icon: Users
    },
    {
      number: "2", 
      title: "Ele observa.",
      description: "Lê seus padrões, detecta ciclos invisíveis, cruza áreas da vida.",
      icon: Search
    },
    {
      number: "3",
      title: "Você vê.", 
      description: "A verdade. Suas forças. Suas fugas. Seus caminhos. Em tempo real.",
      icon: Eye
    }
  ];

  const benefits = [
    { icon: Brain, title: "Clareza mental", description: "Veja seus pensamentos com nitidez" },
    { icon: Compass, title: "Autoconhecimento em tempo real", description: "Insights instantâneos sobre si mesmo" },
    { icon: Flame, title: "Expansão emocional", description: "Desenvolva sua inteligência emocional" },
    { icon: TrendingUp, title: "Plano de evolução pessoal contínua", description: "Crescimento constante e direcionado" },
    { icon: Target, title: "Foco, propósito e visão", description: "Clareza sobre seus objetivos de vida" }
  ];

  const testimonials = [
    {
      text: "Nunca imaginei que ver minha mente assim seria tão brutal. E tão libertador.",
      author: "Ana, 34 anos"
    },
    {
      text: "Parece que alguém me escutou de verdade — e me mostrou o que eu não via.",
      author: "Carlos, 28 anos"
    },
    {
      text: "É como ter um espelho da alma. Assustador e necessário ao mesmo tempo.",
      author: "Marina, 41 anos"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CursorEffect />
      
      {/* Canvas de rede neural com parallax */}
      <canvas
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 1) 100%)',
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      {/* Seção 1 - O IMPACTO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 z-10">
        <div className="text-center max-w-6xl mx-auto w-full">
          {/* Glow neural central */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl opacity-60" 
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          
          <div className="relative z-10">
            <ScrollReveal id="hero-badge" direction="scale" delay={200}>
              <Badge className="mb-8 sm:mb-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30 px-4 sm:px-6 py-2 sm:py-2 text-xs sm:text-sm backdrop-blur-sm hover:bg-purple-500/20 transition-all">
                <CircuitBoard className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                YumerMind - O segundo cérebro do ser humano
              </Badge>
            </ScrollReveal>

            <ScrollReveal id="hero-title" direction="up" delay={400}>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-light mb-8 sm:mb-12 leading-tight tracking-wide">
                <span className="block text-white mb-2 sm:mb-4 font-extralight">O que você não vê...</span>
                <span className="block text-red-400 glow-text-neural">te controla.</span>
                <span className="block text-white mb-2 sm:mb-4 mt-6 sm:mt-8 font-extralight">O que você vê...</span>
                <span className="block text-emerald-400 glow-text-neural">te liberta.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal id="hero-subtitle" direction="up" delay={600}>
              <div className="mb-12 sm:mb-16 space-y-4 sm:space-y-6">
                <p className="text-xl sm:text-3xl md:text-4xl font-light text-white px-2">
                  Ative seu segundo cérebro.
                </p>
                <p className="text-lg sm:text-2xl md:text-3xl text-blue-300 font-light px-2">
                  Veja padrões, emoções, forças e sombras que você nunca percebeu.
                </p>
                <p className="text-base sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4 font-light">
                  Acesse agora o Observatório da sua própria mente.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal id="hero-buttons" direction="up" delay={800}>
              <div className="flex flex-col gap-4 sm:gap-8 justify-center items-center mb-8 sm:mb-12 px-4">
                <Button 
                  onClick={handleActivateYumerMind}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 sm:px-16 py-6 sm:py-8 text-lg sm:text-2xl font-medium rounded-2xl shadow-2xl shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm glow-button-neural group transform hover:scale-105 transition-all duration-500"
                >
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-4 group-hover:rotate-12 transition-transform" />
                  <div className="text-center">
                    <div className="font-bold">
                      {isAuthenticated ? 'ACESSAR MEU YUMERMIND' : 'ATIVAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                    </div>
                    {!isAuthenticated && (
                      <div className="text-sm sm:text-base font-normal opacity-90">
                        Depois, apenas R$ 47/mês. Sem contrato. Cancele quando quiser.
                      </div>
                    )}
                  </div>
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 ml-2 sm:ml-4 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Seção 2 - O QUE É O YUMERMIND */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal id="features-title" direction="up">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-light mb-6 sm:mb-8 text-white leading-tight">
                Você nunca teve acesso a isso.
                <br />
                <span className="text-purple-400 glow-text-neural">Até agora.</span>
              </h2>
              
              <div className="text-lg sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed px-4 space-y-4">
                <p>O YumerMind lê o que você escreve, sente, pergunta.</p>
                <p>Ele analisa seus padrões emocionais, mentais e comportamentais.</p>
                <p className="text-cyan-400 font-light">E transforma isso em um painel vivo da sua mente.</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} id={`feature-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-700 hover:scale-105 group glow-card-neural">
                  <CardContent className="p-4 sm:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base font-light">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - COMO FUNCIONA */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal id="process-title" direction="scale">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-light text-center mb-12 sm:mb-20 text-white">
              Como funciona seu <span className="bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent glow-text-neural">segundo cérebro?</span>
            </h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-16">
            {processSteps.map((step, index) => (
              <ScrollReveal key={index} id={`step-${index}`} direction="up" delay={index * 300}>
                <div className="text-center group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center text-3xl sm:text-5xl font-light text-white group-hover:scale-110 transition-transform duration-700 border border-purple-500/30 backdrop-blur-sm">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-purple-400/30">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-medium text-white mb-4 sm:mb-6">{step.title}</h3>
                  <p className="text-gray-400 text-base sm:text-lg leading-relaxed px-2 font-light">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 4 - BENEFÍCIOS REAIS */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal id="benefits-title" direction="up">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-light text-center mb-12 sm:mb-20 text-white leading-tight">
              Por que ativar seu <span className="text-cyan-400 glow-text-neural">YumerMind?</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} id={`benefit-${index}`} direction="up" delay={index * 150}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:scale-105 group glow-card-neural cursor-pointer">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform border border-purple-400/30">
                        <benefit.icon className="w-6 h-6 text-purple-300" />
                      </div>
                      <h3 className="text-xl font-medium text-white">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 - DEPOIMENTOS */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal id="testimonials-title" direction="up">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-light text-center mb-12 sm:mb-20 text-white leading-tight">
              O que dizem as mentes que já
              <br />
              <span className="text-emerald-400 glow-text-neural">se viram por dentro?</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} id={`testimonial-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:scale-105 group glow-card-neural">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <Quote className="w-8 h-8 text-purple-400 mx-auto mb-4 opacity-60" />
                    <p className="text-lg sm:text-xl text-gray-300 mb-6 font-light italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <p className="text-purple-400 font-medium">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 6 - CTA FINAL */}
      <section className="relative py-20 sm:py-40 px-4 sm:px-6 z-10 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          {/* Cérebro neural pulsando no fundo */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl glow-pulse-neural opacity-40" 
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          
          <div className="relative z-10">
            <ScrollReveal id="final-cta-title" direction="scale" delay={200}>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-light mb-8 sm:mb-12 leading-tight">
                <span className="block text-white mb-4 sm:mb-6">Você olha pra todo mundo.</span>
                <span className="block text-white mb-4 sm:mb-6">Mas nunca olhou pra si assim.</span>
                <span className="block text-purple-400 glow-text-neural mt-6 sm:mt-8">O YumerMind é o espelho mais honesto que você já viu.</span>
                <span className="block text-cyan-400 glow-text-neural mt-4 sm:mt-6">E ele está pronto. Agora.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal id="final-cta-button" direction="up" delay={600}>
              <Button 
                onClick={handleActivateYumerMind}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 sm:px-20 py-8 sm:py-12 text-xl sm:text-3xl font-medium rounded-3xl shadow-2xl shadow-purple-500/40 border-2 border-purple-400/30 backdrop-blur-sm glow-button-neural group transform hover:scale-110 transition-all duration-700 mb-6 sm:mb-8"
              >
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 mr-4 sm:mr-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="text-center">
                  <div className="font-bold">
                    {isAuthenticated ? 'ACESSAR MEU YUMERMIND AGORA' : 'ACESSAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                  </div>
                  {!isAuthenticated && (
                    <div className="text-lg sm:text-xl font-normal opacity-90">
                      Depois, apenas R$ 47/mês. Sem enrolação. Sem obrigações.
                    </div>
                  )}
                </div>
                <Network className="w-8 h-8 sm:w-10 sm:h-10 ml-4 sm:ml-6 group-hover:scale-110 transition-transform duration-500" />
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Estilos CSS customizados para a estética neural */}
      <style>{`
        .glow-text-neural {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
        }
        
        .glow-button-neural {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(79, 70, 229, 0.2), 0 0 60px rgba(147, 51, 234, 0.1);
        }
        
        .glow-button-neural:hover {
          box-shadow: 0 0 30px rgba(147, 51, 234, 0.5), 0 0 60px rgba(79, 70, 229, 0.3), 0 0 90px rgba(147, 51, 234, 0.2);
        }
        
        .glow-card-neural {
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.1), 0 0 30px rgba(79, 70, 229, 0.05);
        }
        
        .glow-card-neural:hover {
          box-shadow: 0 0 25px rgba(147, 51, 234, 0.2), 0 0 50px rgba(79, 70, 229, 0.1);
        }
        
        .glow-pulse-neural {
          animation: pulse-glow-neural 6s ease-in-out infinite;
        }
        
        @keyframes pulse-glow-neural {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        
        @media (max-width: 768px) {
          .glow-text-neural {
            text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
          }
          
          .glow-button-neural {
            box-shadow: 0 0 15px rgba(147, 51, 234, 0.3), 0 0 30px rgba(79, 70, 229, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
