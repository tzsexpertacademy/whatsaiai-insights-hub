import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useParallax } from '@/hooks/useParallax';
import { CursorEffect } from '@/components/effects/CursorEffect';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { BrainAnimation } from '@/components/effects/BrainAnimation';
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
  Network,
  Volume2,
  VolumeX
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [showBrainAnimation, setShowBrainAnimation] = React.useState(true);
  const [showContent, setShowContent] = React.useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEffectsRef = useRef<{
    ambient?: OscillatorNode;
    hover?: () => void;
    click?: () => void;
  }>({});

  // Função para pular a animação (para debug ou usuários que querem ir direto)
  const skipAnimation = () => {
    console.log('⏭️ Pulando animação do cérebro');
    setShowBrainAnimation(false);
    setShowContent(true);
  };

  // Controlar sequência da animação
  const handleBrainAnimationComplete = () => {
    console.log('🧠 Animação do cérebro completa, mostrando conteúdo em 2 segundos');
    setTimeout(() => {
      setShowBrainAnimation(false);
      setTimeout(() => {
        setShowContent(true);
        console.log('✅ Conteúdo da página exibido');
      }, 500);
    }, 2000);
  };

  // Inicializar conteúdo após um tempo máximo (fallback)
  useEffect(() => {
    const maxWaitTime = 10000; // 10 segundos máximo
    const timer = setTimeout(() => {
      if (!showContent) {
        console.log('⏰ Timeout da animação, forçando exibição do conteúdo');
        setShowBrainAnimation(false);
        setShowContent(true);
      }
    }, maxWaitTime);

    return () => clearTimeout(timer);
  }, [showContent]);

  // Sistema de áudio épico e imersivo
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Som ambiente neural (frequências binaurais)
      const createAmbientSound = () => {
        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator1.frequency.setValueAtTime(40, ctx.currentTime); // Frequência base
        oscillator2.frequency.setValueAtTime(40.5, ctx.currentTime); // Leve batimento binaural
        
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator1.start();
        oscillator2.start();
        
        return { oscillator1, oscillator2, gainNode };
      };

      // Efeito sonoro de hover
      const createHoverSound = () => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
      };

      // Efeito sonoro de click
      const createClickSound = () => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
      };

      soundEffectsRef.current = {
        hover: createHoverSound,
        click: createClickSound
      };

      if (soundEnabled) {
        const ambient = createAmbientSound();
        soundEffectsRef.current.ambient = ambient.oscillator1;
      }
    };

    if (soundEnabled) {
      initAudio();
    }

    return () => {
      if (soundEffectsRef.current.ambient) {
        soundEffectsRef.current.ambient.stop();
      }
    };
  }, [soundEnabled]);

  // Animação neural de fundo (versão anterior mais simples)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Pontos neurais
    const neurons: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      intensity: number;
      connections: number[];
    }> = [];

    // Criar neurônios
    for (let i = 0; i < 80; i++) {
      neurons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        intensity: Math.random(),
        connections: []
      });
    }

    // Conectar neurônios próximos
    neurons.forEach((neuron, index) => {
      const connections: number[] = [];
      neurons.forEach((otherNeuron, otherIndex) => {
        if (index !== otherIndex && connections.length < 3) {
          const dx = neuron.x - otherNeuron.x;
          const dy = neuron.y - otherNeuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            connections.push(otherIndex);
          }
        }
      });
      neuron.connections = connections;
    });

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.016;
      
      // Fundo escuro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar neurônios
      neurons.forEach(neuron => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.intensity += (Math.random() - 0.5) * 0.02;
        neuron.intensity = Math.max(0, Math.min(1, neuron.intensity));

        // Manter dentro da tela
        if (neuron.x < 0 || neuron.x > canvas.width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > canvas.height) neuron.vy *= -1;
      });

      // Renderizar conexões
      neurons.forEach(neuron => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neurons[connectionIndex];
          if (!otherNeuron) return;

          const alpha = (neuron.intensity + otherNeuron.intensity) * 0.3;
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(otherNeuron.x, otherNeuron.y);
          ctx.stroke();
        });
      });

      // Renderizar neurônios
      neurons.forEach(neuron => {
        const pulseIntensity = (Math.sin(animationTime * 2 + neuron.x * 0.01) + 1) * 0.5;
        const totalIntensity = (neuron.intensity + pulseIntensity) * 0.5;

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
        ctx.fillStyle = `rgba(139, 92, 246, ${totalIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 3 + totalIntensity * 2, 0, Math.PI * 2);
        ctx.fill();
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
    
    if (soundEnabled && soundEffectsRef.current.click) {
      soundEffectsRef.current.click();
    }
    
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

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (soundEnabled && audioContextRef.current) {
      audioContextRef.current.suspend();
    } else if (audioContextRef.current) {
      audioContextRef.current.resume();
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
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <CursorEffect />
      
      {/* Animação do cérebro neural */}
      {showBrainAnimation && (
        <div className="relative z-30">
          <BrainAnimation 
            onAnimationComplete={handleBrainAnimationComplete}
            soundEnabled={soundEnabled}
          />
          
          {/* Botão para pular animação */}
          <button
            onClick={skipAnimation}
            className="fixed bottom-8 right-8 z-50 bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 hover:bg-purple-500/20 transition-all text-purple-400 text-sm"
          >
            Pular animação →
          </button>
        </div>
      )}
      
      {/* Controle de som */}
      <button
        onClick={handleSoundToggle}
        className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-full p-3 hover:bg-purple-500/20 transition-all group"
        onMouseEnter={() => {
          if (soundEnabled && soundEffectsRef.current.hover) {
            soundEffectsRef.current.hover();
          }
        }}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {/* Canvas neural simples (mantém o fundo) */}
      {showContent && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 w-full h-full"
          style={{ 
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
      )}

      {/* Conteúdo principal - só aparece após animação do cérebro */}
      {showContent && (
        <div className="animate-fade-in">
          {/* Seção 1 - O IMPACTO ÉPICO */}
          <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 z-10">
            <div className="text-center max-w-7xl mx-auto w-full">
              <div className="relative z-10">
                <ScrollReveal id="hero-badge" direction="scale" delay={200}>
                  <Badge className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-purple-200 border border-purple-400/50 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base backdrop-blur-sm hover:bg-purple-500/40 transition-all glow-badge">
                    <CircuitBoard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    YumerMind - O segundo cérebro do ser humano
                  </Badge>
                </ScrollReveal>

                <ScrollReveal id="hero-title" direction="up" delay={400}>
                  <div className="mb-8 sm:mb-12">
                    {/* Primeira frase com MUITO mais destaque */}
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-extralight mb-4 sm:mb-6 leading-[0.85] tracking-tight">
                      <span className="block text-white mb-2 sm:mb-4 transform hover:scale-105 transition-transform duration-700">
                        O que você 
                        <span className="italic text-red-400 font-light glow-text-mega"> não vê</span>...
                      </span>
                      <span className="block text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[15rem] font-bold text-red-500 glow-text-apocalypse mb-6 sm:mb-8 transform hover:scale-110 transition-all duration-500 animate-pulse-slow drop-shadow-2xl">
                        te controla.
                      </span>
                    </h1>
                    
                    <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight mb-2 sm:mb-4 leading-[0.85] tracking-tight">
                      <span className="block text-white mb-2 sm:mb-4 transform hover:scale-105 transition-transform duration-700">
                        O que você 
                        <span className="italic text-emerald-400 font-light glow-text-mega"> vê</span>...
                      </span>
                      <span className="block text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] xl:text-[14rem] font-bold text-emerald-400 glow-text-liberation transform hover:scale-110 transition-all duration-500">
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
                      onMouseEnter={() => {
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                      className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-8 sm:px-16 md:px-20 py-6 sm:py-8 md:py-10 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black rounded-3xl sm:rounded-4xl shadow-2xl shadow-purple-500/50 border-3 border-purple-400/50 backdrop-blur-sm glow-button-apocalypse group transform hover:scale-110 transition-all duration-700 max-w-4xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000"
                    >
                      <Brain className="w-8 h-8 sm:w-10 h-10 md:w-12 md:h-12 mr-4 sm:mr-6 group-hover:rotate-12 transition-transform duration-500 drop-shadow-lg" />
                      <div className="text-center leading-tight relative z-10">
                        <div className="font-black tracking-wide drop-shadow-lg">
                          {isAuthenticated ? 'ACESSAR MEU YUMERMIND' : 'ATIVAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                        </div>
                      </div>
                      <Sparkles className="w-8 h-8 sm:w-10 h-10 md:w-12 md:h-12 ml-4 sm:ml-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-light max-w-3xl leading-relaxed bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-600/20">
                        Depois, apenas <span className="text-green-400 font-medium glow-text">R$ 47/mês</span>. Sem contrato. Sem enrolação. Cancele quando quiser.
                      </div>
                    )}
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
                    <Card 
                      className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-700 hover:scale-105 group glow-card-neural cursor-pointer"
                      onMouseEnter={() => {
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                    >
                      <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-purple-500/40">
                          <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-300" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2 sm:mb-3 md:mb-4">{feature.title}</h3>
                        <p className="text-gray-300 text-sm sm:text-base font-light">{feature.description}</p>
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
                      <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-light text-white group-hover:scale-110 transition-transform duration-700 border border-purple-500/40 backdrop-blur-sm">
                        {step.number}
                      </div>
                      <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-purple-400/40">
                        <step.icon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-white mb-3 sm:mb-4 md:mb-6">{step.title}</h3>
                      <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed font-light">{step.description}</p>
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
                    <Card className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-105 group glow-card-neural cursor-pointer">
                      <CardContent className="p-4 sm:p-6 md:p-8">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform border border-purple-400/40">
                            <benefit.icon className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-medium text-white">{benefit.title}</h3>
                        </div>
                        <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed">{benefit.description}</p>
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
                    <Card className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-105 group glow-card-neural">
                      <CardContent className="p-4 sm:p-6 md:p-8 text-center">
                        <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-3 sm:mb-4 opacity-60" />
                        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-4 sm:mb-6 font-light italic leading-relaxed">
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
                  <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center">
                    <Button 
                      onClick={handleActivateYumerMind}
                      onMouseEnter={() => {
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                      className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-10 sm:px-20 md:px-24 py-8 sm:py-10 md:py-12 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black rounded-3xl sm:rounded-4xl shadow-2xl shadow-purple-500/60 border-3 border-purple-400/50 backdrop-blur-sm glow-button-apocalypse group transform hover:scale-110 transition-all duration-700 max-w-5xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000"
                    >
                      <Brain className="w-8 h-8 sm:w-10 h-10 md:w-12 md:h-12 mr-4 sm:mr-6 group-hover:rotate-12 transition-transform duration-500 drop-shadow-lg" />
                      <div className="text-center leading-tight relative z-10">
                        <div className="font-black tracking-wide drop-shadow-lg">
                          {isAuthenticated ? 'ACESSAR MEU YUMERMIND AGORA' : 'ACESSAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                        </div>
                      </div>
                      <Network className="w-8 h-8 sm:w-10 h-10 md:w-12 md:h-12 ml-4 sm:ml-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light max-w-4xl leading-relaxed bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-600/20">
                        Depois, apenas <span className="text-green-400 font-medium glow-text">R$ 47/mês</span>. Sem enrolação. Sem obrigações.
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Estilos CSS customizados para a estética neural épica */}
          <style>{`
            .glow-text-apocalypse {
              text-shadow: 
                0 0 30px currentColor, 
                0 0 60px currentColor, 
                0 0 120px currentColor,
                0 0 200px rgba(239, 68, 68, 0.8),
                0 0 300px rgba(239, 68, 68, 0.6);
              filter: drop-shadow(0 0 50px currentColor);
            }
            
            .glow-text-liberation {
              text-shadow: 
                0 0 30px currentColor, 
                0 0 60px currentColor, 
                0 0 120px currentColor,
                0 0 200px rgba(52, 211, 153, 0.8),
                0 0 300px rgba(52, 211, 153, 0.6);
              filter: drop-shadow(0 0 50px currentColor);
            }
            
            .glow-text-mega {
              text-shadow: 
                0 0 20px currentColor, 
                0 0 40px currentColor, 
                0 0 80px currentColor,
                0 0 120px currentColor;
              filter: drop-shadow(0 0 30px currentColor);
            }
            
            .glow-text {
              text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            }
            
            .glow-text-neural {
              text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
            }
            
            .glow-button-apocalypse {
              box-shadow: 
                0 0 40px rgba(147, 51, 234, 0.6), 
                0 0 80px rgba(79, 70, 229, 0.4), 
                0 0 120px rgba(147, 51, 234, 0.3),
                0 0 200px rgba(147, 51, 234, 0.2),
                inset 0 0 40px rgba(255, 255, 255, 0.1);
              border-width: 3px;
            }
            
            .glow-button-apocalypse:hover {
              box-shadow: 
                0 0 60px rgba(147, 51, 234, 0.8), 
                0 0 120px rgba(79, 70, 229, 0.6), 
                0 0 180px rgba(147, 51, 234, 0.4),
                0 0 300px rgba(147, 51, 234, 0.3),
                inset 0 0 60px rgba(255, 255, 255, 0.2);
            }
            
            .glow-card-neural {
              box-shadow: 0 0 15px rgba(147, 51, 234, 0.2), 0 0 30px rgba(79, 70, 229, 0.1);
            }
            
            .glow-card-neural:hover {
              box-shadow: 
                0 0 25px rgba(147, 51, 234, 0.4), 
                0 0 50px rgba(79, 70, 229, 0.3),
                0 0 75px rgba(34, 197, 94, 0.2);
            }
            
            .glow-badge {
              box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
            }
            
            .animate-pulse-slow {
              animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes pulse-slow {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              50% { 
                opacity: 0.8;
                transform: scale(1.02);
              }
            }
            
            /* Responsividade melhorada */
            @media (max-width: 640px) {
              .glow-text-apocalypse {
                text-shadow: 
                  0 0 15px currentColor, 
                  0 0 30px currentColor, 
                  0 0 60px currentColor;
              }
              
              .glow-text-liberation {
                text-shadow: 
                  0 0 15px currentColor, 
                  0 0 30px currentColor, 
                  0 0 60px currentColor;
              }
              
              .glow-text-mega {
                text-shadow: 
                  0 0 10px currentColor, 
                  0 0 20px currentColor, 
                  0 0 40px currentColor;
              }
              
              .glow-button-apocalypse {
                box-shadow: 
                  0 0 20px rgba(147, 51, 234, 0.6), 
                  0 0 40px rgba(79, 70, 229, 0.4);
              }
            }
            
            /* Animação suave para elementos que entram na tela */
            @media (prefers-reduced-motion: no-preference) {
              * {
                scroll-behavior: smooth;
              }
            }
            
            /* Efeitos de partículas animadas */
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            /* Respiração da página */
            @keyframes breathe {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
