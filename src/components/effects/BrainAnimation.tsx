
import React, { useEffect, useRef, useState } from 'react';

interface BrainAnimationProps {
  onAnimationComplete?: () => void;
  soundEnabled?: boolean;
}

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  intensity: number;
  connections: number[];
  pulsePhase: number;
}

interface Pulse {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  id: number;
}

export function BrainAnimation({ onAnimationComplete, soundEnabled = false }: BrainAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'neural' | 'logo' | 'complete'>('neural');
  const [showYumerMindText, setShowYumerMindText] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const neuronsRef = useRef<Neuron[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);
  const timeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Efeito sonoro épico
  const playEpicSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Som épico de ativação neural - versão mobile otimizada
      const createEpicActivationSound = () => {
        // Base profunda
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.frequency.setValueAtTime(60, ctx.currentTime);
        bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.5);
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
        bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        
        // Sweep ascendente
        const sweepOsc = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweepOsc.frequency.setValueAtTime(200, ctx.currentTime + 0.5);
        sweepOsc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.5);
        sweepGain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
        sweepGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.7);
        sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
        
        // Conectar
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        
        sweepOsc.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        
        // Iniciar sons
        bassOsc.start();
        bassOsc.stop(ctx.currentTime + 2);
        
        sweepOsc.start(ctx.currentTime + 0.5);
        sweepOsc.stop(ctx.currentTime + 2);
      };
      
      createEpicActivationSound();
    } catch (error) {
      console.log('Audio não disponível:', error);
    }
  };

  useEffect(() => {
    // Som épico no início
    setTimeout(() => {
      playEpicSound();
    }, 300);

    // Sequência de animação: 4s logo + 3s texto = 7s total
    const logoTimer = setTimeout(() => {
      console.log('🧠 Mostrando logo da Yumer (4s), adicionando YumerMind');
      setAnimationPhase('logo');
      
      // Adicionar texto YumerMind após 4 segundos
      setTimeout(() => {
        setShowYumerMindText(true);
        
        // Completar animação após mais 3 segundos
        setTimeout(() => {
          setAnimationPhase('complete');
          console.log('✅ Animação completa (7s total)');
          onAnimationComplete?.();
        }, 3000);
        
      }, 4000);
      
    }, 0);

    return () => clearTimeout(logoTimer);
  }, [onAnimationComplete, soundEnabled]);

  // Animação neural otimizada para mobile
  useEffect(() => {
    if (animationPhase === 'complete') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Para mobile, usar resolução menor para melhor performance
      const scale = isMobile ? Math.min(dpr, 2) : dpr;
      
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(scale, scale);
      
      // Reinicializar neurônios quando redimensionar
      initializeNeurons();
    };

    const initializeNeurons = () => {
      neuronsRef.current = [];
      
      // Reduzir neurônios para mobile
      const neuronCount = isMobile ? 30 : 60;
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      
      for (let i = 0; i < neuronCount; i++) {
        const neuron: Neuron = {
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
          intensity: Math.random(),
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2
        };
        neuronsRef.current.push(neuron);
      }

      // Conectar neurônios próximos
      neuronsRef.current.forEach((neuron, index) => {
        const connections: number[] = [];
        const maxConnections = isMobile ? 1 : 2;
        const connectionDistance = isMobile ? 80 : 120;
        
        neuronsRef.current.forEach((otherNeuron, otherIndex) => {
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
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let pulseIdCounter = 0;

    const animate = () => {
      timeRef.current += 0.016;
      
      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
      
      // Fundo escuro mais simples para mobile
      if (isMobile) {
        ctx.fillStyle = 'rgba(5, 0, 15, 0.95)';
      } else {
        const gradient = ctx.createRadialGradient(
          canvasWidth / 2, canvasHeight / 2, 0,
          canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) / 2
        );
        gradient.addColorStop(0, 'rgba(5, 0, 15, 0.98)');
        gradient.addColorStop(0.5, 'rgba(10, 0, 25, 0.99)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = gradient;
      }
      
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Atualizar neurônios
      neuronsRef.current.forEach((neuron, index) => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.pulsePhase += 0.02;
        
        // Intensidade com variação temporal
        const baseIntensity = 0.4 + Math.sin(timeRef.current * 0.5 + index * 0.1) * 0.2;
        neuron.intensity = Math.max(0, Math.min(1, baseIntensity + (Math.random() - 0.5) * 0.05));

        // Manter dentro da tela
        if (neuron.x < 0 || neuron.x > canvasWidth) {
          neuron.vx *= -0.8;
          neuron.x = Math.max(0, Math.min(canvasWidth, neuron.x));
        }
        if (neuron.y < 0 || neuron.y > canvasHeight) {
          neuron.vy *= -0.8;
          neuron.y = Math.max(0, Math.min(canvasHeight, neuron.y));
        }

        // Criar pulsos menos frequentes em mobile
        const pulseChance = isMobile ? 0.001 : 0.002;
        if (Math.random() < pulseChance && neuron.intensity > 0.6) {
          pulsesRef.current.push({
            x: neuron.x,
            y: neuron.y,
            radius: 0,
            intensity: neuron.intensity,
            id: pulseIdCounter++
          });
        }
      });

      // Atualizar pulsos
      pulsesRef.current = pulsesRef.current.filter(pulse => {
        pulse.radius += isMobile ? 1.5 : 2;
        pulse.intensity *= 0.98;
        return pulse.radius < (isMobile ? 80 : 120) && pulse.intensity > 0.01;
      });

      // Renderizar conexões neurais
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = isMobile ? 0.3 : 0.5;
      
      neuronsRef.current.forEach(neuron => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neuronsRef.current[connectionIndex];
          if (!otherNeuron) return;

          const distance = Math.sqrt(
            Math.pow(neuron.x - otherNeuron.x, 2) + 
            Math.pow(neuron.y - otherNeuron.y, 2)
          );
          
          const alpha = Math.max(0, Math.min(0.3, (neuron.intensity + otherNeuron.intensity) * 0.2 * (1 - distance / 150)));
          
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = (isMobile ? 0.3 : 0.5) + alpha * 1;
          
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(otherNeuron.x, otherNeuron.y);
          ctx.stroke();
        });
      });

      // Renderizar pulsos mais simples em mobile
      pulsesRef.current.forEach(pulse => {
        if (isMobile) {
          ctx.fillStyle = `rgba(139, 92, 246, ${pulse.intensity * 0.4})`;
        } else {
          const gradient = ctx.createRadialGradient(
            pulse.x, pulse.y, 0,
            pulse.x, pulse.y, pulse.radius
          );
          gradient.addColorStop(0, `rgba(139, 92, 246, ${pulse.intensity * 0.6})`);
          gradient.addColorStop(0.5, `rgba(59, 130, 246, ${pulse.intensity * 0.3})`);
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Renderizar neurônios
      neuronsRef.current.forEach(neuron => {
        const pulseIntensity = (Math.sin(neuron.pulsePhase) + 1) * 0.5;
        const totalIntensity = (neuron.intensity + pulseIntensity) * 0.7;
        const size = (isMobile ? 1.5 : 2) + totalIntensity * (isMobile ? 2 : 3);

        // Halo brilhante mais simples em mobile
        if (!isMobile) {
          const haloGradient = ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, size * 2.5
          );
          haloGradient.addColorStop(0, `rgba(139, 92, 246, ${totalIntensity * 0.6})`);
          haloGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.fillStyle = haloGradient;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Núcleo do neurônio
        ctx.fillStyle = `rgba(255, 255, 255, ${totalIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Borda brilhante
        ctx.strokeStyle = `rgba(139, 92, 246, ${totalIntensity * 0.8})`;
        ctx.lineWidth = isMobile ? 0.5 : 1;
        ctx.stroke();
      });

      // Reduzir partículas atmosféricas em mobile
      const particleCount = isMobile ? 5 : 15;
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const alpha = Math.random() * 0.08;
        const size = Math.random() * (isMobile ? 1 : 2);
        
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationPhase, isMobile]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 w-full h-full flex items-center justify-center"
         style={{ 
           background: 'radial-gradient(circle at center, rgba(5, 0, 15, 0.98) 0%, rgba(0, 0, 0, 0.99) 100%)'
         }}>
      
      {/* Animação neural customizada */}
      {animationPhase !== 'complete' && (
        <div className="relative w-full h-full animate-fade-in">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ 
              background: 'transparent',
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Overlay com logo da Yumer */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-4">
              {/* Logo da Yumer - sempre visível */}
              <div className="mb-4 sm:mb-6 md:mb-8 relative">
                <img 
                  src="/lovable-uploads/e100949d-480b-4b63-ba68-f400a538f0df.png" 
                  alt="Yumer Logo" 
                  className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto drop-shadow-2xl animate-pulse"
                  style={{ opacity: logoOpacity }}
                />
                
                {/* Efeitos de brilho concêntricos - reduzidos para mobile */}
                <div className="absolute inset-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-lg sm:blur-xl md:blur-2xl animate-pulse" />
                {!isMobile && (
                  <div className="absolute inset-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 mx-auto bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                )}
              </div>
              
              {/* Texto YumerMind aparece após 4 segundos */}
              {showYumerMindText && (
                <div className="animate-fade-in">
                  <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl">
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text-mega">
                      YumerMind
                    </span>
                  </h1>
                  
                  <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-purple-300 font-light max-w-3xl leading-relaxed glow-text">
                    Seu segundo cérebro está ativando...
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de progresso */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/60"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Estilos CSS otimizados */}
      <style>{`
        .glow-text-mega {
          text-shadow: 
            0 0 10px currentColor,
            0 0 20px currentColor,
            0 0 30px currentColor;
          animation: glow-mega 3s ease-in-out infinite alternate;
        }
        
        .glow-text {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
        }
        
        @keyframes glow-mega {
          0% {
            filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5)) brightness(1);
          }
          100% {
            filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.8)) brightness(1.2);
          }
        }
        
        /* Otimizações para mobile */
        @media (max-width: 768px) {
          .glow-text-mega {
            text-shadow: 
              0 0 5px currentColor,
              0 0 10px currentColor;
          }
          
          .glow-text {
            text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
          }
          
          @keyframes glow-mega {
            0% {
              filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.5)) brightness(1);
            }
            100% {
              filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.7)) brightness(1.1);
            }
          }
        }
      `}</style>
    </div>
  );
}
