import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
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
  Moon,
  Sun,
  Home,
  Film,
  Lightbulb,
  Scale,
  Trophy,
  FileText,
  Clock,
  DollarSign,
  Activity,
  Zap,
  Award,
} from 'lucide-react';

import '../../styles/codex.css';

// ============================================
// COMPONENTE: Página do Livro (wrapper)
// ============================================
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; number?: number }>(
  ({ children, className = '', number }, ref) => (
    <div className="demoPage" ref={ref}>
      <div className={`page-content ${className}`}>
        {children}
        {number && (
          <div className="page-number">
            <span className="font-headline text-xs text-gold-600/60 tracking-widest">
              — FÓLIO {number} —
            </span>
          </div>
        )}
      </div>
    </div>
  )
);

Page.displayName = 'Page';

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
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="scrollable-quote cursor-pointer"
      >
        <div className="quote-medieval">
          <p className="font-title text-xl italic text-ink-700 leading-relaxed">
            "{quote}"
          </p>
          <span className="quote-source">— {source}</span>
        </div>
      </div>

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
                {type === 'biblical' ? '📜 Reflexão Bíblica' : '🏛️ Sabedoria Mitológica'}
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
              📜 Enrolar Pergaminho
            </button>
          </div>
        </div>
      )}
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
    className={`parchment-surface p-6 md:p-8 rounded-sm relative ${className}`}
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
// COMPONENTE: Rubric
// ============================================
const Rubric: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rubric">{children}</span>
);

// ============================================
// COMPONENTE: Botão de Navegação Medieval
// ============================================
const NavButton: React.FC<{
  onClick: () => void;
  direction: 'prev' | 'next';
  disabled?: boolean;
}> = ({ onClick, direction, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group relative w-14 h-14 md:w-16 md:h-16 rounded-full
      bg-gradient-to-br ${direction === 'prev' ? 'from-gold-600 to-gold-800' : 'from-vermillion-700 to-vermillion-900'}
      text-parchment-100 shadow-xl
      hover:shadow-2xl hover:scale-110
      active:scale-95
      transition-all duration-300
      border-2 border-gold-400/50
      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
      flex items-center justify-center`}
  >
    {direction === 'prev' ? (
      <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
    ) : (
      <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
    )}
    <div className="absolute inset-0 rounded-full border-2 border-gold-400/0 group-hover:border-gold-400/50 transition-all duration-300"></div>
  </button>
);

// ============================================
// PÁGINAS DO LIVRO
// ============================================

// Página 1: Capa
const CoverPage: React.FC = () => (
  <Page>
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-parchment-100 via-parchment-200 to-parchment-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/old-mathematics.png')`,
          }}
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <WaxSeal size="lg">
          <Shield className="w-12 h-12 text-parchment-100" />
        </WaxSeal>
        
        <h1 className="font-display text-4xl md:text-6xl font-black text-ink-800 mb-4 mt-6 tracking-tight">
          MANUAL<br />UNIVERSAL
        </h1>
        
        <SacredDivider icon={Crown} />
        
        <h2 className="font-headline text-xl md:text-2xl font-bold text-vermillion-700 mb-6">
          O Método de Turnaround Humano
        </h2>
        
        <p className="font-title text-lg md:text-xl text-ink-700 max-w-md italic">
          Previsibilidade, Comportamento e Sistema Financeiro Baseado em Princípios Eternos
        </p>
        
        <div className="mt-8 flex items-center gap-2 text-gold-700">
          <BookOpen className="w-5 h-5" />
          <span className="font-headline text-xs tracking-widest">ABRA PARA COMEÇAR</span>
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>
      </div>
    </div>
  </Page>
);

// Página 2: Introdução
const IntroPage: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-6">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PRÓLOGO
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink-800 mb-2">
          POR QUE ESTE MATERIAL EXISTE
        </h2>
        <SacredDivider icon={BookOpen} />
      </div>

      <ScrollableQuote
        quote="O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
        source="Mateus 7:24"
        explanation="A rocha representa a estrutura que resiste ao tempo. A areia representa a ilusão de controle que desmorona na primeira crise."
        type="biblical"
      />

      <div className="mt-6 space-y-4">
        <DropCap letter="E">
          ste manual não é sobre dinheiro. É sobre <Rubric>governança pessoal</Rubric>.
        </DropCap>

        <p className="font-body text-base text-ink-700 leading-relaxed">
          Não é sobre enriquecer. É sobre <Rubric>sobreviver com dignidade</Rubric>.
        </p>
        <p className="font-body text-base text-ink-700 leading-relaxed">
          Não é sobre motivação. É sobre <Rubric>método</Rubric>.
        </p>

        <div className="my-6 p-4 bg-gold-100/30 rounded-sm border border-gold-600/30">
          <p className="font-title text-base text-center text-ink-800 italic">
            <strong className="text-vermillion-700">
              Pessoas quebram pelo mesmo motivo que empresas:
            </strong>
            <br />
            falta de previsibilidade, contratos mal estruturados e decisões sob impulso.
          </p>
        </div>
      </div>
    </div>
  </Page>
);

