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
// COMPONENTE: Página do Livro
// ============================================
const BookPage = React.forwardRef<HTMLDivElement, { 
  children: React.ReactNode; 
  className?: string;
  pageNumber?: number;
}>(({ children, className = '', pageNumber }, ref) => (
  <div
    ref={ref}
    className={`book-page parchment-surface ${className}`}
    style={{
      width: '100%',
      height: '100%',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div className="corner-ornament top-left"></div>
    <div className="corner-ornament top-right"></div>
    <div className="corner-ornament bottom-left"></div>
    <div className="corner-ornament bottom-right"></div>
    
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
    
    {pageNumber && (
      <div className="text-center mt-4 text-sm text-ink-500 font-headline">
        — {pageNumber} —
      </div>
    )}
  </div>
));

BookPage.displayName = 'BookPage';

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
  <p className="drop-cap text-base leading-relaxed text-justify">
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
    <Icon className="w-5 h-5" />
  </div>
);

// ============================================
// COMPONENTE: Rubric
// ============================================
const Rubric: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rubric">{children}</span>
);

// ============================================
// CONTEÚDO DAS PÁGINAS
// ============================================

// Página 1: Capa
const CoverPage: React.FC = () => (
  <BookPage className="flex items-center justify-center">
    <div className="text-center">
      <div className="mb-8 flex justify-center">
        <WaxSeal size="lg">
          <Shield className="w-16 h-16 text-parchment-100" />
        </WaxSeal>
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-black text-ink-800 mb-4 tracking-tight">
        MANUAL UNIVERSAL
      </h1>
      
      <SacredDivider icon={Crown} />
      
      <h2 className="font-headline text-xl md:text-2xl font-bold text-gold-700 mb-6">
        O Método de Turnaround Humano
      </h2>

      <p className="font-title text-base md:text-lg text-ink-600 max-w-md mx-auto leading-relaxed italic mb-8">
        Previsibilidade, Comportamento e Sistema Financeiro Baseado em Princípios Eternos
      </p>

      <div className="mt-8">
        <p className="font-headline text-xs text-ink-500 tracking-widest">
          CODEX PHILOSOPHIA
        </p>
      </div>
    </div>
  </BookPage>
);

// Página 2: Introdução
const IntroPage: React.FC = () => (
  <BookPage>
    <div className="mb-6">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        PRÓLOGO
      </p>
      <h2 className="font-display text-2xl font-bold text-ink-800 mb-3">
        POR QUE ESTE MATERIAL EXISTE
      </h2>
      <SacredDivider icon={BookOpen} />
    </div>

    <ScrollableQuote
      quote="O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
      source="Mateus 7:24"
      explanation="Esta passagem bíblica estabelece o princípio fundamental: a diferença entre construir sobre bases sólidas (previsibilidade, método, governança) e bases frágeis (impulso, emoção, improviso)."
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
  </BookPage>
);

// Página 3: Fundamentos 1.1
const FundamentosPage1: React.FC = () => (
  <BookPage>
    <div className="mb-4">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        PARTE I
      </p>
      <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
        FUNDAMENTOS
      </h2>
      <p className="font-title text-sm text-gold-600 italic mb-3">
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

    <ScrollableQuote
      quote="Tudo me é permitido, mas nem tudo convém."
      source="1 Coríntios 6:12"
      explanation="Paulo ensina governança pessoal. A liberdade absoluta sem governança vira escravidão química. Autonomia sem disciplina é dependência disfarçada."
      type="biblical"
    />

    <ScrollableQuote
      quote="Sísifo: condenado a empurrar uma pedra montanha acima para sempre"
      source="Mitologia Grega"
      explanation="Sísifo representa o ciclo de esforço sem conclusão. Muitas pessoas vivem o ciclo de Sísifo financeiro: ganham → gastam → se endividam → tentam recuperar → repetem."
      type="mythological"
    />
  </BookPage>
);

