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
  Sparkles,
  Eye,
  Lock,
  Unlock,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Key,
  Feather,
  Lamp,
  Search,
  Zap,
  Activity,
  Moon,
  Sun
} from 'lucide-react';

import '../../styles/codex.css';

// ============================================
// COMPONENTE: Pergaminho Interativo Aprimorado
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
    <div className="mb-8 scroll-trigger">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="scrollable-quote cursor-pointer group"
      >
        <div className="quote-medieval relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-600 to-transparent opacity-50"></div>
          <p className="font-title text-xl italic text-ink-700 leading-relaxed relative z-10">
            "{quote}"
          </p>
          <span className="quote-source block mt-2 text-right">— {source}</span>
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity">
            {type === 'biblical' ? <BookOpen className="w-16 h-16 text-vermillion-700" /> : <Scroll className="w-16 h-16 text-gold-700" />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="scroll-container scroll-unroll mt-4 animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400 opacity-30"></div>
          
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gold-600/30">
              {type === 'biblical' ? (
                <BookOpen className="w-6 h-6 text-vermillion-700" />
              ) : (
                <Scroll className="w-6 h-6 text-gold-700" />
              )}
              <h4 className="font-headline text-lg font-bold text-ink-800">
                {type === 'biblical' ? '📜 Reflexão Bíblica' : '🏛️ Sabedoria Mitológica'}
              </h4>
            </div>
            <p className="font-body text-lg text-ink-700 leading-relaxed mb-6">
              {explanation}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-gradient-to-r from-gold-600/20 to-gold-600/10 hover:from-gold-600/30 hover:to-gold-600/20 
                         border-2 border-gold-600/40 rounded-sm
                         font-headline text-sm text-ink-700 transition-all duration-300 hover:shadow-lg"
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
// COMPONENTE: Card de Seção Medieval
// ============================================
const MedievalCard: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ title, icon: Icon, children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`parchment-surface p-6 md:p-8 rounded-lg relative mb-8 transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      <div className="corner-ornament top-left"></div>
      <div className="corner-ornament top-right"></div>
      <div className="corner-ornament bottom-left"></div>
      <div className="corner-ornament bottom-right"></div>
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gold-600/30">
        <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-sm shadow-lg">
          <Icon className="w-6 h-6 text-parchment-100" />
        </div>
        <h3 className="font-display text-2xl font-bold text-ink-800">{title}</h3>
      </div>
      
      {children}
    </div>
  );
};

// ============================================
// COMPONENTE: Tabela Medieval
// ============================================
const MedievalTable: React.FC<{
  headers: string[];
  rows: string[][];
}> = ({ headers, rows }) => (
  <div className="overflow-x-auto my-6 rounded-lg border-2 border-gold-600/30 shadow-xl">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gradient-to-r from-gold-600/20 to-gold-600/10">
          {headers.map((header, idx) => (
            <th key={idx} className="border-2 border-gold-600/30 p-4 text-left font-headline text-sm text-ink-800 font-bold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-parchment-100/30' : 'bg-parchment-200/20'}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className="border-2 border-gold-600/20 p-4 font-body text-ink-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

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
    className={`parchment-surface p-6 md:p-10 rounded-lg relative ${className}`}
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
  <p className="drop-cap text-lg leading-relaxed text-justify font-body">
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
  <div className="sacred-divider my-8">
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
// COMPONENTE: Referência Bíblica
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

// ============================================
// COMPONENTE: Referência Mitológica
// ============================================
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
      <div className="mb-8 flex justify-center animate-float">
        <WaxSeal size="lg">
          <Shield className="w-12 h-12 text-parchment-100" />
        </WaxSeal>
      </div>

      <h1 className="font-display text-5xl md:text-7xl font-black text-parchment-200 mb-6 tracking-tight drop-shadow-2xl">
        MANUAL UNIVERSAL
      </h1>
      <h2 className="font-headline text-2xl md:text-4xl font-bold text-gold-500 mb-8 drop-shadow-lg">
        O Método de Turnaround Humano
      </h2>

      <SacredDivider icon={Crown} />

      <p className="font-title text-xl md:text-2xl text-parchment-300 max-w-3xl mx-auto leading-relaxed mb-12 italic">
        Previsibilidade, Comportamento e Sistema Financeiro Baseado em Princípios Eternos
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="#introducao"
          className="px-8 py-4 bg-gradient-to-r from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline font-bold tracking-widest rounded-sm shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-vermillion-600"
        >
          📜 EXPLORAR O CÓDICE
        </a>
        <a
          href="#metodo"
          className="px-8 py-4 border-2 border-gold-500 text-gold-500 font-headline font-bold tracking-widest rounded-sm hover:bg-gold-500/10 transform hover:-translate-y-1 transition-all duration-300"
        >
          🎯 O MÉTODO
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
      <div className="quote-medieval mb-8">
        <p className="font-title text-xl italic text-ink-700 leading-relaxed">
          "O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
        </p>
        <span className="quote-source">— Mateus 7:24</span>
      </div>

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

        <div className="my-8 p-6 bg-gradient-to-br from-gold-100/40 to-vermillion-50/30 rounded-sm border-2 border-gold-600/30 shadow-lg">
          <p className="font-title text-xl text-center text-ink-800 italic">
            <strong className="text-vermillion-700">
              Pessoas quebram pelo mesmo motivo que empresas:
            </strong>
            <br />
            falta de previsibilidade, contratos mal estruturados e decisões sob impulso.
          </p>
        </div>

        <h3 className="font-headline text-xl font-bold text-ink-800 mb-4 mt-8 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-600" />
          Este documento consolida conceitos de:
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: BookOpen, text: '📜 Bíblia e sabedoria antiga' },
            { icon: Scroll, text: '🏛️ Mitologia e arquétipos humanos' },
            { icon: Brain, text: '🧠 Neurociência e dopamina' },
            { icon: Heart, text: '🔄 Comportamento e padrões repetitivos' },
            { icon: Settings, text: '🏗️ Sistemas e previsibilidade' },
            { icon: Users, text: '👨‍👩‍👦 Família como unidade econômica' },
            { icon: TrendingUp, text: '💰 Finanças com mentalidade corporativa' },
            { icon: Shield, text: '🔄 Turnaround: reestruturação de crise' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 bg-parchment-200/50 rounded-sm border-2 border-gold-600/20 hover:border-gold-600/40 transition-all duration-300 hover:shadow-lg"
            >
              <item.icon className="w-5 h-5 text-vermillion-700 flex-shrink-0" />
              <span className="font-body text-ink-800">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </ParchmentCard>
  </section>
);

const FundamentosSection: React.FC = () => (
  <section id="fundamentos" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE I
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        FUNDAMENTOS
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        O Ser Humano e o Estímulo
      </p>
      <SacredDivider icon={Brain} />
    </div>

    <div className="space-y-12">
      {/* 1.1 Dopamina */}
      <MedievalCard title="1.1 Por que o ser humano busca dopamina?" icon={Brain} delay={100}>
        <div className="space-y-6">
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ❓ Pergunta
            </h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Por que repetimos comportamentos que nos prejudicam, mesmo sabendo que são ruins?
            </p>
          </div>

          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h4 className="font-headline text-lg font-bold text-sage-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              ✅ Resposta
            </h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Porque o cérebro humano foi projetado para <Rubric>buscar recompensa</Rubric>, não para planejar longo prazo.
            </p>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              A dopamina não é o neurotransmissor do prazer. É o neurotransmissor da <Rubric>expectativa</Rubric>.
            </p>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              Quando o cérebro antecipa uma recompensa:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li className="font-body text-ink-700">ele libera dopamina</li>
              <li className="font-body text-ink-700">ele foca na busca</li>
              <li className="font-body text-ink-700">ele ignora consequências futuras</li>
            </ul>
          </div>

          <div className="my-8 p-6 bg-gradient-to-br from-vermillion-50/40 to-gold-50/30 rounded-sm border-2 border-vermillion-700/30">
            <p className="font-title text-xl text-ink-800 italic">
              <strong className="text-vermillion-700">Resultado:</strong>
              <br />
              O cérebro antigo em ambiente moderno = busca constante por estímulo.
            </p>
          </div>

          <ScrollableQuote
            quote="Tudo me é permitido, mas nem tudo convém. Tudo me é permitido, mas eu não me deixarei dominar por nada."
            source="1 Coríntios 6:12"
            explanation="Paulo não está pregando restrição por restrição. Ele está ensinando governança pessoal. A liberdade absoluta sem governança vira escravidão química. Quando o cérebro busca dopamina sem filtro, a 'liberdade' de fazer o que quer se torna 'escravidão' ao impulso. O princípio é claro: autonomia sem disciplina é dependência disfarçada."
            type="biblical"
          />

          <ScrollableQuote
            quote="Sísifo: condenado a empurrar uma pedra montanha acima para sempre"
            source="Mitologia Grega"
            explanation="Sísifo representa o ciclo de esforço sem conclusão. Muitas pessoas vivem o ciclo de Sísifo financeiro: ganham → gastam → se endividam → tentam recuperar → repetem. Sem método (um sistema para segurar a pedra no topo), o ciclo se repete eternamente. O aprendizado é que esforço sem sistema é apenas movimento."
            type="mythological"
          />
        </div>
      </MedievalCard>

      {/* 1.2 Impulsividade */}
      <MedievalCard title="1.2 Por que pessoas inteligentes sofrem mais com impulsividade?" icon={Brain} delay={200}>
        <div className="space-y-6">
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">❓ Pergunta</h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Por que pessoas analíticas, responsáveis e técnicas parecem mais vulneráveis a vícios de dopamina?
            </p>
          </div>

          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">✅ Resposta</h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Porque usam intensamente o <Rubric>córtex pré-frontal</Rubric> (planejamento, análise, controle), que consome muita energia mental.
            </p>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              Quando esse sistema cansa:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li className="font-body text-ink-700">o cérebro busca recompensa rápida</li>
              <li className="font-body text-ink-700">a impulsividade aumenta</li>
              <li className="font-body text-ink-700">a justificativa racional aparece ("só dessa vez")</li>
            </ul>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              Isso não é fraqueza. É <Rubric>sobrecarga cognitiva</Rubric>.
            </p>
          </div>

          <ScrollableQuote
            quote="Melhor é o longânimo do que o herói da guerra, e o que domina o seu espírito do que o que toma uma cidade."
            source="Provérbios 16:32"
            explanation="Salomão, o homem mais sábio da Bíblia, reconheceu que a conquista externa (tomar uma cidade) é mais fácil que a conquista interna (dominar o espírito). Pessoas inteligentes conquistam 'cidades' (projetos, metas, conhecimento), mas falham em dominar o 'espírito' (impulso, ansiedade, dopamina). A sabedoria prática aqui é que inteligência sem autodomínio é vulnerabilidade disfarçada."
            type="biblical"
          />

          <ScrollableQuote
            quote="Ulisses e as Sereias: Ulisses sabia que o canto das sereias era irresistível"
            source="Mitologia Grega"
            explanation="Ulisses não confiou em sua força de vontade. Ele ordenou que os marinheiros tampassem os ouvidos com cera e o amarrassem ao mastro, dizendo: 'Mesmo que eu peça para soltar, não me soltem.' Esta é a gestão de impulso por design, não por força de vontade. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
            type="mythological"
          />
        </div>
      </MedievalCard>

      {/* 1.3 Rotina */}
      <MedievalCard title="1.3 Por que a rotina acalma o cérebro?" icon={Activity} delay={300}>
        <div className="space-y-6">
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">❓ Pergunta</h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Por que pessoas ansiosas melhoram quando têm rotina, exercício e previsibilidade?
            </p>
          </div>

          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">✅ Resposta</h4>
            <p className="font-body text-lg text-ink-700 leading-relaxed">
              Porque <Rubric>previsibilidade reduz incerteza</Rubric>, e incerteza é o maior gatilho de ansiedade.
            </p>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              O cérebro odeia o desconhecido. Quando você estabelece:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li className="font-body text-ink-700">horário fixo</li>
              <li className="font-body text-ink-700">tarefa clara</li>
              <li className="font-body text-ink-700">regra definida</li>
              <li className="font-body text-ink-700">plano visível</li>
            </ul>
            <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
              O sistema de alerta diminui. A dopamina se estabiliza. A impulsividade cai.
            </p>
          </div>

          <ScrollableQuote
            quote="Façam tudo com decência e ordem."
            source="1 Coríntios 14:40"
            explanation="Paulo não está pregando perfeccionismo. Ele está ensinando que ordem é pré-requisito para paz. A palavra grega usada para 'ordem' é taxis, que significa organização militar, estrutura hierárquica. A aplicação moderna é clara: quando a vida financeira e comportamental é 'taxis' (ordenada), o cérebro para de operar em modo de alerta constante. Decência e ordem não são virtudes morais; são ferramentas de sobrevivência neural."
            type="biblical"
          />

          <ScrollableQuote
            quote="Héstia: deusa do lar e da ordem"
            source="Mitologia Grega"
            explanation="Héstia era a única dos doze olímpicos que não participava das guerras e disputas. Ela representava o centro, a estabilidade, o fogo que nunca se apagava. Na vida moderna, Héstia é a rotina inegociável: o treino na mesma hora, o estudo no mesmo horário, a revisão financeira semanal. O lar (interno e externo) organizado protege contra o caos externo. Quando o cérebro sabe 'o que vem depois', ele para de gerar cortisol (estresse) e começa a gerar serotonina (estabilidade). Ordem não é rigidez; é proteção neural."
            type="mythological"
          />
        </div>
      </MedievalCard>
    </div>
  </section>
);

// ... (continua com as outras seções - MetodoSection, ComportamentoSection, SistemaSection, HumanidadeSection, ConclusaoSection)

const MetodoSection: React.FC = () => (
  <section id="metodo" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE II
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        O MÉTODO
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        Turnaround Pessoal
      </p>
      <SacredDivider icon={Target} />
    </div>

    <MedievalCard title="2.1 O que é Turnaround Pessoal?" icon={Shield}>
      <div className="space-y-6">
        <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">❓ Pergunta</h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            O que significa "turnaround" aplicado à vida pessoal?
          </p>
        </div>

        <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">✅ Resposta</h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Turnaround é um termo corporativo para <Rubric>reestruturação de crise</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Aplicado à pessoa física, significa:
          </p>
          <div className="my-4 p-6 bg-gradient-to-br from-gold-100/40 to-vermillion-50/30 rounded-sm border-2 border-gold-600/30">
            <p className="font-title text-xl text-center text-ink-800 italic">
              Parar de sangrar → Estabilizar → Reconstruir → Crescer
            </p>
          </div>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Não é sobre cortar tudo. É sobre <Rubric>eliminar contratos ruins</Rubric> e <Rubric>proteger contratos essenciais</Rubric>.
          </p>
        </div>

        <h4 className="font-headline text-lg font-bold text-ink-800 mb-4 mt-8">
          🔄 As 4 Fases do Turnaround Pessoal
        </h4>
        <MedievalTable
          headers={['Fase', 'Objetivo', 'Duração Típica']}
          rows={[
            ['🔒 1. Contenção', 'Parar a sangria imediata', '0-30 dias'],
            ['⚓ 2. Estabilização', 'Criar previsibilidade básica', '30-90 dias'],
            ['🏰 3. Reconstrução', 'Eliminar passivos tóxicos', '90-180 dias'],
            ['👑 4. Crescimento', 'Investir com governança', '180+ dias'],
          ]}
        />

        <ScrollableQuote
          quote="Porque qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas, para ver se tem com que a acabar?"
          source="Lucas 14:28"
          explanation="Jesus não está falando de economia doméstica. Ele está ensinando gestão de risco. A 'torre' é qualquer projeto de vida (casa, família, negócio, patrimônio). 'Assentar-se primeiro' é a fase de contenção e planejamento. 'Calcular as despesas' é o mapeamento de contratos e passivos. 'Ver se tem com que acabar' é a análise de capacidade de pagamento. O princípio é brutal: iniciar sem cálculo é arrogância; calcular antes é sabedoria."
          type="biblical"
        />
      </div>
    </MedievalCard>

    {/* Continue com o restante das seções... */}
  </section>
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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-900/95 backdrop-blur-md border-b-2 border-gold-600/30 shadow-2xl">
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
                    className={`px-3 py-2 rounded-sm font-headline text-xs tracking-wide transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gold-500/20 text-gold-400 border-2 border-gold-600/30 shadow-lg'
                        : 'text-parchment-300/70 hover:text-gold-400 hover:bg-gold-500/10'
                    }`}
                  >
                    {section.shortTitle}
                  </button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gold-500 hover:text-gold-400 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <div className="lg:hidden bg-ink-900 border-t-2 border-gold-600/30">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavClick(section.id)}
                  className="w-full px-4 py-3 text-left font-headline text-sm text-parchment-300/70 hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-300 flex items-center gap-3 border-b border-gold-600/10"
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
          className={`hidden xl:flex fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex-col bg-ink-900/95 backdrop-blur-md border-r-2 border-gold-600/30 transition-all duration-300 shadow-2xl ${
            isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b-2 border-gold-600/20">
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
              className="text-gold-500 hover:text-gold-400 transition-colors p-2"
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
                <section.icon className="w-5 h-5 flex-shrink-0" />
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
            <div className="p-4 border-t-2 border-gold-600/20">
              <div className="p-3 bg-gradient-to-br from-vermillion-700/20 to-gold-500/10 rounded-sm border-2 border-gold-600/30">
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
            <FundamentosSection />
            <MetodoSection />
            {/* Adicione as outras seções aqui */}
          </div>
        </main>

        {/* Footer */}
        <footer
          className={`relative z-10 border-t-2 border-gold-600/30 bg-ink-900/95 py-12 transition-all duration-300 ${
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
            <div className="mt-8 pt-6 border-t-2 border-gold-600/20">
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