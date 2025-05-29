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
  Network,
  Volume2,
  VolumeX
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const brainCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEffectsRef = useRef<{
    ambient?: OscillatorNode;
    hover?: () => void;
    click?: () => void;
  }>({});

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

  // Animação de cérebro humano realista épica
  useEffect(() => {
    const canvas = brainCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Cérebro humano proporcional
    const brainWidth = Math.min(canvas.width * 0.7, 1200);
    const brainHeight = Math.min(canvas.height * 0.8, 900);

    // Estrutura cerebral realista
    const brainRegions: Array<{
      x: number;
      y: number;
      z: number;
      radius: number;
      intensity: number;
      region: 'frontal' | 'parietal' | 'temporal' | 'occipital' | 'cerebellum' | 'brainstem';
      connections: number[];
      activity: number;
      pulsePhase: number;
      color: string;
    }> = [];

    // Criar regiões cerebrais anatômicas
    const regions = [
      // Córtex frontal (raciocínio, personalidade)
      { name: 'frontal', count: 25, baseX: centerX, baseY: centerY - brainHeight * 0.2, color: 'rgba(139, 92, 246, 0.8)' },
      // Córtex parietal (sensações, espacial)
      { name: 'parietal', count: 20, baseX: centerX, baseY: centerY - brainHeight * 0.1, color: 'rgba(59, 130, 246, 0.8)' },
      // Córtex temporal (audição, memória)
      { name: 'temporal', count: 18, baseX: centerX - brainWidth * 0.2, baseY: centerY + brainHeight * 0.1, color: 'rgba(34, 197, 94, 0.8)' },
      // Córtex occipital (visão)
      { name: 'occipital', count: 15, baseX: centerX + brainWidth * 0.2, baseY: centerY + brainHeight * 0.1, color: 'rgba(168, 85, 247, 0.8)' },
      // Cerebelo (coordenação)
      { name: 'cerebellum', count: 12, baseX: centerX, baseY: centerY + brainHeight * 0.25, color: 'rgba(236, 72, 153, 0.8)' },
      // Tronco cerebral (funções vitais)
      { name: 'brainstem', count: 8, baseX: centerX, baseY: centerY + brainHeight * 0.35, color: 'rgba(245, 158, 11, 0.8)' }
    ];

    regions.forEach((region, regionIndex) => {
      for (let i = 0; i < region.count; i++) {
        const angle = (i / region.count) * Math.PI * 2;
        const distance = (Math.random() * 0.5 + 0.3) * brainWidth * 0.15;
        
        // Forma cerebral mais realista
        const brainShapeX = Math.cos(angle * 1.5) * (1 + Math.sin(angle * 3) * 0.2);
        const brainShapeY = Math.sin(angle) * 0.7; // Cérebro mais largo que alto
        
        const x = region.baseX + brainShapeX * distance;
        const y = region.baseY + brainShapeY * distance * 0.8;
        
        brainRegions.push({
          x,
          y,
          z: Math.random() * 100 + regionIndex * 20,
          radius: 3 + Math.random() * 4,
          intensity: Math.random(),
          region: region.name as any,
          connections: [],
          activity: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
          color: region.color
        });
      }
    });

    // Conectar regiões cerebrais de forma inteligente
    brainRegions.forEach((region, index) => {
      const connections: number[] = [];
      const maxConnections = region.region === 'frontal' ? 5 : 3;
      
      brainRegions.forEach((otherRegion, otherIndex) => {
        if (index !== otherIndex && connections.length < maxConnections) {
          const dx = region.x - otherRegion.x;
          const dy = region.y - otherRegion.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Conexões preferenciais entre regiões específicas
          let connectionProbability = 0.1;
          if (region.region === 'frontal' && otherRegion.region === 'parietal') connectionProbability = 0.8;
          if (region.region === 'temporal' && otherRegion.region === 'frontal') connectionProbability = 0.7;
          if (region.region === 'occipital' && otherRegion.region === 'parietal') connectionProbability = 0.6;
          
          if (distance < brainWidth * 0.3 && Math.random() < connectionProbability) {
            connections.push(otherIndex);
          }
        }
      });
      region.connections = connections;
    });

    // Partículas de energia neural
    const neuralParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      trail: Array<{ x: number; y: number; alpha: number }>;
    }> = [];

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.016;
      
      // Fundo escuro mais intenso
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gradiente de fundo cerebral
      const brainGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, brainWidth * 0.6
      );
      brainGradient.addColorStop(0, 'rgba(30, 41, 59, 0.1)');
      brainGradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.2)');
      brainGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      
      ctx.fillStyle = brainGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ondas cerebrais de fundo mais visíveis
      for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 + Math.sin(animationTime * 2 + i) * 0.05})`;
        ctx.lineWidth = 1 + Math.sin(animationTime + i) * 0.5;
        ctx.beginPath();
        
        const waveY = centerY + Math.sin(animationTime * 1.5 + i * 0.3) * brainHeight * 0.1;
        
        for (let x = 0; x <= canvas.width; x += 20) {
          const y = waveY + 
            Math.sin((x / 100) + animationTime * 4 + i) * 30 +
            Math.sin((x / 50) + animationTime * 3 + i * 1.5) * 15;
          
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Contorno cerebral
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        const brainShapeX = Math.cos(angle * 1.2) * (1 + Math.sin(angle * 4) * 0.15);
        const brainShapeY = Math.sin(angle) * 0.65; // Cérebro mais largo que alto
        
        const x = centerX + brainShapeX * brainWidth * 0.35;
        const y = centerY + brainShapeY * brainHeight * 0.3;
        
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Linha divisória entre hemisférios
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - brainHeight * 0.3);
      ctx.lineTo(centerX, centerY + brainHeight * 0.3);
      ctx.stroke();

      // Atualizar partículas neurais
      neuralParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        // Adicionar rastro
        particle.trail.unshift({ x: particle.x, y: particle.y, alpha: 1 });
        if (particle.trail.length > 8) particle.trail.pop();
        
        // Atualizar alpha do rastro
        particle.trail.forEach((point, i) => {
          point.alpha = (particle.trail.length - i) / particle.trail.length;
        });
        
        if (particle.life <= 0) {
          neuralParticles.splice(index, 1);
        }
      });

      // Renderizar regiões cerebrais
      brainRegions.forEach((region, index) => {
        // Atualizar atividade
        region.activity += (Math.random() - 0.5) * 0.03;
        region.activity = Math.max(0, Math.min(1, region.activity));
        region.pulsePhase += 0.02 + region.activity * 0.05;

        const pulseIntensity = (Math.sin(region.pulsePhase) + 1) * 0.5;
        const totalIntensity = (region.activity + pulseIntensity) * 0.5;

        // Efeito 3D
        const scale = 0.6 + (region.z / 200) * 0.4;
        const alpha = 0.4 + (region.z / 200) * 0.6;

        // Disparos neurais
        if (region.activity > 0.8 && Math.random() < 0.05) {
          // Criar partículas de energia
          for (let i = 0; i < 3; i++) {
            neuralParticles.push({
              x: region.x,
              y: region.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 60,
              maxLife: 60,
              size: 2 + Math.random() * 3,
              color: region.color,
              trail: []
            });
          }
        }

        // Renderizar conexões com mais intensidade
        region.connections.forEach(connectionIndex => {
          const otherRegion = brainRegions[connectionIndex];
          if (!otherRegion) return;

          const connectionIntensity = (region.activity + otherRegion.activity) * 0.5;
          
          if (connectionIntensity > 0.2) {
            const baseAlpha = 0.2 + connectionIntensity * 0.6;
            
            ctx.strokeStyle = `rgba(139, 92, 246, ${baseAlpha})`;
            ctx.lineWidth = 1 + connectionIntensity * 3;
            ctx.beginPath();
            
            // Conexão curvada
            const midX = (region.x + otherRegion.x) / 2;
            const midY = (region.y + otherRegion.y) / 2;
            const distance = Math.sqrt(
              Math.pow(region.x - otherRegion.x, 2) + Math.pow(region.y - otherRegion.y, 2)
            );
            const controlOffset = Math.sin(animationTime * 2 + distance * 0.01) * 15;
            
            ctx.moveTo(region.x, region.y);
            ctx.quadraticCurveTo(
              midX + controlOffset, 
              midY + controlOffset, 
              otherRegion.x, 
              otherRegion.y
            );
            ctx.stroke();

            // Pulsos elétricos nas conexões
            if (connectionIntensity > 0.6) {
              const pulseProgress = (animationTime * 3 + distance * 0.01) % 1;
              const pulseX = region.x + (otherRegion.x - region.x) * pulseProgress;
              const pulseY = region.y + (otherRegion.y - region.y) * pulseProgress;
              
              ctx.shadowBlur = 20;
              ctx.shadowColor = region.color;
              ctx.fillStyle = region.color;
              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 3 + connectionIntensity * 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        });

        // Renderizar região cerebral
        ctx.shadowBlur = 20 * scale * totalIntensity;
        ctx.shadowColor = region.color;
        
        // Anel externo pulsante
        if (totalIntensity > 0.5) {
          ctx.strokeStyle = region.color.replace(/[\d.]+\)/, `${alpha * 0.8})`);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(region.x, region.y, region.radius * scale * (1.5 + pulseIntensity * 0.5), 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Corpo principal da região
        ctx.fillStyle = region.color.replace(/[\d.]+\)/, `${alpha * (0.6 + totalIntensity * 0.4)})`);
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.radius * scale, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante
        if (totalIntensity > 0.4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * totalIntensity * 0.9})`;
          ctx.beginPath();
          ctx.arc(region.x, region.y, region.radius * scale * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
      });

      // Renderizar partículas neurais
      neuralParticles.forEach(particle => {
        // Rastro da partícula
        particle.trail.forEach((point, i) => {
          if (i < particle.trail.length - 1) {
            const alpha = point.alpha * (particle.life / particle.maxLife);
            ctx.strokeStyle = particle.color.replace(/[\d.]+\)/, `${alpha * 0.6})`);
            ctx.lineWidth = particle.size * alpha;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(particle.trail[i + 1].x, particle.trail[i + 1].y);
            ctx.stroke();
          }
        });

        // Partícula principal
        const alpha = particle.life / particle.maxLife;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = particle.color.replace(/[\d.]+\)/, `${alpha})`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
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
      
      {/* Canvas de cérebro humano realista */}
      <canvas
        ref={brainCanvasRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      />

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
                    <step.icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-300" />
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
  );
}
