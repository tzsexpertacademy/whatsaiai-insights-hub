
import React, { useEffect, useRef, useState } from 'react';

interface BrainAnimationProps {
  onAnimationComplete?: () => void;
  soundEnabled?: boolean;
}

export function BrainAnimation({ onAnimationComplete, soundEnabled = false }: BrainAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'growing' | 'pulsing' | 'complete'>('growing');

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

    // Estrutura da rede neural orgânica
    const nodes: Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      intensity: number;
      connections: number[];
      pulsePhase: number;
      growthProgress: number;
      nodeType: 'core' | 'branch' | 'leaf';
      depth: number;
    }> = [];

    // Criar estrutura hierárquica do cérebro
    const createBrainNetwork = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Núcleo central (tronco cerebral)
      const coreNodes = 8;
      for (let i = 0; i < coreNodes; i++) {
        const angle = (i / coreNodes) * Math.PI * 2;
        const radius = 50;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        nodes.push({
          x, y, baseX: x, baseY: y,
          size: 4 + Math.random() * 3,
          intensity: 0,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          growthProgress: 0,
          nodeType: 'core',
          depth: 0
        });
      }

      // Ramos principais (córtex)
      const branchLayers = 4;
      for (let layer = 1; layer <= branchLayers; layer++) {
        const layerNodes = 12 + layer * 4;
        const layerRadius = 50 + layer * 40;
        
        for (let i = 0; i < layerNodes; i++) {
          const angle = (i / layerNodes) * Math.PI * 2 + layer * 0.3;
          const radiusVariation = layerRadius + (Math.random() - 0.5) * 30;
          const x = centerX + Math.cos(angle) * radiusVariation;
          const y = centerY + Math.sin(angle) * radiusVariation;
          
          nodes.push({
            x, y, baseX: x, baseY: y,
            size: Math.max(1, 4 - layer * 0.5) + Math.random() * 2,
            intensity: 0,
            connections: [],
            pulsePhase: Math.random() * Math.PI * 2,
            growthProgress: 0,
            nodeType: layer < 3 ? 'branch' : 'leaf',
            depth: layer
          });
        }
      }

      // Conectar nós baseado em proximidade e hierarquia
      nodes.forEach((node, index) => {
        const maxConnections = node.nodeType === 'core' ? 6 : 
                              node.nodeType === 'branch' ? 4 : 2;
        
        const nearbyNodes = nodes
          .map((otherNode, otherIndex) => {
            if (index === otherIndex) return null;
            const dx = node.baseX - otherNode.baseX;
            const dy = node.baseY - otherNode.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { index: otherIndex, distance, node: otherNode };
          })
          .filter(item => item !== null)
          .sort((a, b) => a!.distance - b!.distance)
          .slice(0, maxConnections * 2);

        // Conectar preferencialmente com nós de camadas adjacentes
        nearbyNodes.forEach(item => {
          if (node.connections.length >= maxConnections) return;
          
          const { index: otherIndex, distance, node: otherNode } = item!;
          const depthDiff = Math.abs(node.depth - otherNode.depth);
          
          if (distance < 120 && (depthDiff <= 1 || Math.random() < 0.3)) {
            node.connections.push(otherIndex);
          }
        });
      });
    };

    createBrainNetwork();

    let animationTime = 0;
    let globalIntensity = 0;

    // Efeito sonoro neural
    const playNeuralPulse = (frequency: number = 60) => {
      if (!soundEnabled || !audioContextRef.current) return;
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    };

    const animate = () => {
      animationTime += 0.016;
      
      // Fase 1: Crescimento da rede (primeiros 4 segundos)
      if (animationTime < 4) {
        globalIntensity = Math.min(1, animationTime / 4);
        if (animationPhase !== 'growing') {
          setAnimationPhase('growing');
        }
      } 
      // Fase 2: Rede ativa e pulsante
      else if (animationTime < 7) {
        globalIntensity = 0.8 + Math.sin(animationTime * 3) * 0.2;
        if (animationPhase !== 'pulsing') {
          setAnimationPhase('pulsing');
        }
      }
      // Fase 3: Finalização
      else {
        if (animationPhase !== 'complete') {
          setAnimationPhase('complete');
          setTimeout(() => {
            onAnimationComplete?.();
          }, 1000);
        }
      }

      // Limpar canvas com efeito de névoa
      ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar nós
      nodes.forEach((node, index) => {
        // Crescimento progressivo baseado na profundidade
        const growthDelay = node.depth * 0.3;
        node.growthProgress = Math.max(0, Math.min(1, (animationTime - growthDelay) / 2));
        
        // Movimento orgânico sutil
        const organicMovement = Math.sin(animationTime * 0.5 + index * 0.1) * 2;
        node.x = node.baseX + organicMovement;
        node.y = node.baseY + Math.cos(animationTime * 0.3 + index * 0.15) * 1.5;
        
        // Atualizar fase do pulso
        node.pulsePhase += 0.02 + node.intensity * 0.01;
        
        // Intensidade baseada no tipo de nó e atividade global
        const baseIntensity = node.nodeType === 'core' ? 0.8 : 
                             node.nodeType === 'branch' ? 0.6 : 0.4;
        node.intensity = baseIntensity * globalIntensity * node.growthProgress +
                        Math.sin(node.pulsePhase) * 0.3 * node.growthProgress;
      });

      // Renderizar conexões (sinapses)
      nodes.forEach((node, index) => {
        if (node.growthProgress < 0.3) return;
        
        node.connections.forEach(connectionIndex => {
          const otherNode = nodes[connectionIndex];
          if (!otherNode || otherNode.growthProgress < 0.3) return;

          // Intensidade da conexão baseada na atividade dos nós
          const connectionIntensity = (node.intensity + otherNode.intensity) * 0.4;
          if (connectionIntensity < 0.1) return;

          // Efeito elétrico na conexão
          const electricVariation = Math.sin(animationTime * 8 + index * 0.5) * 1.5;
          
          // Gradiente da sinapse
          const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
          gradient.addColorStop(0, `rgba(0, 150, 255, ${connectionIntensity * 0.8})`);
          gradient.addColorStop(0.5, `rgba(100, 50, 255, ${connectionIntensity})`);
          gradient.addColorStop(1, `rgba(0, 255, 150, ${connectionIntensity * 0.6})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + connectionIntensity * 2;
          ctx.shadowBlur = 8 + connectionIntensity * 10;
          ctx.shadowColor = `rgba(0, 150, 255, ${connectionIntensity})`;
          
          ctx.beginPath();
          ctx.moveTo(node.x + electricVariation, node.y + electricVariation);
          
          // Curva orgânica da conexão
          const midX = (node.x + otherNode.x) / 2 + Math.sin(animationTime * 2 + index) * 5;
          const midY = (node.y + otherNode.y) / 2 + Math.cos(animationTime * 1.5 + index) * 5;
          
          ctx.quadraticCurveTo(midX, midY, otherNode.x + electricVariation, otherNode.y + electricVariation);
          ctx.stroke();
          
          // Impulsos neurais viajando pelas conexões
          if (connectionIntensity > 0.6 && Math.random() < 0.08) {
            const pulseProgress = (animationTime * 3 + index) % 1;
            const pulseX = node.x + (otherNode.x - node.x) * pulseProgress;
            const pulseY = node.y + (otherNode.y - node.y) * pulseProgress;
            
            ctx.fillStyle = `rgba(255, 255, 100, ${1 - pulseProgress})`;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(255, 255, 100, 0.8)';
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2 + connectionIntensity * 2, 0, Math.PI * 2);
            ctx.fill();
            
            if (soundEnabled && Math.random() < 0.03) {
              playNeuralPulse(80 + Math.random() * 40);
            }
          }
        });
      });

      // Renderizar nós (neurônios)
      nodes.forEach(node => {
        if (node.growthProgress < 0.1) return;
        
        const nodeSize = node.size * node.growthProgress * (1 + node.intensity * 0.3);
        const nodeIntensity = node.intensity * node.growthProgress;

        // Cor baseada no tipo de neurônio
        const nodeColor = node.nodeType === 'core' ? [255, 100, 100] :
                         node.nodeType === 'branch' ? [100, 100, 255] : [100, 255, 100];

        // Halo exterior
        ctx.shadowBlur = 15 + nodeIntensity * 20;
        ctx.shadowColor = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity * 0.8})`;
        ctx.fillStyle = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Corpo do neurônio
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity * 0.7})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante
        if (nodeIntensity > 0.3) {
          ctx.shadowBlur = 3;
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeIntensity})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Efeito de energia global
      if (globalIntensity > 0.7) {
        const energyAlpha = (globalIntensity - 0.7) * 0.15;
        ctx.fillStyle = `rgba(50, 0, 150, ${energyAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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
        background: 'radial-gradient(circle at center, rgba(10, 0, 30, 0.9) 0%, rgba(0, 0, 0, 0.98) 100%)'
      }}
    />
  );
}
