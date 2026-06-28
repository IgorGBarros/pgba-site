import React, { useState, useEffect, useRef } from 'react';
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
// TIPOS
// ============================================
interface FlipBookRef {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    turnToPage: (page: number) => void;
  };
}

interface ScrollableQuoteProps {
  quote: string;
  source: string;
  explanation: string;
  type?: 'biblical' | 'mythological';
}

// ============================================
// COMPONENTE: Página do Livro (wrapper)
// ============================================
const BookPage = React.forwardRef<HTMLDivElement, { 
  children: React.ReactNode; 
  className?: string;
  number?: number;
  total?: number;
}>(({ children, className = '', number, total }, ref) => (
  <div 
    ref={ref}
    className={`book-page parchment-surface ${className}`}
  >
    <div className="corner-ornament top-left"></div>
    <div className="corner-ornament top-right"></div>
    <div className="corner-ornament bottom-left"></div>
    <div className="corner-ornament bottom-right"></div>
    
    <div className="book-page-content">
      {children}
    </div>
    
    {number !== undefined && total !== undefined && (
      <div className="page-number">
        <span className="folio-number">— {number} —</span>
      </div>
    )}
  </div>
));

BookPage.displayName = 'BookPage';

// ============================================
// COMPONENTE: Pergaminho Interativo
// ============================================
const ScrollableQuote: React.FC<ScrollableQuoteProps> = ({ 
  quote, 
  source, 
  explanation,
  type = 'biblical'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="scrollable-quote cursor-pointer"
      >
        <div className="quote-medieval">
          <p className="font-title text-lg italic text-ink-700 leading-relaxed">
            "{quote}"
          </p>
          <span className="quote-source">— {source}</span>
        </div>
      </div>

      {isOpen && (
        <div className="scroll-container scroll-unroll mt-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              {type === 'biblical' ? (
                <BookOpen className="w-5 h-5 text-vermillion-700" />
              ) : (
                <Scroll className="w-5 h-5 text-gold-700" />
              )}
              <h4 className="font-headline text-base font-bold text-ink-800">
                {type === 'biblical' ? 'Reflexão Bíblica' : 'Sabedoria Mitológica'}
              </h4>
            </div>
            <p className="font-body text-base text-ink-700 leading-relaxed">
              {explanation}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 px-3 py-1.5 bg-gold-600/20 hover:bg-gold-600/30 
                         border border-gold-600/40 rounded-sm
                         font-headline text-xs text-ink-700 transition-all"
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
// COMPONENTES AUXILIARES
// ============================================
const ParchmentCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`parchment-card ${className}`}>
    <div className="corner-ornament top-left"></div>
    <div className="corner-ornament top-right"></div>
    <div className="corner-ornament bottom-left"></div>
    <div className="corner-ornament bottom-right"></div>
    {children}
  </div>
);

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

const DropCap: React.FC<{ letter: string; children: React.ReactNode }> = ({ letter, children }) => (
  <p className="drop-cap text-base leading-relaxed text-justify">
    {letter}
    {children}
  </p>
);

const SacredDivider: React.FC<{ icon?: React.ElementType }> = ({ icon: Icon = Sparkles }) => (
  <div className="sacred-divider">
    <Icon className="w-5 h-5" />
  </div>
);

const Rubric: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rubric">{children}</span>
);

const BiblicalReference: React.FC<{
  quote: string;
  reference: string;
  explanation: string;
}> = ({ quote, reference, explanation }) => (
  <ScrollableQuote quote={quote} source={reference} explanation={explanation} type="biblical" />
);

const MythologicalReference: React.FC<{
  title: string;
  description: string;
  explanation: string;
}> = ({ title, description, explanation }) => (
  <ScrollableQuote quote={`${title}: ${description}`} source="Mitologia" explanation={explanation} type="mythological" />
);

// ============================================
// PÁGINAS DO LIVRO
// ============================================

