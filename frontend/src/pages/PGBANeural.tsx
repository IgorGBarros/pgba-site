// src/pages/PGBANeural.tsx - Nova página integrada com seu ThemeProvider
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { PGBACanvas } from '../components/PGBACanvas';
import { PGBALogo } from '../components/PGBALogo';
import { ThemeToggle } from '../components/ThemeToggle';

const PGBANeural: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950 font-outfit overflow-hidden transition-colors duration-500" style={{ perspective: '1000px' }}>
      <PGBACanvas isDarkMode={isDarkMode} />
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      <PGBALogo isDarkMode={isDarkMode} />
    </div>
  );
};

export default PGBANeural;