// Página 3: Conceitos Consolidados
const ConceptsPage: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-xl font-bold text-ink-800 mb-4 text-center">
        Este documento consolida conceitos de:
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {[
          { icon: BookOpen, text: '📜 Bíblia e sabedoria antiga' },
          { icon: Scroll, text: '🏛️ Mitologia e arquétipos humanos' },
          { icon: Brain, text: '🧠 Neurociência e dopamina' },
          { icon: Heart, text: '🔄 Comportamento e padrões repetitivos' },
          { icon: Settings, text: '🏗️ Sistemas e previsibilidade' },
          { icon: Users, text: '👨‍👩‍👦 Família como unidade econômica' },
          { icon: TrendingUp, text: '💰 Finanças com mentalidade corporativa' },
          { icon: Shield, text: '🛡️ Turnaround: reestruturação de crise' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20 hover:border-gold-600/40 transition-all"
          >
            <item.icon className="w-5 h-5 text-vermillion-700 flex-shrink-0" />
            <span className="font-body text-sm text-ink-800">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

// Página 4: Fundamentos - Dopamina
const FundamentosPage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PARTE I
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          FUNDAMENTOS
        </h2>
        <p className="font-title text-sm text-gold-600 italic">
          O Ser Humano e o Estímulo
        </p>
      </div>

      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.1 Por que o ser humano busca dopamina?
      </h3>

      <div className="mb-4">
        <h4 className="font-headline text-sm font-bold text-vermillion-700 mb-1">
          ❓ Pergunta
        </h4>
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Por que repetimos comportamentos que nos prejudicam, mesmo sabendo que são ruins?
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-headline text-sm font-bold text-sage-700 mb-1">
          ✅ Resposta
        </h4>
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque o cérebro humano foi projetado para <Rubric>buscar recompensa</Rubric>, não para planejar longo prazo.
        </p>
        <p className="font-body text-sm text-ink-700 leading-relaxed mt-2">
          A dopamina não é o neurotransmissor do prazer. É o neurotransmissor da <Rubric>expectativa</Rubric>.
        </p>
      </div>

      <div className="my-4 p-3 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
        <p className="font-title text-sm text-ink-800 italic">
          <strong className="text-vermillion-700">Resultado:</strong>
          <br />
          O cérebro antigo em ambiente moderno = busca constante por estímulo.
        </p>
      </div>
    </div>
  </Page>
);

// Página 5: Referências da Dopamina
const FundamentosPage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.1 Continuação
      </h3>

      <ScrollableQuote
        quote="Tudo me é permitido, mas nem tudo convém. Tudo me é permitido, mas eu não me deixarei dominar por nada."
        source="1 Coríntios 6:12"
        explanation="Paulo ensina governança pessoal. A liberdade absoluta sem governança vira escravidão química. Autonomia sem disciplina é dependência disfarçada."
        type="biblical"
      />

      <ScrollableQuote
        quote="Sísifo: condenado a empurrar uma pedra montanha acima para sempre"
        source="Mitologia Grega"
        explanation="Sísifo representa o ciclo de esforço sem conclusão. Muitas pessoas vivem o ciclo de Sísifo financeiro: ganham → gastam → se endividam → tentam recuperar → repetem. Esforço sem sistema é apenas movimento."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 6: Impulsividade
const FundamentosPage3: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.2 Por que pessoas inteligentes sofrem mais com impulsividade?
      </h3>

      <div className="mb-4">
        <h4 className="font-headline text-sm font-bold text-sage-700 mb-1">
          ✅ Resposta
        </h4>
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque usam intensamente o <Rubric>córtex pré-frontal</Rubric> (planejamento, análise, controle), que consome muita energia mental.
        </p>
        <p className="font-body text-sm text-ink-700 leading-relaxed mt-2">
          Isso não é fraqueza. É <Rubric>sobrecarga cognitiva</Rubric>.
        </p>
      </div>

      <ScrollableQuote
        quote="Melhor é o longânimo do que o herói da guerra, e o que domina o seu espírito do que o que toma uma cidade."
        source="Provérbios 16:32"
        explanation="Salomão reconheceu que a conquista externa é mais fácil que a conquista interna. Inteligência sem autodomínio é vulnerabilidade disfarçada."
        type="biblical"
      />

      <ScrollableQuote
        quote="Ulisses e as Sereias"
        source="Mitologia Grega"
        explanation="Ulisses não confiou em sua força de vontade. Ele ordenou que os marinheiros tampassem os ouvidos com cera e o amarrassem ao mastro. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 7: Rotina
const FundamentosPage4: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.3 Por que a rotina acalma o cérebro?
      </h3>

      <div className="mb-4">
        <h4 className="font-headline text-sm font-bold text-sage-700 mb-1">
          ✅ Resposta
        </h4>
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque <Rubric>previsibilidade reduz incerteza</Rubric>, e incerteza é o maior gatilho de ansiedade.
        </p>
      </div>

      <ScrollableQuote
        quote="Façam tudo com decência e ordem."
        source="1 Coríntios 14:40"
        explanation="Paulo ensina que ordem é pré-requisito para paz. Decência e ordem não são virtudes morais; são ferramentas de sobrevivência neural."
        type="biblical"
      />

      <ScrollableQuote
        quote="Héstia: deusa do lar e da ordem"
        source="Mitologia Grega"
        explanation="Héstia representava o centro, a estabilidade, o fogo que nunca se apagava. Na vida moderna, Héstia é a rotina inegociável. Ordem não é rigidez; é proteção neural."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 8: Sal e Açúcar
const FundamentosPage5: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.4 O Papel do Sal e do Açúcar
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque o cérebro não opera no vácuo. Ele depende de <Rubric>estabilidade bioquímica</Rubric> para tomar decisões racionais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 my-4">
        <div className="p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <h5 className="font-headline text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
            <span className="text-lg">🧂</span> O Sal
          </h5>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">Cérebro depende de sódio, potássio e magnésio</li>
            <li className="font-body text-xs text-ink-700">Sal refinado causa fadiga e névoa mental</li>
          </ul>
        </div>
        <div className="p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <h5 className="font-headline text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
            <span className="text-lg">🍬</span> O Açúcar
          </h5>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">Pico glicêmico → insulina → queda brusca</li>
            <li className="font-body text-xs text-ink-700">Reduz capacidade do pré-frontal de planejar</li>
          </ul>
        </div>
      </div>

      <div className="my-4 p-3 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
        <p className="font-title text-sm text-ink-800 italic">
          <strong className="text-vermillion-700">Conexão:</strong> Cérebro desregulado = decisão sob estresse = contrato ruim.
        </p>
      </div>
    </div>
  </Page>
);

// Página 9: Sono Bifásico
const FundamentosPage6: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        1.5 O Sono Bifásico
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          O sono bifásico era o padrão natural da humanidade por milênios: duas fases de sono separadas por 1–2 horas de vigília tranquila.
        </p>
        <p className="font-body text-sm text-ink-700 leading-relaxed mt-2">
          O resultado: <Rubric>decisões mais impulsivas, menor tolerância à frustração e busca por recompensa rápida</Rubric>.
        </p>
        <p className="font-body text-sm text-ink-700 leading-relaxed mt-2">
          O sono não é "desligar". É <Rubric>reorganizar</Rubric>.
        </p>
      </div>

      <ScrollableQuote
        quote="Em paz me deito e logo pego no sono, pois só tu, Senhor, me fazes repousar seguro."
        source="Salmos 4:8"
        explanation="A Bíblia reconhece a vigília como momento de clareza. Quem dorme com pressa, acorda com ansiedade. Quem descansa com ritmo, executa com clareza."
        type="biblical"
      />
    </div>
  </Page>
);

