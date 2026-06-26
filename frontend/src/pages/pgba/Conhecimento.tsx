import React, { useState, useEffect, useRef } from 'react';
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
  Swords,
  Hourglass,
  Scale,
  Castle,
  Sparkles,
  Eye,
  Lock,
  Unlock,
  FileText,
  ArrowRight,
  ArrowLeft,
  Home,
  Layers,
  CircleDot,
} from 'lucide-react';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

interface Section {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  part?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  type: 'biblical' | 'mythological' | 'neuroscience';
  reference?: string;
  explanation?: string;
}

interface ContractType {
  title: string;
  icon: React.ElementType;
  color: string;
  characteristics: string[];
  examples: string[];
  rule: string;
  ruleType: 'positive' | 'negative' | 'warning';
}

interface PhaseItem {
  phase: string;
  objective: string;
  duration: string;
  icon: React.ElementType;
}

// ============================================================
// COMPONENTES AUXILIARES DO DESIGN SYSTEM
// ============================================================

/** Pergaminho com textura medieval */
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

/** Selo de cera com animação */
const WaxSeal: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div
      className={`wax-seal ${sizeClasses[size]} ${className}`}
    >
      {children}
    </div>
  );
};

/** Letra capitular decorativa */
const DropCap: React.FC<{ letter: string; children: React.ReactNode }> = ({
  letter,
  children,
}) => (
  <p className="drop-cap text-lg leading-relaxed text-justify">
    {letter}
    {children}
  </p>
);

/** Divisor sagrado com ornamento */
const SacredDivider: React.FC<{ icon?: React.ElementType }> = ({
  icon: Icon = Sparkles,
}) => (
  <div className="sacred-divider">
    <Icon className="divider-icon" />
  </div>
);

/** Citação medieval com borda lateral */
const QuoteMedieval: React.FC<{
  quote: string;
  source: string;
}> = ({ quote, source }) => (
  <div className="quote-medieval">
    <p className="font-title text-xl italic text-ink-700 leading-relaxed">
      "{quote}"
    </p>
    <span className="quote-source">— {source}</span>
  </div>
);

/** Referência bíblica */
const BiblicalReference: React.FC<{
  quote: string;
  reference: string;
  explanation: string;
}> = ({ quote, reference, explanation }) => (
  <div className="principle-card my-6 bg-vermillion-50/30">
    <div className="flex items-center gap-2 mb-3">
      <BookOpen className="w-5 h-5 text-vermillion-700" />
      <h4 className="font-headline text-sm font-bold text-vermillion-700 uppercase tracking-wide">
        Referência Bíblica
      </h4>
    </div>
    <blockquote className="font-title text-lg italic text-ink-800 mb-2">
      "{quote}"
    </blockquote>
    <p className="font-headline text-xs text-vermillion-700 mb-3">
      — {reference}
    </p>
    <p className="font-body text-sm text-ink-600 leading-relaxed">
      <strong className="text-vermillion-700">Explicação:</strong> {explanation}
    </p>
  </div>
);

/** Referência mitológica */
const MythologicalReference: React.FC<{
  title: string;
  description: string;
  explanation: string;
}> = ({ title, description, explanation }) => (
  <div className="principle-card my-6 bg-gold-50/30">
    <div className="flex items-center gap-2 mb-3">
      <Scroll className="w-5 h-5 text-gold-700" />
      <h4 className="font-headline text-sm font-bold text-gold-700 uppercase tracking-wide">
        Referência Mitológica
      </h4>
    </div>
    <h5 className="font-headline text-lg font-bold text-ink-800 mb-2">
      {title}
    </h5>
    <p className="font-body text-ink-600 mb-3">{description}</p>
    <p className="font-body text-sm text-ink-600 leading-relaxed italic">
      <strong className="text-gold-700 not-italic">Significado:</strong>{' '}
      {explanation}
    </p>
  </div>
);

/** Card de princípio */
const PrincipleCard: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`principle-card ${className}`}>
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-sm bg-gold-100 border border-gold-600/30 flex items-center justify-center flex-shrink-0">
        <Icon className="card-icon w-7 h-7 text-gold-700" />
      </div>
      <div className="flex-1">
        <h3 className="font-headline text-xl font-bold text-ink-800 mb-3">
          {title}
        </h3>
        {children}
      </div>
    </div>
  </div>
);