// PÁGINA 1 - CAPA
const CoverPage: React.FC = () => (
  <BookPage className="cover-page">
    <div className="cover-content">
      <div className="mb-6 flex justify-center">
        <WaxSeal size="lg">
          <Shield className="w-12 h-12 text-parchment-100" />
        </WaxSeal>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-black text-parchment-200 mb-4 tracking-tight text-center">
        MANUAL UNIVERSAL
      </h1>
      <SacredDivider icon={Crown} />
      <h2 className="font-headline text-xl md:text-2xl font-bold text-gold-500 mb-6 text-center">
        O Método de Turnaround Humano
      </h2>
      <p className="font-title text-base text-parchment-300 text-center italic leading-relaxed">
        Previsibilidade, Comportamento e Sistema Financeiro Baseado em Princípios Eternos
      </p>
      <div className="mt-8 text-center">
        <p className="font-headline text-xs text-gold-500/70 tracking-[0.3em]">
          CODEX PHILOSOPHIA
        </p>
      </div>
    </div>
  </BookPage>
);

// PÁGINA 2 - SUMÁRIO
const IndexPage: React.FC<{ onNavigate: (page: number) => void }> = ({ onNavigate }) => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">ÍNDICE</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Sumário</h2>
      <SacredDivider icon={BookOpen} />
    </div>
    <div className="index-list">
      {[
        { title: 'Prólogo', page: 2, icon: BookOpen },
        { title: 'Parte I — Fundamentos', page: 3, icon: Brain },
        { title: 'Parte II — O Método', page: 5, icon: Target },
        { title: 'Parte III — Comportamento', page: 7, icon: Heart },
        { title: 'Parte IV — Sistema', page: 9, icon: Settings },
        { title: 'Parte V — Humanidade', page: 11, icon: Users },
        { title: 'Epílogo', page: 13, icon: Crown },
        { title: 'Anexos', page: 14, icon: FileText },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={() => onNavigate(item.page)}
          className="index-item"
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4 text-gold-600" />
            <span className="font-body text-sm text-ink-700">{item.title}</span>
          </div>
          <span className="font-headline text-xs text-gold-700">p. {item.page}</span>
        </button>
      ))}
    </div>
  </BookPage>
);

// PÁGINA 3 - INTRODUÇÃO
const IntroPage: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PRÓLOGO</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Por que este material existe</h2>
      <SacredDivider icon={BookOpen} />
    </div>

    <ScrollableQuote
      quote="O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
      source="Mateus 7:24"
      explanation="Esta passagem estabelece o princípio fundamental: a diferença entre construir sobre bases sólidas (previsibilidade, método, governança) e bases frágeis (impulso, emoção, improviso)."
      type="biblical"
    />

    <div className="mt-6">
      <DropCap letter="E">
        ste manual não é sobre dinheiro. É sobre <Rubric>governança pessoal</Rubric>.
      </DropCap>
      <p className="font-body text-sm text-ink-700 leading-relaxed mt-3">
        Não é sobre enriquecer. É sobre <Rubric>sobreviver com dignidade</Rubric>.
      </p>
      <p className="font-body text-sm text-ink-700 leading-relaxed mt-2">
        Não é sobre motivação. É sobre <Rubric>método</Rubric>.
      </p>
    </div>

    <div className="my-4 p-4 bg-gold-100/30 rounded-sm border border-gold-600/30">
      <p className="font-title text-sm text-center text-ink-800 italic">
        <strong className="text-vermillion-700">Pessoas quebram pelo mesmo motivo que empresas:</strong>
        <br />
        falta de previsibilidade, contratos mal estruturados e decisões sob impulso.
      </p>
    </div>
  </BookPage>
);

