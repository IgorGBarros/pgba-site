// src/components/pgba/PGBALogo.tsx - Prisma 3D neon flutuante melhorado
import React, { useState, useEffect } from 'react';

interface PGBALogoProps {
  isDarkMode: boolean;
}

export const PGBALogo: React.FC<PGBALogoProps> = ({ isDarkMode }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [energyPulse, setEnergyPulse] = useState(true);

  // Ciclo de energia automático
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCubeClick = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1500);
  };

  return (
    <div className="relative z-10 flex items-center gap-8 bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-black/8 dark:border-white/10 px-16 py-12 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500">
      <div 
        className={`relative cursor-pointer ${
          isSpinning ? 'animate-[prisma-spin_1.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_forwards]' : 'animate-[prisma-float_4s_ease-in-out_infinite]'
        }`}
        onClick={handleCubeClick}
      >
        {/* Aura de energia ao redor do prisma */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          energyPulse 
            ? 'animate-[energy-aura_2s_ease-in-out_infinite] bg-gradient-radial from-cyan-400/20 via-blue-500/10 to-transparent blur-xl scale-[3]' 
            : 'bg-gradient-radial from-purple-400/15 via-pink-500/8 to-transparent blur-lg scale-[2.5]'
        }`} />
        
        {/* Anéis de energia rotativos */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-40 h-40 rounded-full border-2 ${
            isDarkMode ? 'border-cyan-400/30' : 'border-cyan-500/50'
          } animate-[energy-ring_6s_linear_infinite]`} />
          <div className={`absolute w-36 h-36 rounded-full border-2 ${
            isDarkMode ? 'border-purple-400/25' : 'border-purple-500/40'
          } animate-[energy-ring-reverse_4s_linear_infinite]`} />
          <div className={`absolute w-32 h-32 rounded-full border border-dashed ${
            isDarkMode ? 'border-pink-400/20' : 'border-pink-500/35'
          } animate-[energy-ring_8s_linear_infinite]`} />
        </div>

        <svg
          viewBox="0 0 160 160"
          width="140"
          height="140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 animate-[prisma-rotate_12s_linear_infinite]"
        >
          <defs>
            {/* Gradientes neon para as faces */}
            <linearGradient id="face-front" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#00ffff" : "#00ddff"} stopOpacity="0.4" />
              <stop offset="50%" stopColor={isDarkMode ? "#0088ff" : "#0066ff"} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isDarkMode ? "#004499" : "#003388"} stopOpacity="0.1" />
            </linearGradient>
            
            <linearGradient id="face-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#ff00ff" : "#ee00dd"} stopOpacity="0.3" />
              <stop offset="50%" stopColor={isDarkMode ? "#8800ff" : "#7700ee"} stopOpacity="0.15" />
              <stop offset="100%" stopColor={isDarkMode ? "#440088" : "#330077"} stopOpacity="0.08" />
            </linearGradient>
            
            <linearGradient id="face-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDarkMode ? "#00ff88" : "#00ee77"} stopOpacity="0.25" />
              <stop offset="50%" stopColor={isDarkMode ? "#0088ff" : "#0077ee"} stopOpacity="0.12" />
              <stop offset="100%" stopColor={isDarkMode ? "#004488" : "#003377"} stopOpacity="0.06" />
            </linearGradient>

            {/* Filtros de brilho neon intenso */}
            <filter id="neon-glow-intense" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feGaussianBlur stdDeviation="8" result="bigBlur"/>
              <feGaussianBlur stdDeviation="12" result="hugeBlur"/>
              <feMerge>
                <feMergeNode in="hugeBlur"/>
                <feMergeNode in="bigBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="energy-pulse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="pulse"/>
              <feMerge>
                <feMergeNode in="pulse"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* PRISMA 3D - Coordenadas expandidas */}
          {/* Base: Hexágono irregular para dar mais dinamismo */}
          
          {/* FACES DO PRISMA COM TRANSPARÊNCIA NEON */}
          {/* Face frontal esquerda */}
          <path 
            d="M 40 50 L 80 30 L 80 90 L 40 110 Z" 
            fill="url(#face-front)" 
            stroke={isDarkMode ? "#00ffff" : "#00ccff"} 
            strokeWidth="2"
            opacity={energyPulse ? "0.8" : "0.6"}
            className="transition-opacity duration-1000"
          />
          
          {/* Face frontal direita */}
          <path 
            d="M 80 30 L 120 50 L 120 110 L 80 90 Z" 
            fill="url(#face-right)" 
            stroke={isDarkMode ? "#00ff88" : "#00dd77"} 
            strokeWidth="2"
            opacity={energyPulse ? "0.7" : "0.5"}
            className="transition-opacity duration-1000"
          />
          
          {/* Face superior */}
          <path 
            d="M 40 50 L 80 30 L 120 50 L 100 35 L 60 35 Z" 
            fill="url(#face-left)" 
            stroke={isDarkMode ? "#ff00ff" : "#dd00cc"} 
            strokeWidth="2"
            opacity={energyPulse ? "0.6" : "0.4"}
            className="transition-opacity duration-1000"
          />

          {/* BORDAS PRINCIPAIS COM NEON ULTRA INTENSO */}
          {/* Bordas frontais */}
          <line x1="40" y1="50" x2="80" y2="30" 
                stroke={isDarkMode ? "#00ffff" : "#00eeee"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />
          
          <line x1="80" y1="30" x2="120" y2="50" 
                stroke={isDarkMode ? "#00ff88" : "#00dd77"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite] [animation-delay:0.3s]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />
          
          <line x1="120" y1="50" x2="120" y2="110" 
                stroke={isDarkMode ? "#ff00ff" : "#dd00cc"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite] [animation-delay:0.6s]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />
          
          <line x1="120" y1="110" x2="80" y2="90" 
                stroke={isDarkMode ? "#00ffff" : "#00eeee"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite] [animation-delay:0.9s]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />
          
          <line x1="80" y1="90" x2="40" y2="110" 
                stroke={isDarkMode ? "#00ff88" : "#00dd77"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite] [animation-delay:1.2s]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />
          
          <line x1="40" y1="110" x2="40" y2="50" 
                stroke={isDarkMode ? "#ff00ff" : "#dd00cc"} 
                strokeWidth="3" 
                filter="url(#neon-glow-intense)"
                className={`${energyPulse ? 'animate-[data-flow_1.5s_linear_infinite] [animation-delay:1.5s]' : ''}`}
                strokeDasharray={energyPulse ? "8 4" : "none"} />

          {/* Bordas internas de conexão */}
          <line x1="80" y1="30" x2="80" y2="90" 
                stroke={isDarkMode ? "#ffffff" : "#cccccc"} 
                strokeWidth="2" 
                filter="url(#energy-pulse)"
                opacity="0.8"
                strokeDasharray="4 2" />

          {/* PONTOS DE ENERGIA NOS VÉRTICES */}
          {/* Vértices principais com pulso de energia */}
          <circle cx="40" cy="50" r="4" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite]' : 'animate-[idle-pulse_3s_ease-in-out_infinite]'}`} />
          
          <circle cx="80" cy="30" r="4" 
                  fill={isDarkMode ? "#00ff88" : "#00dd77"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite] [animation-delay:0.2s]' : 'animate-[idle-pulse_3s_ease-in-out_infinite] [animation-delay:1s]'}`} />
          
          <circle cx="120" cy="50" r="4" 
                  fill={isDarkMode ? "#ff00ff" : "#dd00cc"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite] [animation-delay:0.4s]' : 'animate-[idle-pulse_3s_ease-in-out_infinite] [animation-delay:2s]'}`} />
          
          <circle cx="120" cy="110" r="4" 
                  fill={isDarkMode ? "#00ffff" : "#00ddff"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite] [animation-delay:0.6s]' : 'animate-[idle-pulse_3s_ease-in-out_infinite]'}`} />
          
          <circle cx="80" cy="90" r="4" 
                  fill={isDarkMode ? "#00ff88" : "#00dd77"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite] [animation-delay:0.8s]' : 'animate-[idle-pulse_3s_ease-in-out_infinite] [animation-delay:0.5s]'}`} />
          
          <circle cx="40" cy="110" r="4" 
                  fill={isDarkMode ? "#ff00ff" : "#dd00cc"} 
                  filter="url(#neon-glow-intense)"
                  className={`${energyPulse ? 'animate-[core-energy_1s_ease-in-out_infinite] [animation-delay:1s]' : 'animate-[idle-pulse_3s_ease-in-out_infinite] [animation-delay:1.5s]'}`} />

          {/* Núcleo central com energia máxima */}
          <circle cx="80" cy="80" r="6" 
                  fill={isDarkMode ? "#ffffff" : "#ffffff"} 
                  filter="url(#neon-glow-intense)"
                  className="animate-[core-processing_2s_ease-in-out_infinite]"
                  opacity={energyPulse ? "1" : "0.7"} />

          {/* Partículas de energia fluindo */}
          {energyPulse && (
            <>
              <circle cx="50" cy="40" r="2" fill="#00ffff" opacity="0.8" className="animate-[particle-orbit-1_3s_linear_infinite]" />
              <circle cx="110" cy="70" r="2" fill="#ff00ff" opacity="0.8" className="animate-[particle-orbit-2_4s_linear_infinite]" />
              <circle cx="70" cy="100" r="2" fill="#00ff88" opacity="0.8" className="animate-[particle-orbit-3_3.5s_linear_infinite]" />
            </>
          )}
        </svg>

        {/* Indicador de status energético */}
        <div className={`absolute -bottom-3 -right-3 w-4 h-4 rounded-full transition-all duration-500 ${
          energyPulse 
            ? 'bg-green-400 animate-[status-active_0.8s_ease-in-out_infinite] shadow-[0_0_15px_rgba(34,197,94,0.8)]' 
            : 'bg-blue-400 animate-[status-standby_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(59,130,246,0.6)]'
        }`} />
      </div>
      
      <div className="flex flex-col border-l-2 border-black/8 dark:border-white/10 pl-8 transition-colors duration-500">
        <h1 className="text-5xl font-medium text-slate-900 dark:text-white tracking-[2px] m-0 leading-[0.95] transition-colors duration-500">
          PGBA<span className="text-sky-500 font-bold drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">.</span>
        </h1>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[3.5px] mt-2 transition-colors duration-500">
          Data, AI & Tech Solutions
        </span>
        
        {/* Status de energia */}
        <div className="flex items-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            energyPulse ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
          }`} />
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {energyPulse ? 'Energia Ativa' : 'Modo Estável'}
          </span>
        </div>
      </div>
    </div>
  );
};