/** Badge de status */
const Badge: React.FC<{
  type: 'essential' | 'good' | 'warning' | 'bad' | 'critical' | 'behavior';
  children: React.ReactNode;
}> = ({ type, children }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

/** Accordion de FAQ */
const FAQAccordion: React.FC<{
  item: FAQItem & { isOpen: boolean; onToggle: () => void };
}> = ({ item }) => {
  const { isOpen, onToggle } = item;

  const icons = {
    biblical: BookOpen,
    mythological: Scroll,
    neuroscience: Brain,
  };

  const Icon = icons[item.type];

  return (
    <div className="border-b border-gold-600/30 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-vermillion-700 opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="font-headline font-semibold text-ink-800 group-hover:text-vermillion-700 transition-colors">
            {item.question}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-vermillion-700" />
        ) : (
          <ChevronDown className="w-5 h-5 text-vermillion-700" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4 pl-8 space-y-4">
          <p className="font-body text-ink-800 leading-relaxed">
            {item.answer}
          </p>
          {item.reference && (
            <p className="font-headline text-xs text-vermillion-700 italic">
              {item.reference}
            </p>
          )}
          {item.explanation && (
            <p className="font-body text-sm text-ink-600">
              {item.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/** Card de contrato */
const ContractCard: React.FC<{ contract: ContractType }> = ({ contract }) => {
  const ruleColors = {
    positive: 'text-sage-700 bg-sage-50/50 border border-sage-600/30',
    negative: 'text-vermillion-800 bg-vermillion-50/50 border border-vermillion-600/30',
    warning: 'text-gold-800 bg-gold-50/50 border border-gold-600/30',
  };

  const ruleIcons = {
    positive: CheckCircle,
    negative: XCircle,
    warning: AlertCircle,
  };

  const RuleIcon = ruleIcons[contract.ruleType];

  return (
    <ParchmentCard className="mb-6">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-3 rounded-sm"
          style={{ backgroundColor: `${contract.color}20` }}
        >
          <contract.icon className="w-8 h-8" style={{ color: contract.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-xl font-bold text-ink-800 mb-2">
            {contract.title}
          </h3>
          <ul className="space-y-2 mb-4">
            {contract.characteristics.map((char, idx) => (
              <li key={idx} className="flex items-start gap-2 text-ink-600">
                <span className="text-gold-600 mt-1">•</span>
                <span className="font-body">{char}</span>
              </li>
            ))}
          </ul>
          <div className="mb-3">
            <h4 className="font-headline text-sm font-bold text-vermillion-700 mb-2">
              Exemplos:
            </h4>
            <div className="flex flex-wrap gap-2">
              {contract.examples.map((ex, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gold-100/50 rounded-full text-xs font-body text-ink-700 border border-gold-600/20"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
          <div
            className={`flex items-center gap-2 p-3 rounded-sm ${
              ruleColors[contract.ruleType]
            }`}
          >
            <RuleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="font-body text-sm font-semibold">{contract.rule}</p>
          </div>
        </div>
      </div>
    </ParchmentCard>
  );
};

/** Rubric (letra vermelha destacada) */
const Rubric: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rubric">{children}</span>
);

/** Texto iluminado (dourado) */
const IlluminatedText: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span className={`illuminated-text ${className}`}>{children}</span>
);

// ============================================================
// SEÇÕES DO MANUAL
// ============================================================

/** Hero Section */
const HeroSection: React.FC = () => (
  <section className="relative pt-32 pb-20 px-4 overflow-hidden">
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

/** Introdução */
const IntroSection: React.FC = () => (
  <section id="introducao" className="scroll-mt-20">
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
      <QuoteMedieval
        quote="O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
        source="Mateus 7:24"
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

/** Parte 1 — Fundamentos */
const FundamentosSection: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Por que o ser humano busca dopamina?',
      answer:
        'Porque o cérebro humano foi projetado para buscar recompensa, não para planejar longo prazo. A dopamina não é o neurotransmissor do prazer. É o neurotransmissor da expectativa.',
      type: 'neuroscience',
      explanation:
        'Quando o cérebro antecipa uma recompensa, ele libera dopamina, foca na busca e ignora consequências futuras. Hoje, a recompensa é notificação, like, ganho rápido, compra impulsiva, trade, vídeo curto. E o ciclo é instantâneo.',
    },
    {
      question: 'Por que pessoas inteligentes sofrem mais com impulsividade?',
      answer:
        'Porque usam intensamente o córtex pré-frontal (planejamento, análise, controle), que consome muita energia mental. Quando esse sistema cansa, o cérebro busca recompensa rápida.',
      type: 'neuroscience',
      explanation:
        'Isso não é fraqueza. É sobrecarga cognitiva. Quanto mais o pré-frontal trabalha, mais o límbico pede alívio.',
    },
    {
      question: 'Por que a rotina acalma o cérebro?',
      answer:
        'Porque previsibilidade reduz incerteza, e incerteza é o maior gatilho de ansiedade. O cérebro odeia o desconhecido.',
      type: 'neuroscience',
      explanation:
        'Quando você estabelece horário fixo, tarefa clara, regra definida e plano visível, o sistema de alerta diminui. A dopamina se estabiliza. A impulsividade cai.',
    },
  ];

  return (
    <section id="fundamentos" className="scroll-mt-20">
      <div className="text-center mb-12">
        <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
          PARTE I
        </p>
        <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
          FUNDAMENTOS
        </h2>
        <p className="font-title text-xl text-gold-500 italic">
          O Ser Humano e o Estímulo
        </p>
        <SacredDivider icon={Brain} />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <ParchmentCard>
          <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
            1.1 A Busca por Dopamina
          </h3>
          <BiblicalReference
            quote="Tudo me é permitido, mas nem tudo convém. Tudo me é permitido, mas eu não me deixarei dominar por nada."
            reference="1 Coríntios 6:12"
            explanation="Paulo ensina governança pessoal. A liberdade absoluta sem governança vira escravidão química. Autonomia sem disciplina é dependência disfarçada."
          />
          <MythologicalReference
            title="Sísifo"
            description="Condenado a empurrar uma pedra montanha acima para sempre, representa o ciclo de esforço sem conclusão."
            explanation="Muitas pessoas vivem o ciclo de Sísifo financeiro: ganham → gastam → se endividam → tentam recuperar → repetem. Esforço sem sistema é apenas movimento."
          />
        </ParchmentCard>

        <ParchmentCard>
          <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
            1.2 Inteligência e Impulsividade
          </h3>
          <BiblicalReference
            quote="Melhor é o longânimo do que o herói da guerra, e o que domina o seu espírito do que o que toma uma cidade."
            reference="Provérbios 16:32"
            explanation="Salomão reconheceu que a conquista externa é mais fácil que a conquista interna. Inteligência sem autodomínio é vulnerabilidade disfarçada."
          />
          <MythologicalReference
            title="Ulisses e as Sereias"
            description="Ulisses sabia que o canto das sereias era irresistível. Ele ordenou que os marinheiros o amarrassem ao mastro."
            explanation="Esta é a gestão de impulso por design, não por força de vontade. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
          />
        </ParchmentCard>

        <ParchmentCard className="md:col-span-2">
          <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
            1.3 O Poder da Rotina
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <BiblicalReference
                quote="Façam tudo com decência e ordem."
                reference="1 Coríntios 14:40"
                explanation="Paulo ensina que ordem é pré-requisito para paz. A palavra grega 'taxis' significa organização militar. Decência e ordem são ferramentas de sobrevivência neural."
              />
            </div>
            <div>
              <MythologicalReference
                title="Héstia"
                description="Deusa do lar e da ordem, representa o poder do ambiente estruturado. Ela representava o centro, a estabilidade, o fogo que nunca se apagava."
                explanation="Héstia é a rotina inegociável: o treino na mesma hora, o estudo no mesmo horário, a revisão financeira semanal. Ordem não é rigidez; é proteção neural."
              />
            </div>
          </div>
        </ParchmentCard>
      </div>

      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
          Perguntas Fundamentais
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <FAQAccordion
              key={idx}
              item={{
                ...faq,
                isOpen: openFAQ === idx,
                onToggle: () => setOpenFAQ(openFAQ === idx ? null : idx),
              }}
            />
          ))}
        </div>
      </ParchmentCard>
    </section>
  );
};

/** Parte 2 — O Método */
const MetodoSection: React.FC = () => {
  const contracts: ContractType[] = [
    {
      title: 'CONTRATO ESSENCIAL',
      icon: Shield,
      color: '#415841',
      characteristics: [
        'Mantém a vida funcionando',
        'É previsível e inevitável',
        'Não carrega juros abusivos',
      ],
      examples: [
        'Moradia',
        'Alimentação básica',
        'Saúde',
        'Educação dos filhos',
        'Transporte para trabalho',
      ],
      rule: 'Não se corta. Se renegocia.',
      ruleType: 'positive',
    },
    {
      title: 'CONTRATO RUIM',
      icon: AlertCircle,
      color: '#aa2424',
      characteristics: [
        'Juros altos ou embutidos',
        'Consumo emocional ou impulsivo',
        'Prazo indefinido ou muito longo',
        'Não gera retorno',
      ],
      examples: [
        'Rotativo de cartão',
        'Cheque especial',
        'Parcelamento de lazer',
        'Assinaturas não usadas',
      ],
      rule: 'Eliminar prioritariamente.',
      ruleType: 'negative',
    },
    {
      title: 'CUSTO DE COMPORTAMENTO',
      icon: Brain,
      color: '#92700c',
      characteristics: [
        'Despesa evitável causada por impulso, dopamina ou estresse',
        'Não sustenta a operação',
        'Gera arrependimento ou tentativa de "recuperar"',
      ],
      examples: [
        'Trade emocional',
        'Apostas',
        'Compras por ansiedade',
        'Juros por atraso evitável',
      ],
      rule: 'Nunca mascarar como despesa normal. Registrar separadamente.',
      ruleType: 'warning',
    },
  ];

  const fases: PhaseItem[] = [
    {
      phase: '1. Contenção',
      objective: 'Parar a sangria imediata',
      duration: '0-30 dias',
      icon: Lock,
    },
    {
      phase: '2. Estabilização',
      objective: 'Criar previsibilidade básica',
      duration: '30-90 dias',
      icon: Anchor,
    },
    {
      phase: '3. Reconstrução',
      objective: 'Eliminar passivos tóxicos',
      duration: '90-180 dias',
      icon: Castle,
    },
    {
      phase: '4. Crescimento',
      objective: 'Investir com governança',
      duration: '180+ dias',
      icon: Crown,
    },
  ];

  return (
    <section id="metodo" className="scroll-mt-20">
      <div className="text-center mb-12">
        <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
          PARTE II
        </p>
        <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
          O MÉTODO
        </h2>
        <p className="font-title text-xl text-gold-500 italic">
          Turnaround Pessoal
        </p>
        <SacredDivider icon={Target} />
      </div>

      <ParchmentCard className="mb-12">
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
          O que é Turnaround Pessoal?
        </h3>
        <div className="text-center mb-8">
          <p className="font-title text-xl text-ink-800 italic">
            Parar de sangrar → Estabilizar → Reconstruir → Crescer
          </p>
          <p className="font-body text-lg text-ink-600 mt-4">
            Não é sobre cortar tudo. É sobre{' '}
            <Rubric>eliminar contratos ruins</Rubric> e{' '}
            <Rubric>proteger contratos essenciais</Rubric>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {fases.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gold-100/30 rounded-sm border border-gold-600/30 text-center"
            >
              <item.icon className="w-8 h-8 text-vermillion-700 mx-auto mb-2" />
              <h4 className="font-headline font-bold text-ink-800 mb-1">
                {item.phase}
              </h4>
              <p className="font-body text-sm text-ink-600 mb-2">
                {item.objective}
              </p>
              <p className="font-headline text-xs text-gold-700 tracking-wide">
                {item.duration}
              </p>
            </div>
          ))}
        </div>

        <BiblicalReference
          quote="Porque qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas, para ver se tem com que a acabar?"
          reference="Lucas 14:28"
          explanation="Jesus ensina gestão de risco. Iniciar sem cálculo é arrogância; calcular antes é sabedoria. Antes de pensar em crescimento, calcule quanto custa sobreviver."
        />
      </ParchmentCard>

      <div>
        <h3 className="font-display text-2xl font-bold text-parchment-200 mb-6 text-center">
          Classificação de Contratos: O Coração do Método
        </h3>
        {contracts.map((contract, idx) => (
          <ContractCard key={idx} contract={contract} />
        ))}
      </div>

      <ParchmentCard className="mt-12">
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
          A Regra de Ouro da Previsibilidade
        </h3>
        <QuoteMedieval
          quote="Os planos do diligente tendem à abundância; mas todo apressado, à pobreza."
          source="Provérbios 21:5"
        />
        <div className="mt-6 p-6 bg-vermillion-50/30 rounded-sm border border-vermillion-600/30">
          <p className="font-title text-lg text-ink-800 italic text-center">
            <strong className="text-vermillion-700">
              Previsibilidade = (Receita Conhecida) − (Despesas Mapeadas) −
              (Contratos Classificados)
            </strong>
          </p>
          <p className="font-body text-ink-600 text-center mt-4">
            Se o resultado é visível mês a mês → há controle.
            <br />
            Se é surpresa todo mês → há caos.
          </p>
        </div>
      </ParchmentCard>
    </section>
  );
};

/** Parte 3 — Comportamento */
const ComportamentoSection: React.FC = () => (
  <section id="comportamento" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE III
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        COMPORTAMENTO
      </h2>
      <p className="font-title text-xl text-gold-500 italic">
        Quebrando Ciclos
      </p>
      <SacredDivider icon={Flame} />
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
          3.1 O Ciclo Dopaminérgico Financeiro
        </h3>
        <div className="space-y-3 mb-6">
          {[
            'Estresse ou tédio → busca por estímulo',
            'Operação/decisão rápida → ganho pequeno',
            'Dopamina libera → "eu consigo!"',
            'Nova operação → risco maior',
            'Perda → frustração',
            'Tentativa de recuperar → perda maior',
            'Culpa → mais estresse → volta ao passo 1',
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 bg-parchment-200/50 rounded-sm border-l-2 border-vermillion-700"
            >
              <span className="font-headline text-sm font-bold text-vermillion-700">
                {idx + 1}.
              </span>
              <span className="font-body text-sm text-ink-800">{step}</span>
            </div>
          ))}
        </div>
        <MythologicalReference
          title="Ícaro"
          description="Voou perto demais do sol, representa o perigo da euforia após o sucesso inicial."
          explanation="O ciclo dopaminérgico é Ícaro financeiro: o primeiro ganho gera euforia, a euforia gera mais risco, o risco gera queda. Sucesso inicial sem estrutura é convite para a queda."
        />
      </ParchmentCard>

      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
          3.2 Substituição de Estímulo
        </h3>
        <p className="font-body text-lg text-ink-800 mb-6">
          Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
        </p>
        <div className="space-y-3">
          {[
            { nocivo: 'Trade / apostas', saudavel: 'Exercício físico' },
            {
              nocivo: 'Scroll infinito',
              saudavel: 'Leitura focada / estudo técnico',
            },
            {
              nocivo: 'Compras impulsivas',
              saudavel: 'Construir algo (projeto, sistema)',
            },
            {
              nocivo: 'Decisão sob ansiedade',
              saudavel: 'Registrar + esperar 24h',
            },
            {
              nocivo: 'Tela excessiva',
              saudavel: 'Música instrumental / ambiente controlado',
            },
          ].map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-parchment-200/50 rounded-sm border border-gold-600/20"
            >
              <span className="font-body text-sm text-vermillion-800 line-through">
                {sub.nocivo}
              </span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
              <span className="font-body text-sm text-sage-700 font-semibold">
                {sub.saudavel}
              </span>
            </div>
          ))}
        </div>
        <MythologicalReference
          title="Prometeu"
          description="Trouxe o fogo aos humanos, representa o poder transformador do estímulo bem direcionado."
          explanation="O fogo pode cozinhar ou queimar. O estímulo (dopamina) é o fogo moderno. Direcionado para construção, aquece e ilumina. Direcionado para destruição, queima. O problema não é a energia; é a direção."
        />
      </ParchmentCard>
    </div>

    <ParchmentCard>
      <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
        3.3 O Papel da Família
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-3">
            Protocolo de Governança Familiar
          </h4>
          <ol className="space-y-2 list-decimal list-inside">
            {[
              'Comunicação clara: "Estamos em modo de reorganização por X meses"',
              'Regras visíveis: o que pode, o que não pode, por quê',
              'Participação leve: crianças podem ter pequenas responsabilidades',
              'Exemplo antes de discurso: pais executando o plano primeiro',
              'Celebração de marcos: reconhecer progresso',
            ].map((item, idx) => (
              <li key={idx} className="font-body text-ink-800 pl-2">
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <BiblicalReference
            quote="Mas, se alguém não tem cuidado dos seus e principalmente dos da sua própria casa, negou a fé e é pior do que o infiel."
            reference="1 Timóteo 5:8"
            explanation="Governança não é opcional; é obrigação. Transparência com a família não é fraqueza; é cumprimento de responsabilidade."
          />
          <MythologicalReference
            title="Héstia"
            description="Guardiã do lar, representa a importância do ambiente doméstico como base de estabilidade."
            explanation="Héstia é a regra doméstica inegociável: horário de sono, rotina de estudo, limite de tela. O lar organizado é proteção contra o caos externo."
          />
        </div>
      </div>
    </ParchmentCard>
  </section>
);

/** Parte 4 — Sistema */
const SistemaSection: React.FC = () => (
  <section id="sistema" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE IV
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        SISTEMA
      </h2>
      <p className="font-title text-xl text-gold-500 italic">
        Construindo Previsibilidade
      </p>
      <SacredDivider icon={Settings} />
    </div>

    <ParchmentCard className="mb-12">
      <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
        4.1 O Modelo de ERP Pessoal
      </h3>
      <p className="font-body text-lg text-ink-800 mb-6 italic">
        Trate sua vida como uma{' '}
        <Rubric>microempresa com um único cliente: você mesmo</Rubric>.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            title: 'Módulo 1: Receitas',
            items: [
              'Fixas (salário, renda recorrente)',
              'Variáveis previsíveis (13º, férias)',
              'Extraordinárias (não contar como base)',
            ],
          },
          {
            title: 'Módulo 2: Contratos',
            items: ['Essenciais', 'Financeiros', 'Ruins (a eliminar)'],
          },
          {
            title: 'Módulo 3: Fluxo de Caixa',
            items: [
              'Projeção mensal',
              'Projeção trimestral',
              'Alertas de risco',
            ],
          },
          {
            title: 'Módulo 4: Comportamento',
            items: [
              'Registro de custos',
              'Gatilhos identificados',
              'Substituições aplicadas',
            ],
          },
          {
            title: 'Módulo 5: Metas',
            items: [
              'Curto prazo (30 dias)',
              'Médio prazo (90 dias)',
              'Longo prazo (180+ dias)',
            ],
          },
        ].map((mod, idx) => (
          <div
            key={idx}
            className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/30"
          >
            <h4 className="font-headline font-bold text-vermillion-700 mb-2">
              {mod.title}
            </h4>
            <ul className="space-y-1">
              {mod.items.map((item, i) => (
                <li key={i} className="font-body text-sm text-ink-600">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <MythologicalReference
        title="Hefesto"
        description="O ferreiro divino, representa o poder de construir sistemas que duram. Ele construía armas, ferramentas, redes e autômatos."
        explanation="O ERP pessoal é a 'forja' moderna. Sistemas bem feitos libertam; sistemas mal feitos aprisionam. O ERP é sobre automatizar decisões para focar no que importa."
      />
    </ParchmentCard>

    <ParchmentCard>
      <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
        4.2 A Regra dos 90 Dias
      </h3>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          {
            periodo: 'Dias 1-30',
            foco: 'Contenção',
            indicador: 'Nenhuma nova dívida criada',
            icon: Lock,
          },
          {
            periodo: 'Dias 31-60',
            foco: 'Estabilização',
            indicador: 'Fluxo de caixa projetado',
            icon: Anchor,
          },
          {
            periodo: 'Dias 61-90',
            foco: 'Reconstrução',
            indicador: 'Primeiro contrato ruim eliminado',
            icon: Unlock,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-gradient-to-br from-vermillion-700/10 to-gold-500/10 rounded-sm border border-gold-600/30 text-center"
          >
            <item.icon className="w-10 h-10 text-vermillion-700 mx-auto mb-3" />
            <h4 className="font-headline font-bold text-vermillion-700 mb-2">
              {item.periodo}
            </h4>
            <p className="font-body font-semibold text-ink-800 mb-2">
              {item.foco}
            </p>
            <p className="font-body text-sm text-ink-600">{item.indicador}</p>
          </div>
        ))}
      </div>

      <BiblicalReference
        quote="Ensina-nos a contar os nossos dias, para que alcancemos coração sábio."
        reference="Salmos 90:12"
        explanation="Contar dias é consciência de finitude. 'Coração sábio' significa mente que sabe medir. Os 90 dias são um horizonte realista que impede tanto o desespero quanto a arrogância."
      />
    </ParchmentCard>
  </section>
);

/** Parte 5 — Humanidade */
const HumanidadeSection: React.FC = () => (
  <section id="humanidade" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE V
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        HUMANIDADE
      </h2>
      <p className="font-title text-xl text-gold-500 italic">
        Além do Financeiro
      </p>
      <SacredDivider icon={Heart} />
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
          5.1 O Ser Humano Como Sistema
        </h3>
        <p className="font-body text-lg text-ink-800 mb-4">
          Sistemas são previsíveis; vontades são voláteis.
        </p>
        <div className="space-y-2 mb-6">
          {[
            { pilar: 'Corpo', desc: 'físico, energia, saúde' },
            { pilar: 'Mente', desc: 'pensamento, análise, planejamento' },
            { pilar: 'Emoção', desc: 'sentimento, impulso, conexão' },
            { pilar: 'Espírito', desc: 'propósito, valores, legado' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 bg-parchment-200/50 rounded-sm border-l-2 border-vermillion-700"
            >
              <div className="w-2 h-2 rounded-full bg-vermillion-700" />
              <span className="font-headline font-bold text-vermillion-700">
                {item.pilar}
              </span>
              <span className="font-body text-sm text-ink-600">
                {item.desc}
              </span>
            </div>
          ))}
        </div>
        <MythologicalReference
          title="Atlas"
          description="Carrega o mundo nos ombros, representa a responsabilidade de manter o sistema em equilíbrio."
          explanation="Quando você negligencia um pilar, os outros compensam até exaurir. Equilíbrio não é passividade; é carga ativa."
        />
      </ParchmentCard>

      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-4">
          5.2 Influência e Padrão
        </h3>
        <p className="font-body text-lg text-ink-800 mb-4">
          Seres humanos aprendem por <Rubric>observação</Rubric>, não por
          discurso.
        </p>
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-vermillion-50/50 rounded-sm border-l-4 border-vermillion-700">
            <p className="font-body text-sm text-ink-800">
              Se você fala de disciplina mas age por impulso, o sistema inteiro
              desconfia.
            </p>
          </div>
          <div className="p-3 bg-sage-50/50 rounded-sm border-l-4 border-sage-600">
            <p className="font-body text-sm text-ink-800">
              Se você executa antes de explicar e mantém regra mesmo quando
              ninguém vê, o ambiente muda sozinho.
            </p>
          </div>
        </div>
        <MythologicalReference
          title="Orfeu"
          description="Cuja música acalmava até feras, representa o poder do exemplo harmonioso."
          explanation="Quando você executa o plano com consistência, emite uma 'música' de coerência que acalma o ambiente. Quem vive em ritmo atrai quem quer dançar."
        />
      </ParchmentCard>
    </div>

    <ParchmentCard>
      <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
        5.7 O Ciclo da Transformação
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {[
          'Método',
          'Comportamento',
          'Padrão',
          'Previsibilidade',
          'Influência',
        ].map((item, idx, arr) => (
          <React.Fragment key={idx}>
            <div className="px-5 py-3 bg-gradient-to-br from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline font-bold rounded-sm shadow-md">
              {item}
            </div>
            {idx < arr.length - 1 && (
              <ArrowRight className="w-6 h-6 text-gold-500" />
            )}
          </React.Fragment>
        ))}
      </div>
      <MythologicalReference
        title="Hermes"
        description="Mensageiro dos deuses, representa a ponte entre método e influência."
        explanation="Hermes é a comunicação do padrão. Previsibilidade só vira influência quando é comunicada com clareza. O método vira linguagem compartilhada."
      />
    </ParchmentCard>
  </section>
);

/** Conclusão */
const ConclusionSection: React.FC = () => (
  <section id="conclusao" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        EPÍLOGO
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        CONCLUSÃO
      </h2>
      <p className="font-title text-xl text-gold-500 italic">
        O Caminho da Liberdade com Governança
      </p>
      <SacredDivider icon={Crown} />
    </div>

    <ParchmentCard className="max-w-4xl mx-auto mb-12">
      <div className="text-center mb-8">
        <Quote className="w-12 h-12 text-vermillion-700 mx-auto mb-4" />
        <p className="font-title text-2xl italic text-ink-800 mb-4">
          "A verdade vos libertará."
        </p>
        <p className="font-headline text-sm text-vermillion-700">
          — João 8:32
        </p>
      </div>

      <p className="font-body text-lg text-ink-800 mb-6">
        Mas a verdade só liberta quem a <Rubric>encara</Rubric>,{' '}
        <Rubric>organiza</Rubric> e <Rubric>age</Rubric>.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-vermillion-50/50 rounded-sm border border-vermillion-600/30">
          <h4 className="font-headline font-bold text-vermillion-800 mb-2">
            Este manual NÃO promete:
          </h4>
          <ul className="space-y-1">
            {[
              'Enriquecimento rápido',
              'Vida sem esforço',
              'Felicidade constante',
            ].map((item, idx) => (
              <li key={idx} className="font-body text-sm text-ink-600">
                ✕ {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-sage-50/50 rounded-sm border border-sage-600/30">
          <h4 className="font-headline font-bold text-sage-700 mb-2">
            Promete apenas:
          </h4>
          <ul className="space-y-1">
            {[
              'Clareza sobre o que está acontecendo',
              'Método para sair do caos',
              'Disciplina para não voltar',
              'Dignidade para reconstruir',
            ].map((item, idx) => (
              <li key={idx} className="font-body text-sm text-ink-600">
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center p-6 bg-gold-100/30 rounded-sm border border-gold-600/30">
        <p className="font-title text-xl text-ink-800 italic">
          <strong className="text-vermillion-700">
            O sistema cria o caos para vender conforto.
          </strong>
          <br />
          <strong className="text-vermillion-700">
            O método conforta porque devolve o controle.
          </strong>
        </p>
      </div>
    </ParchmentCard>

    <ParchmentCard>
      <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 text-center">
        Resumo Executivo do Método
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
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
          'Celebre marcos, não apenas resultados finais',
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm border border-gold-600/20"
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-vermillion-700 to-vermillion-800 text-parchment-100 flex items-center justify-center font-headline text-xs font-bold">
              {idx + 1}
            </span>
            <span className="font-body text-sm text-ink-800">{item}</span>
          </div>
        ))}
      </div>
    </ParchmentCard>

    <div className="mt-12 text-center">
      <div className="inline-block p-8 parchment-surface rounded-sm shadow-2xl">
        <p className="font-title text-xl text-ink-800 mb-4 italic">
          "Não é sobre ter mais.
          <br />
          É sobre ser livre.
          <br />
          E liberdade vem de previsibilidade,
          <br />
          não de sorte."
        </p>
        <div className="flex justify-center mt-6">
          <WaxSeal size="md">
            <Compass className="w-8 h-8 text-parchment-100" />
          </WaxSeal>
        </div>
      </div>
    </div>
  </section>
);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const ManualTurnaround: React.FC = () => {
  const [activeSection, setActiveSection] = useState('introducao');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sections: Section[] = [
    {
      id: 'introducao',
      title: 'Introdução',
      shortTitle: 'Prólogo',
      icon: BookOpen,
    },
    {
      id: 'fundamentos',
      title: 'Fundamentos',
      shortTitle: 'Parte I',
      icon: Brain,
      part: 'PARTE I',
    },
    {
      id: 'metodo',
      title: 'O Método',
      shortTitle: 'Parte II',
      icon: Target,
      part: 'PARTE II',
    },
    {
      id: 'comportamento',
      title: 'Comportamento',
      shortTitle: 'Parte III',
      icon: Heart,
      part: 'PARTE III',
    },
    {
      id: 'sistema',
      title: 'Sistema',
      shortTitle: 'Parte IV',
      icon: Settings,
      part: 'PARTE IV',
    },
    {
      id: 'humanidade',
      title: 'Humanidade',
      shortTitle: 'Parte V',
      icon: Users,
      part: 'PARTE V',
    },
    {
      id: 'conclusao',
      title: 'Conclusão',
      shortTitle: 'Epílogo',
      icon: Crown,
    },
  ];

  // Observador de scroll para destacar seção ativa
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

      {/* ===== NAVIGATION BAR ===== */}
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

      {/* ===== SIDEBAR ===== */}
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

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`relative z-10 pt-16 transition-all duration-300 ${
          isSidebarCollapsed
            ? 'xl:ml-20'
            : 'xl:ml-72'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 pb-20 space-y-20">
          <HeroSection />
          <IntroSection />
          <FundamentosSection />
          <MetodoSection />
          <ComportamentoSection />
          <SistemaSection />
          <HumanidadeSection />
          <ConclusionSection />
        </div>
      </main>

      {/* ===== FOOTER ===== */}
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
  );
};

export default ManualTurnaround;