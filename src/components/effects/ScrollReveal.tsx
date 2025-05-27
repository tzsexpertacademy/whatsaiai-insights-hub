
import React from 'react';
import { useScrollAnimation } from '@/hooks/useParallax';

interface ScrollRevealProps {
  children: React.ReactNode;
  id: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  className?: string;
}

export function ScrollReveal({ 
  children, 
  id, 
  direction = 'up', 
  delay = 0,
  className = '' 
}: ScrollRevealProps) {
  const visibleElements = useScrollAnimation();
  const isVisible = visibleElements.has(id);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';
    
    switch (direction) {
      case 'up': return 'translate(0, 60px) scale(0.95)';
      case 'down': return 'translate(0, -60px) scale(0.95)';
      case 'left': return 'translate(60px, 0) scale(0.95)';
      case 'right': return 'translate(-60px, 0) scale(0.95)';
      case 'scale': return 'translate(0, 0) scale(0.8)';
      default: return 'translate(0, 60px) scale(0.95)';
    }
  };

  return (
    <div
      id={id}
      data-animate
      className={className}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
