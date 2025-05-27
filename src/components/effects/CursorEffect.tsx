
import React, { useEffect, useRef } from 'react';

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      const speed = 0.15;
      const trailSpeed = 0.08;

      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      
      trailX += (mouseX - trailX) * trailSpeed;
      trailY += (mouseY - trailY) * trailSpeed;

      cursor.style.transform = `translate(${cursorX - 8}px, ${cursorY - 8}px)`;
      trail.style.transform = `translate(${trailX - 20}px, ${trailY - 20}px)`;

      requestAnimationFrame(animateCursor);
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
      trail.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
      trail.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    animateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className="fixed top-0 left-0 w-10 h-10 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full pointer-events-none z-50 opacity-0 transition-opacity duration-300 blur-sm"
        style={{ mixBlendMode: 'screen' }}
      />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pointer-events-none z-50 opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: 'screen' }}
      />
    </>
  );
}
