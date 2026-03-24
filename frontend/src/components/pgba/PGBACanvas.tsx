// src/components/pgba/PGBACanvas.tsx - Versão com MUITO mais neon no tema claro
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
        return type === 1 ? '#38bdf8' : '#c026d3';
      } else {
        // CORES NEON ULTRA SATURADAS para tema claro
        return type === 1 ? '#00ffff' : '#ff0099'; // Ciano puro e Rosa choque
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        const particleColor = getParticleColor(particle.type);

        if (!isDarkMode) {
          // TEMA CLARO: MÚLTIPLAS CAMADAS DE BRILHO NEON
          
          // Camada 1: Brilho externo gigante
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 50;
          ctx.shadowColor = particleColor;
          ctx.globalAlpha = 0.1;
          ctx.fill();
          
          // Camada 2: Brilho médio
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 30;
          ctx.shadowColor = particleColor;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          
          // Camada 3: Brilho interno
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = particleColor;
          ctx.globalAlpha = 0.6;
          ctx.fill();
          
          // Camada 4: Núcleo ultra brilhante
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = particleColor;
          ctx.globalAlpha = 1;
          ctx.fill();
          
          ctx.globalAlpha = 1; // Reset alpha
        } else {
          // TEMA ESCURO: Brilho normal
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = particleColor;
          ctx.fill();
        }

        // Draw connections
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            const opacity = 1 - (distance / connectionDistance);
            
            if (!isDarkMode) {
              // TEMA CLARO: LINHAS NEON ULTRA BRILHANTES
              
              // Determina cor da linha baseada no tipo das partículas
              const lineColor = particle.type === 1 ? '#00ffff' : '#ff0099';
              
              // Camada 1: Brilho externo da linha
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = opacity > 0.7 ? 8 : 6;
              ctx.shadowBlur = 25;
              ctx.shadowColor = lineColor;
              ctx.globalAlpha = opacity * 0.2;
              ctx.stroke();
              
              // Camada 2: Brilho médio da linha
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = opacity > 0.7 ? 4 : 3;
              ctx.shadowBlur = 15;
              ctx.shadowColor = lineColor;
              ctx.globalAlpha = opacity * 0.5;
              ctx.stroke();
              
              // Camada 3: Núcleo da linha
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = opacity > 0.7 ? 2 : 1;
              ctx.shadowBlur = 8;
              ctx.shadowColor = lineColor;
              ctx.globalAlpha = opacity * 0.8;
              ctx.stroke();
              
              ctx.globalAlpha = 1; // Reset alpha
            } else {
              // TEMA ESCURO: Linhas normais
              const rgbLine = '139, 92, 246';
              ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * 0.6})`;
              ctx.lineWidth = opacity > 0.7 ? 2 : 1.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
              
              if (opacity > 0.8) {
                ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * 0.2})`;
                ctx.lineWidth = 2;
                ctx.stroke();
              }
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