// components/PGBACanvas.tsx
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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    // Initialize particles
    const numParticles = 80;
    const connectionDistance = 140;
    
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.0,
      vy: (Math.random() - 0.5) * 1.0,
      radius: Math.random() * 2 + 1,
      type: Math.random() > 0.5 ? 1 : 2,
    }));

    const getParticleColor = (type: number) => {
      if (isDarkMode) {
        return type === 1 ? '#38bdf8' : '#c026d3';
      } else {
        return type === 1 ? '#0369a1' : '#6d28d9';
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
      className="absolute top-0 left-0 w-full h-full z-[1]"
    />
  );
};