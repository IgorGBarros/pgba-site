// src/components/pgba/PGBACanvas.tsx - Versão com mais neon no tema claro
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
    const numParticles = 60;
    const connectionDistance = 180;
    
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 1,
      type: Math.random() > 0.5 ? 1 : 2,
    }));

    const getParticleColor = (type: number) => {
      if (isDarkMode) {
        return type === 1 ? '#38bdf8' : '#c026d3'; // Neon Ciano e Fuchsia
      } else {
        // Cores mais vibrantes e neon no tema claro
        return type === 1 ? '#00d4ff' : '#ff0080'; // Ciano neon e Rosa neon
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

        // Draw particle com mais brilho no tema claro
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particle.type);
        
        // Brilho muito mais intenso no tema claro
        ctx.shadowBlur = isDarkMode ? 8 : 20; // Brilho 2.5x maior no claro
        ctx.shadowColor = getParticleColor(particle.type);
        ctx.fill();

        // Adiciona um segundo layer de brilho no tema claro
        if (!isDarkMode) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = getParticleColor(particle.type);
          ctx.fill();
        }

        // Draw connections com mais intensidade
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - (distance / connectionDistance);
            
            let rgbLine, lineOpacity;
            if (isDarkMode) {
              rgbLine = '139, 92, 246';
              lineOpacity = opacity * 0.6;
            } else {
              // Linhas mais vibrantes no tema claro
              rgbLine = particle.type === 1 ? '0, 212, 255' : '255, 0, 128'; // Cores neon
              lineOpacity = opacity * 0.8; // Mais opacas
            }
            
            ctx.strokeStyle = `rgba(${rgbLine}, ${lineOpacity})`;
            ctx.lineWidth = opacity > 0.7 ? 2 : 1.5; // Linhas mais grossas no claro
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            // Adiciona brilho nas linhas no tema claro
            if (!isDarkMode) {
              ctx.shadowBlur = 8;
              ctx.shadowColor = `rgba(${rgbLine}, 0.6)`;
            }
            
            ctx.stroke();
            
            // Adiciona um brilho extra nas conexões mais fortes
            if (opacity > 0.8) {
              if (isDarkMode) {
                ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.2})`;
                ctx.lineWidth = 2;
              } else {
                // Brilho neon extra no tema claro
                ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * 0.4})`;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
              }
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