// Página 10: Método - Turnaround
const MetodoPage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PARTE II
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          O MÉTODO
        </h2>
        <p className="font-title text-sm text-gold-600 italic">
          Turnaround Pessoal
        </p>
      </div>

      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        2.1 O que é Turnaround Pessoal?
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Turnaround é um termo corporativo para <Rubric>reestruturação de crise</Rubric>.
        </p>
        <div className="my-3 p-3 bg-gold-100/30 rounded-sm border border-gold-600/30">
          <p className="font-title text-sm text-center text-ink-800 italic">
            Parar de sangrar → Estabilizar → Reconstruir → Crescer
          </p>
        </div>
      </div>

      <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
        As 4 Fases:
      </h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <div className="flex items-center gap-1 mb-1">
            <Lock className="w-4 h-4 text-vermillion-700" />
            <h5 className="font-headline text-xs font-bold text-ink-800">1. Contenção</h5>
          </div>
          <p className="font-body text-xs text-ink-600">0-30 dias</p>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <div className="flex items-center gap-1 mb-1">
            <Anchor className="w-4 h-4 text-gold-700" />
            <h5 className="font-headline text-xs font-bold text-ink-800">2. Estabilização</h5>
          </div>
          <p className="font-body text-xs text-ink-600">30-90 dias</p>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <div className="flex items-center gap-1 mb-1">
            <Castle className="w-4 h-4 text-sage-700" />
            <h5 className="font-headline text-xs font-bold text-ink-800">3. Reconstrução</h5>
          </div>
          <p className="font-body text-xs text-ink-600">90-180 dias</p>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <div className="flex items-center gap-1 mb-1">
            <Crown className="w-4 h-4 text-gold-600" />
            <h5 className="font-headline text-xs font-bold text-ink-800">4. Crescimento</h5>
          </div>
          <p className="font-body text-xs text-ink-600">180+ dias</p>
        </div>
      </div>
    </div>
  </Page>
);