// PÁGINA 4 - INTRODUÇÃO (continuação)
const IntroPage2: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PRÓLOGO</p>
      <h2 className="font-display text-xl font-bold text-parchment-200">Conceitos Consolidados</h2>
    </div>

    <h3 className="font-headline text-base font-bold text-ink-800 mb-3 mt-4">
      Este documento consolida conceitos de:
    </h3>
    <div className="grid grid-cols-1 gap-2">
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
        <div key={idx} className="flex items-center gap-2 p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
          <item.icon className="w-4 h-4 text-vermillion-700 flex-shrink-0" />
          <span className="font-body text-xs text-ink-800">{item.text}</span>
        </div>
      ))}
    </div>
  </BookPage>
);

// PÁGINA 5 - FUNDAMENTOS 1.1
const FundamentosPage1: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE I</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Fundamentos</h2>
      <p className="font-title text-sm text-gold-500 italic">O Ser Humano e o Estímulo</p>
      <SacredDivider icon={Brain} />
    </div>

    <h3 className="font-headline text-base font-bold text-ink-800 mb-3">
      1.1 Por que o ser humano busca dopamina?
    </h3>
    
    <div className="mb-3">
      <h4 className="font-headline text-xs font-bold text-vermillion-700 mb-1">❓ Pergunta</h4>
      <p className="font-body text-xs text-ink-700 leading-relaxed">
        Por que repetimos comportamentos que nos prejudicam, mesmo sabendo que são ruins?
      </p>
    </div>

    <div className="mb-3">
      <h4 className="font-headline text-xs font-bold text-sage-700 mb-1">✅ Resposta</h4>
      <p className="font-body text-xs text-ink-700 leading-relaxed">
        Porque o cérebro humano foi projetado para <Rubric>buscar recompensa</Rubric>, não para planejar longo prazo.
      </p>
      <p className="font-body text-xs text-ink-700 leading-relaxed mt-2">
        A dopamina não é o neurotransmissor do prazer. É o neurotransmissor da <Rubric>expectativa</Rubric>.
      </p>
    </div>

    <ScrollableQuote
      quote="Tudo me é permitido, mas nem tudo convém."
      source="1 Coríntios 6:12"
      explanation="Paulo ensina governança pessoal. A liberdade absoluta sem governança vira escravidão química. Autonomia sem disciplina é dependência disfarçada."
      type="biblical"
    />
  </BookPage>
);

// PÁGINA 6 - FUNDAMENTOS 1.2 e 1.3
const FundamentosPage2: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE I</p>
      <h2 className="font-display text-xl font-bold text-parchment-200">Impulsividade e Rotina</h2>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      1.2 Por que pessoas inteligentes sofrem mais com impulsividade?
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-3">
      Porque usam intensamente o <Rubric>córtex pré-frontal</Rubric>, que consome muita energia mental. Quando cansa, o cérebro busca recompensa rápida. Isso não é fraqueza. É <Rubric>sobrecarga cognitiva</Rubric>.
    </p>

    <ScrollableQuote
      quote="Ulisses e as Sereias"
      source="Mitologia Grega"
      explanation="Ulisses não confiou em sua força de vontade. Ele ordenou que os marinheiros o amarrassem ao mastro. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
      type="mythological"
    />

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2 mt-4">
      1.3 Por que a rotina acalma o cérebro?
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-3">
      Porque <Rubric>previsibilidade reduz incerteza</Rubric>, e incerteza é o maior gatilho de ansiedade. Quando você estabelece horário fixo, tarefa clara, regra definida e plano visível, o sistema de alerta diminui.
    </p>

    <ScrollableQuote
      quote="Héstia: deusa do lar e da ordem"
      source="Mitologia Grega"
      explanation="Héstia representava o centro, a estabilidade, o fogo que nunca se apagava. Na vida moderna, Héstia é a rotina inegociável. Ordem não é rigidez; é proteção neural."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 7 - MÉTODO 2.1
