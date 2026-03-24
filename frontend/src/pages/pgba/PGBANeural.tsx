// src/pages/PGBANeural.tsx - Versão corrigida com layout original
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
      {/* Fundo Neural - Tela inteira */}
      <PGBACanvas isDarkMode={isDarkMode} />
      
      {/* Botão de tema - Posição absoluta */}
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      
      {/* Logo centralizado - Como no HTML original */}
      <PGBALogo isDarkMode={isDarkMode} />
    </div>
  );
};

export default PGBANeural;