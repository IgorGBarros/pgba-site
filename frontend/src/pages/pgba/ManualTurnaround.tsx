import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Scroll,
  Shield,
  Brain,
  TrendingUp,
  Users,
  Settings,
  Heart,
  ChevronDown,
  ChevronUp,
  Quote,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Compass,
  Flame,
  Anchor,
  Crown,
  Castle,
  Sparkles,
  Eye,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import '../../styles/codex.css';

// ============================================
// COMPONENTE: Pergaminho Interativo
// ============================================
interface ScrollableQuoteProps {
  quote: string;
  source: string;
  explanation: string;
  type?: 'biblical' | 'mythological';
}

const ScrollableQuote: React.FC<ScrollableQuoteProps> = ({ 
  quote, 
  source, 
  explanation,
  type = 'biblical'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8">
      {/* Frase clicável */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="scrollable-quote"
      >
        <div className="quote-medieval">
          <p className="font-title text-xl italic text-ink-700 leading-relaxed">
            "{quote}"
          </p>
          <span className="quote-source">— {source}</span>
        </div>
      </div>

      {/* Pergaminho expandido */}
      {isOpen && (
        <div className="scroll-container scroll-unroll mt-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              {type === 'biblical' ? (
                <BookOpen className="w-6 h-6 text-vermillion-700" />
              ) : (
                <Scroll className="w-6 h-6 text-gold-700" />
              )}
              <h4 className="font-headline text-lg font-bold text-ink-800">
                {type === 'biblical' ? 'Reflexão Bíblica' : 'Sabedoria Mitológica'}
              </h4>
            </div>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              {explanation}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 
                         border border-gold-600/40 rounded-sm
                         font-headline text-sm text-ink-700 transition-all"
            >
              Enrolar Pergaminho
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: Livro 3D
// ============================================
interface Book3DProps {
  coverTitle: string;
  coverSubtitle: string;
  children: React.ReactNode;
}

const Book3D: React.FC<Book3DProps> = ({ coverTitle, coverSubtitle, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="book-3d relative">
      {/* Capa do livro */}
      <div 
        className={`book-cover ${isOpen ? 'open' : ''}`}
        style={{ minHeight: '600px' }}
      >
        {/* Frente da capa */}
        <div className="book-front p-12 flex flex-col items-center justify-center">
          <div className="corner-ornament top-left"></div>
          <div className="corner-ornament top-right"></div>
          <div className="corner-ornament bottom-left"></div>
          <div className="corner-ornament bottom-right"></div>
          
          <div className="text-center">
            <Crown className="w-16 h-16 text-gold-600 mb-6 float-animation" />
            <h2 className="font-display text-4xl font-bold text-ink-800 mb-4">
              {coverTitle}
            </h2>
            <div className="sacred-divider">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-title text-xl italic text-ink-600 mb-8">
              {coverSubtitle}
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-vermillion-700 to-vermillion-800 
                         text-parchment-100 font-headline font-bold tracking-widest 
                         rounded-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 
                         transition-all duration-300"
            >
              ABRIR O CÓDICE
            </button>
          </div>
        </div>

        {/* Conteúdo interno */}
        <div className="book-back p-8">
          {children}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-8 px-6 py-3 bg-gold-600/20 hover:bg-gold-600/30 
                       border border-gold-600/40 rounded-sm
                       font-headline text-sm text-ink-700 transition-all"
          >
            Fechar Livro
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: Pergaminho Base
// ============================================
const ParchmentCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = '', id }) => (
  <div
    id={id}
    className={`parchment-surface p-6 md:p-10 rounded-sm relative ${className}`}
  >
    <div className="corner-ornament top-left"></div>
    <div className="corner-ornament top-right"></div>
    <div className="corner-ornament bottom-left"></div>
    <div className="corner-ornament bottom-right"></div>
    {children}
  </div>
);

// ============================================
// COMPONENTE: Selo de Cera
// ============================================
const WaxSeal: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'wax-seal-sm',
    md: '',
    lg: 'wax-seal-lg',
  };

  return (
    <div className={`wax-seal ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// COMPONENTE: Letra Capitular
// ============================================
const DropCap: React.FC<{ letter: string; children: React.ReactNode }> = ({ 
  letter, 
  children 
}) => (
  <p className="drop-cap text-lg leading-relaxed text-justify">
    {letter}
    {children}
  </p>
);

// ============================================
// COMPONENTE: Divisor Sagrado
// ============================================
const SacredDivider: React.FC<{ icon?: React.ElementType }> = ({ 
  icon: Icon = Sparkles 
}) => (
  <div className="sacred-divider">
    <Icon className="w-6 h-6" />
  </div>
);

// ============================================
// COMPONENTE: Referência Bíblica/Mitológica
// ============================================
const BiblicalReference: React.FC<{
  quote: string;
  reference: string;
  explanation: string;
}> = ({ quote, reference, explanation }) => (
  <ScrollableQuote
    quote={quote}
    source={reference}
    explanation={explanation}
    type="biblical"
  />
);

const MythologicalReference: React.FC<{
  title: string;
  description: string;
  explanation: string;
}> = ({ title, description, explanation }) => (
  <ScrollableQuote
    quote={`${title}: ${description}`}
    source="Mitologia"
    explanation={explanation}
    type="mythological"
  />
);

// ============================================
// SEÇÕES DO MANUAL
// ============================================

const HeroSection: React.FC = () => (
  <section className="relative pt-32 pb-20 px-4 overflow-hidden book-open">
    <div className="absolute inset-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
        }}
      />
    </div>

    <div className="max-w-5xl mx-auto relative z-10 text-center">
      <div className="mb-8 flex justify-center">
        <WaxSeal size="lg">
          <Shield className="w-12 h-12 text-parchment-100" />
        </WaxSeal>
      </div>

      <h1 className="font-display text-5xl md:text-7xl font-black text-parchment-200 mb-6 tracking-tight">
        MANUAL UNIVERSAL
      </h1>
      <h2 className="font-headline text-2xl md:text-4xl font-bold text-gold-500 mb-8">
        O Método de Turnaround Humano
      </h2>

      <SacredDivider icon={Crown} />

      <p className="font-title text-xl md:text-2xl text-parchment-300 max-w-3xl mx-auto leading-relaxed mb-12 italic">
        Previsibilidade, Comportamento e Sistema Financeiro Baseado em
        Princípios Eternos
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#introducao"
          className="px-8 py-4 bg-gradient-to-r from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline font-bold tracking-widest rounded-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          EXPLORAR O CÓDICE
        </a>
        <a
          href="#metodo"
          className="px-8 py-4 border-2 border-gold-500 text-gold-500 font-headline font-bold tracking-widest rounded-sm hover:bg-gold-500/10 transform hover:-translate-y-1 transition-all duration-300"
        >
          O MÉTODO
        </a>
      </div>
    </div>
  </section>
);

const IntroSection: React.FC = () => (
  <section id="introducao" className="scroll-mt-20 fade-in-up">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PRÓLOGO
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        POR QUE ESTE MATERIAL EXISTE
      </h2>
      <SacredDivider icon={BookOpen} />
    </div>

    <ParchmentCard className="max-w-4xl mx-auto">
      <ScrollableQuote
        quote="O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
        source="Mateus 7:24"
        explanation="Esta passagem bíblica estabelece o princípio fundamental de todo o método: a diferença entre construir sobre bases sólidas (previsibilidade, método, governança) e construir sobre bases frágeis (impulso, emoção, improviso). A rocha representa a estrutura que resiste ao tempo e às tempestades da vida. A areia representa a ilusão de controle que desmorona na primeira crise."
        type="biblical"
      />

      <div className="mt-8 space-y-6">
        <DropCap letter="E">
          ste manual não é sobre dinheiro. É sobre{' '}
          <Rubric>governança pessoal</Rubric>.
        </DropCap>

        <p className="font-body text-lg text-ink-700 leading-relaxed">
          Não é sobre enriquecer. É sobre{' '}
          <Rubric>sobreviver com dignidade</Rubric>.
        </p>
        <p className="font-body text-lg text-ink-700 leading-relaxed">
          Não é sobre motivação. É sobre <Rubric>método</Rubric>.
        </p>

        <div className="my-8 p-6 bg-gold-100/30 rounded-sm border border-gold-600/30">
          <p className="font-title text-xl text-center text-ink-800 italic">
            <strong className="text-vermillion-700">
              Pessoas quebram pelo mesmo motivo que empresas:
            </strong>
            <br />
            falta de previsibilidade, contratos mal estruturados e decisões sob
            impulso.
          </p>
        </div>

        <h3 className="font-headline text-xl font-bold text-ink-800 mb-4 mt-8">
          Este documento consolida conceitos de:
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: BookOpen, text: 'Bíblia e sabedoria antiga' },
            { icon: Scroll, text: 'Mitologia e arquétipos humanos' },
            { icon: Brain, text: 'Neurociência e dopamina' },
            { icon: Heart, text: 'Comportamento e padrões repetitivos' },
            { icon: Settings, text: 'Sistemas e previsibilidade' },
            { icon: Users, text: 'Família como unidade econômica' },
            { icon: TrendingUp, text: 'Finanças com mentalidade corporativa' },
            { icon: Shield, text: 'Turnaround: reestruturação de crise' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-parchment-200/50 rounded-sm border border-gold-600/20"
            >
              <item.icon className="w-5 h-5 text-vermillion-700" />
              <span className="font-body text-ink-800">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </ParchmentCard>
  </section>
);

// Componente Rubric
const Rubric: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rubric">{children}</span>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ManualTurnaround: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introducao');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sections = [
    { id: 'introducao', title: 'Introdução', shortTitle: 'Prólogo', icon: BookOpen },
    { id: 'fundamentos', title: 'Fundamentos', shortTitle: 'Parte I', icon: Brain, part: 'PARTE I' },
    { id: 'metodo', title: 'O Método', shortTitle: 'Parte II', icon: Target, part: 'PARTE II' },
    { id: 'comportamento', title: 'Comportamento', shortTitle: 'Parte III', icon: Heart, part: 'PARTE III' },
    { id: 'sistema', title: 'Sistema', shortTitle: 'Parte IV', icon: Settings, part: 'PARTE IV' },
    { id: 'humanidade', title: 'Humanidade', shortTitle: 'Parte V', icon: Users, part: 'PARTE V' },
    { id: 'conclusao', title: 'Conclusão', shortTitle: 'Epílogo', icon: Crown },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="codex-theme">
      <div
        className="min-h-screen relative overflow-x-hidden"
        style={{
          backgroundColor: '#1a140c',
          backgroundImage: `radial-gradient(#2a2015 1px, transparent 1px), url('https://www.transparenttextures.com/patterns/dark-wood.png')`,
          backgroundSize: '20px 20px, auto',
        }}
      >
        {/* Ambient Candle Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-flicker"></div>
          <div
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-vermillion-700/3 rounded-full blur-3xl animate-flicker"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-md border-b border-gold-600/30">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <WaxSeal size="sm">
                  <Compass className="w-5 h-5 text-parchment-100" />
                </WaxSeal>
                <div>
                  <h1 className="font-display text-lg font-bold illuminated-text">
                    CODEX PHILOSOPHIA
                  </h1>
                  <p className="font-headline text-[10px] text-gold-500/70 tracking-[0.3em]">
                    TURNOVERN HUMANO
                  </p>
                </div>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleNavClick(section.id)}
                    className={`px-3 py-2 rounded-sm font-headline text-xs tracking-wide transition-all ${
                      activeSection === section.id
                        ? 'bg-gold-500/20 text-gold-400 border border-gold-600/30'
                        : 'text-parchment-300/70 hover:text-gold-400 hover:bg-gold-500/10'
                    }`}
                  >
                    {section.shortTitle}
                  </button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gold-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <div className="lg:hidden bg-ink-900 border-t border-gold-600/30">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  className="w-full px-4 py-3 text-left font-headline text-sm text-parchment-300/70 hover:text-gold-400 hover:bg-gold-500/10 transition-colors flex items-center gap-3"
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Sidebar */}
        <aside
          className={`hidden xl:flex fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex-col bg-ink-900/95 backdrop-blur-md border-r border-gold-600/30 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-gold-600/20">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-gold-600 overflow-hidden bg-ink-800 flex items-center justify-center candle-glow">
                  <Eye className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <div className="font-headline text-xs text-gold-400 tracking-widest">
                    O ARQUIVISTA
                  </div>
                  <div className="text-[10px] italic text-parchment-300/60 font-title">
                    Custódio do Conhecimento
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gold-500 hover:text-gold-400 transition-colors"
            >
              {isSidebarCollapsed ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavClick(section.id)}
                className={`nav-item w-full ${
                  activeSection === section.id ? 'active' : ''
                }`}
              >
                <section.icon className="w-5 h-5" />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col items-start">
                    {section.part && (
                      <span className="text-[9px] text-gold-500/60 tracking-widest">
                        {section.part}
                      </span>
                    )}
                    <span className="font-headline text-xs">
                      {section.title}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gold-600/20">
              <div className="p-3 bg-gradient-to-br from-vermillion-700/20 to-gold-500/10 rounded-sm border border-gold-600/30">
                <p className="font-title text-xs italic text-parchment-200 text-center">
                  "Antes de ganhar mais, precisamos parar de perder."
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main
          className={`relative z-10 pt-16 transition-all duration-300 ${
            isSidebarCollapsed ? 'xl:ml-20' : 'xl:ml-72'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 pb-20 space-y-20">
            <HeroSection />
            <IntroSection />
            {/* Adicione as outras seções aqui */}
          </div>
        </main>

        {/* Footer */}
        <footer
          className={`relative z-10 border-t border-gold-600/30 bg-ink-900/95 py-12 transition-all duration-300 ${
            isSidebarCollapsed ? 'xl:ml-20' : 'xl:ml-72'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <WaxSeal size="md">
                <Compass className="w-8 h-8 text-parchment-100" />
              </WaxSeal>
            </div>
            <p className="font-headline text-gold-400 mb-4">
              "A verdade vos libertará." — João 8:32
            </p>
            <p className="font-body text-parchment-300/60 text-sm mb-6">
              Documento genérico para replicação educacional — Sem dados pessoais
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs">
              <a
                href="#introducao"
                className="font-headline text-parchment-300/60 hover:text-gold-400 transition-colors tracking-widest"
              >
                PRÓLOGO
              </a>
              <a
                href="#metodo"
                className="font-headline text-parchment-300/60 hover:text-gold-400 transition-colors tracking-widest"
              >
                O MÉTODO
              </a>
              <a
                href="#conclusao"
                className="font-headline text-parchment-300/60 hover:text-gold-400 transition-colors tracking-widest"
              >
                EPÍLOGO
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-gold-600/20">
              <p className="font-headline text-[10px] text-parchment-300/40 tracking-[0.3em]">
                ANNO DOMINI MMXXVI · MANUAL UNIVERSAL
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ManualTurnaround;