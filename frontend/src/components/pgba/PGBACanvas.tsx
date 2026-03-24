// src/components/pgba/PGBACanvas.tsx - Ajustado para canto esquerdo
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: number;
}

interface PGBACanvasProps {
  isDarkMode: boolean;
}

export const PGBACanvas: React.FC<PGBACanvasProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas apenas no canto esquerdo - 40% da largura
    const canvasWidth = window.innerWidth * 0.4;
    const canvasHeight = window.innerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const resizeCanvas = () => {
      const newWidth = window.innerWidth * 0.4;
      const newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
    };

    // Menos partículas já que a área é menor
    const numParticles = 50;
    const connectionDistance = 120;
    
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
      type: Math.random() > 0.5 ? 1 : 2,
    }));

    const getParticleColor = (type: number) => {
      if (isDarkMode) {
        return type === 1 ? '#38bdf8' : '#c026d3'; // Neon Ciano e Fuchsia
      } else {
        return type === 1 ? '#0369a1' : '#6d28d9'; // Azul Escuro e Roxo Escuro
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particle.type);
        ctx.shadowBlur = isDarkMode ? 12 : 2;
        ctx.shadowColor = getParticleColor(particle.type);
        ctx.fill();

        // Draw connections
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - (distance / connectionDistance);
            const rgbLine = isDarkMode ? '139, 92, 246' : '71, 85, 105';
            ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * (isDarkMode ? 0.4 : 0.2)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-[1]"
      style={{ width: '40%', height: '100%' }}
    />
  );
};