
import React, { useEffect, useRef, useState } from 'react';

interface BrainAnimationProps {
  onAnimationComplete?: () => void;
  soundEnabled?: boolean;
}

export function BrainAnimation({ onAnimationComplete, soundEnabled = false }: BrainAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'growing' | 'pulsing' | 'showingLogo' | 'complete'>('growing');

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

    // Audio setup com sons mais vibrantes
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Estrutura anatômica do cérebro
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
      nodeType: 'cortex' | 'limbic' | 'brainstem' | 'cerebellum';
      region: string;
      depth: number;
    }> = [];

    // Criar estrutura anatômica realista do cérebro
    const createBrainStructure = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Tronco cerebral (base)
      const brainstemNodes = 6;
      for (let i = 0; i < brainstemNodes; i++) {
        const angle = (i / brainstemNodes) * Math.PI * 2;
        const radius = 25;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + 60 + Math.sin(angle) * radius * 0.5;
        
        nodes.push({
          x, y, baseX: x, baseY: y,
          size: 3 + Math.random() * 2,
          intensity: 0,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          growthProgress: 0,
          nodeType: 'brainstem',
          region: 'brainstem',
          depth: 0
        });
      }

      // Sistema límbico (emocional)
      const limbicNodes = 12;
      for (let i = 0; i < limbicNodes; i++) {
        const angle = (i / limbicNodes) * Math.PI * 2;
        const radius = 45 + Math.random() * 15;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + 20 + Math.sin(angle) * radius * 0.6;
        
        nodes.push({
          x, y, baseX: x, baseY: y,
          size: 3.5 + Math.random() * 2,
          intensity: 0,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          growthProgress: 0,
          nodeType: 'limbic',
          region: 'limbic',
          depth: 1
        });
      }

      // Córtex cerebral (hemisfério esquerdo e direito)
      const cortexLayers = 4;
      for (let layer = 0; layer < cortexLayers; layer++) {
        const layerNodes = 16 + layer * 8;
        
        for (let i = 0; i < layerNodes; i++) {
          const angle = (i / layerNodes) * Math.PI * 2;
          const baseRadius = 70 + layer * 35;
          
          // Forma de cérebro (mais largo na parte superior)
          const brainShape = Math.sin(angle + Math.PI) * 0.3 + 1;
          const radius = baseRadius * brainShape;
          
          // Criar hemisférios
          const hemisphere = angle < Math.PI ? 'left' : 'right';
          const hemisphereOffset = hemisphere === 'left' ? -8 : 8;
          
          const x = centerX + hemisphereOffset + Math.cos(angle) * radius;
          const y = centerY - 10 + Math.sin(angle) * radius * 0.7; // Achatado verticalmente
          
          // Só criar nós na parte superior (formato de cérebro)
          if (angle > Math.PI * 0.1 && angle < Math.PI * 0.9 || 
              angle > Math.PI * 1.1 && angle < Math.PI * 1.9) {
            nodes.push({
              x, y, baseX: x, baseY: y,
              size: 4 - layer * 0.5 + Math.random() * 2,
              intensity: 0,
              connections: [],
              pulsePhase: Math.random() * Math.PI * 2,
              growthProgress: 0,
              nodeType: 'cortex',
              region: `cortex_${hemisphere}_l${layer}`,
              depth: 2 + layer
            });
          }
        }
      }

      // Cerebelo (parte posterior inferior)
      const cerebellumNodes = 20;
      for (let i = 0; i < cerebellumNodes; i++) {
        const angle = Math.PI + (i / cerebellumNodes) * Math.PI; // Só parte inferior
        const radius = 40 + Math.random() * 20;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + 40 + Math.sin(angle) * radius * 0.4;
        
        nodes.push({
          x, y, baseX: x, baseY: y,
          size: 2.5 + Math.random() * 1.5,
          intensity: 0,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
          growthProgress: 0,
          nodeType: 'cerebellum',
          region: 'cerebellum',
          depth: 1
        });
      }

      // Conectar regiões do cérebro de forma hierárquica
      nodes.forEach((node, index) => {
        const maxConnections = node.nodeType === 'brainstem' ? 8 : 
                              node.nodeType === 'limbic' ? 6 : 
                              node.nodeType === 'cortex' ? 4 : 3;
        
        const nearbyNodes = nodes
          .map((otherNode, otherIndex) => {
            if (index === otherIndex) return null;
            const dx = node.baseX - otherNode.baseX;
            const dy = node.baseY - otherNode.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { index: otherIndex, distance, node: otherNode };
          })
          .filter(item => item !== null)
          .sort((a, b) => a!.distance - b!.distance);

        // Conexões preferenciais entre regiões
        nearbyNodes.forEach(item => {
          if (node.connections.length >= maxConnections) return;
          
          const { index: otherIndex, distance, node: otherNode } = item!;
          const connectionThreshold = node.nodeType === otherNode.nodeType ? 80 : 120;
          
          if (distance < connectionThreshold) {
            // Priorizar conexões anatômicas corretas
            const shouldConnect = 
              (node.nodeType === 'brainstem' && otherNode.nodeType === 'limbic') ||
              (node.nodeType === 'limbic' && otherNode.nodeType === 'cortex') ||
              (node.nodeType === otherNode.nodeType) ||
              Math.random() < 0.3;
            
            if (shouldConnect) {
              node.connections.push(otherIndex);
            }
          }
        });
      });
    };

    createBrainStructure();

    let animationTime = 0;
    let globalIntensity = 0;
    let logoOpacity = 0;

    // Sons vibrantes mais intensos
    const playVibriantPulse = (frequency: number = 40, intensity: number = 0.1) => {
      if (!soundEnabled || !audioContextRef.current) return;
      
      const ctx = audioContextRef.current;
      
      // Tom base profundo
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.frequency.setValueAtTime(frequency, ctx.currentTime);
      bassGain.gain.setValueAtTime(0, ctx.currentTime);
      bassGain.gain.linearRampToValueAtTime(intensity, ctx.currentTime + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      // Harmônicos
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonic.frequency.setValueAtTime(frequency * 2.5, ctx.currentTime);
      harmonicGain.gain.setValueAtTime(0, ctx.currentTime);
      harmonicGain.gain.linearRampToValueAtTime(intensity * 0.3, ctx.currentTime + 0.05);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);
      
      bass.start();
      harmonic.start();
      bass.stop(ctx.currentTime + 0.8);
      harmonic.stop(ctx.currentTime + 0.4);
    };

    // Som ambiente contínuo
    const playAmbientDrone = () => {
      if (!soundEnabled || !audioContextRef.current) return;
      
      const ctx = audioContextRef.current;
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      
      drone.frequency.setValueAtTime(30, ctx.currentTime);
      droneGain.gain.setValueAtTime(0.02, ctx.currentTime);
      
      drone.connect(droneGain);
      droneGain.connect(ctx.destination);
      drone.start();
      
      return { drone, droneGain };
    };

    let ambientDrone: any = null;
    if (soundEnabled) {
      ambientDrone = playAmbientDrone();
    }

    const animate = () => {
      animationTime += 0.016;
      
      // Fase 1: Crescimento da rede neural (4 segundos)
      if (animationTime < 4) {
        globalIntensity = Math.min(1, animationTime / 4);
        if (animationPhase !== 'growing') {
          setAnimationPhase('growing');
          if (soundEnabled && animationTime > 0.5) {
            playVibriantPulse(35, 0.15);
          }
        }
      } 
      // Fase 2: Rede ativa e pulsante (3 segundos)
      else if (animationTime < 7) {
        globalIntensity = 0.9 + Math.sin(animationTime * 4) * 0.3;
        if (animationPhase !== 'pulsing') {
          setAnimationPhase('pulsing');
          if (soundEnabled) {
            playVibriantPulse(50, 0.2);
          }
        }
      }
      // Fase 3: Mostrar logo (2 segundos)
      else if (animationTime < 9) {
        logoOpacity = Math.min(1, (animationTime - 7) / 2);
        globalIntensity = 0.6 + Math.sin(animationTime * 2) * 0.2;
        if (animationPhase !== 'showingLogo') {
          setAnimationPhase('showingLogo');
          if (soundEnabled) {
            playVibriantPulse(80, 0.25);
          }
        }
      }
      // Fase 4: Finalização
      else {
        if (animationPhase !== 'complete') {
          setAnimationPhase('complete');
          if (ambientDrone) {
            ambientDrone.droneGain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 1);
            ambientDrone.drone.stop(audioContextRef.current!.currentTime + 1);
          }
          setTimeout(() => {
            onAnimationComplete?.();
          }, 1000);
        }
      }

      // Limpar canvas com efeito neurológico
      ctx.fillStyle = 'rgba(5, 0, 20, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Atualizar neurônios
      nodes.forEach((node, index) => {
        // Crescimento baseado na região cerebral
        const regionDelay = node.nodeType === 'brainstem' ? 0 :
                           node.nodeType === 'limbic' ? 0.5 :
                           node.nodeType === 'cortex' ? 1 :
                           node.nodeType === 'cerebellum' ? 1.5 : 0;
        
        node.growthProgress = Math.max(0, Math.min(1, (animationTime - regionDelay) / 3));
        
        // Movimento orgânico sutil
        const organicX = Math.sin(animationTime * 0.3 + index * 0.1) * 1.5;
        const organicY = Math.cos(animationTime * 0.2 + index * 0.15) * 1;
        
        node.x = node.baseX + organicX;
        node.y = node.baseY + organicY;
        
        // Atividade neural baseada na região
        const baseActivity = node.nodeType === 'cortex' ? 0.8 :
                            node.nodeType === 'limbic' ? 0.9 :
                            node.nodeType === 'brainstem' ? 1.0 :
                            node.nodeType === 'cerebellum' ? 0.7 : 0.5;
        
        node.intensity = baseActivity * globalIntensity * node.growthProgress +
                        Math.sin(animationTime * 3 + index * 0.5) * 0.4 * node.growthProgress;
        
        // Pulsos neurais sincronizados
        if (node.intensity > 0.7 && Math.random() < 0.05) {
          if (soundEnabled) {
            playVibriantPulse(60 + Math.random() * 40, 0.08);
          }
        }
      });

      // Renderizar conexões sinápticas
      nodes.forEach((node, index) => {
        if (node.growthProgress < 0.2) return;
        
        node.connections.forEach(connectionIndex => {
          const otherNode = nodes[connectionIndex];
          if (!otherNode || otherNode.growthProgress < 0.2) return;

          const connectionIntensity = (node.intensity + otherNode.intensity) * 0.5;
          if (connectionIntensity < 0.1) return;

          // Impulso elétrico viajante
          const pulseSpeed = 2 + connectionIntensity;
          const pulseProgress = (animationTime * pulseSpeed + index * 0.3) % 1;
          
          // Gradiente sináptico
          const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
          
          // Cores baseadas no tipo de neurônio
          const nodeColor = node.nodeType === 'cortex' ? [100, 150, 255] :
                           node.nodeType === 'limbic' ? [255, 100, 150] :
                           node.nodeType === 'brainstem' ? [255, 200, 100] :
                           [150, 255, 150];
          
          gradient.addColorStop(0, `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${connectionIntensity * 0.9})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${connectionIntensity * 0.6})`);
          gradient.addColorStop(1, `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${connectionIntensity * 0.9})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + connectionIntensity * 3;
          ctx.shadowBlur = 10 + connectionIntensity * 15;
          ctx.shadowColor = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${connectionIntensity})`;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          
          // Curva orgânica
          const controlX = (node.x + otherNode.x) / 2 + Math.sin(animationTime + index) * 8;
          const controlY = (node.y + otherNode.y) / 2 + Math.cos(animationTime + index) * 8;
          ctx.quadraticCurveTo(controlX, controlY, otherNode.x, otherNode.y);
          ctx.stroke();
          
          // Impulso neural viajante
          if (connectionIntensity > 0.5) {
            const pulseX = node.x + (otherNode.x - node.x) * pulseProgress;
            const pulseY = node.y + (otherNode.y - node.y) * pulseProgress;
            
            ctx.fillStyle = `rgba(255, 255, 100, ${1 - pulseProgress})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(255, 255, 100, 0.9)';
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2 + connectionIntensity * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Renderizar neurônios com efeitos visuais intensos
      nodes.forEach(node => {
        if (node.growthProgress < 0.1) return;
        
        const nodeSize = node.size * node.growthProgress * (1 + node.intensity * 0.5);
        const nodeIntensity = node.intensity * node.growthProgress;

        // Cores por tipo de neurônio
        const nodeColor = node.nodeType === 'cortex' ? [100, 150, 255] :
                         node.nodeType === 'limbic' ? [255, 100, 150] :
                         node.nodeType === 'brainstem' ? [255, 200, 100] :
                         [150, 255, 150];

        // Halo exterior pulsante
        ctx.shadowBlur = 25 + nodeIntensity * 30;
        ctx.shadowColor = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity})`;
        ctx.fillStyle = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity * 0.4})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Corpo do neurônio
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(${nodeColor[0]}, ${nodeColor[1]}, ${nodeColor[2]}, ${nodeIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brilhante
        if (nodeIntensity > 0.4) {
          ctx.shadowBlur = 5;
          ctx.fillStyle = `rgba(255, 255, 255, ${nodeIntensity})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Mostrar logo da Yumer
      if (logoOpacity > 0) {
        const logoSize = 200 * logoOpacity;
        const logoX = canvas.width / 2 - logoSize / 2;
        const logoY = canvas.height / 2 - logoSize / 2;
        
        // Fundo da logo com brilho
        ctx.shadowBlur = 50;
        ctx.shadowColor = `rgba(147, 51, 234, ${logoOpacity * 0.8})`;
        ctx.fillStyle = `rgba(0, 0, 0, ${logoOpacity * 0.7})`;
        ctx.fillRect(logoX - 50, logoY - 50, logoSize + 100, logoSize + 100);
        
        // Texto "Yumer" estilizado
        ctx.shadowBlur = 30;
        ctx.shadowColor = `rgba(147, 51, 234, ${logoOpacity})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${logoOpacity})`;
        ctx.font = `bold ${60 * logoOpacity}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('Yumer', canvas.width / 2, canvas.height / 2 + 20);
        
        // Efeito "Mind" abaixo
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(79, 70, 229, ${logoOpacity})`;
        ctx.fillStyle = `rgba(200, 200, 255, ${logoOpacity * 0.8})`;
        ctx.font = `normal ${30 * logoOpacity}px Arial`;
        ctx.fillText('Mind', canvas.width / 2, canvas.height / 2 + 70);
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
      if (ambientDrone) {
        ambientDrone.drone.stop();
      }
    };
  }, [soundEnabled, onAnimationComplete, animationPhase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full"
      style={{ 
        background: 'radial-gradient(circle at center, rgba(20, 0, 40, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)'
      }}
    />
  );
}
