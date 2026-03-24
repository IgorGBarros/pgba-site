// src/components/pgba/PGBALogo.tsx - Versão com animações de transferência de dados
import React, { useState, useEffect } from 'react';

interface PGBALogoProps {
  isDarkMode: boolean;
}

export const PGBALogo: React.FC<PGBALogoProps> = ({ isDarkMode }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [dataTransferActive, setDataTransferActive] = useState(true);

  // Simula ciclos de transferência de dados
  useEffect(() => {
    const interval = setInterval(() => {
      setDataTransferActive(prev => !prev);
    }, 3000); // Alterna a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const handleCubeClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1200);
  };

  return (
    <div className="relative z-10 flex items-center gap-8 bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-black/8 dark:border-white/10 px-16 py-12 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500">
      <div 
        className={`animate-[floating_6s_ease-in-out_infinite] cursor-pointer relative ${
          isSpinning ? 'animate-[spin360_1.2s_cubic-bezier(0.64,0.04,0.35,1)_forwards]' : ''
        }`}
        onClick={handleCubeClick}
      >
        {/* Aura pulsante ao redor do cubo */}
        <div className={`absolute inset-0 rounded-full ${
          dataTransferActive 
            ? 'animate-[data-aura_2s_ease-in-out_infinite] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl scale-150' 
            : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-lg scale-125'
        } transition-all duration-1000`} />
        
        {/* Anéis de energia */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full border-2 ${
            isDarkMode ? 'border-cyan-400/30' : 'border-blue-600/30'
          } animate-[energy-ring_4s_linear_infinite]`} />
          <div className={`absolute w-28 h-28 rounded-full border-2 ${
            isDarkMode ? 'border-purple-400/30' : 'border-purple-600/30'
          } animate-[energy-ring-reverse_3s_linear_infinite]`} />
        </div>

        <svg
          viewBox="0 -5 50 70"
          width="85"
          height="100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
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
            
            {/* Gradiente animado para transferência de dados */}
            <linearGradient id="data-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#00f5ff" stopOpacity={dataTransferActive ? "0.8" : "0.3"} />
              <stop offset="100%" stopColor="transparent" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values="-100 0;100 0;-100 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
          
          {/* Faces do Cubo com brilho dinâmico */}
          <path 
            d="M 25 5 L 5 16 L 5 44 L 25 55 L 25 30 Z" 
            fill="url(#pgba-blue)" 
            opacity={dataTransferActive ? "1" : "0.95"}
            className="transition-opacity duration-500"
          />
          <path 
            d="M 25 55 L 45 44 L 45 16 L 25 5 L 25 30 Z" 
            fill="url(#pgba-ia)" 
            style={{ mixBlendMode: 'multiply' }} 
            opacity={dataTransferActive ? "0.95" : "0.85"}
            className="transition-opacity duration-500"
          />
          <path 
            d="M 5 16 L 25 5 L 45 16 L 25 27 Z" 
            fill="#38BDF8" 
            opacity={dataTransferActive ? "0.8" : "0.7"}
            className="transition-opacity duration-500"
          />
          
          {/* Conexões com fluxo de dados */}
          <line 
            x1="12" y1="19" x2="25" y2="27" 
            stroke="url(#data-flow)" 
            strokeWidth="2.5" 
            strokeOpacity="0.9" 
            strokeDasharray="6 2"
            className="animate-[data-dash_1s_linear_infinite]"
          />
          <line 
            x1="38" y1="40" x2="25" y2="27" 
            stroke="url(#data-flow)" 
            strokeWidth="2.5" 
            strokeOpacity="0.9" 
            strokeDasharray="6 2"
            className="animate-[data-dash_1s_linear_infinite] [animation-delay:0.3s]"
          />
          <line 
            x1="25" y1="27" x2="25" y2="48" 
            stroke="#FFFFFF" 
            strokeWidth="1.5" 
            strokeOpacity="0.6" 
            strokeDasharray="2 3"
          />
          
          {/* Nós de dados com pulsos */}
          <circle 
            cx="12" cy="19" r="2.5" 
            fill="#FFFFFF" 
            opacity="0.9"
            className={`${dataTransferActive ? 'animate-[node-pulse_1.5s_ease-in-out_infinite]' : ''}`}
          />
          <circle 
            cx="38" cy="40" r="2.5" 
            fill="#FFFFFF" 
            opacity="0.9"
            className={`${dataTransferActive ? 'animate-[node-pulse_1.5s_ease-in-out_infinite] [animation-delay:0.5s]' : ''}`}
          />
          
          {/* Núcleo central - Hub de processamento */}
          <circle 
            cx="25" cy="27" r="3.5" 
            fill="#FFFFFF" 
            className={`${dataTransferActive ? 'animate-[core-processing_1s_ease-in-out_infinite]' : 'animate-[pulsing_2s_ease-in-out_infinite]'}`}
          />
          
          {/* Partículas de dados fluindo */}
          {dataTransferActive && (
            <>
              <circle cx="15" cy="22" r="1" fill="#00f5ff" opacity="0.8" className="animate-[particle-flow-1_2s_linear_infinite]" />
              <circle cx="32" cy="35" r="1" fill="#ff00ff" opacity="0.8" className="animate-[particle-flow-2_2.5s_linear_infinite]" />
              <circle cx="25" cy="15" r="1" fill="#00ff88" opacity="0.8" className="animate-[particle-flow-3_1.8s_linear_infinite]" />
            </>
          )}
        </svg>

        {/* Indicador de status de transferência */}
        <div className={`absolute -bottom-2 -right-2 w-3 h-3 rounded-full ${
          dataTransferActive 
            ? 'bg-green-400 animate-[status-blink_1s_ease-in-out_infinite]' 
            : 'bg-yellow-400 animate-[status-idle_2s_ease-in-out_infinite]'
        } shadow-lg`} />
      </div>
      
      <div className="flex flex-col border-l-2 border-black/8 dark:border-white/10 pl-8 transition-colors duration-500">
        <h1 className="text-5xl font-medium text-slate-900 dark:text-white tracking-[2px] m-0 leading-[0.95] transition-colors duration-500">
          PGBA<span className="text-sky-500 font-bold drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">.</span>
        </h1>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[3.5px] mt-2 transition-colors duration-500">
          Data, AI & Tech Solutions
        </span>
        
        {/* Status de transferência */}
        <div className="flex items-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full ${
            dataTransferActive ? 'bg-green-400' : 'bg-yellow-400'
          } animate-pulse`} />
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {dataTransferActive ? 'Transferindo Dados' : 'Standby Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};