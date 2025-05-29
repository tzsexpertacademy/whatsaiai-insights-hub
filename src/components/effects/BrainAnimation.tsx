
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
    // Deixar o vídeo rodar por muito mais tempo para ser assistido completo
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
      
    }, 30000); // 30 segundos para assistir o vídeo completo

    return () => clearTimeout(videoTimer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 w-full h-full flex items-center justify-center"
         style={{ 
           background: 'radial-gradient(circle at center, rgba(15, 0, 35, 0.98) 0%, rgba(0, 0, 0, 0.99) 100%)'
         }}>
      
      {/* Efeito neural de fundo durante a animação */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-purple-400/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Linhas conectoras neurais */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute border-t border-purple-500/20"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              width: `${50 + Math.random() * 200}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Vídeo do YouTube */}
      {showVideo && (
        <div className="relative w-full h-full flex items-center justify-center animate-fade-in">
          <div className="relative w-[95vw] h-[95vh] max-w-6xl max-h-[800px] rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/50 border-2 border-purple-400/40">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/p1y4YsZSyaA?si=39ic_TKTdrFaojkY&autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1" 
              title="Brain Animation Video" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="rounded-3xl"
            />
            
            {/* Overlay neural muito sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Logo da Yumer com transição mais suave */}
      {animationPhase === 'showingLogo' && (
        <div 
          className="flex flex-col items-center justify-center text-center animate-fade-in"
          style={{ opacity: logoOpacity, transition: 'opacity 2s ease-in-out' }}
        >
          <div className="mb-8 relative">
            <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-purple-400/70 shadow-2xl shadow-purple-500/60">
              <div className="text-8xl font-black text-white drop-shadow-2xl">Y</div>
            </div>
            
            {/* Efeitos de brilho concêntricos */}
            <div className="absolute inset-0 w-64 h-64 mx-auto bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 w-64 h-64 mx-auto bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <h1 className="text-9xl font-black text-white mb-6 drop-shadow-2xl">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text-mega">
              Yumer
            </span>
          </h1>
          
          <p className="text-5xl font-light text-gray-300 mb-10 drop-shadow-lg glow-text">
            Mind
          </p>
          
          <p className="text-2xl text-purple-300 font-light max-w-3xl leading-relaxed glow-text">
            Seu segundo cérebro está ativando...
          </p>
        </div>
      )}
      
      {/* Indicador de progresso elegante */}
      {showVideo && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/60"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2.5s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
