// src/pages/PGBANeural.tsx - Layout correto mantendo nomes anteriores
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { PGBACanvas } from '../../components/pgba/PGBACanvas';
import { PGBALogo } from '../../components/pgba/PGBALogo';
import { ThemeToggle } from '../../components/pgba/ThemeToggle';

const PGBANeural: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950 font-outfit overflow-hidden transition-colors duration-500" style={{ perspective: '1000px' }}>
      {/* Neural Canvas - Apenas canto esquerdo */}
      <PGBACanvas isDarkMode={isDarkMode} />
      
      {/* Botão de tema - Canto superior direito */}
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      
      {/* Logo centralizado - Versão simples */}
      <PGBALogo isDarkMode={isDarkMode} />
    </div>
  );
};

export default PGBANeural;