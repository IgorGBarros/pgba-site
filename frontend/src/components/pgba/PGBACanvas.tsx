// src/components/pgba/PGBACanvas.tsx - Canvas responsivo OTIMIZADO
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
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ═══════════════════════════════════════════
    // CONFIGURAÇÃO RESPONSIVA
    // ═══════════════════════════════════════════
    const isMobile = window.innerWidth < 768;

    const updateCanvasSize = () => {
      if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else {
        canvas.width = window.innerWidth * 0.4;
        canvas.height = window.innerHeight;
      }
    };

    updateCanvasSize();

    const resizeCanvas = () => {
      updateCanvasSize();
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].x > canvas.width) particles[i].x = canvas.width - 50;
        if (particles[i].y > canvas.height) particles[i].y = canvas.height - 50;
      }
    };

    // ═══════════════════════════════════════════
    // PARÂMETROS DE PERFORMANCE
    // ═══════════════════════════════════════════
    const numParticles = isMobile ? 35 : 60;
    const connectionDistance = isMobile ? 120 : 180;
    // ✅ PRÉ-CALCULAR o quadrado da distância (evita sqrt no loop)
    const connectionDistSq = connectionDistance * connectionDistance;

    // ✅ PRÉ-CALCULAR cores (evita recalcular a cada frame)
    const particleColor1 = isDarkMode ? '#38bdf8' : '#0066ff';
    const particleColor2 = isDarkMode ? '#c026d3' : '#cc0099';
    const lineRgbDark = '139, 92, 246';
    const lineRgb1Light = '0, 102, 255';
    const lineRgb2Light = '204, 0, 153';

    const particleShadowBlur = isDarkMode
      ? (isMobile ? 4 : 6)
      : (isMobile ? 8 : 10);

    const lineWidthThick = isMobile ? 1.5 : 2;
    const lineWidthThin = isMobile ? 1 : 1.5;

    // ═══════════════════════════════════════════
    // INICIALIZAR PARTÍCULAS
    // ═══════════════════════════════════════════
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
      vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.3),
      radius: Math.random() * (isMobile ? 1.2 : 1.5) + (isMobile ? 0.8 : 1),
      type: Math.random() > 0.5 ? 1 : 2,
    }));

    const getParticleColor = (type: number): string => {
      return type === 1 ? particleColor1 : particleColor2;
    };

    // ═══════════════════════════════════════════
    // LOOP DE ANIMAÇÃO OTIMIZADO
    // ═══════════════════════════════════════════
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const len = particles.length;
      const w = canvas.width;
      const h = canvas.height;

      // ─── FASE 1: Atualizar posições (separado do draw) ───
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) {
          p.vx *= -1;
          p.x = p.x < 0 ? 0 : w;
        }
        if (p.y < 0 || p.y > h) {
          p.vy *= -1;
          p.y = p.y < 0 ? 0 : h;
        }
      }

      // ─── FASE 2: Desenhar conexões (SEM shadowBlur) ───
      // ✅ CRÍTICO: shadowBlur = 0 durante conexões
      //    shadowBlur força composição por pixel = MUITO caro
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        for (let j = i + 1; j < len; j++) {
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;

          // ✅ EARLY EXIT: se um eixo já excede, pula
          //    Evita sqrt em ~60% dos pares
          if (dx > connectionDistance || dx < -connectionDistance) continue;
          if (dy > connectionDistance || dy < -connectionDistance) continue;

          // ✅ Comparar distância ao quadrado (evita sqrt)
          const distSq = dx * dx + dy * dy;
          if (distSq >= connectionDistSq) continue;

          // Só calcula sqrt quando realmente precisa da opacity
          const distance = Math.sqrt(distSq);
          const opacity = 1 - (distance / connectionDistance);

          let rgbLine: string;
          if (isDarkMode) {
            rgbLine = lineRgbDark;
          } else {
            rgbLine = p.type === 1 ? lineRgb1Light : lineRgb2Light;
          }

          const lineOpacity = isDarkMode
            ? opacity * 0.6
            : opacity * 0.8;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${rgbLine}, ${lineOpacity})`;
          ctx.lineWidth = opacity > 0.7 ? lineWidthThick : lineWidthThin;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();

          // ✅ REMOVIDO: segundo ctx.stroke() duplicado
          //    O original fazia stroke() duas vezes para opacity > 0.8
          //    Isso dobrava draw calls sem ganho visual perceptível
        }
      }

      // ─── FASE 3: Desenhar partículas (COM shadowBlur, uma vez) ───
      // ✅ Ativar shadowBlur apenas para partículas (poucos elementos)
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        const color = getParticleColor(p.type);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = particleShadowBlur;
        ctx.shadowColor = color;
        ctx.fill();
      }

      // ✅ Reset shadow para próximo frame (evita leak)
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

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
      className="absolute top-0 left-0 z-[1] md:w-[40%] w-full h-full"
    />
  );
};