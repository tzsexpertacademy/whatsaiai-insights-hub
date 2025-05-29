
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
import { useResponsive } from '@/hooks/use-responsive';
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
  const { isMobile, isTablet } = useResponsive();
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showBrainAnimation, setShowBrainAnimation] = React.useState(true);
  const [showContent, setShowContent] = React.useState(false);
  const [showFirstPhrase, setShowFirstPhrase] = React.useState(false);
  const [showSecondPhrase, setShowSecondPhrase] = React.useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioInitialized, setAudioInitialized] = React.useState(false);
  const soundEffectsRef = useRef<{
    ambient?: OscillatorNode;
    hover?: () => void;
    click?: () => void;
  }>({});

  // Inicializar áudio para mobile (requer interação do usuário)
  const initMobileAudio = React.useCallback(async () => {
    if (audioInitialized) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Para mobile, precisamos "destravar" o áudio com uma interação
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setAudioInitialized(true);
      console.log('🎵 Áudio inicializado para mobile');
    } catch (error) {
      console.log('❌ Erro ao inicializar áudio mobile:', error);
    }
  }, [audioInitialized]);

  // Tocar primeiro som para destravar áudio no mobile
  const unlockMobileAudio = React.useCallback(async () => {
    if (isMobile && !audioInitialized) {
      await initMobileAudio();
    }
  }, [isMobile, audioInitialized, initMobileAudio]);

  // Função para pular a animação (para debug ou usuários que querem ir direto)
  const skipAnimation = () => {
    console.log('⏭️ Pulando animação do cérebro');
    setShowBrainAnimation(false);
    setShowContent(true);
    // Mostrar frases imediatamente
    setTimeout(() => setShowFirstPhrase(true), 300);
    setTimeout(() => setShowSecondPhrase(true), 800);
  };

  // Controlar sequência da animação
  const handleBrainAnimationComplete = () => {
    console.log('🧠 Animação do cérebro completa, mostrando conteúdo em 1 segundo');
    setTimeout(() => {
      setShowBrainAnimation(false);
      setTimeout(() => {
        setShowContent(true);
        // Sequência de entrada das frases
        setTimeout(() => setShowFirstPhrase(true), 500);
        setTimeout(() => setShowSecondPhrase(true), 1200);
        console.log('✅ Conteúdo da página exibido');
      }, 500);
    }, 1000);
  };

  // Inicializar conteúdo após um tempo máximo (fallback) - ajustado para 7s + margem
  useEffect(() => {
    const maxWaitTime = 9000; // 9 segundos máximo (7s animação + margem)
    const timer = setTimeout(() => {
      if (!showContent) {
        console.log('⏰ Timeout da animação, forçando exibição do conteúdo');
        setShowBrainAnimation(false);
        setShowContent(true);
        setTimeout(() => setShowFirstPhrase(true), 300);
        setTimeout(() => setShowSecondPhrase(true), 800);
      }
    }, maxWaitTime);

    return () => clearTimeout(timer);
  }, [showContent]);

  // Sistema de áudio épico e imersivo (otimizado para mobile)
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        
        // Para mobile, aguardar interação do usuário
        if (isMobile && ctx.state === 'suspended') {
          console.log('🔇 Áudio suspenso - aguardando interação do usuário');
          return;
        }

        // Som ambiente neural (frequências binaurais) - reduzido para mobile
        const createAmbientSound = () => {
          const oscillator1 = ctx.createOscillator();
          const oscillator2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator1.frequency.setValueAtTime(40, ctx.currentTime);
          oscillator2.frequency.setValueAtTime(40.5, ctx.currentTime);
          
          // Volume mais baixo para mobile
          gainNode.gain.setValueAtTime(isMobile ? 0.02 : 0.05, ctx.currentTime);
          
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator1.start();
          oscillator2.start();
          
          return { oscillator1, oscillator2, gainNode };
        };

        // Efeito sonoro de hover (otimizado para mobile)
        const createHoverSound = () => {
          if (!soundEnabled) return;
          
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(isMobile ? 0.05 : 0.1, ctx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.2);
        };

        // Efeito sonoro de click (otimizado para mobile)
        const createClickSound = () => {
          if (!soundEnabled) return;
          
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(isMobile ? 0.1 : 0.2, ctx.currentTime + 0.01);
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

        if (soundEnabled && audioInitialized) {
          const ambient = createAmbientSound();
          soundEffectsRef.current.ambient = ambient.oscillator1;
        }
      } catch (error) {
        console.log('❌ Erro ao inicializar áudio:', error);
      }
    };

    if (soundEnabled) {
      initAudio();
    }

    return () => {
      if (soundEffectsRef.current.ambient) {
        try {
          soundEffectsRef.current.ambient.stop();
        } catch (error) {
          console.log('Erro ao parar áudio:', error);
        }
      }
    };
  }, [soundEnabled, audioInitialized, isMobile]);

  // Animação neural de fundo (otimizada para mobile)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const scale = isMobile ? Math.min(dpr, 2) : dpr;
      
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      
      ctx.scale(scale, scale);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Pontos neurais (reduzidos para mobile)
    const neurons: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      intensity: number;
      connections: number[];
    }> = [];

    // Criar neurônios (menos para mobile)
    const neuronCount = isMobile ? 30 : isTablet ? 50 : 80;
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        intensity: Math.random(),
        connections: []
      });
    }

    // Conectar neurônios próximos (menos conexões para mobile)
    neurons.forEach((neuron, index) => {
      const connections: number[] = [];
      const maxConnections = isMobile ? 1 : isTablet ? 2 : 3;
      const connectionDistance = isMobile ? 80 : isTablet ? 120 : 150;
      
      neurons.forEach((otherNeuron, otherIndex) => {
        if (index !== otherIndex && connections.length < maxConnections) {
          const dx = neuron.x - otherNeuron.x;
          const dy = neuron.y - otherNeuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            connections.push(otherIndex);
          }
        }
      });
      neuron.connections = connections;
    });

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.016;
      
      // Fundo escuro (simplificado para mobile)
      if (isMobile) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      }
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Atualizar neurônios
      neurons.forEach(neuron => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.intensity += (Math.random() - 0.5) * 0.02;
        neuron.intensity = Math.max(0, Math.min(1, neuron.intensity));

        // Manter dentro da tela
        if (neuron.x < 0 || neuron.x > window.innerWidth) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > window.innerHeight) neuron.vy *= -1;
      });

      // Renderizar conexões (simplificadas para mobile)
      neurons.forEach(neuron => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neurons[connectionIndex];
          if (!otherNeuron) return;

          const alpha = (neuron.intensity + otherNeuron.intensity) * (isMobile ? 0.2 : 0.3);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = isMobile ? 0.5 : 1;
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(otherNeuron.x, otherNeuron.y);
          ctx.stroke();
        });
      });

      // Renderizar neurônios (otimizados para mobile)
      neurons.forEach(neuron => {
        const pulseIntensity = (Math.sin(animationTime * 2 + neuron.x * 0.01) + 1) * 0.5;
        const totalIntensity = (neuron.intensity + pulseIntensity) * 0.5;
        const size = (isMobile ? 2 : 3) + totalIntensity * (isMobile ? 1 : 2);

        // Efeito glow reduzido para mobile
        if (!isMobile) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
        } else {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(139, 92, 246, 0.6)';
        }
        
        ctx.fillStyle = `rgba(139, 92, 246, ${totalIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isMobile, isTablet]);

  const handleActivateYumerMind = async () => {
    console.log('🧠 Ativando YumerMind', { isAuthenticated });
    
    // Destravar áudio no mobile se necessário
    await unlockMobileAudio();
    
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

  const handleSoundToggle = async () => {
    // Destravar áudio no mobile se necessário
    if (!audioInitialized) {
      await unlockMobileAudio();
    }
    
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
    { icon: Target, title: "Foco, propósito e visão", description: "Clareza sobre seus objetivos de vida" },
    { icon: Shield, title: "Proteção contra autossabotagem", description: "Identifique e neutralize padrões destrutivos" }
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
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative w-full max-w-full">
      <CursorEffect />
      
      {/* Canvas neural épico em toda a página */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      />
      
      {/* Animação do cérebro neural */}
      {showBrainAnimation && (
        <div className="relative z-30">
          <BrainAnimation 
            onAnimationComplete={handleBrainAnimationComplete}
            soundEnabled={soundEnabled}
          />
        </div>
      )}
      
      {/* Controle de som (otimizado para mobile) */}
      <button
        onClick={handleSoundToggle}
        className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full p-2 sm:p-3 hover:bg-white/10 transition-all group"
        onMouseEnter={async () => {
          await unlockMobileAudio();
          if (soundEnabled && soundEffectsRef.current.hover) {
            soundEffectsRef.current.hover();
          }
        }}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {/* Conteúdo principal */}
      {showContent && (
        <div className="animate-fade-in relative z-10 w-full max-w-full overflow-x-hidden">
          {/* Seção 1 - Hero Section com animação sequencial */}
          <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6">
            <div className="text-center max-w-7xl mx-auto w-full">
              <div className="relative z-10">
                <ScrollReveal id="hero-badge" direction="scale" delay={200}>
                  <Badge className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 text-white border border-purple-400/40 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-bold backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-600/30 hover:via-blue-600/30 hover:to-cyan-600/30 transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    <CircuitBoard className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                    <span className="relative z-10 bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent font-black glow-text-neural">
                      YumerMind - O segundo cérebro do ser humano
                    </span>
                  </Badge>
                </ScrollReveal>

                {/* Primeira frase com animação de entrada (otimizada para mobile) */}
                <div 
                  className={`mb-6 sm:mb-8 md:mb-12 transition-all duration-1000 ease-out ${
                    showFirstPhrase 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-8'
                  }`}
                >
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 leading-[0.9] tracking-tight px-2">
                    <div className="mb-2 sm:mb-4">
                      <span className="block text-white font-black mb-1 sm:mb-2">
                        O que você
                      </span>
                      <span 
                        className="block font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent glow-text-pulsing"
                        style={{
                          textShadow: `
                            0 0 ${isMobile ? '15px' : '30px'} rgba(239, 68, 68, 0.8),
                            0 0 ${isMobile ? '30px' : '60px'} rgba(249, 115, 22, 0.6),
                            0 0 ${isMobile ? '45px' : '90px'} rgba(234, 179, 8, 0.4)
                          `,
                          filter: `drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(239, 68, 68, 0.5))`
                        }}
                      >
                        NÃO VÊ...
                      </span>
                    </div>
                    <div 
                      className="block font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent glow-text-pulsing"
                      style={{
                        textShadow: `
                          0 0 ${isMobile ? '15px' : '30px'} rgba(220, 38, 127, 0.8),
                          0 0 ${isMobile ? '30px' : '60px'} rgba(147, 51, 234, 0.6),
                          0 0 ${isMobile ? '45px' : '90px'} rgba(168, 85, 247, 0.4)
                        `,
                        filter: `drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(220, 38, 127, 0.5))`,
                        animationDelay: '0.3s'
                      }}
                    >
                      TE CONTROLA.
                    </div>
                  </h1>
                </div>
                
                {/* Segunda frase com animação de entrada atrasada (otimizada para mobile) */}
                <div 
                  className={`mb-6 sm:mb-8 md:mb-12 transition-all duration-1000 ease-out ${
                    showSecondPhrase 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-8'
                  }`}
                >
                  <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[0.9] tracking-tight px-2">
                    <div className="mb-2 sm:mb-4">
                      <span className="block text-white font-black mb-1 sm:mb-2">
                        O que você
                      </span>
                      <span 
                        className="block font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent glow-text-cold"
                        style={{
                          textShadow: `
                            0 0 ${isMobile ? '15px' : '30px'} rgba(59, 130, 246, 0.8),
                            0 0 ${isMobile ? '30px' : '60px'} rgba(6, 182, 212, 0.6),
                            0 0 ${isMobile ? '45px' : '90px'} rgba(16, 185, 129, 0.4)
                          `,
                          filter: `drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(59, 130, 246, 0.5))`
                        }}
                      >
                        VÊ...
                      </span>
                    </div>
                    <div 
                      className="block font-black bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent glow-text-liberation"
                      style={{
                        textShadow: `
                          0 0 ${isMobile ? '15px' : '30px'} rgba(16, 185, 129, 0.8),
                          0 0 ${isMobile ? '30px' : '60px'} rgba(34, 197, 94, 0.6),
                          0 0 ${isMobile ? '45px' : '90px'} rgba(163, 230, 53, 0.4)
                        `,
                        filter: `drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(16, 185, 129, 0.5))`,
                        animationDelay: '0.3s'
                      }}
                    >
                      TE LIBERTA.
                    </div>
                  </h2>
                </div>

                <ScrollReveal id="hero-subtitle" direction="up" delay={600}>
                  <div className="mb-6 sm:mb-8 md:mb-12 space-y-2 sm:space-y-4 px-2">
                    <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-light text-white">
                      Ative seu <span className="text-purple-400 font-medium glow-text">segundo cérebro</span>.
                    </p>
                    <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-blue-300 font-light">
                      Veja padrões, emoções, forças e sombras que você nunca percebeu.
                    </p>
                    <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light">
                      Acesse agora o <span className="text-cyan-400 font-medium glow-text">Observatório</span> da sua própria mente.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal id="hero-buttons" direction="up" delay={800}>
                  <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center px-2">
                    <Button 
                      onClick={handleActivateYumerMind}
                      className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-6 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 text-sm sm:text-lg md:text-2xl font-black rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white/50 backdrop-blur-sm group transform hover:scale-105 transition-all duration-500 max-w-4xl glow-button"
                    >
                      <Brain className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-4 group-hover:rotate-12 transition-transform duration-500" />
                      <span className="font-black tracking-wide text-center">
                        {isAuthenticated ? 'ACESSAR MEU YUMERMIND' : 'ATIVAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                      </span>
                      <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-2 sm:ml-4 group-hover:scale-110 transition-transform duration-500" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-sm sm:text-base md:text-lg text-white font-light max-w-3xl bg-black/50 rounded-xl px-4 sm:px-6 py-3 sm:py-4 border border-green-400/30">
                        Depois, apenas <span className="text-green-400 font-medium text-base sm:text-lg md:text-xl">R$ 47/mês</span>. Sem contrato. Sem enrolação. Cancele quando quiser.
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Seção 2 - O QUE É O YUMERMIND (otimizada para mobile) */}
          <section className="relative py-8 sm:py-12 md:py-20 lg:py-32 px-3 sm:px-4 md:px-6 z-10">
            <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
              <ScrollReveal id="features-title" direction="up">
                <div className="text-center mb-6 sm:mb-12 md:mb-16 lg:mb-20">
                  <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light mb-3 sm:mb-4 md:mb-6 lg:mb-8 text-white leading-tight px-2">
                    Você nunca teve acesso a isso.
                    <br />
                    <span className="text-purple-400 glow-text-neural">Até agora.</span>
                  </h2>
                  
                  <div className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl text-gray-300 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-5xl mx-auto leading-relaxed space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4 px-2">
                    <p>O YumerMind lê o que você escreve, sente, pergunta.</p>
                    <p>Ele analisa seus padrões emocionais, mentais e comportamentais.</p>
                    <p className="text-cyan-400 font-light glow-text">E transforma isso em um painel vivo da sua mente.</p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {features.map((feature, index) => (
                  <ScrollReveal key={index} id={`feature-${index}`} direction="up" delay={index * 200}>
                    <Card 
                      className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-700 hover:scale-105 group glow-card-neural cursor-pointer"
                      onMouseEnter={async () => {
                        await unlockMobileAudio();
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                    >
                      <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 text-center">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-6 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-purple-500/40">
                          <feature.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-300" />
                        </div>
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4">{feature.title}</h3>
                        <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 3 - COMO FUNCIONA (otimizada para mobile) */}
          <section className="relative py-8 sm:py-12 md:py-20 lg:py-32 px-3 sm:px-4 md:px-6 z-10">
            <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
              <ScrollReveal id="process-title" direction="scale">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light text-center mb-6 sm:mb-12 md:mb-16 lg:mb-20 text-white px-2">
                  Como funciona seu <span className="bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent glow-text-neural">segundo cérebro?</span>
                </h2>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12 lg:gap-16">
                {processSteps.map((step, index) => (
                  <ScrollReveal key={index} id={`step-${index}`} direction="up" delay={index * 300}>
                    <div className="text-center group">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto mb-3 sm:mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-3xl lg:text-5xl font-light text-white group-hover:scale-110 transition-transform duration-700 border border-purple-500/40">
                        {step.number}
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-6 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-purple-400/40">
                        <step.icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-300" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-medium text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6">{step.title}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-light px-2">{step.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 4 - BENEFÍCIOS REAIS (otimizada para mobile) */}
          <section className="relative py-8 sm:py-12 md:py-20 lg:py-32 px-3 sm:px-4 md:px-6 z-10">
            <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
              <ScrollReveal id="benefits-title" direction="up">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light text-center mb-6 sm:mb-12 md:mb-16 lg:mb-20 text-white leading-tight px-2">
                  Por que ativar seu <span className="text-cyan-400 glow-text-neural">YumerMind?</span>
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {benefits.map((benefit, index) => (
                  <ScrollReveal key={index} id={`benefit-${index}`} direction="up" delay={index * 150}>
                    <Card className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-105 group glow-card-neural cursor-pointer">
                      <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                        <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full flex items-center justify-center mr-2 sm:mr-3 lg:mr-4 group-hover:scale-110 transition-transform border border-purple-400/40">
                            <benefit.icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-300" />
                          </div>
                          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white">{benefit.title}</h3>
                        </div>
                        <p className="text-gray-300 text-xs sm:text-sm md:text-base font-light leading-relaxed">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 5 - DEPOIMENTOS (otimizada para mobile) */}
          <section className="relative py-8 sm:py-12 md:py-20 lg:py-32 px-3 sm:px-4 md:px-6 z-10">
            <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
              <ScrollReveal id="testimonials-title" direction="up">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-light text-center mb-6 sm:mb-12 md:mb-16 lg:mb-20 text-white leading-tight px-2">
                  O que dizem as mentes que já
                  <br />
                  <span className="text-emerald-400 glow-text-neural">se viram por dentro?</span>
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <ScrollReveal key={index} id={`testimonial-${index}`} direction="up" delay={index * 200}>
                    <Card className="bg-gradient-to-br from-white/10 to-white/[0.05] border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-105 group glow-card-neural">
                      <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 text-center">
                        <Quote className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-400 mx-auto mb-2 sm:mb-3 lg:mb-4 opacity-60" />
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-3 sm:mb-4 lg:mb-6 font-light italic leading-relaxed">
                          "{testimonial.text}"
                        </p>
                        <p className="text-purple-400 font-medium text-xs sm:text-sm md:text-base">{testimonial.author}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 6 - CTA FINAL (otimizada para mobile) */}
          <section className="relative py-12 sm:py-16 md:py-32 lg:py-40 px-3 sm:px-4 md:px-6 z-10 bg-black">
            <div className="max-w-6xl mx-auto text-center w-full overflow-x-hidden">
              <div className="relative z-10">
                <ScrollReveal id="final-cta-title" direction="scale" delay={200}>
                  <h2 className="text-lg sm:text-xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light mb-4 sm:mb-6 md:mb-8 lg:mb-12 leading-tight px-2">
                    <span className="block text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6">Você olha pra todo mundo.</span>
                    <span className="block text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6">Mas nunca olhou pra si assim.</span>
                    <span className="block text-purple-400 glow-text-neural mt-3 sm:mt-4 md:mt-6 lg:mt-8 font-medium">O YumerMind é o espelho mais honesto que você já viu.</span>
                    <span className="block text-cyan-400 glow-text-neural mt-2 sm:mt-3 md:mt-4 lg:mt-6 font-medium">E ele está pronto. Agora.</span>
                  </h2>
                </ScrollReveal>

                <ScrollReveal id="final-cta-button" direction="up" delay={600}>
                  <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 justify-center items-center px-2">
                    <Button 
                      onClick={handleActivateYumerMind}
                      onMouseEnter={async () => {
                        await unlockMobileAudio();
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                      className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white px-6 sm:px-10 md:px-20 lg:px-24 py-6 sm:py-8 md:py-10 lg:py-12 text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-black rounded-2xl sm:rounded-3xl lg:rounded-4xl shadow-2xl shadow-purple-500/60 border-2 sm:border-3 border-purple-400/50 backdrop-blur-sm glow-button-apocalypse group transform hover:scale-110 transition-all duration-700 max-w-5xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000"
                    >
                      <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 mr-2 sm:mr-3 md:mr-4 lg:mr-6 group-hover:rotate-12 transition-transform duration-500 drop-shadow-lg" />
                      <div className="text-center leading-tight relative z-10">
                        <div className="font-black tracking-wide drop-shadow-lg">
                          {isAuthenticated ? 'ACESSAR MEU YUMERMIND AGORA' : 'ACESSAR MEU YUMERMIND — 7 DIAS GRÁTIS'}
                        </div>
                      </div>
                      <Network className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 ml-2 sm:ml-3 md:ml-4 lg:ml-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-300 font-light max-w-4xl leading-relaxed bg-black/30 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-gray-600/20">
                        Depois, apenas <span className="text-green-400 font-medium glow-text">R$ 47/mês</span>. Sem enrolação. Sem obrigações.
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Estilos CSS harmonizados com otimizações para mobile */}
          <style>{`
            .glow-text {
              text-shadow: 0 0 ${isMobile ? '10px' : '20px'} currentColor, 0 0 ${isMobile ? '20px' : '40px'} currentColor;
            }
            
            .glow-text-neural {
              text-shadow: 0 0 ${isMobile ? '10px' : '20px'} currentColor, 0 0 ${isMobile ? '20px' : '40px'} currentColor, 0 0 ${isMobile ? '30px' : '60px'} currentColor;
              animation: glow-neural 3s ease-in-out infinite alternate;
            }
            
            @keyframes glow-neural {
              0% {
                filter: drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(139, 92, 246, 0.5)) brightness(1);
              }
              100% {
                filter: drop-shadow(0 0 ${isMobile ? '20px' : '40px'} rgba(139, 92, 246, 0.8)) brightness(1.2);
              }
            }
            
            .glow-text-pulsing {
              animation: glow-pulse 2s ease-in-out infinite alternate;
            }
            
            .glow-text-cold {
              animation: glow-cold 3s ease-in-out infinite alternate;
            }
            
            .glow-text-liberation {
              animation: glow-liberation 2.5s ease-in-out infinite alternate;
            }
            
            @keyframes glow-pulse {
              0% {
                filter: drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(239, 68, 68, 0.5)) brightness(1);
              }
              100% {
                filter: drop-shadow(0 0 ${isMobile ? '20px' : '40px'} rgba(239, 68, 68, 0.8)) brightness(1.2);
              }
            }
            
            @keyframes glow-cold {
              0% {
                filter: drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(59, 130, 246, 0.5)) brightness(1);
              }
              100% {
                filter: drop-shadow(0 0 ${isMobile ? '17px' : '35px'} rgba(59, 130, 246, 0.8)) brightness(1.1);
              }
            }
            
            @keyframes glow-liberation {
              0% {
                filter: drop-shadow(0 0 ${isMobile ? '10px' : '20px'} rgba(16, 185, 129, 0.5)) brightness(1);
              }
              100% {
                filter: drop-shadow(0 0 ${isMobile ? '17px' : '35px'} rgba(16, 185, 129, 0.8)) brightness(1.1);
              }
            }
            
            .glow-button {
              box-shadow: 
                0 0 ${isMobile ? '20px' : '40px'} rgba(147, 51, 234, 0.6), 
                0 0 ${isMobile ? '40px' : '80px'} rgba(79, 70, 229, 0.4), 
                0 0 ${isMobile ? '60px' : '120px'} rgba(147, 51, 234, 0.3);
            }
            
            .glow-button:hover {
              box-shadow: 
                0 0 ${isMobile ? '30px' : '60px'} rgba(147, 51, 234, 0.8), 
                0 0 ${isMobile ? '60px' : '120px'} rgba(79, 70, 229, 0.6), 
                0 0 ${isMobile ? '90px' : '180px'} rgba(147, 51, 234, 0.4);
            }
            
            .glow-card-neural {
              box-shadow: 0 0 ${isMobile ? '7px' : '15px'} rgba(147, 51, 234, 0.2), 0 0 ${isMobile ? '15px' : '30px'} rgba(79, 70, 229, 0.1);
            }
            
            .glow-card-neural:hover {
              box-shadow: 
                0 0 ${isMobile ? '12px' : '25px'} rgba(147, 51, 234, 0.4), 
                0 0 ${isMobile ? '25px' : '50px'} rgba(79, 70, 229, 0.3),
                0 0 ${isMobile ? '37px' : '75px'} rgba(34, 197, 94, 0.2);
            }
            
            /* Otimizações específicas para mobile */
            @media (max-width: 640px) {
              .glow-text, .glow-text-neural, .glow-text-pulsing, .glow-text-cold, .glow-text-liberation {
                text-shadow: 
                  0 0 5px currentColor, 
                  0 0 10px currentColor;
              }
              
              .glow-button {
                box-shadow: 
                  0 0 10px rgba(147, 51, 234, 0.6), 
                  0 0 20px rgba(79, 70, 229, 0.4);
              }
              
              /* Reduzir animações complexas em mobile */
              @keyframes glow-neural {
                0% {
                  filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.5)) brightness(1);
                }
                100% {
                  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.7)) brightness(1.1);
                }
              }
            }
            
            /* Performance - reduzir motion para dispositivos com preferência */
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }
            
            /* Animações suaves */
            @media (prefers-reduced-motion: no-preference) {
              * {
                scroll-behavior: smooth;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
