
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
  const brainCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();

  // Animação de cérebro neural épica
  useEffect(() => {
    const canvas = brainCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
      type: 'neuron' | 'synapse';
      connections: number[];
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar rede neural em formato de cérebro
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const brainWidth = Math.min(canvas.width * 0.6, 800);
    const brainHeight = Math.min(canvas.height * 0.4, 400);

    // Criar neurônios principais (formato cerebral)
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const radiusX = brainWidth / 2 * (0.3 + Math.random() * 0.7);
      const radiusY = brainHeight / 2 * (0.3 + Math.random() * 0.7);
      
      // Distribuição em formato de cérebro (duas metades)
      const hemisphere = i < 40 ? -1 : 1;
      const x = centerX + hemisphere * radiusX * Math.cos(angle) * 0.8;
      const y = centerY + radiusY * Math.sin(angle) * 0.6;
      
      nodes.push({
        x,
        y,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.1,
        size: 2 + Math.random() * 4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        type: 'neuron',
        connections: []
      });
    }

    // Adicionar sinapses (conexões)
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: centerX + (Math.random() - 0.5) * brainWidth,
        y: centerY + (Math.random() - 0.5) * brainHeight,
        z: Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.05,
        size: 1 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        type: 'synapse',
        connections: []
      });
    }

    // Conectar neurônios próximos
    nodes.forEach((node, index) => {
      const connections: number[] = [];
      nodes.forEach((otherNode, otherIndex) => {
        if (index !== otherIndex) {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120 && connections.length < 3) {
            connections.push(otherIndex);
          }
        }
      });
      node.connections = connections;
    });

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.016;
      
      // Fundo com degradê neural
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ondas cerebrais de fundo
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const waveY = centerY + Math.sin(animationTime * 2 + i) * 20;
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= canvas.width; x += 20) {
          const y = waveY + Math.sin((x / 50) + animationTime * 3 + i) * 15;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      nodes.forEach((node, index) => {
        // Movimento orgânico
        node.x += node.vx * Math.sin(animationTime + index * 0.1);
        node.y += node.vy * Math.cos(animationTime + index * 0.1);
        node.z += node.vz;
        node.pulse += node.pulseSpeed;

        // Manter dentro dos limites cerebrais
        const distFromCenter = Math.sqrt(
          Math.pow(node.x - centerX, 2) + Math.pow(node.y - centerY, 2)
        );
        if (distFromCenter > brainWidth / 2) {
          node.vx *= -0.5;
          node.vy *= -0.5;
        }

        // Efeito 3D baseado em Z
        const scale = 0.5 + (node.z / 100) * 0.5;
        const alpha = 0.3 + (node.z / 100) * 0.7;

        // Pulso neural
        const intensity = (Math.sin(node.pulse) + 1) * 0.5;
        const nodeAlpha = alpha * (0.4 + intensity * 0.6);

        // Cor baseada no tipo
        const color = node.type === 'neuron' 
          ? `rgba(139, 92, 246, ${nodeAlpha})` 
          : `rgba(59, 130, 246, ${nodeAlpha})`;

        // Desenhar conexões com efeito elétrico
        node.connections.forEach(connectionIndex => {
          const otherNode = nodes[connectionIndex];
          if (!otherNode) return;

          const connectionIntensity = Math.sin(animationTime * 4 + index * 0.5) * 0.5 + 0.5;
          const connectionAlpha = 0.1 + connectionIntensity * 0.3;
          
          // Gradiente nas conexões
          const gradient = ctx.createLinearGradient(
            node.x, node.y, otherNode.x, otherNode.y
          );
          gradient.addColorStop(0, `rgba(139, 92, 246, ${connectionAlpha})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${connectionAlpha * 1.5})`);
          gradient.addColorStop(1, `rgba(34, 197, 94, ${connectionAlpha})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + connectionIntensity * 2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(otherNode.x, otherNode.y);
          ctx.stroke();

          // Pulsos elétricos nas conexões
          if (connectionIntensity > 0.8) {
            const pulseX = node.x + (otherNode.x - node.x) * (animationTime % 1);
            const pulseY = node.y + (otherNode.y - node.y) * (animationTime % 1);
            
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
            ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Desenhar neurônio com glow
        ctx.shadowBlur = 20 * scale;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante
        if (node.type === 'neuron') {
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * scale * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
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
      
      {/* Canvas de cérebro neural épico */}
      <canvas
        ref={brainCanvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      />

      {/* Seção 1 - O IMPACTO ÉPICO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 z-10">
        <div className="text-center max-w-7xl mx-auto w-full">
          <div className="relative z-10">
            <ScrollReveal id="hero-badge" direction="scale" delay={200}>
              <Badge className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-200 border border-purple-400/40 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base backdrop-blur-sm hover:bg-purple-500/30 transition-all glow-badge">
                <CircuitBoard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                YumerMind - O segundo cérebro do ser humano
              </Badge>
            </ScrollReveal>

            <ScrollReveal id="hero-title" direction="up" delay={400}>
              <div className="mb-8 sm:mb-12">
                {/* Primeira frase com MUITO mais destaque */}
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight mb-4 sm:mb-6 leading-[0.9] tracking-tight">
                  <span className="block text-white mb-2 sm:mb-4 transform hover:scale-105 transition-transform duration-700">
                    O que você 
                    <span className="italic text-red-400 font-light glow-text-epic"> não vê</span>...
                  </span>
                  <span className="block text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-bold text-red-500 glow-text-mega mb-6 sm:mb-8 transform hover:scale-110 transition-all duration-500 animate-pulse-slow">
                    te controla.
                  </span>
                </h1>
                
                <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight mb-2 sm:mb-4 leading-[0.9] tracking-tight">
                  <span className="block text-white mb-2 sm:mb-4 transform hover:scale-105 transition-transform duration-700">
                    O que você 
                    <span className="italic text-emerald-400 font-light glow-text-epic"> vê</span>...
                  </span>
                  <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[11rem] font-bold text-emerald-400 glow-text-mega transform hover:scale-110 transition-all duration-500">
                    te liberta.
                  </span>
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal id="hero-subtitle" direction="up" delay={600}>
              <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
                <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light text-white leading-tight">
                  Ative seu <span className="text-purple-400 font-medium glow-text">segundo cérebro</span>.
                </p>
                <p className="text-lg sm:text-xl md:text-3xl lg:text-4xl text-blue-300 font-light leading-relaxed">
                  Veja padrões, emoções, forças e sombras que você nunca percebeu.
                </p>
                <p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-gray-300 max-w-5xl mx-auto font-light leading-relaxed">
                  Acesse agora o <span className="text-cyan-400 glow-text">Observatório</span> da sua própria mente.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal id="hero-buttons" direction="up" delay={800}>
              <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12">
                <Button 
                  onClick={handleActivateYumerMind}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-6 sm:px-12 md:px-16 py-4 sm:py-6 md:py-8 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/40 border-2 border-purple-400/50 backdrop-blur-sm glow-button-epic group transform hover:scale-105 transition-all duration-700 max-w-4xl"
                >
                  <Brain className="w-5 h-5 sm:w-6 h-6 md:w-8 md:h-8 mr-2 sm:mr-4 group-hover:rotate-12 transition-transform duration-500" />
                  <div className="text-center leading-tight">
                    <div className="font-black tracking-wide">
                      {isAuthenticated ? 'ACESSAR MEU YUMERMIND' : 'ATIVAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                    </div>
                    {!isAuthenticated && (
                      <div className="text-sm sm:text-base md:text-lg font-normal opacity-90 mt-1">
                        Depois, apenas R$ 47/mês. Sem contrato. Cancele quando quiser.
                      </div>
                    )}
                  </div>
                  <Sparkles className="w-5 h-5 sm:w-6 h-6 md:w-8 md:h-8 ml-2 sm:ml-4 group-hover:scale-110 transition-transform duration-500" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Seção 2 - O QUE É O YUMERMIND */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal id="features-title" direction="up">
            <div className="text-center mb-8 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light mb-4 sm:mb-6 md:mb-8 text-white leading-tight">
                Você nunca teve acesso a isso.
                <br />
                <span className="text-purple-400 glow-text-neural font-medium">Até agora.</span>
              </h2>
              
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 sm:mb-8 md:mb-12 max-w-5xl mx-auto leading-relaxed space-y-2 sm:space-y-3 md:space-y-4">
                <p>O YumerMind lê o que você escreve, sente, pergunta.</p>
                <p>Ele analisa seus padrões emocionais, mentais e comportamentais.</p>
                <p className="text-cyan-400 font-light glow-text">E transforma isso em um painel vivo da sua mente.</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={index} id={`feature-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-700 hover:scale-105 group glow-card-neural">
                  <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-300" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2 sm:mb-3 md:mb-4">{feature.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base font-light">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - COMO FUNCIONA */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal id="process-title" direction="scale">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-center mb-8 sm:mb-16 md:mb-20 text-white">
              Como funciona seu <span className="bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent glow-text-neural">segundo cérebro?</span>
            </h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 md:gap-16">
            {processSteps.map((step, index) => (
              <ScrollReveal key={index} id={`step-${index}`} direction="up" delay={index * 300}>
                <div className="text-center group">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-light text-white group-hover:scale-110 transition-transform duration-700 border border-purple-500/30 backdrop-blur-sm">
                    {step.number}
                  </div>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-purple-400/30">
                    <step.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-300" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-3 sm:mb-4 md:mb-6">{step.title}</h3>
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-light">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 4 - BENEFÍCIOS REAIS */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal id="benefits-title" direction="up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-center mb-8 sm:mb-16 md:mb-20 text-white leading-tight">
              Por que ativar seu <span className="text-cyan-400 glow-text-neural">YumerMind?</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} id={`benefit-${index}`} direction="up" delay={index * 150}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:scale-105 group glow-card-neural cursor-pointer">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform border border-purple-400/30">
                        <benefit.icon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-medium text-white">{benefit.title}</h3>
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
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal id="testimonials-title" direction="up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-center mb-8 sm:mb-16 md:mb-20 text-white leading-tight">
              O que dizem as mentes que já
              <br />
              <span className="text-emerald-400 glow-text-neural">se viram por dentro?</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={index} id={`testimonial-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:scale-105 group glow-card-neural">
                  <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                    <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-3 sm:mb-4 opacity-60" />
                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6 font-light italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <p className="text-purple-400 font-medium text-sm sm:text-base">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 6 - CTA FINAL */}
      <section className="relative py-16 sm:py-32 md:py-40 px-4 sm:px-6 z-10 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="relative z-10">
            <ScrollReveal id="final-cta-title" direction="scale" delay={200}>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-6 sm:mb-8 md:mb-12 leading-tight">
                <span className="block text-white mb-3 sm:mb-4 md:mb-6">Você olha pra todo mundo.</span>
                <span className="block text-white mb-3 sm:mb-4 md:mb-6">Mas nunca olhou pra si assim.</span>
                <span className="block text-purple-400 glow-text-neural mt-4 sm:mt-6 md:mt-8 font-medium">O YumerMind é o espelho mais honesto que você já viu.</span>
                <span className="block text-cyan-400 glow-text-neural mt-3 sm:mt-4 md:mt-6 font-medium">E ele está pronto. Agora.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal id="final-cta-button" direction="up" delay={600}>
              <Button 
                onClick={handleActivateYumerMind}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-8 sm:px-16 md:px-20 py-6 sm:py-8 md:py-12 text-lg sm:text-xl md:text-3xl font-bold rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-500/50 border-2 border-purple-400/50 backdrop-blur-sm glow-button-epic group transform hover:scale-110 transition-all duration-700 mb-4 sm:mb-6 md:mb-8 max-w-5xl"
              >
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-3 sm:mr-4 md:mr-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="text-center leading-tight">
                  <div className="font-black tracking-wide">
                    {isAuthenticated ? 'ACESSAR MEU YUMERMIND AGORA' : 'ACESSAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                  </div>
                  {!isAuthenticated && (
                    <div className="text-base sm:text-lg md:text-xl font-normal opacity-90 mt-1">
                      Depois, apenas R$ 47/mês. Sem enrolação. Sem obrigações.
                    </div>
                  )}
                </div>
                <Network className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-3 sm:ml-4 md:ml-6 group-hover:scale-110 transition-transform duration-500" />
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Estilos CSS customizados para a estética neural épica */}
      <style>{`
        .glow-text-epic {
          text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor;
        }
        
        .glow-text-mega {
          text-shadow: 
            0 0 20px currentColor, 
            0 0 40px currentColor, 
            0 0 80px currentColor,
            0 0 120px currentColor,
            0 0 160px rgba(239, 68, 68, 0.5);
          filter: drop-shadow(0 0 30px currentColor);
        }
        
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        
        .glow-text-neural {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
        }
        
        .glow-button-epic {
          box-shadow: 
            0 0 30px rgba(147, 51, 234, 0.4), 
            0 0 60px rgba(79, 70, 229, 0.3), 
            0 0 90px rgba(147, 51, 234, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
        }
        
        .glow-button-epic:hover {
          box-shadow: 
            0 0 40px rgba(147, 51, 234, 0.6), 
            0 0 80px rgba(79, 70, 229, 0.4), 
            0 0 120px rgba(147, 51, 234, 0.3),
            inset 0 0 40px rgba(255, 255, 255, 0.2);
        }
        
        .glow-card-neural {
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.1), 0 0 30px rgba(79, 70, 229, 0.05);
        }
        
        .glow-card-neural:hover {
          box-shadow: 0 0 25px rgba(147, 51, 234, 0.2), 0 0 50px rgba(79, 70, 229, 0.1);
        }
        
        .glow-badge {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.7;
          }
        }
        
        /* Responsividade melhorada */
        @media (max-width: 640px) {
          .glow-text-mega {
            text-shadow: 
              0 0 10px currentColor, 
              0 0 20px currentColor, 
              0 0 40px currentColor;
          }
          
          .glow-text-epic {
            text-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
          }
          
          .glow-button-epic {
            box-shadow: 
              0 0 20px rgba(147, 51, 234, 0.4), 
              0 0 40px rgba(79, 70, 229, 0.3);
          }
        }
        
        /* Animação suave para elementos que entram na tela */
        @media (prefers-reduced-motion: no-preference) {
          * {
            scroll-behavior: smooth;
          }
        }
      `}</style>
    </div>
  );
}
