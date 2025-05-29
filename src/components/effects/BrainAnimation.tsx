
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

  // Efeito sonoro épico que quebra padrão
  const playEpicSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Som épico de ativação neural - múltiplas camadas
      const createEpicActivationSound = () => {
        // Base profunda
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.frequency.setValueAtTime(60, ctx.currentTime);
        bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.5);
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        
        // Sweep ascendente
        const sweepOsc = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweepOsc.frequency.setValueAtTime(200, ctx.currentTime + 0.5);
        sweepOsc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.8);
        sweepGain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
        sweepGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.7);
        sweepGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        
        // Harmonics de impacto
        const impactOsc = ctx.createOscillator();
        const impactGain = ctx.createGain();
        impactOsc.frequency.setValueAtTime(800, ctx.currentTime + 1);
        impactOsc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.3);
        impactGain.gain.setValueAtTime(0, ctx.currentTime + 1);
        impactGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 1.05);
        impactGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8);
        
        // Ruído neural (white noise filtrado)
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const noiseSource = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();
        noiseBuffer && (noiseSource.buffer = noiseBuffer);
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
        noiseGain.gain.setValueAtTime(0, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        
        // Conectar tudo
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        
        sweepOsc.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        
        impactOsc.connect(impactGain);
        impactGain.connect(ctx.destination);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        // Iniciar sons
        bassOsc.start();
        bassOsc.stop(ctx.currentTime + 2.5);
        
        sweepOsc.start(ctx.currentTime + 0.5);
        sweepOsc.stop(ctx.currentTime + 2.5);
        
        impactOsc.start(ctx.currentTime + 1);
        impactOsc.stop(ctx.currentTime + 2);
        
        noiseSource.start();
        noiseSource.stop(ctx.currentTime + 2);
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
    }, 500);

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

  // Animação neural customizada
  useEffect(() => {
    if (animationPhase === 'complete') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reinicializar neurônios quando redimensionar
      initializeNeurons();
    };

    const initializeNeurons = () => {
      neuronsRef.current = [];
      
      // Número de neurônios baseado no tamanho da tela
      const neuronCount = window.innerWidth < 768 ? 60 : 100;
      
      for (let i = 0; i < neuronCount; i++) {
        const neuron: Neuron = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          intensity: Math.random(),
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2
        };
        neuronsRef.current.push(neuron);
      }

      // Conectar neurônios próximos
      neuronsRef.current.forEach((neuron, index) => {
        const connections: number[] = [];
        const maxConnections = window.innerWidth < 768 ? 2 : 3;
        const connectionDistance = window.innerWidth < 768 ? 120 : 180;
        
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
      
      // Fundo escuro com gradiente
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(5, 0, 15, 0.98)');
      gradient.addColorStop(0.5, 'rgba(10, 0, 25, 0.99)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar neurônios
      neuronsRef.current.forEach((neuron, index) => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.pulsePhase += 0.02;
        
        // Intensidade com variação temporal
        const baseIntensity = 0.3 + Math.sin(timeRef.current * 0.5 + index * 0.1) * 0.3;
        neuron.intensity = Math.max(0, Math.min(1, baseIntensity + (Math.random() - 0.5) * 0.1));

        // Manter dentro da tela com efeito de borda suave
        if (neuron.x < 0 || neuron.x > canvas.width) {
          neuron.vx *= -0.8;
          neuron.x = Math.max(0, Math.min(canvas.width, neuron.x));
        }
        if (neuron.y < 0 || neuron.y > canvas.height) {
          neuron.vy *= -0.8;
          neuron.y = Math.max(0, Math.min(canvas.height, neuron.y));
        }

        // Criar pulsos ocasionalmente
        if (Math.random() < 0.003 && neuron.intensity > 0.6) {
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
        pulse.radius += 2;
        pulse.intensity *= 0.98;
        return pulse.radius < 150 && pulse.intensity > 0.01;
      });

      // Renderizar conexões neurais
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 0.5;
      
      neuronsRef.current.forEach(neuron => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neuronsRef.current[connectionIndex];
          if (!otherNeuron) return;

          const distance = Math.sqrt(
            Math.pow(neuron.x - otherNeuron.x, 2) + 
            Math.pow(neuron.y - otherNeuron.y, 2)
          );
          
          const alpha = Math.max(0, Math.min(0.4, (neuron.intensity + otherNeuron.intensity) * 0.3 * (1 - distance / 200)));
          
          // Efeito de pulso nas conexões
          const pulseIntensity = 1 + Math.sin(timeRef.current * 3 + distance * 0.01) * 0.2;
          
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * pulseIntensity})`;
          ctx.lineWidth = 0.5 + alpha * 1.5;
          
          ctx.beginPath();
          ctx.moveTo(neuron.x, neuron.y);
          ctx.lineTo(otherNeuron.x, otherNeuron.y);
          ctx.stroke();
        });
      });

      // Renderizar pulsos
      pulsesRef.current.forEach(pulse => {
        const gradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulse.radius
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${pulse.intensity * 0.6})`);
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${pulse.intensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Renderizar neurônios
      neuronsRef.current.forEach(neuron => {
        const pulseIntensity = (Math.sin(neuron.pulsePhase) + 1) * 0.5;
        const totalIntensity = (neuron.intensity + pulseIntensity) * 0.6;
        const size = 2 + totalIntensity * 4;

        // Halo brilhante
        const haloGradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, size * 3
        );
        haloGradient.addColorStop(0, `rgba(139, 92, 246, ${totalIntensity * 0.8})`);
        haloGradient.addColorStop(0.5, `rgba(59, 130, 246, ${totalIntensity * 0.4})`);
        haloGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = haloGradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo do neurônio
        ctx.fillStyle = `rgba(255, 255, 255, ${totalIntensity * 0.9})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Borda brilhante
        ctx.strokeStyle = `rgba(139, 92, 246, ${totalIntensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Efeitos de partículas atmosféricas
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const alpha = Math.random() * 0.1;
        const size = Math.random() * 2;
        
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
  }, [animationPhase]);

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
              background: 'transparent'
            }}
          />
          
          {/* Overlay com logo da Yumer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              {/* Logo da Yumer - sempre visível */}
              <div className="mb-6 sm:mb-8 relative">
                <img 
                  src="/lovable-uploads/e100949d-480b-4b63-ba68-f400a538f0df.png" 
                  alt="Yumer Logo" 
                  className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto drop-shadow-2xl animate-pulse"
                  style={{ opacity: logoOpacity }}
                />
                
                {/* Efeitos de brilho concêntricos */}
                <div className="absolute inset-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full blur-xl sm:blur-2xl animate-pulse" />
                <div className="absolute inset-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              
              {/* Texto YumerMind aparece após 4 segundos */}
              {showYumerMindText && (
                <div className="animate-fade-in">
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 drop-shadow-2xl">
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text-mega">
                      YumerMind
                    </span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl lg:text-2xl text-purple-300 font-light max-w-3xl leading-relaxed glow-text">
                    Seu segundo cérebro está ativando...
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de progresso */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/60"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Estilos CSS para os efeitos de brilho */}
      <style>{`
        .glow-text-mega {
          text-shadow: 
            0 0 20px currentColor,
            0 0 40px currentColor,
            0 0 60px currentColor,
            0 0 80px currentColor;
          animation: glow-mega 3s ease-in-out infinite alternate;
        }
        
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        
        @keyframes glow-mega {
          0% {
            filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)) brightness(1);
          }
          100% {
            filter: drop-shadow(0 0 60px rgba(139, 92, 246, 0.9)) brightness(1.3);
          }
        }
      `}</style>
    </div>
  );
}