const MetodoPage1: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE II</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">O Método</h2>
      <p className="font-title text-sm text-gold-500 italic">Turnaround Pessoal</p>
      <SacredDivider icon={Target} />
    </div>

    <h3 className="font-headline text-base font-bold text-ink-800 mb-3">
      2.1 O que é Turnaround Pessoal?
    </h3>
    
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-3">
      Turnaround é um termo corporativo para <Rubric>reestruturação de crise</Rubric>. Aplicado à pessoa física, significa:
    </p>

    <div className="my-3 p-4 bg-gold-100/30 rounded-sm border border-gold-600/30">
      <p className="font-title text-sm text-center text-ink-800 italic">
        Parar de sangrar → Estabilizar → Reconstruir → Crescer
      </p>
    </div>

    <h4 className="font-headline text-xs font-bold text-ink-800 mb-2 mt-4">
      As 4 Fases do Turnaround
    </h4>
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Lock className="w-3 h-3 text-vermillion-700" />
          <span className="font-headline text-xs font-bold text-ink-800">1. Contenção</span>
        </div>
        <p className="font-body text-[10px] text-ink-700">Parar sangria (0-30 dias)</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Anchor className="w-3 h-3 text-gold-700" />
          <span className="font-headline text-xs font-bold text-ink-800">2. Estabilização</span>
        </div>
        <p className="font-body text-[10px] text-ink-700">Previsibilidade (30-90 dias)</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Castle className="w-3 h-3 text-sage-700" />
          <span className="font-headline text-xs font-bold text-ink-800">3. Reconstrução</span>
        </div>
        <p className="font-body text-[10px] text-ink-700">Eliminar passivos (90-180 dias)</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Crown className="w-3 h-3 text-gold-600" />
          <span className="font-headline text-xs font-bold text-ink-800">4. Crescimento</span>
        </div>
        <p className="font-body text-[10px] text-ink-700">Investir (180+ dias)</p>
      </div>
    </div>

    <ScrollableQuote
      quote="Qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas?"
      source="Lucas 14:28"
      explanation="Jesus ensina gestão de risco. Iniciar sem cálculo é arrogância; calcular antes é sabedoria."
      type="biblical"
    />
  </BookPage>
);

// PÁGINA 8 - MÉTODO 2.2 e 2.3
const MetodoPage2: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE II</p>
      <h2 className="font-display text-xl font-bold text-parchment-200">Classificação e Previsibilidade</h2>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      2.2 Classificação de Contratos
    </h3>

    <div className="space-y-2 mb-3">
      <div className="p-2 bg-sage-50/30 rounded-sm border-l-2 border-sage-600">
        <div className="flex items-center gap-1 mb-1">
          <Shield className="w-3 h-3 text-sage-700" />
          <h4 className="font-headline text-xs font-bold text-sage-700">CONTRATO ESSENCIAL</h4>
        </div>
        <p className="font-body text-[10px] text-ink-700">Mantém vida funcionando. ✅ Não se corta. Se renegocia.</p>
      </div>

      <div className="p-2 bg-vermillion-50/30 rounded-sm border-l-2 border-vermillion-700">
        <div className="flex items-center gap-1 mb-1">
          <AlertCircle className="w-3 h-3 text-vermillion-700" />
          <h4 className="font-headline text-xs font-bold text-vermillion-700">CONTRATO RUIM</h4>
        </div>
        <p className="font-body text-[10px] text-ink-700">Juros altos, consumo emocional. ❌ Eliminar prioritariamente.</p>
      </div>

      <div className="p-2 bg-gold-50/30 rounded-sm border-l-2 border-gold-600">
        <div className="flex items-center gap-1 mb-1">
          <Brain className="w-3 h-3 text-gold-700" />
          <h4 className="font-headline text-xs font-bold text-gold-700">CUSTO DE COMPORTAMENTO</h4>
        </div>
        <p className="font-body text-[10px] text-ink-700">Despesa por impulso. ⚠️ Nunca mascarar como despesa normal.</p>
      </div>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2 mt-4">
      2.3 A Regra de Ouro da Previsibilidade
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Porque <Rubric>renda alta sem previsibilidade gera caos</Rubric>.
    </p>
    <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/30">
      <p className="font-mono text-[10px] text-ink-700">
        Previsibilidade = Receita - Despesas - Contratos
      </p>
    </div>

    <ScrollableQuote
      quote="Os planos do diligente tendem à abundância; mas todo apressado, à pobreza."
      source="Provérbios 21:5"
      explanation="Abundância não vem de velocidade; vem de precisão."
      type="biblical"
    />
  </BookPage>
);

