
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
    // Deixar a primeira tela por 13 segundos conforme solicitado
    const videoTimer = setTimeout(() => {
      console.log('🎬 Primeira tela completa (13s), mostrando logo');
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
      
    }, 13000); // 13 segundos para a primeira tela

    return () => clearTimeout(videoTimer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 w-full h-full flex items-center justify-center"
         style={{ 
           background: 'radial-gradient(circle at center, rgba(15, 0, 35, 0.98) 0%, rgba(0, 0, 0, 0.99) 100%)'
         }}>
      
      {/* Efeito neural de fundo tecnológico suavizado */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {/* Partículas neurais mais suaves */}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400/40 to-cyan-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              boxShadow: '0 0 10px currentColor'
            }}
          />
        ))}
        
        {/* Linhas conectoras neurais tecnológicas */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute border-t border-gradient-to-r from-purple-500/15 to-cyan-500/15"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              width: `${80 + Math.random() * 150}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 3}s`,
              background: `linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)`,
              height: '1px',
              filter: 'blur(0.5px)'
            }}
          />
        ))}

        {/* Efeitos de circuito tecnológico */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`circuit-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              width: '40px',
              height: '40px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
              animation: `pulse ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}

        {/* Ondas tecnológicas */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`wave-${i}`}
            className="absolute inset-0 border border-purple-500/10 rounded-full"
            style={{
              animation: `ping ${8 + i * 2}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Vídeo responsivo */}
      {showVideo && (
        <div className="relative w-full h-full flex items-center justify-center animate-fade-in px-2 sm:px-4">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/50 border border-purple-400/30">
            {/* Container responsivo para o iframe */}
            <div className="relative w-full h-full">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/9xvhXm159UM?si=usOoMhipbjpx6Z3l&autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&start=0" 
                title="Brain Animation Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="rounded-xl sm:rounded-2xl lg:rounded-3xl"
                style={{
                  aspectRatio: '16/9',
                  objectFit: 'cover'
                }}
              />
              
              {/* Overlay neural muito sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/3 via-transparent to-blue-900/3 pointer-events-none rounded-xl sm:rounded-2xl lg:rounded-3xl" />
              
              {/* Efeito de borda tecnológica */}
              <div className="absolute inset-0 border-2 border-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl lg:rounded-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Logo da Yumer com transição mais suave */}
      {animationPhase === 'showingLogo' && (
        <div 
          className="flex flex-col items-center justify-center text-center animate-fade-in px-4"
          style={{ opacity: logoOpacity, transition: 'opacity 2s ease-in-out' }}
        >
          <div className="mb-6 sm:mb-8 relative">
            <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-purple-400/70 shadow-2xl shadow-purple-500/60">
              <div className="text-4xl sm:text-6xl lg:text-8xl font-black text-white drop-shadow-2xl">Y</div>
            </div>
            
            {/* Efeitos de brilho concêntricos responsivos */}
            <div className="absolute inset-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 mx-auto bg-gradient-to-r from-purple-500/40 to-blue-500/40 rounded-full blur-xl sm:blur-2xl animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 mx-auto bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-9xl font-black text-white mb-4 sm:mb-6 drop-shadow-2xl">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent glow-text-mega">
              Yumer
            </span>
          </h1>
          
          <p className="text-2xl sm:text-3xl lg:text-5xl font-light text-gray-300 mb-6 sm:mb-10 drop-shadow-lg glow-text">
            Mind
          </p>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-purple-300 font-light max-w-3xl leading-relaxed glow-text">
            Seu segundo cérebro está ativando...
          </p>
        </div>
      )}
      
      {/* Indicador de progresso elegante responsivo */}
      {showVideo && (
        <div className="absolute bottom-6 sm:bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-500/60"
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