// Página 4: Fundamentos 1.2
const FundamentosPage2: React.FC = () => (
  <BookPage>
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
        Quando esse sistema cansa, o cérebro busca recompensa rápida. Isso não é fraqueza. É <Rubric>sobrecarga cognitiva</Rubric>.
      </p>
    </div>

    <ScrollableQuote
      quote="Melhor é o longânimo do que o herói da guerra"
      source="Provérbios 16:32"
      explanation="Salomão reconheceu que a conquista externa é mais fácil que a conquista interna. Inteligência sem autodomínio é vulnerabilidade disfarçada."
      type="biblical"
    />

    <ScrollableQuote
      quote="Ulisses e as Sereias"
      source="Mitologia Grega"
      explanation="Ulisses não confiou em sua força de vontade. Ele ordenou que os marinheiros o amarrassem ao mastro. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
      type="mythological"
    />

    <h3 className="font-headline text-lg font-bold text-ink-800 mb-4 mt-6">
      1.3 Por que a rotina acalma o cérebro?
    </h3>
    
    <div className="mb-4">
      <p className="font-body text-sm text-ink-700 leading-relaxed">
        Porque <Rubric>previsibilidade reduz incerteza</Rubric>, e incerteza é o maior gatilho de ansiedade.
      </p>
    </div>

    <ScrollableQuote
      quote="Héstia: deusa do lar e da ordem"
      source="Mitologia Grega"
      explanation="Héstia representava o centro, a estabilidade. Na vida moderna, Héstia é a rotina inegociável. Ordem não é rigidez; é proteção neural."
      type="mythological"
    />
  </BookPage>
);