// PÁGINA 9 - COMPORTAMENTO 3.1
const ComportamentoPage1: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE III</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Comportamento</h2>
      <p className="font-title text-sm text-gold-500 italic">Quebrando Ciclos</p>
      <SacredDivider icon={Heart} />
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      3.1 O Ciclo Dopaminérgico Financeiro
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Porque o cérebro interpreta <Rubric>ganho aleatório</Rubric> como <Rubric>habilidade</Rubric>, mesmo quando é sorte.
    </p>

    <h4 className="font-headline text-xs font-bold text-ink-800 mb-2">O ciclo típico:</h4>
    <ol className="space-y-1">
      {[
        'Estresse → busca por estímulo',
        'Operação rápida → ganho pequeno',
        'Dopamina → "eu consigo!"',
        'Nova operação → risco maior',
        'Perda → frustração',
        'Recuperar → perda maior',
        'Culpa → volta ao passo 1'
      ].map((step, idx) => (
        <li key={idx} className="flex items-start gap-2 p-1.5 bg-parchment-200/50 rounded-sm">
          <span className="font-headline text-[10px] font-bold text-vermillion-700">{idx + 1}.</span>
          <span className="font-body text-[10px] text-ink-700">{step}</span>
        </li>
      ))}
    </ol>

    <ScrollableQuote
      quote="Ícaro: voou perto demais do sol"
      source="Mitologia Grega"
      explanation="O ciclo dopaminérgico é Ícaro financeiro: o primeiro ganho gera euforia, a euforia gera mais risco, o risco gera queda. Sucesso inicial sem estrutura é convite para a queda."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 10 - COMPORTAMENTO 3.2 e 3.3
const ComportamentoPage2: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE III</p>
      <h2 className="font-display text-xl font-bold text-parchment-200">Substituição e Família</h2>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      3.2 Substituição de Estímulo
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
    </p>

    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gold-100/30">
            <th className="border border-gold-600/30 p-1 text-left font-headline text-[10px] text-ink-800">Nocivo</th>
            <th className="border border-gold-600/30 p-1 text-left font-headline text-[10px] text-ink-800">Saudável</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-vermillion-700">Trade</td>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-sage-700">Exercício</td>
          </tr>
          <tr>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-vermillion-700">Scroll</td>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-sage-700">Leitura</td>
          </tr>
          <tr>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-vermillion-700">Compras</td>
            <td className="border border-gold-600/30 p-1 font-body text-[10px] text-sage-700">Construir</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2 mt-3">
      3.3 O Papel da Família
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Com <Rubric>transparência, não dramatismo</Rubric>.
    </p>

    <ScrollableQuote
      quote="Héstia: guardiã do lar"
      source="Mitologia Grega"
      explanation="Héstia era a deusa que nunca saía de casa. Na governança familiar, Héstia é a regra doméstica inegociável. O lar organizado não é perfeição; é proteção contra o caos externo."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 11 - SISTEMA 4.1
