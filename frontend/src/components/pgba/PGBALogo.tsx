// src/components/pgba/PGBALogo.tsx - Cubo 3D wireframe neon
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
        className={`animate-[floating_6s_ease-in-out_infinite] cursor-pointer ${
          isSpinning ? 'animate-[spin360_1.2s_cubic-bezier(0.64,0.04,0.35,1)_forwards]' : ''
        }`}
        onClick={handleCubeClick}
      >
        <svg
          viewBox="0 0 120 120"
          width="100"
          height="100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <defs>
            {/* Gradientes para as faces */}
            <linearGradient id="face-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#00ffff" : "#00ccff"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isDarkMode ? "#0088ff" : "#0066cc"} stopOpacity="0.1" />
            </linearGradient>
            
            <linearGradient id="face-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#00aaff" : "#0099ee"} stopOpacity="0.15" />
              <stop offset="100%" stopColor={isDarkMode ? "#0066cc" : "#004499"} stopOpacity="0.05" />
            </linearGradient>
            
            <linearGradient id="face-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#0099ee" : "#0088dd"} stopOpacity="0.1" />
              <stop offset="100%" stopColor={isDarkMode ? "#004499" : "#003366"} stopOpacity="0.05" />
            </linearGradient>

            {/* Filtro de brilho neon */}
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Cubo 3D Wireframe */}
          {/* Vértices do cubo (coordenadas isométricas) */}
          {/* Frente: A(30,70), B(70,70), C(70,30), D(30,30) */}
          {/* Trás: E(50,50), F(90,50), G(90,10), H(50,10) */}
          
          {/* FACES DO CUBO COM TRANSPARÊNCIA */}
          {/* Face superior */}
          <path 
            d="M 30 30 L 50 10 L 90 10 L 70 30 Z" 
            fill="url(#face-top)" 
            stroke={isDarkMode ? "#00ffff" : "#00aaff"} 
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Face esquerda */}
          <path 
            d="M 30 30 L 30 70 L 50 50 L 50 10 Z" 
            fill="url(#face-left)" 
            stroke={isDarkMode ? "#00ccff" : "#0088cc"} 
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Face direita */}
          <path 
            d="M 70 30 L 90 10 L 90 50 L 70 70 Z" 
            fill="url(#face-right)" 
            stroke={isDarkMode ? "#0099dd" : "#0077bb"} 
            strokeWidth="1"
            opacity="0.4"
          />

          {/* BORDAS PRINCIPAIS DO CUBO - NEON BRILHANTE */}
          {/* Bordas da frente */}
          <line x1="30" y1="30" x2="70" y2="30" 
                stroke={isDarkMode ? "#00ffff" : "#00ddff"} 
                strokeWidth="2" 
                filter="url(#neon-glow)"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="4 2" />
          
          <line x1="70" y1="30" x2="70" y2="70" 
                stroke={isDarkMode ? "#00ffff" : "#00ddff"} 
                strokeWidth="2" 
                filter="url(#neon-glow)" />
          
          <line x1="70" y1="70" x2="30" y2="70" 
                stroke={isDarkMode ? "#00ffff" : "#00ddff"} 
                strokeWidth="2" 
                filter="url(#neon-glow)" />
          
          <line x1="30" y1="70" x2="30" y2="30" 
                stroke={isDarkMode ? "#00ffff" : "#00ddff"} 
                strokeWidth="2" 
                filter="url(#neon-glow)" />

          {/* Bordas de profundidade */}
          <line x1="30" y1="30" x2="50" y2="10" 
                stroke={isDarkMode ? "#00ccff" : "#00bbee"} 
                strokeWidth="1.5" 
                filter="url(#neon-glow)" />
          
          <line x1="70" y1="30" x2="90" y2="10" 
                stroke={isDarkMode ? "#00ccff" : "#00bbee"} 
                strokeWidth="1.5" 
                filter="url(#neon-glow)" />
          
          <line x1="70" y1="70" x2="90" y2="50" 
                stroke={isDarkMode ? "#00ccff" : "#00bbee"} 
                strokeWidth="1.5" 
                filter="url(#neon-glow)" />
          
          <line x1="30" y1="70" x2="50" y2="50" 
                stroke={isDarkMode ? "#00ccff" : "#00bbee"} 
                strokeWidth="1.5" 
                filter="url(#neon-glow)" />

          {/* Bordas traseiras */}
          <line x1="50" y1="10" x2="90" y2="10" 
                stroke={isDarkMode ? "#0099dd" : "#0088cc"} 
                strokeWidth="1" 
                filter="url(#neon-glow)" />
          
          <line x1="90" y1="10" x2="90" y2="50" 
                stroke={isDarkMode ? "#0099dd" : "#0088cc"} 
                strokeWidth="1" 
                filter="url(#neon-glow)" />
          
          <line x1="90" y1="50" x2="50" y2="50" 
                stroke={isDarkMode ? "#0099dd" : "#0088cc"} 
                strokeWidth="1" 
                filter="url(#neon-glow)" />
          
          <line x1="50" y1="50" x2="50" y2="10" 
                stroke={isDarkMode ? "#0099dd" : "#0088cc"} 
                strokeWidth="1" 
                filter="url(#neon-glow)" />

          {/* GRADE INTERNA 3D */}
          {/* Linhas horizontais internas */}
          <line x1="35" y1="45" x2="65" y2="45" 
                stroke={isDarkMode ? "#00aaff" : "#0099ee"} 
                strokeWidth="0.8" 
                opacity="0.6"
                strokeDasharray="2 1" />
          
          <line x1="40" y1="55" x2="60" y2="55" 
                stroke={isDarkMode ? "#00aaff" : "#0099ee"} 
                strokeWidth="0.8" 
                opacity="0.4"
                strokeDasharray="2 1" />

          {/* Linhas verticais internas */}
          <line x1="45" y1="35" x2="45" y2="65" 
                stroke={isDarkMode ? "#00aaff" : "#0099ee"} 
                strokeWidth="0.8" 
                opacity="0.6"
                strokeDasharray="2 1" />
          
          <line x1="55" y1="35" x2="55" y2="65" 
                stroke={isDarkMode ? "#00aaff" : "#0099ee"} 
                strokeWidth="0.8" 
                opacity="0.4"
                strokeDasharray="2 1" />

          {/* Linhas de profundidade internas */}
          <line x1="40" y1="40" x2="55" y2="25" 
                stroke={isDarkMode ? "#0088dd" : "#0077cc"} 
                strokeWidth="0.6" 
                opacity="0.5"
                strokeDasharray="1 1" />
          
          <line x1="60" y1="40" x2="75" y2="25" 
                stroke={isDarkMode ? "#0088dd" : "#0077cc"} 
                strokeWidth="0.6" 
                opacity="0.3"
                strokeDasharray="1 1" />

          {/* PONTOS DE CONEXÃO BRILHANTES */}
          {/* Vértices principais */}
          <circle cx="30" cy="30" r="2" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow)"
                  className="animate-[pulsing_2s_ease-in-out_infinite]" />
          
          <circle cx="70" cy="30" r="2" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow)" />
          
          <circle cx="70" cy="70" r="2" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow)" />
          
          <circle cx="30" cy="70" r="2" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow)" />

          {/* Vértices traseiros */}
          <circle cx="50" cy="10" r="1.5" 
                  fill={isDarkMode ? "#00ccff" : "#00bbee"} 
                  filter="url(#neon-glow)" />
          
          <circle cx="90" cy="10" r="1.5" 
                  fill={isDarkMode ? "#00ccff" : "#00bbee"} 
                  filter="url(#neon-glow)" />
          
          <circle cx="90" cy="50" r="1.5" 
                  fill={isDarkMode ? "#00ccff" : "#00bbee"} 
                  filter="url(#neon-glow)" />
          
          <circle cx="50" cy="50" r="1.5" 
                  fill={isDarkMode ? "#00ccff" : "#00bbee"} 
                  filter="url(#neon-glow)" />

          {/* Pontos internos da grade */}
          <circle cx="45" cy="45" r="1" 
                  fill={isDarkMode ? "#00aaff" : "#0099ee"} 
                  opacity="0.8" />
          
          <circle cx="55" cy="45" r="1" 
                  fill={isDarkMode ? "#00aaff" : "#0099ee"} 
                  opacity="0.6" />
          
          <circle cx="50" cy="40" r="0.8" 
                  fill={isDarkMode ? "#0088dd" : "#0077cc"} 
                  opacity="0.7" />
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