// Página 5: Método 2.1
const MetodoPage1: React.FC = () => (
  <BookPage>
    <div className="mb-4">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        PARTE II
      </p>
      <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
        O MÉTODO
      </h2>
      <p className="font-title text-sm text-gold-600 italic mb-3">
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

    <h4 className="font-headline text-sm font-bold text-ink-800 mb-3">
      As 4 Fases do Turnaround
    </h4>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Lock className="w-3 h-3 text-vermillion-700" />
          <h5 className="font-headline text-xs font-bold text-ink-800">1. Contenção</h5>
        </div>
        <p className="font-body text-xs text-ink-700">0-30 dias</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Anchor className="w-3 h-3 text-gold-700" />
          <h5 className="font-headline text-xs font-bold text-ink-800">2. Estabilização</h5>
        </div>
        <p className="font-body text-xs text-ink-700">30-90 dias</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Castle className="w-3 h-3 text-sage-700" />
          <h5 className="font-headline text-xs font-bold text-ink-800">3. Reconstrução</h5>
        </div>
        <p className="font-body text-xs text-ink-700">90-180 dias</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <div className="flex items-center gap-1 mb-1">
          <Crown className="w-3 h-3 text-gold-600" />
          <h5 className="font-headline text-xs font-bold text-ink-800">4. Crescimento</h5>
        </div>
        <p className="font-body text-xs text-ink-700">180+ dias</p>
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

// Página 6: Método 2.2
const MetodoPage2: React.FC = () => (
  <BookPage>
    <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
      2.2 Classificação de Contratos
    </h3>
    
    <p className="font-body text-sm text-ink-700 leading-relaxed mb-4">
      Toda movimentação financeira deve ser classificada em <Rubric>três categorias</Rubric>:
    </p>

    <div className="space-y-3">
      <div className="p-3 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-sage-700" />
          <h4 className="font-headline text-sm font-bold text-sage-700">
            CONTRATO ESSENCIAL
          </h4>
        </div>
        <p className="font-body text-xs text-ink-700 mb-1">
          Mantém a vida funcionando. Não carrega juros abusivos.
        </p>
        <p className="font-body text-xs text-sage-800 font-semibold">
          ✅ Regra: Não se corta. Se renegocia.
        </p>
      </div>

      <div className="p-3 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-vermillion-700" />
          <h4 className="font-headline text-sm font-bold text-vermillion-700">
            CONTRATO RUIM
          </h4>
        </div>
        <p className="font-body text-xs text-ink-700 mb-1">
          Juros altos, consumo emocional, prazo indefinido.
        </p>
        <p className="font-body text-xs text-vermillion-800 font-semibold">
          ❌ Regra: Eliminar prioritariamente.
        </p>
      </div>

      <div className="p-3 bg-gold-50/30 rounded-sm border-l-4 border-gold-600">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-gold-700" />
          <h4 className="font-headline text-sm font-bold text-gold-700">
            CUSTO DE COMPORTAMENTO
          </h4>
        </div>
        <p className="font-body text-xs text-ink-700 mb-1">
          Despesa evitável por impulso, dopamina ou estresse.
        </p>
        <p className="font-body text-xs text-gold-800 font-semibold">
          ⚠️ Regra: Nunca mascarar como despesa normal.
        </p>
      </div>
    </div>
  </BookPage>
);

// Página 7: Comportamento 3.1
const ComportamentoPage1: React.FC = () => (
  <BookPage>
    <div className="mb-4">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        PARTE III
      </p>
      <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
        COMPORTAMENTO
      </h2>
      <p className="font-title text-sm text-gold-600 italic mb-3">
        Quebrando Ciclos
      </p>
    </div>

    <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
      3.1 O Ciclo Dopaminérgico Financeiro
    </h3>
    
    <p className="font-body text-sm text-ink-700 leading-relaxed mb-4">
      Porque o cérebro interpreta <Rubric>ganho aleatório</Rubric> como <Rubric>habilidade</Rubric>, mesmo quando é sorte.
    </p>

    <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
      O ciclo típico:
    </h4>
    <ol className="space-y-1 mb-4">
      {[
        'Estresse → busca por estímulo',
        'Operação rápida → ganho pequeno',
        'Dopamina → "eu consigo!"',
        'Nova operação → risco maior',
        'Perda → frustração',
        'Recuperar → perda maior',
        'Culpa → volta ao passo 1'
      ].map((step, idx) => (
        <li key={idx} className="flex items-start gap-2 p-2 bg-parchment-200/50 rounded-sm">
          <span className="font-headline text-xs font-bold text-vermillion-700">{idx + 1}.</span>
          <span className="font-body text-xs text-ink-700">{step}</span>
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

// Página 8: Comportamento 3.2
const ComportamentoPage2: React.FC = () => (
  <BookPage>
    <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
      3.2 Substituição de Estímulo
    </h3>
    
    <p className="font-body text-sm text-ink-700 leading-relaxed mb-4">
      Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
    </p>

    <h4 className="font-headline text-sm font-bold text-ink-800 mb-2">
      Tabela de Substituições
    </h4>
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gold-100/30">
            <th className="border border-gold-600/30 p-2 text-left font-headline text-ink-800">Nocivo</th>
            <th className="border border-gold-600/30 p-2 text-left font-headline text-ink-800">Saudável</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gold-600/30 p-2 text-vermillion-700">Trade</td>
            <td className="border border-gold-600/30 p-2 text-sage-700">Exercício</td>
          </tr>
          <tr className="bg-parchment-100/30">
            <td className="border border-gold-600/30 p-2 text-vermillion-700">Scroll</td>
            <td className="border border-gold-600/30 p-2 text-sage-700">Leitura</td>
          </tr>
          <tr>
            <td className="border border-gold-600/30 p-2 text-vermillion-700">Compras</td>
            <td className="border border-gold-600/30 p-2 text-sage-700">Construir</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ScrollableQuote
      quote="Prometeu: trouxe o fogo aos humanos"
      source="Mitologia Grega"
      explanation="O fogo pode cozinhar ou queimar. O estímulo é o fogo moderno. Direcionado para construção, aquece. Direcionado para destruição, queima. O problema não é a energia; é a direção."
      type="mythological"
    />
  </BookPage>
);

// Página 9: Sistema 4.1
const SistemaPage1: React.FC = () => (
  <BookPage>
    <div className="mb-4">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        PARTE IV
      </p>
      <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
        SISTEMA
      </h2>
      <p className="font-title text-sm text-gold-600 italic mb-3">
        Construindo Previsibilidade
      </p>
    </div>

    <h3 className="font-headline text-lg font-bold text-ink-800 mb-4">
      4.1 O Modelo de ERP Pessoal
    </h3>
    
    <p className="font-body text-sm text-ink-700 leading-relaxed mb-4">
      Trate sua vida como uma <Rubric>microempresa com um único cliente: você mesmo</Rubric>.
    </p>

    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Receitas</h5>
        <p className="font-body text-xs text-ink-700">Fixas, Variáveis, Extraordinárias</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Contratos</h5>
        <p className="font-body text-xs text-ink-700">Essenciais, Financeiros, Ruins</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Fluxo de Caixa</h5>
        <p className="font-body text-xs text-ink-700">Projeção mensal e trimestral</p>
      </div>
      <div className="p-2 bg-parchment-200/50 rounded-sm border border-gold-600/20">
        <h5 className="font-headline text-xs font-bold text-ink-800 mb-1">Metas</h5>
        <p className="font-body text-xs text-ink-700">30, 90, 180+ dias</p>
      </div>
    </div>

    <ScrollableQuote
      quote="Hefesto: o ferreiro divino"
      source="Mitologia Grega"
      explanation="Hefesto construía armas e ferramentas. O ERP pessoal é a 'forja' moderna. Sistemas bem feitos libertam; sistemas mal feitos aprisionam."
      type="mythological"
    />
  </BookPage>
);

// Página 10: Conclusão
const ConclusaoPage: React.FC = () => (
  <BookPage>
    <div className="mb-4">
      <p className="font-headline text-xs text-gold-600 tracking-[0.3em] mb-2">
        EPÍLOGO
      </p>
      <h2 className="font-display text-xl font-bold text-ink-800 mb-2">
        CONCLUSÃO
      </h2>
      <p className="font-title text-sm text-gold-600 italic mb-3">
        O Caminho da Liberdade
      </p>
    </div>

    <ScrollableQuote
      quote="A verdade vos libertará."
      source="João 8:32"
      explanation="Mas a verdade só liberta quem a encara, organiza e age. Este manual promete: clareza, método, disciplina, dignidade."
      type="biblical"
    />

    <div className="mt-6 space-y-4">
      <h3 className="font-headline text-base font-bold text-ink-800">
        Resumo Executivo
      </h3>
      <ol className="space-y-2">
        {[
          'Classifique contratos',
          'Elimine contratos ruins',
          'Proteja essenciais',
          'Registre custos de comportamento',
          'Projete fluxo de caixa',
          'Substitua estímulos',
          'Envolva a família',
          'Mantenha rotina',
          'Revise a cada 30 dias',
          'Celebre marcos'
        ].map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 p-2 bg-parchment-200/50 rounded-sm">
            <span className="font-headline text-xs font-bold text-vermillion-700">{idx + 1}.</span>
            <span className="font-body text-xs text-ink-700">{item}</span>
          </li>
        ))}
      </ol>
    </div>

    <div className="mt-6 text-center p-4 bg-gradient-to-br from-gold-100/30 to-vermillion-50/30 rounded-sm border-2 border-gold-600/40">
      <p className="font-title text-sm text-ink-800 italic">
        "Não é sobre ter mais.<br />
        É sobre ser livre.<br />
        E liberdade vem de previsibilidade,<br />
        não de sorte."
      </p>
    </div>
  </BookPage>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ManualTurnaround: React.FC = () => {
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(10);

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const goToPage = (page: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flip(page);
    }
  };

  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

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

              <div className="flex items-center gap-4">
                <span className="font-headline text-xs text-gold-400">
                  Página {currentPage + 1} de {totalPages}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - FlipBook */}
        <main className="relative z-10 pt-20 pb-24 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-6xl">
            <HTMLFlipBook
              ref={flipBookRef}
              width={400}
              height={600}
              size="stretch"
              minWidth={300}
              maxWidth={600}
              minHeight={400}
              maxHeight={800}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              drawShadow={true}
              flippingTime={800}
              usePortrait={true}
              startPage={0}
              startZIndex={0}
              autoSize={true}
              clickEventForward={true}
              useMouseEvents={true}
              swipeDistance={30}
              showPageCorners={true}
              disableFlipByClick={false}
              onFlip={onFlip}
              className="flip-book mx-auto"
              style={{
                maxWidth: '1200px',
              }}
            >
              <CoverPage />
              <IntroPage />
              <FundamentosPage1 />
              <FundamentosPage2 />
              <MetodoPage1 />
              <MetodoPage2 />
              <ComportamentoPage1 />
              <ComportamentoPage2 />
              <SistemaPage1 />
              <ConclusaoPage />
            </HTMLFlipBook>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="px-6 py-3 bg-gradient-to-r from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline text-sm font-bold rounded-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToPage(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentPage === idx
                        ? 'bg-gold-500 scale-125'
                        : 'bg-gold-500/30 hover:bg-gold-500/60'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="px-6 py-3 bg-gradient-to-r from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline text-sm font-bold rounded-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Próxima
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gold-600/30 bg-ink-900/95 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="font-headline text-gold-400 mb-2 text-sm">
              "A verdade vos libertará." — João 8:32
            </p>
            <p className="font-body text-parchment-300/60 text-xs">
              Documento genérico para replicação educacional — Sem dados pessoais
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ManualTurnaround;