const SistemaPage1: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE IV</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Sistema</h2>
      <p className="font-title text-sm text-gold-500 italic">Construindo Previsibilidade</p>
      <SacredDivider icon={Settings} />
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      4.1 O Modelo de ERP Pessoal
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-3">
      Trate sua vida como uma <Rubric>microempresa com um único cliente: você mesmo</Rubric>.
    </p>

    <h4 className="font-headline text-xs font-bold text-ink-800 mb-2">Estrutura Mínima:</h4>
    <div className="grid grid-cols-1 gap-1.5">
      {[
        { title: 'Módulo 1: Receitas', items: 'Fixas, Variáveis, Extraordinárias' },
        { title: 'Módulo 2: Contratos', items: 'Essenciais, Financeiros, Ruins' },
        { title: 'Módulo 3: Fluxo de Caixa', items: 'Projeção mensal e trimestral' },
        { title: 'Módulo 4: Comportamento', items: 'Custos, gatilhos, substituições' },
        { title: 'Módulo 5: Metas', items: '30, 90, 180+ dias' },
      ].map((mod, idx) => (
        <div key={idx} className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
          <h5 className="font-headline text-[10px] font-bold text-ink-800">{mod.title}</h5>
          <p className="font-body text-[10px] text-ink-700">{mod.items}</p>
        </div>
      ))}
    </div>

    <ScrollableQuote
      quote="Hefesto: o ferreiro divino"
      source="Mitologia Grega"
      explanation="Hefesto era o único deus que trabalhava com as mãos. O ERP pessoal é a 'forja' moderna. Sistemas bem feitos libertam; sistemas mal feitos aprisionam."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 12 - SISTEMA 4.2
const SistemaPage2: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE IV</p>
      <h2 className="font-display text-xl font-bold text-parchment-200">Regra dos 90 Dias</h2>
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      4.2 A Regra dos 90 Dias
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-3">
      Tempo suficiente para criar novo hábito, reduzir impulso antigo, ver resultado tangível e ajustar o método.
    </p>

    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gold-100/30">
            <th className="border border-gold-600/30 p-1.5 text-left font-headline text-[10px] text-ink-800">Período</th>
            <th className="border border-gold-600/30 p-1.5 text-left font-headline text-[10px] text-ink-800">Foco</th>
            <th className="border border-gold-600/30 p-1.5 text-left font-headline text-[10px] text-ink-800">Sucesso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">1-30</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">Contenção</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">Sem nova dívida</td>
          </tr>
          <tr>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">31-60</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">Estabilização</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">Fluxo projetado</td>
          </tr>
          <tr>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">61-90</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">Reconstrução</td>
            <td className="border border-gold-600/30 p-1.5 font-body text-[10px] text-ink-700">1º contrato eliminado</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ScrollableQuote
      quote="As Três Graças: Aglaia, Eufrósine e Talia"
      source="Mitologia Grega"
      explanation="As Graças dançavam juntas, representando que beleza, alegria e abundância só existem em harmonia. Os 90 dias são a 'dança das Graças' do turnaround."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 13 - HUMANIDADE
const HumanidadePage: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">PARTE V</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Humanidade</h2>
      <p className="font-title text-sm text-gold-500 italic">Além do Financeiro</p>
      <SacredDivider icon={Users} />
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2">
      5.1 O Ser Humano Como Sistema
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Porque <Rubric>sistemas são previsíveis; vontades são voláteis</Rubric>.
    </p>

    <div className="grid grid-cols-2 gap-1.5 mb-3">
      {[
        { name: 'Corpo', desc: 'físico, energia' },
        { name: 'Mente', desc: 'pensamento' },
        { name: 'Emoção', desc: 'sentimento' },
        { name: 'Espírito', desc: 'propósito' },
      ].map((item, idx) => (
        <div key={idx} className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
          <span className="font-headline text-[10px] font-bold text-vermillion-700">{item.name}</span>
          <p className="font-body text-[10px] text-ink-700">{item.desc}</p>
        </div>
      ))}
    </div>

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2 mt-3">
      5.2 Influência e Padrão
    </h3>
    <p className="font-body text-xs text-ink-700 leading-relaxed mb-2">
      Porque <Rubric>seres humanos aprendem por observação, não por discurso</Rubric>.
    </p>

    <ScrollableQuote
      quote="Orfeu: cuja música acalmava até feras"
      source="Mitologia Grega"
      explanation="Orfeu não usava armas ou ordens; usava harmonia. Quem vive em ritmo atrai quem quer dançar."
      type="mythological"
    />
  </BookPage>
);

