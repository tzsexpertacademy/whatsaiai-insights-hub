
import React, { useEffect, useRef, useState } from 'react';

interface BrainAnimationProps {
  onAnimationComplete?: () => void;
  soundEnabled?: boolean;
}

export function BrainAnimation({ onAnimationComplete, soundEnabled = false }: BrainAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'video' | 'showingLogo' | 'complete'>('video');
  const [showVideo, setShowVideo] = useState(true);
  const [logoOpacity, setLogoOpacity] = useState(0);

  useEffect(() => {
    // Mostrar vídeo por 6 segundos
    const videoTimer = setTimeout(() => {
      console.log('🎬 Vídeo terminado, mostrando logo');
      setShowVideo(false);
      setAnimationPhase('showingLogo');
      
      // Fade in da logo
      setTimeout(() => {
        setLogoOpacity(1);
      }, 100);
      
      // Mostrar logo por 3 segundos
      setTimeout(() => {
        setAnimationPhase('complete');
        console.log('✅ Animação completa');
        onAnimationComplete?.();
      }, 3000);
      
    }, 6000);

    return () => clearTimeout(videoTimer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 w-full h-full flex items-center justify-center"
         style={{ 
           background: 'radial-gradient(circle at center, rgba(20, 0, 40, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)'
         }}>
      
      {/* Vídeo do YouTube */}
      {showVideo && (
        <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
          <div className="relative w-[90vw] h-[90vh] max-w-4xl max-h-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30 border border-purple-500/20">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/p1y4YsZSyaA?si=39ic_TKTdrFaojkY&autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=p1y4YsZSyaA" 
              title="Brain Animation Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="rounded-2xl"
            />
            
            {/* Overlay neural sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-blue-900/10 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Logo da Yumer */}
      {animationPhase === 'showingLogo' && (
        <div 
          className="flex flex-col items-center justify-center text-center animate-fade-in"
          style={{ opacity: logoOpacity, transition: 'opacity 1s ease-in-out' }}
        >
          {/* Logo principal */}
          <div className="mb-8 relative">
            <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-400/50">
              <div className="text-6xl font-black text-white drop-shadow-2xl">Y</div>
            </div>
            
            {/* Efeito de brilho ao redor */}
            <div className="absolute inset-0 w-48 h-48 mx-auto bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          
          {/* Texto "Yumer" estilizado */}
          <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Yumer
            </span>
          </h1>
          
          {/* Subtitle "Mind" */}
          <p className="text-3xl font-light text-gray-300 mb-8 drop-shadow-lg">
            Mind
          </p>
          
          {/* Tagline */}
          <p className="text-xl text-purple-300 font-light max-w-2xl leading-relaxed">
            Seu segundo cérebro está ativando...
          </p>
          
          {/* Efeitos visuais */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Partículas flutuantes */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/60 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Indicador de progresso sutil */}
      {showVideo && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-400/60 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