// Página 11: Classificação de Contratos
const MetodoPage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        2.2 Classificação de Contratos
      </h3>

      <div className="space-y-3">
        <div className="p-3 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-sage-700" />
            <h4 className="font-headline text-sm font-bold text-sage-700">
              🔹 CONTRATO ESSENCIAL
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">Mantém a vida funcionando</li>
            <li className="font-body text-xs text-ink-700">É previsível e inevitável</li>
          </ul>
          <p className="font-body text-xs text-sage-800 font-semibold mt-2">
            ✅ Regra: Não se corta. Se renegocia.
          </p>
        </div>

        <div className="p-3 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-vermillion-700" />
            <h4 className="font-headline text-sm font-bold text-vermillion-700">
              🔹 CONTRATO RUIM
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">Juros altos ou embutidos</li>
            <li className="font-body text-xs text-ink-700">Consumo emocional ou impulsivo</li>
          </ul>
          <p className="font-body text-xs text-vermillion-800 font-semibold mt-2">
            ❌ Regra: Eliminar prioritariamente.
          </p>
        </div>

        <div className="p-3 bg-gold-50/30 rounded-sm border-l-4 border-gold-600">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-gold-700" />
            <h4 className="font-headline text-sm font-bold text-gold-700">
              🔹 CUSTO DE COMPORTAMENTO
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">Despesa evitável causada por impulso</li>
            <li className="font-body text-xs text-ink-700">Gera arrependimento</li>
          </ul>
          <p className="font-body text-xs text-gold-800 font-semibold mt-2">
            ⚠️ Regra: Registrar separadamente.
          </p>
        </div>
      </div>
    </div>
  </Page>
);

// Página 12: Previsibilidade
const MetodoPage3: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        2.3 A Regra de Ouro da Previsibilidade
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque <Rubric>renda alta sem previsibilidade gera caos</Rubric>.
        </p>
      </div>

      <div className="my-4 p-3 bg-parchment-100/50 rounded-sm border border-gold-600/30">
        <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
          🔄 Fórmula da Previsibilidade
        </h4>
        <p className="font-mono text-xs text-ink-700 bg-ink-50/50 p-2 rounded-sm">
          Previsibilidade = (Receita Conhecida) - (Despesas Mapeadas) - (Contratos Classificados)
        </p>
      </div>

      <ScrollableQuote
        quote="Os planos do diligente tendem à abundância; mas todo apressado, à pobreza."
        source="Provérbios 21:5"
        explanation="'Diligente' (hebraico: charuts) significa alguém que corta, que é preciso, que planeja com exatidão. Abundância não vem de velocidade; vem de precisão."
        type="biblical"
      />
    </div>
  </Page>
);