// PÁGINA 14 - CONCLUSÃO
const ConclusaoPage: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">EPÍLOGO</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Conclusão</h2>
      <p className="font-title text-sm text-gold-500 italic">O Caminho da Liberdade</p>
      <SacredDivider icon={Crown} />
    </div>

    <ScrollableQuote
      quote="A verdade vos libertará."
      source="João 8:32"
      explanation="Mas a verdade só liberta quem a encara, organiza e age. Este manual não promete enriquecimento rápido. Promete apenas: clareza, método, disciplina, dignidade."
      type="biblical"
    />

    <h3 className="font-headline text-sm font-bold text-ink-800 mb-2 mt-3">
      🔄 Resumo Executivo
    </h3>
    <ol className="space-y-1">
      {[
        'Classifique: Essencial, Ruim ou Comportamento',
        'Elimine contratos ruins',
        'Proteja contratos essenciais',
        'Registre custos de comportamento',
        'Projete fluxo de caixa',
        'Substitua estímulos nocivos',
        'Envolva a família',
        'Mantenha rotina',
        'Revise a cada 30 dias',
        'Celebre marcos'
      ].map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 p-1.5 bg-parchment-200/50 rounded-sm">
          <span className="font-headline text-[10px] font-bold text-vermillion-700">{idx + 1}.</span>
          <span className="font-body text-[10px] text-ink-700">{item}</span>
        </li>
      ))}
    </ol>

    <div className="mt-4 text-center p-3 bg-gradient-to-br from-gold-100/30 to-vermillion-50/30 rounded-sm border border-gold-600/40">
      <p className="font-title text-xs text-ink-800 italic">
        "Não é sobre ter mais.<br />
        É sobre ser livre.<br />
        E liberdade vem de previsibilidade,<br />
        não de sorte."
      </p>
    </div>
  </BookPage>
);

// PÁGINA 15 - ANEXOS
const AnexosPage: React.FC = () => (
  <BookPage>
    <div className="page-header">
      <p className="font-headline text-xs text-gold-500 tracking-[0.3em] mb-2">ANEXOS</p>
      <h2 className="font-display text-2xl font-bold text-parchment-200">Ferramentas Práticas</h2>
      <SacredDivider icon={FileText} />
    </div>

    <h3 className="font-headline text-xs font-bold text-ink-800 mb-2 flex items-center gap-1">
      <FileText className="w-3 h-3 text-gold-700" />
      Checklist de Classificação
    </h3>
    <div className="space-y-1 mb-3">
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <p className="font-body text-[10px] text-ink-700">
          <span className="font-headline font-bold text-sage-700">[ ]</span> Mantém operação funcionando? → <span className="text-sage-700 font-bold">Essencial</span>
        </p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <p className="font-body text-[10px] text-ink-700">
          <span className="font-headline font-bold text-vermillion-700">[ ]</span> Juros altos ou prazo indefinido? → <span className="text-vermillion-700 font-bold">Ruim</span>
        </p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <p className="font-body text-[10px] text-ink-700">
          <span className="font-headline font-bold text-gold-700">[ ]</span> Feito por impulso? → <span className="text-gold-700 font-bold">Comportamento</span>
        </p>
      </div>
    </div>

    <h3 className="font-headline text-xs font-bold text-ink-800 mb-2 flex items-center gap-1">
      <Clock className="w-3 h-3 text-gold-700" />
      Protocolo Anti-Impulso
    </h3>
    <ol className="space-y-1 mb-3">
      {[
        'Sentiu vontade? → PARE',
        'Registre o gatilho',
        'Execute substituição',
        'Espere 24h',
        'Revise com a regra'
      ].map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 p-1.5 bg-parchment-200/50 rounded-sm">
          <span className="font-headline text-[10px] font-bold text-vermillion-700">{idx + 1}.</span>
          <span className="font-body text-[10px] text-ink-700">{item}</span>
        </li>
      ))}
    </ol>

    <h3 className="font-headline text-xs font-bold text-ink-800 mb-2 flex items-center gap-1">
      <Trophy className="w-3 h-3 text-gold-700" />
      Marco de 90 Dias
    </h3>
    <div className="grid grid-cols-3 gap-1.5">
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Lock className="w-3 h-3 text-vermillion-700" />
          <span className="font-headline text-[10px] font-bold">Dia 30</span>
        </div>
        <p className="font-body text-[9px] text-ink-700">Nenhuma nova dívida</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Anchor className="w-3 h-3 text-gold-700" />
          <span className="font-headline text-[10px] font-bold">Dia 60</span>
        </div>
        <p className="font-body text-[9px] text-ink-700">Fluxo projetado</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Castle className="w-3 h-3 text-sage-700" />
          <span className="font-headline text-[10px] font-bold">Dia 90</span>
        </div>
        <p className="font-body text-[9px] text-ink-700">1º contrato eliminado</p>
      </div>
    </div>
  </BookPage>
);

