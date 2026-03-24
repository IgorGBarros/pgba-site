// src/components/pgba/PGBACanvas.tsx - Versão com mais conexões e movimento suave
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
      
      // Reposiciona partículas se necessário
      particlesRef.current.forEach(particle => {
        if (particle.x > newWidth) particle.x = newWidth - 50;
        if (particle.y > newHeight) particle.y = newHeight - 50;
      });
    };

    // Configurações ajustadas
    const numParticles = 60; // Mais partículas para mais conexões
    const connectionDistance = 180; // Distância maior para mais linhas conectadas
    
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.3, // Movimento muito mais lento
      vy: (Math.random() - 0.5) * 0.3, // Movimento muito mais lento
      radius: Math.random() * 1.5 + 1, // Partículas um pouco menores
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
        // Update position com movimento mais suave
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce mais suave nas bordas
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particle.type);
        ctx.shadowBlur = isDarkMode ? 8 : 2; // Brilho mais suave
        ctx.shadowColor = getParticleColor(particle.type);
        ctx.fill();

        // Draw connections com mais densidade
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - (distance / connectionDistance);
            const rgbLine = isDarkMode ? '139, 92, 246' : '71, 85, 105';
            
            // Linhas mais visíveis e suaves
            ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * (isDarkMode ? 0.6 : 0.4)})`;
            ctx.lineWidth = opacity > 0.7 ? 1.5 : 1; // Linhas mais próximas ficam mais grossas
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            
            // Adiciona um brilho sutil nas conexões mais fortes
            if (opacity > 0.8 && isDarkMode) {
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.2})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
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