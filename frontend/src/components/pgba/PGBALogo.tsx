// src/components/pgba/PGBALogo.tsx - Cubo isométrico profissional
import React, { useState } from 'react';

interface PGBALogoProps {
  isDarkMode: boolean;
}

export const PGBALogo: React.FC<PGBALogoProps> = ({ isDarkMode }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleCubeClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1200);
  };

  return (
    <div className="relative z-10 flex items-center gap-8 bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-black/8 dark:border-white/10 px-16 py-12 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500">
      <div 
        className={`animate-[floating_6s_ease-in-out_infinite] cursor-pointer transition-transform duration-300 hover:scale-110 ${
          isSpinning ? 'animate-[spin360_1.2s_cubic-bezier(0.64,0.04,0.35,1)_forwards]' : ''
        }`}
        onClick={handleCubeClick}
      >
        <svg
          viewBox="0 0 100 100"
          width="90"
          height="90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
        >
          <defs>
            {/* Gradientes profissionais para cada face */}
            <linearGradient id="face-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#60a5fa" : "#3b82f6"} />
              <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#1d4ed8"} />
            </linearGradient>
            
            <linearGradient id="face-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#a78bfa" : "#8b5cf6"} />
              <stop offset="100%" stopColor={isDarkMode ? "#8b5cf6" : "#7c3aed"} />
            </linearGradient>
            
            <linearGradient id="face-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#34d399" : "#10b981"} />
              <stop offset="100%" stopColor={isDarkMode ? "#10b981" : "#059669"} />
            </linearGradient>

            {/* Sombras internas para profundidade */}
            <linearGradient id="shadow-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>

            <linearGradient id="shadow-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
            </linearGradient>

            <linearGradient id="shadow-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
            </linearGradient>

            {/* Filtro de brilho sutil */}
            <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* CUBO ISOMÉTRICO PROFISSIONAL */}
          
          {/* Face superior (azul) */}
          <path 
            d="M 20 35 L 50 20 L 80 35 L 50 50 Z" 
            fill="url(#face-top)" 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="0.5"
          />
          
          {/* Sombra interna da face superior */}
          <path 
            d="M 20 35 L 50 20 L 80 35 L 50 50 Z" 
            fill="url(#shadow-top)" 
          />
          
          {/* Face esquerda (roxa) */}
          <path 
            d="M 20 35 L 50 50 L 50 80 L 20 65 Z" 
            fill="url(#face-left)" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="0.5"
          />
          
          {/* Sombra interna da face esquerda */}
          <path 
            d="M 20 35 L 50 50 L 50 80 L 20 65 Z" 
            fill="url(#shadow-left)" 
          />
          
          {/* Face direita (verde) */}
          <path 
            d="M 50 50 L 80 35 L 80 65 L 50 80 Z" 
            fill="url(#face-right)" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="0.5"
          />
          
          {/* Sombra interna da face direita */}
          <path 
            d="M 50 50 L 80 35 L 80 65 L 50 80 Z" 
            fill="url(#shadow-right)" 
          />

          {/* Bordas de destaque para dar definição */}
          <line x1="20" y1="35" x2="50" y2="20" 
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="1" 
                filter="url(#subtle-glow)" />
          
          <line x1="50" y1="20" x2="80" y2="35" 
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="1" 
                filter="url(#subtle-glow)" />
          
          <line x1="50" y1="50" x2="50" y2="80" 
                stroke="rgba(255,255,255,0.3)" 
                strokeWidth="1" />

          {/* Pontos de conexão sutis */}
          <circle cx="50" cy="20" r="1.5" 
                  fill="rgba(255,255,255,0.8)" 
                  filter="url(#subtle-glow)" />
          
          <circle cx="20" cy="35" r="1.5" 
                  fill="rgba(255,255,255,0.6)" />
          
          <circle cx="80" cy="35" r="1.5" 
                  fill="rgba(255,255,255,0.6)" />

          {/* Elemento central de dados (opcional) */}
          <circle cx="50" cy="50" r="3" 
                  fill="rgba(255,255,255,0.9)" 
                  className="animate-[pulsing_3s_ease-in-out_infinite]"
                  filter="url(#subtle-glow)" />
          
          {/* Pequenos detalhes de conectividade */}
          <line x1="45" y1="45" x2="55" y2="55" 
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="0.5" 
                strokeDasharray="2 1" />
          
          <line x1="55" y1="45" x2="45" y2="55" 
                stroke="rgba(255,255,255,0.4)" 
                strokeWidth="0.5" 
                strokeDasharray="2 1" />
        </svg>
      </div>
      
      <div className="flex flex-col border-l-2 border-black/8 dark:border-white/10 pl-8 transition-colors duration-500">
        <h1 className="text-5xl font-medium text-slate-900 dark:text-white tracking-[2px] m-0 leading-[0.95] transition-colors duration-500">
          PGBA<span className="text-sky-500 font-bold drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">.</span>
        </h1>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[3.5px] mt-2 transition-colors duration-500">
          Data, AI & Tech Solutions
        </span>
      </div>
    </div>
  );
};