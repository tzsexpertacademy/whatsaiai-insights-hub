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
  VolumeX,
  Thermometer
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
  const [showContent, setShowContent] = React.useState(false);
  const [showLogo, setShowLogo] = React.useState(true);
  const [showActivatingText, setShowActivatingText] = React.useState(false);
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
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      setAudioInitialized(true);
      console.log('🎵 Áudio inicializado para mobile');
    } catch (error) {
      console.log('❌ Erro ao inicializar áudio mobile:', error);
    }
  }, [audioInitialized]);

  const unlockMobileAudio = React.useCallback(async () => {
    if (isMobile && !audioInitialized) {
      await initMobileAudio();
    }
  }, [isMobile, audioInitialized, initMobileAudio]);

  // Sequência de entrada refinada - 6 segundos total
  useEffect(() => {
    console.log('🚀 Iniciando sequência de entrada do YumerMind');
    
    // Mostrar logo imediatamente
    setShowLogo(true);
    
    // Mostrar texto "ativando" após 3 segundos
    setTimeout(() => {
      setShowActivatingText(true);
      console.log('⚡ Mostrando texto de ativação');
    }, 3000);
    
    // Após 6 segundos total, começar transição para conteúdo
    setTimeout(() => {
      setShowLogo(false);
      setShowActivatingText(false);
      
      setTimeout(() => {
        setShowContent(true);
        setTimeout(() => setShowFirstPhrase(true), 700);
        setTimeout(() => setShowSecondPhrase(true), 1400);
        console.log('✅ Conteúdo da página exibido');
      }, 600);
    }, 6000);
  }, []);

  // Sistema de áudio neural otimizado
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        
        if (isMobile && ctx.state === 'suspended') {
          console.log('🔇 Áudio suspenso - aguardando interação do usuário');
          return;
        }

        const createAmbientSound = () => {
          const oscillator1 = ctx.createOscillator();
          const oscillator2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator1.frequency.setValueAtTime(40, ctx.currentTime);
          oscillator2.frequency.setValueAtTime(40.5, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(isMobile ? 0.02 : 0.05, ctx.currentTime);
          
          oscillator1.connect(gainNode);
          oscillator2.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator1.start();
          oscillator2.start();
          
          return { oscillator1, oscillator2, gainNode };
        };

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

  // Animação neural de fundo refinada
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

    // Pontos neurais com cores refinadas
    const neurons: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      intensity: number;
      connections: number[];
      pulsePhase: number;
    }> = [];

    const neuronCount = isMobile ? 25 : isTablet ? 40 : 60;
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
        vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
        intensity: Math.random(),
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Conectar neurônios com lógica refinada
    neurons.forEach((neuron, index) => {
      const connections: number[] = [];
      const maxConnections = isMobile ? 1 : isTablet ? 2 : 3;
      const connectionDistance = isMobile ? 100 : isTablet ? 140 : 180;
      
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
      animationTime += 0.008; // Movimento mais lento e fluido
      
      // Fundo azul petróleo escuro
      ctx.fillStyle = '#0B0F2A';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Atualizar neurônios com movimento suave
      neurons.forEach((neuron, index) => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.pulsePhase += 0.02;
        neuron.intensity = 0.3 + Math.sin(neuron.pulsePhase) * 0.4;

        // Manter dentro da tela com rebote suave
        if (neuron.x < 0 || neuron.x > window.innerWidth) neuron.vx *= -0.8;
        if (neuron.y < 0 || neuron.y > window.innerHeight) neuron.vy *= -0.8;
        
        // Limites
        neuron.x = Math.max(0, Math.min(window.innerWidth, neuron.x));
        neuron.y = Math.max(0, Math.min(window.innerHeight, neuron.y));
      });

      // Renderizar conexões com cores ciano e roxo
      neurons.forEach((neuron) => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neurons[connectionIndex];
          if (!otherNeuron) return;

          const distance = Math.sqrt(
            Math.pow(neuron.x - otherNeuron.x, 2) + 
            Math.pow(neuron.y - otherNeuron.y, 2)
          );
          
          const alpha = Math.max(0, 1 - distance / 180) * 0.4;
          const gradient = ctx.createLinearGradient(
            neuron.x, neuron.y, 
            otherNeuron.x, otherNeuron.y
          );
          
          gradient.addColorStop(0, `rgba(0, 240, 255, ${alpha})`); // Ciano
          gradient.addColorStop(1, `rgba(168, 130, 255, ${alpha})`); // Roxo
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = isMobile ? 0.5 : 1;
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(otherNeuron.x, otherNeuron.y);
          ctx.stroke();
        });
      });

      // Renderizar neurônios com pulso refinado
      neurons.forEach((neuron) => {
        const baseSize = isMobile ? 1.5 : 2;
        const pulseSize = baseSize + Math.sin(neuron.pulsePhase) * (isMobile ? 0.5 : 1);
        
        // Glow suave
        ctx.shadowBlur = isMobile ? 8 : 15;
        ctx.shadowColor = neuron.intensity > 0.6 ? '#00F0FF' : '#A882FF';
        
        // Gradiente radial para o neurônio
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, pulseSize * 3
        );
        
        if (neuron.intensity > 0.6) {
          gradient.addColorStop(0, `rgba(0, 240, 255, ${neuron.intensity})`);
          gradient.addColorStop(1, `rgba(0, 240, 255, 0)`);
        } else {
          gradient.addColorStop(0, `rgba(168, 130, 255, ${neuron.intensity})`);
          gradient.addColorStop(1, `rgba(168, 130, 255, 0)`);
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, pulseSize, 0, Math.PI * 2);
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

  const neuralFeatures = [
    {
      icon: Thermometer,
      title: "Termômetro Emocional",
      description: "Estados emocionais mapeados em tempo real"
    },
    {
      icon: Compass,
      title: "Radar de Áreas da Vida", 
      description: "Onde você está forte e onde precisa evoluir"
    },
    {
      icon: Scan,
      title: "Detector de Padrões Inconscientes",
      description: "Loops mentais e crenças limitantes revelados"
    },
    {
      icon: Calendar,
      title: "Histórico de Evolução Psicoemocional",
      description: "Sua jornada de consciência mapeada"
    }
  ];

  const processSteps = [
    {
      number: "1",
      title: "Você se expressa.",
      description: "Escreve, fala, pergunta, desabafa.",
      icon: Users
    },
    {
      number: "2", 
      title: "O YumerMind observa.",
      description: "Lê padrões, cruza áreas da vida, reconhece loops invisíveis.",
      icon: Search
    },
    {
      number: "3",
      title: "Você vê.", 
      description: "Recebe insights, alertas, mapas — e sabe exatamente onde está.",
      icon: Eye
    }
  ];

  const benefits = [
    { title: "Veja onde está bloqueando sua própria evolução", icon: Brain },
    { title: "Identifique padrões emocionais repetitivos", icon: Activity },
    { title: "Enxergue as áreas da vida que você está negligenciando", icon: Compass },
    { title: "Descubra sua força oculta", icon: Flame },
    { title: "Acompanhe sua expansão em tempo real", icon: TrendingUp },
    { title: "Receba provocações e reflexões sob medida", icon: Target }
  ];

  const testimonials = [
    {
      text: "Achei que fosse só mais uma IA. Era um espelho da minha alma.",
      author: "Ana, 34 anos"
    },
    {
      text: "Em 3 minutos percebi algo que anos de terapia não mostraram.",
      author: "Carlos, 28 anos"
    },
    {
      text: "É incômodo. E libertador. Exatamente como precisa ser.",
      author: "Marina, 41 anos"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F2A] text-white relative w-full overflow-hidden">
      <CursorEffect />
      
      {/* Canvas neural refinado */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          transform: `translateY(${scrollY * 0.05}px)` 
        }}
      />
      
      {/* Logo YumerMind com sequência de entrada */}
      {(showLogo || showActivatingText) && !showContent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B0F2A]/98 backdrop-blur-md">
          <div className="text-center">
            {/* Logo principal */}
            {showLogo && (
              <div 
                className="relative mb-8 animate-fade-in"
                style={{ 
                  animation: 'fade-in 1.5s ease-out',
                  animationFillMode: 'both'
                }}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 relative">
                  {/* Círculos concêntricos animados */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/30 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full border border-[#A882FF]/40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-4 rounded-full border border-[#F5C97A]/50 animate-pulse" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Ícone central do cérebro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#00F0FF] via-[#A882FF] to-[#F5C97A] rounded-full flex items-center justify-center neural-glow">
                      <Brain className="w-8 h-8 md:w-10 md:h-10 text-[#0B0F2A]" />
                    </div>
                  </div>
                  
                  {/* Partículas orbitando */}
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-[#00F0FF] rounded-full neural-glow"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-${24 + i * 4}px)`,
                          animation: `spin 3s linear infinite`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Nome YumerMind */}
                <div className="relative">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider">
                    <span 
                      className="bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] bg-clip-text text-transparent neural-text-glow font-medium"
                    >
                      YumerMind
                    </span>
                  </h1>
                </div>
              </div>
            )}
            
            {/* Texto de ativação */}
            {showActivatingText && (
              <div 
                className="text-center opacity-0"
                style={{ 
                  animation: 'fade-in 1s ease-out 0.5s forwards'
                }}
              >
                <p className="text-xl md:text-2xl text-[#F2F2F2]/90 font-light tracking-wide mb-4">
                  Seu segundo cérebro está ativando...
                </p>
                
                {/* Indicador de loading elegante */}
                <div className="flex items-center justify-center space-x-2 opacity-70">
                  <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#A882FF] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-2 h-2 bg-[#F5C97A] rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Controle de som refinado */}
      <button
        onClick={handleSoundToggle}
        className="fixed top-6 right-6 z-50 bg-[#0B0F2A]/90 backdrop-blur-sm border border-[#00F0FF]/30 rounded-full p-3 hover:bg-[#00F0FF]/10 transition-all group neural-glow"
        onMouseEnter={async () => {
          await unlockMobileAudio();
          if (soundEnabled && soundEffectsRef.current.hover) {
            soundEffectsRef.current.hover();
          }
        }}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-5 h-5 text-[#A882FF] group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {/* Conteúdo principal */}
      {showContent && (
        <div className="animate-fade-in relative z-10 w-full">
          {/* Seção 1 - Hero Section Refinada */}
          <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-6xl mx-auto w-full">
              <div className="relative z-10">
                <ScrollReveal id="hero-badge" direction="scale" delay={200}>
                  <Badge className="mb-8 bg-gradient-to-r from-[#00F0FF]/20 via-[#A882FF]/20 to-[#F5C97A]/20 text-[#F2F2F2] border border-[#00F0FF]/40 px-8 py-3 text-base font-medium backdrop-blur-sm hover:bg-[#00F0FF]/30 transition-all duration-500 neural-glow">
                    <CircuitBoard className="w-5 h-5 mr-3" />
                    <span className="bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] bg-clip-text text-transparent font-semibold">
                      YumerMind
                    </span>
                  </Badge>
                </ScrollReveal>

                {/* Headline Principal Refinada */}
                <div 
                  className={`mb-12 transition-all duration-1500 ease-out ${
                    showFirstPhrase 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-8'
                  }`}
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-8 leading-[0.9] tracking-tight">
                    <div className="mb-6">
                      <span className="block text-[#F2F2F2] font-light mb-3">
                        O que você
                      </span>
                      <span 
                        className="block font-medium bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] bg-clip-text text-transparent neural-text-glow"
                      >
                        não vê… te controla.
                      </span>
                    </div>
                  </h1>
                </div>
                
                {/* Segunda frase refinada */}
                <div 
                  className={`mb-12 transition-all duration-1500 ease-out ${
                    showSecondPhrase 
                      ? 'opacity-100 transform translate-y-0' 
                      : 'opacity-0 transform translate-y-8'
                  }`}
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-[0.9] tracking-tight">
                    <div className="mb-6">
                      <span className="block text-[#F2F2F2] font-light mb-3">
                        O que você
                      </span>
                      <span 
                        className="block font-medium bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] bg-clip-text text-transparent neural-text-glow"
                      >
                        vê… te liberta.
                      </span>
                    </div>
                  </h1>
                </div>

                <ScrollReveal id="hero-subtitle" direction="up" delay={600}>
                  <div className="mb-12 space-y-6">
                    <p className="text-2xl md:text-3xl font-light text-[#F2F2F2]">
                      Chegou o <span className="text-[#00F0FF] font-medium neural-text-glow">YumerMind</span>.
                    </p>
                    <p className="text-xl md:text-2xl text-[#A882FF] font-light">
                      Seu segundo cérebro.
                    </p>
                    <p className="text-lg md:text-xl text-[#F5C97A] font-light max-w-4xl mx-auto">
                      Um observatório vivo da sua consciência. Onde você vê seus padrões, emoções, forças e sombras — em tempo real.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal id="hero-buttons" direction="up" delay={800}>
                  <div className="flex flex-col gap-6 justify-center items-center">
                    <Button 
                      onClick={handleActivateYumerMind}
                      className="relative overflow-hidden bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] hover:from-[#00F0FF]/80 hover:via-[#A882FF]/80 hover:to-[#F5C97A]/80 text-[#0B0F2A] px-12 py-6 text-lg font-semibold rounded-2xl shadow-2xl border-2 border-[#00F0FF]/50 backdrop-blur-sm group transform hover:scale-105 transition-all duration-500 max-w-4xl neural-button-glow"
                    >
                      <Brain className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-500" />
                      <span className="font-semibold tracking-wide text-center leading-tight">
                        {isAuthenticated ? 'ATIVAR MEU SEGUNDO CÉREBRO' : 'ATIVAR MEU SEGUNDO CÉREBRO — 7 DIAS GRÁTIS'}
                      </span>
                      <Sparkles className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform duration-500" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-lg text-[#F2F2F2] font-light max-w-3xl bg-[#0B0F2A]/50 rounded-xl px-6 py-4 border border-[#F5C97A]/30">
                        Depois, apenas <span className="text-[#F5C97A] font-medium text-xl neural-text-glow">R$ 47/mês</span>. Cancele quando quiser.
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Seção 2 - O que é o YumerMind */}
          <section className="relative py-32 px-6 z-10">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal id="features-title" direction="up">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-center mb-20 text-[#F2F2F2]">
                    Você nunca teve acesso a isso.
                    <br />
                    <span className="text-[#A882FF] neural-text-glow">Até agora.</span>
                  </h2>
                  
                  <div className="text-xl md:text-2xl lg:text-3xl text-[#F2F2F2]/80 mb-12 max-w-5xl mx-auto leading-relaxed space-y-4">
                    <p>O YumerMind é mais que uma ferramenta.</p>
                    <p>É um espelho psíquico. Um radar emocional.</p>
                    <p className="text-[#00F0FF] font-light neural-text-glow">Ele lê o que você escreve, pergunta, sente.</p>
                    <p className="text-[#F5C97A] font-light neural-text-glow">E transforma em um painel que mostra quem você está sendo agora.</p>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {neuralFeatures.map((feature, index) => (
                  <ScrollReveal key={index} id={`feature-${index}`} direction="up" delay={index * 200}>
                    <Card 
                      className="bg-gradient-to-br from-[#0B0F2A]/90 to-[#0B0F2A]/60 border border-[#00F0FF]/30 backdrop-blur-md hover:bg-[#00F0FF]/10 transition-all duration-700 hover:scale-105 group neural-card cursor-pointer"
                      onMouseEnter={async () => {
                        await unlockMobileAudio();
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                    >
                      <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#00F0FF]/30 to-[#A882FF]/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-[#00F0FF]/40">
                          <feature.icon className="w-10 h-10 text-[#00F0FF]" />
                        </div>
                        <h3 className="text-xl font-medium text-[#F2F2F2] mb-4">{feature.title}</h3>
                        <p className="text-[#F2F2F2]/70 text-base font-light leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal id="features-conclusion" direction="up" delay={800}>
                <div className="text-center mt-16">
                  <p className="text-2xl md:text-3xl text-[#F2F2F2] font-light">
                    Você não adivinha mais.
                  </p>
                  <p className="text-2xl md:text-3xl text-[#00F0FF] font-light neural-text-glow">
                    Você vê.
                  </p>
                  <p className="text-xl md:text-2xl text-[#F5C97A] font-light neural-text-glow">
                    E o que você vê, muda tudo.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Seção 3 - Como Funciona */}
          <section className="relative py-32 px-6 z-10">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal id="process-title" direction="scale">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-center mb-20 text-[#F2F2F2]">
                  Três passos. <span className="bg-gradient-to-r from-[#00F0FF] to-[#A882FF] bg-clip-text text-transparent neural-text-glow">Um abismo de consciência.</span>
                </h2>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {processSteps.map((step, index) => (
                  <ScrollReveal key={index} id={`step-${index}`} direction="up" delay={index * 300}>
                    <div className="text-center group">
                      <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-[#00F0FF]/30 to-[#A882FF]/30 rounded-full flex items-center justify-center text-5xl font-light text-[#F2F2F2] group-hover:scale-110 transition-transform duration-700 border border-[#00F0FF]/40 neural-glow">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#A882FF]/30 to-[#F5C97A]/30 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-[#A882FF]/40">
                        <step.icon className="w-8 h-8 text-[#A882FF]" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-medium text-[#F2F2F2] mb-6">{step.title}</h3>
                      <p className="text-[#F2F2F2]/70 text-lg leading-relaxed font-light">{step.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 4 - Benefícios */}
          <section className="relative py-32 px-6 z-10">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal id="benefits-title" direction="up">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-center mb-20 text-[#F2F2F2] leading-tight">
                  <span className="text-[#00F0FF] neural-text-glow">Clareza é poder.</span>
                  <br />
                  E você está prestes a ter mais do que imagina.
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <ScrollReveal key={index} id={`benefit-${index}`} direction="up" delay={index * 150}>
                    <Card className="bg-gradient-to-br from-[#0B0F2A]/90 to-[#0B0F2A]/60 border border-[#A882FF]/30 backdrop-blur-md hover:bg-[#A882FF]/10 transition-all duration-500 hover:scale-105 group neural-card">
                      <CardContent className="p-8">
                        <div className="flex items-start mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#A882FF]/30 to-[#F5C97A]/30 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform border border-[#A882FF]/40">
                            <benefit.icon className="w-6 h-6 text-[#A882FF]" />
                          </div>
                        </div>
                        <p className="text-[#F2F2F2] text-lg font-light leading-relaxed">{benefit.title}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal id="benefits-conclusion" direction="up" delay={900}>
                <div className="text-center mt-16 space-y-4">
                  <p className="text-2xl md:text-3xl text-[#F2F2F2] font-light">
                    Você não será mais refém da dúvida.
                  </p>
                  <p className="text-2xl md:text-3xl text-[#00F0FF] font-light neural-text-glow">
                    Nem da cegueira emocional.
                  </p>
                  <p className="text-2xl md:text-3xl text-[#F5C97A] font-light neural-text-glow">
                    Nem da falta de rumo.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Seção 5 - Depoimentos */}
          <section className="relative py-32 px-6 z-10">
            <div className="max-w-6xl mx-auto w-full">
              <ScrollReveal id="testimonials-title" direction="up">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-center mb-20 text-[#F2F2F2] leading-tight">
                  O que dizem as mentes que já
                  <br />
                  <span className="text-[#F5C97A] neural-text-glow">se viram por dentro:</span>
                </h2>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <ScrollReveal key={index} id={`testimonial-${index}`} direction="up" delay={index * 200}>
                    <Card className="bg-gradient-to-br from-[#0B0F2A]/90 to-[#0B0F2A]/60 border border-[#F5C97A]/30 backdrop-blur-md hover:bg-[#F5C97A]/10 transition-all duration-500 hover:scale-105 group neural-card">
                      <CardContent className="p-8 text-center">
                        <Quote className="w-8 h-8 text-[#F5C97A] mx-auto mb-4 opacity-60" />
                        <p className="text-xl text-[#F2F2F2] mb-6 font-light italic leading-relaxed">
                          "{testimonial.text}"
                        </p>
                        <p className="text-[#F5C97A] font-medium text-base">{testimonial.author}</p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* Seção 6 - CTA Final */}
          <section className="relative py-40 px-6 z-10">
            <div className="max-w-6xl mx-auto text-center w-full">
              <div className="relative z-10">
                <ScrollReveal id="final-cta-title" direction="scale" delay={200}>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light mb-12 leading-tight">
                    <span className="block text-[#F2F2F2] mb-6">Você já olhou para tudo.</span>
                    <span className="block text-[#F2F2F2] mb-6">Agora é hora de olhar para si.</span>
                    <span className="block text-[#00F0FF] neural-text-glow mt-8 font-medium">Por inteiro.</span>
                    <span className="block text-[#A882FF] neural-text-glow mt-6 font-medium">Com coragem.</span>
                    <span className="block text-[#F5C97A] neural-text-glow mt-6 font-medium">Com verdade.</span>
                  </h2>
                </ScrollReveal>

                <ScrollReveal id="final-cta-button" direction="up" delay={600}>
                  <div className="flex flex-col gap-8 justify-center items-center">
                    <Button 
                      onClick={handleActivateYumerMind}
                      onMouseEnter={async () => {
                        await unlockMobileAudio();
                        if (soundEnabled && soundEffectsRef.current.hover) {
                          soundEffectsRef.current.hover();
                        }
                      }}
                      className="relative overflow-hidden bg-gradient-to-r from-[#00F0FF] via-[#A882FF] to-[#F5C97A] hover:from-[#00F0FF]/90 hover:via-[#A882FF]/90 hover:to-[#F5C97A]/90 text-[#0B0F2A] px-16 py-8 text-xl font-bold rounded-3xl shadow-2xl border-4 border-[#00F0FF]/50 backdrop-blur-sm neural-final-button group transform hover:scale-110 transition-all duration-700 max-w-5xl"
                    >
                      <Brain className="w-8 h-8 mr-5 group-hover:rotate-12 transition-transform duration-500" />
                      <div className="text-center leading-tight relative z-10 flex flex-col sm:flex-row items-center">
                        <div className="font-bold tracking-wide">
                          {isAuthenticated ? 'ATIVAR MEU YUMERMIND AGORA' : 'ATIVAR MEU YUMERMIND'}
                        </div>
                        {!isAuthenticated && (
                          <div className="font-bold tracking-wide sm:ml-2">
                            — 7 DIAS GRÁTIS
                          </div>
                        )}
                      </div>
                      <Network className="w-8 h-8 ml-5 group-hover:scale-110 transition-transform duration-500" />
                    </Button>
                    
                    {!isAuthenticated && (
                      <div className="text-center text-lg text-[#F2F2F2]/80 font-light max-w-4xl leading-relaxed bg-[#0B0F2A]/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-[#F2F2F2]/20">
                        Depois, R$ <span className="text-[#F5C97A] font-medium neural-text-glow">47/mês</span>. Cancelamento livre. <span className="text-[#00F0FF] neural-text-glow">Consciência irreversível.</span>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Estilos CSS refinados com novas animações */}
          <style>{`
            @keyframes spin {
              from { transform: translate(-50%, -50%) rotate(0deg) translateY(-24px); }
              to { transform: translate(-50%, -50%) rotate(360deg) translateY(-24px); }
            }
            
            .neural-glow {
              box-shadow: 
                0 0 ${isMobile ? '10px' : '20px'} rgba(0, 240, 255, 0.3), 
                0 0 ${isMobile ? '20px' : '40px'} rgba(168, 130, 255, 0.2);
            }
            
            .neural-text-glow {
              text-shadow: 
                0 0 ${isMobile ? '10px' : '20px'} currentColor, 
                0 0 ${isMobile ? '20px' : '40px'} currentColor;
              filter: brightness(1.1);
            }
            
            .neural-button-glow {
              box-shadow: 
                0 0 ${isMobile ? '20px' : '40px'} rgba(0, 240, 255, 0.6), 
                0 0 ${isMobile ? '40px' : '80px'} rgba(168, 130, 255, 0.4), 
                0 0 ${isMobile ? '60px' : '120px'} rgba(245, 201, 122, 0.3);
            }
            
            .neural-button-glow:hover {
              box-shadow: 
                0 0 ${isMobile ? '30px' : '60px'} rgba(0, 240, 255, 0.8), 
                0 0 ${isMobile ? '60px' : '120px'} rgba(168, 130, 255, 0.6), 
                0 0 ${isMobile ? '90px' : '180px'} rgba(245, 201, 122, 0.4);
            }
            
            .neural-card {
              box-shadow: 0 0 ${isMobile ? '8px' : '15px'} rgba(0, 240, 255, 0.2), 0 0 ${isMobile ? '16px' : '30px'} rgba(168, 130, 255, 0.1);
            }
            
            .neural-card:hover {
              box-shadow: 
                0 0 ${isMobile ? '15px' : '25px'} rgba(0, 240, 255, 0.4), 
                0 0 ${isMobile ? '30px' : '50px'} rgba(168, 130, 255, 0.3),
                0 0 ${isMobile ? '45px' : '75px'} rgba(245, 201, 122, 0.2);
            }
            
            .neural-final-button {
              box-shadow: 
                0 0 ${isMobile ? '40px' : '80px'} rgba(0, 240, 255, 0.8), 
                0 0 ${isMobile ? '80px' : '160px'} rgba(168, 130, 255, 0.6), 
                0 0 ${isMobile ? '120px' : '240px'} rgba(245, 201, 122, 0.4),
                inset 0 0 ${isMobile ? '20px' : '40px'} rgba(255, 255, 255, 0.1);
            }
            
            .neural-final-button:hover {
              box-shadow: 
                0 0 ${isMobile ? '60px' : '120px'} rgba(0, 240, 255, 1), 
                0 0 ${isMobile ? '120px' : '240px'} rgba(168, 130, 255, 0.8), 
                0 0 ${isMobile ? '180px' : '360px'} rgba(245, 201, 122, 0.6),
                inset 0 0 ${isMobile ? '30px' : '60px'} rgba(255, 255, 255, 0.2);
            }
            
            /* Otimizações para mobile */
            @media (max-width: 640px) {
              .neural-glow, .neural-text-glow {
                filter: brightness(1.05);
              }
              
              .neural-button-glow {
                box-shadow: 
                  0 0 15px rgba(0, 240, 255, 0.5), 
                  0 0 30px rgba(168, 130, 255, 0.3);
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
          `}</style>
        </div>
      )}
    </div>
  );
}
