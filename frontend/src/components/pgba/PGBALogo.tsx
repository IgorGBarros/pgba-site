// src/components/pgba/PGBALogo.tsx - Cubo original simples do HTML
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
        className={`animate-[floating_6s_ease-in-out_infinite] filter drop-shadow-[0_0_20px_rgba(139,92,246,0.2)] cursor-pointer ${
          isSpinning ? 'animate-[spin360_1.2s_cubic-bezier(0.64,0.04,0.35,1)_forwards]' : ''
        }`}
        onClick={handleCubeClick}
      >
        <svg
          viewBox="0 -5 50 70"
          width="85"
          height="100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pgba-blue" x1="5" y1="5" x2="25" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0EA5E9" />
              <stop offset="1" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="pgba-ia" x1="25" y1="55" x2="45" y2="5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          
          {/* Faces do Cubo - Originais do HTML */}
          <path d="M 25 5 L 5 16 L 5 44 L 25 55 L 25 30 Z" fill="url(#pgba-blue)" opacity="0.95" />
          <path d="M 25 55 L 45 44 L 45 16 L 25 5 L 25 30 Z" fill="url(#pgba-ia)" style={{ mixBlendMode: 'multiply' }} opacity="0.85" />
          <path d="M 5 16 L 25 5 L 45 16 L 25 27 Z" fill="#38BDF8" opacity="0.7" />
          
          {/* Conexões originais */}
          <line x1="12" y1="19" x2="25" y2="27" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.9" strokeDasharray="4" className="animate-[dash_1.5s_linear_infinite]" />
          <line x1="38" y1="40" x2="25" y2="27" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.9" strokeDasharray="4" className="animate-[dash_1.5s_linear_infinite]" />
          <line x1="25" y1="27" x2="25" y2="48" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="2 3" />
          
          {/* Pontos originais */}
          <circle cx="12" cy="19" r="2.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="38" cy="40" r="2.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="25" cy="27" r="3.5" fill="#FFFFFF" className="animate-[pulsing_2s_ease-in-out_infinite]" />
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