// Página 13: Ciclo Dopaminérgico
const ComportamentoPage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PARTE III
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          COMPORTAMENTO
        </h2>
        <p className="font-title text-sm text-gold-600 italic">
          Quebrando Ciclos
        </p>
      </div>

      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        3.1 O Ciclo Dopaminérgico Financeiro
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque o cérebro interpreta <Rubric>ganho aleatório</Rubric> como <Rubric>habilidade</Rubric>, mesmo quando é sorte.
        </p>
      </div>

      <div className="my-4">
        <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
          O ciclo típico:
        </h4>
        <ol className="space-y-1">
          {[
            'Estresse ou tédio → busca por estímulo',
            'Operação rápida → ganho pequeno',
            'Dopamina libera → "eu consigo!"',
            'Nova operação → risco maior',
            'Perda → frustração',
            'Tentativa de recuperar → perda maior',
            'Culpa → mais estresse → volta ao passo 1'
          ].map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 p-2 bg-parchment-100/50 rounded-sm">
              <span className="font-headline text-xs font-bold text-vermillion-700">{idx + 1}.</span>
              <span className="font-body text-xs text-ink-700">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <ScrollableQuote
        quote="Ícaro: voou perto demais do sol"
        source="Mitologia Grega"
        explanation="O ciclo dopaminérgico é Ícaro financeiro: o primeiro ganho gera euforia, a euforia gera mais risco, o risco gera queda. Sucesso inicial sem estrutura é convite para a queda."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 14: Substituição de Estímulo
const ComportamentoPage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        3.2 Substituição de Estímulo
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
        </p>
      </div>

      <div className="space-y-2">
        {[
          { nocivo: 'Trade / apostas', saudavel: 'Exercício físico' },
          { nocivo: 'Scroll infinito', saudavel: 'Leitura focada' },
          { nocivo: 'Compras impulsivas', saudavel: 'Construir algo' },
          { nocivo: 'Decisão sob ansiedade', saudavel: 'Esperar 24h' },
          { nocivo: 'Tela excessiva', saudavel: 'Música instrumental' }
        ].map((sub, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
            <span className="font-body text-xs text-vermillion-700 line-through">{sub.nocivo}</span>
            <ArrowRight className="w-4 h-4 text-gold-600" />
            <span className="font-body text-xs text-sage-700 font-semibold">{sub.saudavel}</span>
          </div>
        ))}
      </div>

      <ScrollableQuote
        quote="Prometeu: trouxe o fogo aos humanos"
        source="Mitologia Grega"
        explanation="O fogo pode cozinhar ou queimar, aquecer ou destruir. O estímulo (dopamina) é o fogo moderno. Direcionado para construção, aquece e ilumina. Direcionado para destruição, queima. O problema não é a energia; é a direção."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 15: Família
const ComportamentoPage3: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        3.3 O Papel da Família
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Com <Rubric>transparência, não dramatismo</Rubric>.
        </p>
      </div>

      <div className="my-4">
        <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
          🔄 Protocolo de Governança Familiar
        </h4>
        <ol className="space-y-2">
          {[
            'Comunicação clara',
            'Regras visíveis',
            'Participação leve',
            'Exemplo antes de discurso',
            'Celebração de marcos'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 p-2 bg-parchment-100/50 rounded-sm">
              <span className="font-headline text-xs font-bold text-gold-700">{idx + 1}.</span>
              <span className="font-body text-xs text-ink-700">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <ScrollableQuote
        quote="Héstia: guardiã do lar"
        source="Mitologia Grega"
        explanation="Héstia era a deusa que nunca saía de casa. Ela representava o centro que mantém tudo girando. Na governança familiar, Héstia é a regra doméstica inegociável. O lar organizado não é perfeição; é proteção contra o caos externo."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 16: ERP Pessoal
const SistemaPage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PARTE IV
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          SISTEMA
        </h2>
      </div>

      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        4.1 O Modelo de ERP Pessoal
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Trate sua vida como uma <Rubric>microempresa com um único cliente: você mesmo</Rubric>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {[
          { title: 'Módulo 1: Receitas', items: ['Fixas', 'Variáveis', 'Extraordinárias'] },
          { title: 'Módulo 2: Contratos', items: ['Essenciais', 'Financeiros', 'Ruins'] },
          { title: 'Módulo 3: Fluxo de Caixa', items: ['Mensal', 'Trimestral', 'Alertas'] },
          { title: 'Módulo 4: Comportamento', items: ['Custos', 'Gatilhos', 'Substituições'] },
          { title: 'Módulo 5: Metas', items: ['30 dias', '90 dias', '180+ dias'] }
        ].map((mod, idx) => (
          <div key={idx} className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20">
            <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">{mod.title}</h5>
            <div className="flex gap-2">
              {mod.items.map((item, i) => (
                <span key={i} className="font-body text-xs text-ink-600">• {item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

// Página 17: 90 Dias
const SistemaPage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        4.2 A Regra dos 90 Dias
      </h3>

      <div className="my-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
            <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Dias 1-30</h5>
            <p className="font-body text-xs text-ink-700">Contenção</p>
            <p className="font-body text-xs text-sage-700 mt-1">✓ Sem novas dívidas</p>
          </div>
          <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
            <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Dias 31-60</h5>
            <p className="font-body text-xs text-ink-700">Estabilização</p>
            <p className="font-body text-xs text-sage-700 mt-1">✓ Fluxo preciso</p>
          </div>
          <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
            <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Dias 61-90</h5>
            <p className="font-body text-xs text-ink-700">Reconstrução</p>
            <p className="font-body text-xs text-sage-700 mt-1">✓ 1º contrato eliminado</p>
          </div>
        </div>
      </div>

      <ScrollableQuote
        quote="As Três Graças: Aglaia, Eufrósine e Talia"
        source="Mitologia Grega"
        explanation="As Graças dançavam juntas, representando que beleza, alegria e abundância só existem em harmonia. Os 90 dias são a 'dança das Graças' do turnaround."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 18: Ser Humano como Sistema
const HumanidadePage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          PARTE V
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          HUMANIDADE
        </h2>
      </div>

      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        5.1 O Ser Humano Como Sistema
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque <Rubric>sistemas são previsíveis; vontades são voláteis</Rubric>.
        </p>
      </div>

      <div className="my-4 grid grid-cols-2 gap-2">
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
          <div className="text-2xl mb-1">💪</div>
          <h5 className="font-headline text-xs font-bold text-ink-800">Corpo</h5>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
          <div className="text-2xl mb-1">🧠</div>
          <h5 className="font-headline text-xs font-bold text-ink-800">Mente</h5>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
          <div className="text-2xl mb-1">❤️</div>
          <h5 className="font-headline text-xs font-bold text-ink-800">Emoção</h5>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border border-gold-600/20 text-center">
          <div className="text-2xl mb-1">✨</div>
          <h5 className="font-headline text-xs font-bold text-ink-800">Espírito</h5>
        </div>
      </div>

      <ScrollableQuote
        quote="Atlas: carrega o mundo nos ombros"
        source="Mitologia Grega"
        explanation="Atlas carrega o céu para que o cosmos não desabe. Na vida moderna, Atlas é a responsabilidade de manter os pilares em equilíbrio. Equilíbrio não é passividade; é carga ativa."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 19: Influência e Padrão
const HumanidadePage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        5.2 Influência e Padrão
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Porque <Rubric>seres humanos aprendem por observação, não por discurso</Rubric>.
        </p>
      </div>

      <div className="my-4 grid grid-cols-2 gap-2">
        <div className="p-2 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
          <p className="font-body text-xs text-ink-700 mb-1"><strong>Se você:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">fala de disciplina mas age por impulso</li>
            <li className="font-body text-xs text-ink-700">cobra controle mas vive no improviso</li>
          </ul>
          <p className="font-body text-xs text-vermillion-700 font-semibold mt-2">
            O sistema desconfia.
          </p>
        </div>
        <div className="p-2 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
          <p className="font-body text-xs text-ink-700 mb-1"><strong>Mas se você:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li className="font-body text-xs text-ink-700">executa antes de explicar</li>
            <li className="font-body text-xs text-ink-700">mantém regra quando ninguém vê</li>
          </ul>
          <p className="font-body text-xs text-sage-700 font-semibold mt-2">
            O ambiente muda.
          </p>
        </div>
      </div>

      <ScrollableQuote
        quote="Orfeu: cuja música acalmava até feras"
        source="Mitologia Grega"
        explanation="Orfeu não usava armas ou ordens; usava harmonia. Quem vive em ritmo atrai quem quer dançar."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 20: Estrutura Econômica
const HumanidadePage3: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        5.4 A Estrutura Econômica
      </h3>

      <div className="my-4 grid grid-cols-3 gap-2">
        <div className="p-2 bg-parchment-100/50 rounded-sm border-l-4 border-parchment-600 text-center">
          <h5 className="font-headline text-lg font-bold text-ink-800 mb-1">95%</h5>
          <p className="font-body text-xs text-ink-700">
            Operam no modo reação. Base de sustentação do consumo.
          </p>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border-l-4 border-gold-600 text-center">
          <h5 className="font-headline text-lg font-bold text-ink-800 mb-1">5%</h5>
          <p className="font-body text-xs text-ink-700">
            Tentam sair do padrão, mas falham por falta de método.
          </p>
        </div>
        <div className="p-2 bg-parchment-100/50 rounded-sm border-l-4 border-sage-600 text-center">
          <h5 className="font-headline text-lg font-bold text-ink-800 mb-1">&lt;1%</h5>
          <p className="font-body text-xs text-ink-700">
            Operam com governança. Constroem sistemas.
          </p>
        </div>
      </div>

      <ScrollableQuote
        quote="As Moiras: Cloto fia, Láquesis mede, Átropos corta"
        source="Mitologia Grega"
        explanation="Representam que o destino não é aleatório; é medida + corte. Destino é a consequência da governança aplicada ao tempo."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 21: Tríade da Transformação
const HumanidadePage4: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
        5.7 A Tríade da Transformação
      </h3>

      <div className="mb-4">
        <p className="font-body text-sm text-ink-700 leading-relaxed">
          Eles formam um <Rubric>ciclo de governança</Rubric> onde cada elemento sustenta o próximo.
        </p>
      </div>

      <div className="my-4 p-3 bg-parchment-100/50 rounded-sm border border-gold-600/30">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['Método', 'Comportamento', 'Padrão', 'Previsibilidade', 'Influência'].map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="px-3 py-1 bg-gradient-to-br from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline text-xs font-bold rounded-sm">
                {item}
              </div>
              {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gold-500" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ScrollableQuote
        quote="Hermes: mensageiro dos deuses"
        source="Mitologia Grega"
        explanation="Hermes não criava as leis; ele as transmitia com clareza. Previsibilidade só vira influência quando é comunicada com clareza."
        type="mythological"
      />
    </div>
  </Page>
);

// Página 22: Conclusão
const ConclusaoPage1: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
          EPÍLOGO
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">
          CONCLUSÃO
        </h2>
      </div>

      <ScrollableQuote
        quote="A verdade vos libertará."
        source="João 8:32"
        explanation="Mas a verdade só liberta quem a encara, organiza e age."
        type="biblical"
      />

      <div className="mt-6">
        <DropCap letter="O">
          sistema cria o caos para vender conforto. O método conforta porque devolve o controle.
        </DropCap>
      </div>

      <div className="my-6 p-4 bg-gradient-to-br from-gold-100/30 to-vermillion-50/30 rounded-sm border-2 border-gold-600/40 text-center">
        <p className="font-title text-base text-ink-800 italic">
          "Não é sobre ter mais.
          <br />
          É sobre ser livre.
          <br />
          E liberdade vem de previsibilidade,
          <br />
          não de sorte."
        </p>
      </div>
    </div>
  </Page>
);

// Página 23: Resumo Executivo
const ConclusaoPage2: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <h3 className="font-headline text-lg font-bold text-ink-800 mb-4 text-center">
        🔄 Resumo Executivo do Método
      </h3>
      <ol className="space-y-2">
        {[
          'Classifique tudo como Contrato Essencial, Ruim ou Custo de Comportamento',
          'Elimine contratos ruins prioritariamente',
          'Proteja contratos essenciais a qualquer custo',
          'Registre custos de comportamento para identificar padrões',
          'Projete fluxo de caixa mês a mês',
          'Substitua estímulos nocivos por construtivos',
          'Envolva a família com transparência, não culpa',
          'Mantenha rotina como proteção neural',
          'Revise a cada 30 dias',
          'Celebre marcos, não apenas resultados finais'
        ].map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 p-2 bg-parchment-100/50 rounded-sm">
            <span className="font-headline text-xs font-bold text-vermillion-700">{idx + 1}.</span>
            <span className="font-body text-xs text-ink-700">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  </Page>
);

// Página 24: Anexos
const AnexosPage: React.FC = () => (
  <Page>
    <div className="h-full p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-parchment-50 to-parchment-200">
      <div className="text-center mb-4">
        <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
          ANEXOS
        </h2>
        <p className="font-title text-xs text-gold-600 italic">
          Ferramentas Práticas
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <h4 className="font-headline text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold-700" />
            Anexo A: Checklist
          </h4>
          <ul className="space-y-1">
            <li className="font-body text-xs text-ink-700">
              <span className="font-headline font-bold text-sage-700">[ ]</span> Mantém operação funcionando? → Essencial
            </li>
            <li className="font-body text-xs text-ink-700">
              <span className="font-headline font-bold text-vermillion-700">[ ]</span> Tem juros altos? → Ruim
            </li>
            <li className="font-body text-xs text-ink-700">
              <span className="font-headline font-bold text-gold-700">[ ]</span> Feito por impulso? → Custo de Comportamento
            </li>
          </ul>
        </div>

        <div className="p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <h4 className="font-headline text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-700" />
            Anexo B: Protocolo Anti-Impulso
          </h4>
          <ol className="space-y-1">
            <li className="font-body text-xs text-ink-700">1. Sentiu vontade? → PARE</li>
            <li className="font-body text-xs text-ink-700">2. Registre o gatilho</li>
            <li className="font-body text-xs text-ink-700">3. Execute substituição</li>
            <li className="font-body text-xs text-ink-700">4. Espere 24h</li>
            <li className="font-body text-xs text-ink-700">5. Revise com a regra</li>
          </ol>
        </div>

        <div className="p-3 bg-parchment-100/50 rounded-sm border border-gold-600/20">
          <h4 className="font-headline text-sm font-bold text-ink-800 mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-700" />
            Anexo C: Marco de 90 Dias
          </h4>
          <ul className="space-y-1">
            <li className="font-body text-xs text-ink-700"><strong>Dia 30:</strong> Nenhuma nova dívida</li>
            <li className="font-body text-xs text-ink-700"><strong>Dia 60:</strong> Fluxo projetado</li>
            <li className="font-body text-xs text-ink-700"><strong>Dia 90:</strong> 1º contrato ruim eliminado</li>
          </ul>
        </div>
      </div>
    </div>
  </Page>
);

// Página 25: Contracapa
const BackCoverPage: React.FC = () => (
  <Page>
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-parchment-100 via-parchment-200 to-parchment-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/old-mathematics.png')`,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <WaxSeal size="lg">
          <Compass className="w-12 h-12 text-parchment-100" />
        </WaxSeal>

        <h2 className="font-display text-3xl font-bold text-ink-800 mb-4 mt-6">
          FIM DO CÓDICE
        </h2>

        <SacredDivider icon={Crown} />

        <p className="font-title text-lg text-ink-700 italic max-w-md mb-6">
          "A verdade vos libertará."
        </p>
        <p className="font-headline text-xs text-vermillion-700 mb-8">
          — João 8:32
        </p>

        <div className="mt-4 text-center">
          <p className="font-headline text-xs text-gold-700 tracking-widest">
            ANNO DOMINI MMXXVI
          </p>
          <p className="font-title text-xs text-ink-600 italic mt-2">
            Documento genérico para replicação educacional
          </p>
        </div>
      </div>
    </div>
  </Page>
);

// ============================================
// COMPONENTE PRINCIPAL COM PAGEFLIP
// ============================================

const ManualTurnaround: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookSize, setBookSize] = useState({ width: 600, height: 800 });
  const bookRef = useRef<any>(null);

  // Total de páginas
  const totalPages = 25;

  // Responsividade
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBookSize({ width: width - 32, height: width * 1.4 });
      } else if (width < 1024) {
        setBookSize({ width: 500, height: 700 });
      } else {
        setBookSize({ width: 600, height: 800 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFlipNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handleFlipPrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handlePageChange = (e: any) => {
    setCurrentPage(e.data);
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

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-md border-b border-gold-600/30">
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

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-gold-500/10 px-3 py-1 rounded-sm border border-gold-600/30">
                  <BookOpen className="w-4 h-4 text-gold-500" />
                  <span className="font-headline text-xs text-gold-400">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Book */}
        <main className="relative z-10 pt-24 pb-32 flex flex-col items-center justify-center min-h-screen">
          <div className="book-container relative">
            {/* Book Shadow */}
            <div className="absolute inset-0 bg-black/50 blur-3xl transform translate-y-8"></div>

            {/* HTMLFlipBook */}
// Substitua o HTMLFlipBook por este código corrigido:

          <HTMLFlipBook
            ref={bookRef}
            width={bookSize.width / 2}
            height={bookSize.height}
            size="fixed"
            minWidth={250}
            maxWidth={500}
            minHeight={400}
            maxHeight={1000}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startPage={0}
            autoSize={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={handlePageChange}
            className="shadow-2xl"
            style={{}}
            startZIndex={0}
          >
              {/* Capa */}
              <CoverPage />
              
              {/* Introdução */}
              <IntroPage />
              <ConceptsPage />
              
              {/* Parte I - Fundamentos */}
              <FundamentosPage1 />
              <FundamentosPage2 />
              <FundamentosPage3 />
              <FundamentosPage4 />
              <FundamentosPage5 />
              <FundamentosPage6 />
              
              {/* Parte II - Método */}
              <MetodoPage1 />
              <MetodoPage2 />
              <MetodoPage3 />
              
              {/* Parte III - Comportamento */}
              <ComportamentoPage1 />
              <ComportamentoPage2 />
              <ComportamentoPage3 />
              
              {/* Parte IV - Sistema */}
              <SistemaPage1 />
              <SistemaPage2 />
              
              {/* Parte V - Humanidade */}
              <HumanidadePage1 />
              <HumanidadePage2 />
              <HumanidadePage3 />
              <HumanidadePage4 />
              
              {/* Conclusão */}
              <ConclusaoPage1 />
              <ConclusaoPage2 />
              
              {/* Anexos */}
              <AnexosPage />
              
              {/* Contracapa */}
              <BackCoverPage />
            </HTMLFlipBook>
          </div>

          {/* Navigation Buttons */}
          <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-8 z-40">
            <NavButton
              onClick={handleFlipPrev}
              direction="prev"
              disabled={currentPage === 0}
            />
            
            <div className="flex items-center gap-2 bg-ink-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-gold-600/30">
              <span className="font-headline text-xs text-gold-400">
                {currentPage + 1} / {totalPages}
              </span>
            </div>

            <NavButton
              onClick={handleFlipNext}
              direction="next"
              disabled={currentPage === totalPages - 1}
            />
          </div>

          {/* Instructions */}
          <div className="fixed bottom-24 left-0 right-0 text-center">
            <p className="font-title text-xs text-gold-500/60 italic">
              ✦ Arraste as páginas ou use os botões para navegar ✦
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManualTurnaround;