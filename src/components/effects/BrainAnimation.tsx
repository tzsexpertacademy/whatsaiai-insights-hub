
import React, { useEffect, useRef, useState } from 'react';

interface BrainAnimationProps {
  onAnimationComplete?: () => void;
  soundEnabled?: boolean;
}

export function BrainAnimation({ onAnimationComplete, soundEnabled = false }: BrainAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'brain' | 'complete'>('brain');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Audio setup
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Neurônios do cérebro
    const neurons: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      intensity: number;
      connections: number[];
      pulsePhase: number;
      size: number;
    }> = [];

    // Criar estrutura do cérebro (formato mais anatômico)
    const brainRegions = [
      // Córtex frontal
      { centerX: 0.3, centerY: 0.3, radius: 0.15, neurons: 25 },
      // Córtex parietal
      { centerX: 0.7, centerY: 0.3, radius: 0.12, neurons: 20 },
      // Córtex temporal
      { centerX: 0.2, centerY: 0.6, radius: 0.1, neurons: 15 },
      // Córtex occipital
      { centerX: 0.8, centerY: 0.6, radius: 0.1, neurons: 15 },
      // Tronco cerebral
      { centerX: 0.5, centerY: 0.8, radius: 0.08, neurons: 12 },
      // Cerebelo
      { centerX: 0.6, centerY: 0.75, radius: 0.12, neurons: 18 }
    ];

    // Gerar neurônios por região
    brainRegions.forEach((region, regionIndex) => {
      for (let i = 0; i < region.neurons; i++) {
        const angle = (i / region.neurons) * Math.PI * 2;
        const distance = Math.random() * region.radius;
        const x = region.centerX + Math.cos(angle) * distance;
        const y = region.centerY + Math.sin(angle) * distance;
        
        neurons.push({
          x: x * canvas.width,
          y: y * canvas.height,
          z: Math.random() * 100 - 50,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          vz: (Math.random() - 0.5) * 0.2,
          intensity: Math.random(),
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          size: 2 + Math.random() * 3
        });
      }
    });

    // Conectar neurônios próximos
    neurons.forEach((neuron, index) => {
      const connections: number[] = [];
      neurons.forEach((otherNeuron, otherIndex) => {
        if (index !== otherIndex && connections.length < 4) {
          const dx = neuron.x - otherNeuron.x;
          const dy = neuron.y - otherNeuron.y;
          const dz = neuron.z - otherNeuron.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (distance < 120) {
            connections.push(otherIndex);
          }
        }
      });
      neuron.connections = connections;
    });

    let animationTime = 0;
    let brainScale = 0;
    let brainRotation = 0;
    let electricityIntensity = 0;

    // Efeitos sonoros neurais
    const playNeuralPulse = () => {
      if (!soundEnabled || !audioContextRef.current) return;
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.frequency.setValueAtTime(60 + Math.random() * 40, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80 + Math.random() * 60, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.4);
    };

    const animate = () => {
      animationTime += 0.016;
      
      // Fase 1: Cérebro aparece (primeiros 3 segundos)
      if (animationTime < 3) {
        brainScale = Math.min(1, animationTime / 3);
        electricityIntensity = brainScale;
        brainRotation = animationTime * 0.2;
      } 
      // Fase 2: Cérebro completo e ativo
      else {
        brainScale = 1;
        electricityIntensity = 0.8 + Math.sin(animationTime * 2) * 0.2;
        brainRotation = animationTime * 0.1;
        
        if (animationPhase === 'brain') {
          setAnimationPhase('complete');
          setTimeout(() => {
            onAnimationComplete?.();
          }, 500);
        }
      }

      // Limpar canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Salvar estado para transformações
      ctx.save();
      
      // Centralizar e escalar o cérebro
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(brainScale, brainScale);
      ctx.rotate(brainRotation);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Atualizar neurônios
      neurons.forEach(neuron => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.z += neuron.vz;
        neuron.pulsePhase += 0.05 + neuron.intensity * 0.03;
        neuron.intensity = 0.3 + Math.sin(neuron.pulsePhase) * 0.7;

        // Manter neurônios na tela
        if (neuron.x < 0 || neuron.x > canvas.width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > canvas.height) neuron.vy *= -1;
      });

      // Renderizar conexões elétricas
      neurons.forEach(neuron => {
        neuron.connections.forEach(connectionIndex => {
          const otherNeuron = neurons[connectionIndex];
          if (!otherNeuron) return;

          const connectionIntensity = (neuron.intensity + otherNeuron.intensity) * 0.5 * electricityIntensity;
          
          // Efeito de eletricidade com ruído
          const electricNoise = Math.sin(animationTime * 10 + neuron.x * 0.01) * 2;
          
          ctx.strokeStyle = `rgba(0, 255, 255, ${connectionIntensity * 0.8})`;
          ctx.lineWidth = 1 + connectionIntensity * 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
          
          ctx.beginPath();
          ctx.moveTo(neuron.x + electricNoise, neuron.y + electricNoise);
          
          // Linha com ondulação elétrica
          const midX = (neuron.x + otherNeuron.x) / 2 + Math.sin(animationTime * 5) * 3;
          const midY = (neuron.y + otherNeuron.y) / 2 + Math.cos(animationTime * 5) * 3;
          
          ctx.quadraticCurveTo(midX, midY, otherNeuron.x + electricNoise, otherNeuron.y + electricNoise);
          ctx.stroke();
          
          // Pulsos elétricos
          if (connectionIntensity > 0.7 && Math.random() < 0.1) {
            ctx.fillStyle = `rgba(255, 255, 0, ${connectionIntensity})`;
            ctx.beginPath();
            ctx.arc(midX, midY, 2, 0, Math.PI * 2);
            ctx.fill();
            
            if (soundEnabled && Math.random() < 0.05) {
              playNeuralPulse();
            }
          }
        });
      });

      // Renderizar neurônios
      neurons.forEach(neuron => {
        const pulseIntensity = neuron.intensity * electricityIntensity;
        const neuronSize = neuron.size * (1 + pulseIntensity * 0.5);

        // Halo do neurônio
        ctx.shadowBlur = 20 + pulseIntensity * 10;
        ctx.shadowColor = `rgba(138, 43, 226, ${pulseIntensity})`;
        ctx.fillStyle = `rgba(138, 43, 226, ${pulseIntensity * 0.9})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuronSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo do neurônio
        ctx.shadowBlur = 5;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuronSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Efeitos de energia global
      if (electricityIntensity > 0.5) {
        ctx.fillStyle = `rgba(0, 255, 255, ${(electricityIntensity - 0.5) * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [soundEnabled, onAnimationComplete, animationPhase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full"
      style={{ 
        background: 'radial-gradient(circle at center, rgba(30, 10, 50, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)'
      }}
    />
  );
}