// PÁGINA 16 - CONTRACAPA
const BackCoverPage: React.FC = () => (
  <BookPage className="cover-page">
    <div className="cover-content">
      <div className="flex justify-center mb-6">
        <WaxSeal size="md">
          <Compass className="w-8 h-8 text-parchment-100" />
        </WaxSeal>
      </div>
      <p className="font-headline text-gold-400 mb-4 text-center text-sm">
        "A verdade vos libertará." — João 8:32
      </p>
      <p className="font-body text-parchment-300/60 text-xs mb-6 text-center">
        Documento genérico para replicação educacional — Sem dados pessoais
      </p>
      <div className="mt-8 text-center">
        <p className="font-headline text-[10px] text-parchment-300/40 tracking-[0.3em]">
          ANNO DOMINI MMXXVI · MANUAL UNIVERSAL
        </p>
      </div>
    </div>
  </BookPage>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ManualTurnaround: React.FC = () => {
  const flipBookRef = useRef<FlipBookRef>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(16);

  const handleFlipNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handleFlipPrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNavigate = (page: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().turnToPage(page);
    }
  };

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleFlipNext();
      } else if (e.key === 'ArrowLeft') {
        handleFlipPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="codex-theme">
      <div
        className="min-h-screen relative overflow-hidden"
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

              {/* Indicador de Página */}
              <div className="hidden md:flex items-center gap-2">
                <span className="font-headline text-xs text-gold-400">
                  Página {currentPage + 1} de {totalPages}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - FlipBook */}
        <main className="relative z-10 pt-20 pb-24 flex items-center justify-center min-h-screen">
          <div className="book-container">
            <HTMLFlipBook
              ref={flipBookRef}
              width={350}
              height={500}
              size="stretch"
              minWidth={300}
              maxWidth={600}
              minHeight={400}
              maxHeight={700}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startPage={0}
              autoSize={true}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
              onFlip={handleFlip}
              style={{}}
              startZIndex={0}
              className="flip-book"
            >
              <CoverPage />
              <IndexPage onNavigate={handleNavigate} />
              <IntroPage />
              <IntroPage2 />
              <FundamentosPage1 />
              <FundamentosPage2 />
              <MetodoPage1 />
              <MetodoPage2 />
              <ComportamentoPage1 />
              <ComportamentoPage2 />
              <SistemaPage1 />
              <SistemaPage2 />
              <HumanidadePage />
              <ConclusaoPage />
              <AnexosPage />
              <BackCoverPage />
            </HTMLFlipBook>
          </div>
        </main>

        {/* Controles de Navegação */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-md border-t border-gold-600/30">
          <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleFlipPrev}
              disabled={currentPage === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 
                         border border-gold-600/40 rounded-sm
                         font-headline text-xs text-gold-400 transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-headline text-xs text-gold-400">
                {currentPage + 1} / {totalPages}
              </span>
            </div>

            <button
              onClick={handleFlipNext}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600/20 hover:bg-gold-600/30 
                         border border-gold-600/40 rounded-sm
                         font-headline text-xs text-gold-400 transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualTurnaround;