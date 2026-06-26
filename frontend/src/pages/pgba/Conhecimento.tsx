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
  Key,
  Feather,
  Eye,
  Lamp
} from 'lucide-react';

// Design System Colors
const colors = {
  parchment: '#F5EBD0',
  parchmentDark: '#E8DCC4',
  ink: '#2B1D0E',
  inkLight: '#5C4A3A',
  sealRed: '#8B2635',
  sealRedDark: '#6B1E2A',
  gold: '#C9A961',
  goldLight: '#D4BC7A',
  brownDark: '#3D2B1F',
  brown: '#5C4033',
  antiqueSand: '#E5D4B0',
  darkBrown: '#4A3520',
  softBlack: '#1E1A16'
};

// TypeScript Interfaces
interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
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

// Components
const ParchmentCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div 
    className={`relative bg-gradient-to-br from-[#F5EBD0] via-[#E8DCC4] to-[#D4C4A8] 
    border-2 border-[#C9A961] shadow-[0_0_30px_rgba(139,115,85,0.3),inset_0_0_60px_rgba(139,115,85,0.1)]
    rounded-lg p-6 ${className}`}
    style={{
      backgroundImage: `url('https://www.transparenttextures.com/patterns/aged-paper.png')`,
      backgroundBlendMode: 'multiply'
    }}
  >
    {children}
  </div>
);

const WaxSeal: React.FC<{ children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#C9455A] to-[#8B2635]
      shadow-[2px_2px_8px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.2),inset_2px_2px_6px_rgba(0,0,0,0.3)]
      flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-6
      cursor-pointer`}
    >
      {children}
    </div>
  );
};

const DropCap: React.FC<{ letter: string; children: React.ReactNode }> = ({ letter, children }) => (
  <p className="text-lg leading-relaxed text-justify">
    <span 
      className="float-left font-cinzel text-6xl font-black text-[#8B2635] mr-3 mt-[-10px] 
      leading-none drop-shadow-[2px_2px_4px_rgba(0,0,0,0.2)]"
    >
      {letter}
    </span>
    {children}
  </p>
);

const SacredDivider: React.FC = () => (
  <div className="flex items-center justify-center my-8 text-[#C9A961] text-2xl tracking-[0.5em]">
    <span>✦</span>
    <span className="mx-4">─────</span>
    <span>❖</span>
    <span className="mx-4">─────</span>
    <span>✦</span>
  </div>
);

const BiblicalReference: React.FC<{ quote: string; reference: string; explanation: string }> = ({ 
  quote, 
  reference, 
  explanation 
}) => (
  <div className="bg-[#8B2635]/5 border-l-4 border-[#8B2635] p-6 rounded-r-lg my-6">
    <div className="flex items-center gap-2 mb-3">
      <BookOpen className="w-5 h-5 text-[#8B2635]" />
      <h4 className="font-cinzel text-sm font-bold text-[#8B2635] uppercase tracking-wide">
        Referência Bíblica
      </h4>
    </div>
    <blockquote className="font-garamond text-lg italic text-[#2B1D0E] mb-2">
      "{quote}"
    </blockquote>
    <p className="font-cinzel text-xs text-[#8B2635] mb-3">— {reference}</p>
    <p className="font-garamond text-sm text-[#5C4A3A] leading-relaxed">
      <strong className="text-[#8B2635]">Explicação:</strong> {explanation}
    </p>
  </div>
);

const MythologicalReference: React.FC<{ title: string; description: string; explanation: string }> = ({ 
  title, 
  description, 
  explanation 
}) => (
  <div className="bg-[#5C4033]/5 border border-[#C9A961]/30 rounded-lg p-6 my-6">
    <div className="flex items-center gap-2 mb-3">
      <Scroll className="w-5 h-5 text-[#8B2635]" />
      <h4 className="font-cinzel text-sm font-bold text-[#8B2635] uppercase tracking-wide">
        Referência Mitológica
      </h4>
    </div>
    <h5 className="font-cinzel text-lg font-bold text-[#3D2B1F] mb-2">{title}</h5>
    <p className="font-garamond text-[#5C4A3A] mb-3">{description}</p>
    <p className="font-garamond text-sm text-[#5C4A3A] leading-relaxed italic">
      <strong className="text-[#8B2635] not-italic">Significado:</strong> {explanation}
    </p>
  </div>
);

const FAQAccordion: React.FC<{ item: FAQItem & { isOpen: boolean; onToggle: () => void } }> = ({ 
  item
}) => {
  const { isOpen, onToggle } = item;
  
  const icons = {
    biblical: BookOpen,
    mythological: Scroll,
    neuroscience: Brain
  };

  const Icon = icons[item.type];

  return (
    <div className="border-b border-[#C9A961]/30 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#8B2635] opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="font-cinzel font-semibold text-[#2B1D0E] group-hover:text-[#8B2635] transition-colors">
            {item.question}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[#8B2635]" /> : <ChevronDown className="w-5 h-5 text-[#8B2635]" />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-4 pl-8 space-y-4">
          <p className="font-garamond text-[#2B1D0E] leading-relaxed">{item.answer}</p>
          {item.reference && (
            <p className="font-cinzel text-xs text-[#8B2635] italic">{item.reference}</p>
          )}
          {item.explanation && (
            <p className="font-garamond text-sm text-[#5C4A3A]">{item.explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ContractCard: React.FC<{ contract: ContractType }> = ({ contract }) => {
  const ruleColors = {
    positive: 'text-green-700 bg-green-50',
    negative: 'text-red-700 bg-red-50',
    warning: 'text-amber-700 bg-amber-50'
  };

  const ruleIcons = {
    positive: CheckCircle,
    negative: XCircle,
    warning: AlertCircle
  };

  const RuleIcon = ruleIcons[contract.ruleType];

  return (
    <ParchmentCard className="mb-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-[${contract.color}]/20`}>
          <contract.icon className="w-8 h-8" style={{ color: contract.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-cinzel text-xl font-bold text-[#2B1D0E] mb-2">{contract.title}</h3>
          <ul className="space-y-2 mb-4">
            {contract.characteristics.map((char, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[#5C4A3A]">
                <span className="text-[#C9A961] mt-1">•</span>
                <span className="font-garamond">{char}</span>
              </li>
            ))}
          </ul>
          <div className="mb-3">
            <h4 className="font-cinzel text-sm font-bold text-[#8B2635] mb-2">Exemplos:</h4>
            <div className="flex flex-wrap gap-2">
              {contract.examples.map((ex, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-[#C9A961]/20 rounded-full text-xs font-garamond text-[#3D2B1F]"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-lg ${ruleColors[contract.ruleType]}`}>
            <RuleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="font-garamond text-sm font-semibold">{contract.rule}</p>
          </div>
        </div>
      </div>
    </ParchmentCard>
  );
};

// Main Landing Page Component
const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections: Section[] = [
    { id: 'intro', title: 'Introdução', icon: BookOpen, content: <IntroSection /> },
    { id: 'fundamentos', title: 'Fundamentos', icon: Brain, content: <FundamentosSection /> },
    { id: 'metodo', title: 'O Método', icon: Target, content: <MetodoSection /> },
    { id: 'comportamento', title: 'Comportamento', icon: Heart, content: <ComportamentoSection /> },
    { id: 'sistema', title: 'Sistema', icon: Settings, content: <SistemaSection /> },
    { id: 'humanidade', title: 'Humanidade', icon: Users, content: <HumanidadeSection /> },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-x-hidden" 
         style={{ 
           backgroundImage: `radial-gradient(#2a2a2a 1px, transparent 1px)`,
           backgroundSize: '20px 20px'
         }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2B1D0E]/95 backdrop-blur-md border-b border-[#C9A961]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <WaxSeal size="sm">
                <Compass className="w-5 h-5 text-white" />
              </WaxSeal>
              <div>
                <h1 className="font-cinzel text-lg font-bold text-[#C9A961]">CODEX PHILOSOPHIA</h1>
                <p className="text-xs text-[#C9A961]/70 tracking-widest">TURNAROUND HUMANO</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-lg font-cinzel text-sm tracking-wide transition-all
                    ${activeSection === section.id 
                      ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30' 
                      : 'text-[#C9A961]/70 hover:text-[#C9A961] hover:bg-[#C9A961]/10'}`}
                >
                  {section.title}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-[#C9A961]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#2B1D0E] border-t border-[#C9A961]/30">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsMenuOpen(false);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full px-4 py-3 text-left font-cinzel text-sm text-[#C9A961]/70 hover:text-[#C9A961] hover:bg-[#C9A961]/10 transition-colors"
              >
                {section.title}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`
          }} />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="mb-8 flex justify-center">
            <WaxSeal size="lg">
              <Shield className="w-12 h-12 text-white" />
            </WaxSeal>
          </div>
          
          <h1 className="font-cinzel text-5xl md:text-7xl font-black text-[#F5EBD0] mb-6 tracking-tight">
            MANUAL UNIVERSAL
          </h1>
          <h2 className="font-cinzel text-2xl md:text-4xl font-bold text-[#C9A961] mb-8">
            O Método de Turnaround Humano
          </h2>
          
          <SacredDivider />
          
          <p className="font-garamond text-xl md:text-2xl text-[#E8DCC4] max-w-3xl mx-auto leading-relaxed mb-12">
            Previsibilidade, Comportamento e Sistema Financeiro Baseado em Princípios Eternos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-[#8B2635] to-[#6B1E2A] text-[#F5EBD0] 
              font-cinzel font-bold tracking-widest rounded-lg shadow-lg hover:shadow-xl 
              transform hover:-translate-y-1 transition-all duration-300"
            >
              EXPLORAR O CÓDICE
            </button>
            <button 
              onClick={() => document.getElementById('metodo')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-[#C9A961] text-[#C9A961] 
              font-cinzel font-bold tracking-widest rounded-lg hover:bg-[#C9A961]/10 
              transform hover:-translate-y-1 transition-all duration-300"
            >
              O MÉTODO
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-20 space-y-20">
        <IntroSection />
        <FundamentosSection />
        <MetodoSection />
        <ComportamentoSection />
        <SistemaSection />
        <HumanidadeSection />
        <ConclusionSection />
      </main>

      {/* Footer */}
      <footer className="bg-[#2B1D0E] border-t border-[#C9A961]/30 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <WaxSeal size="md">
              <Compass className="w-8 h-8 text-white" />
            </WaxSeal>
          </div>
          <p className="font-cinzel text-[#C9A961] mb-4">
            "A verdade vos libertará." — João 8:32
          </p>
          <p className="font-garamond text-[#C9A961]/70 text-sm">
            Documento genérico para replicação educacional — Sem dados pessoais
          </p>
        </div>
      </footer>
    </div>
  );
};

// Section Components
const IntroSection: React.FC = () => (
  <section id="intro" className="scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">INTRODUÇÃO</h2>
      <SacredDivider />
    </div>

    <ParchmentCard className="max-w-4xl mx-auto">
      <div className="prose prose-lg max-w-none">
        <div className="bg-[#8B2635]/10 border-l-4 border-[#8B2635] p-6 rounded-r-lg mb-8 italic">
          <Quote className="w-8 h-8 text-[#8B2635] mb-3" />
          <p className="font-garamond text-xl text-[#2B1D0E]">
            "O sábio edifica sua casa sobre a rocha; o insensato, sobre a areia."
          </p>
          <p className="font-cinzel text-sm text-[#8B2635] mt-2">— Mateus 7:24</p>
        </div>

        <DropCap letter="E">
          ste manual não é sobre dinheiro. É sobre <strong className="text-[#8B2635]">governança pessoal</strong>.
        </DropCap>
        
        <p className="mt-4 font-garamond text-lg text-[#2B1D0E] leading-relaxed">
          Não é sobre enriquecer. É sobre <strong className="text-[#8B2635]">sobreviver com dignidade</strong>.
        </p>
        <p className="font-garamond text-lg text-[#2B1D0E] leading-relaxed">
          Não é sobre motivação. É sobre <strong className="text-[#8B2635]">método</strong>.
        </p>

        <div className="my-8 p-6 bg-[#C9A961]/10 rounded-lg border border-[#C9A961]/30">
          <p className="font-garamond text-xl text-center text-[#2B1D0E] italic">
            <strong className="text-[#8B2635]">Pessoas quebram pelo mesmo motivo que empresas:</strong> 
            <br />
            falta de previsibilidade, contratos mal estruturados e decisões sob impulso.
          </p>
        </div>

        <h3 className="font-cinzel text-xl font-bold text-[#2B1D0E] mb-4 mt-8">
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
            { icon: TrendingUp, text: 'Finanças pessoais com mentalidade corporativa' },
            { icon: Shield, text: 'Turnaround: reestruturação de crise' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-[#F5EBD0]/50 rounded-lg">
              <item.icon className="w-5 h-5 text-[#8B2635]" />
              <span className="font-garamond text-[#2B1D0E]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </ParchmentCard>
  </section>
);

const FundamentosSection: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Por que o ser humano busca dopamina?',
      answer: 'Porque o cérebro humano foi projetado para buscar recompensa, não para planejar longo prazo. A dopamina não é o neurotransmissor do prazer. É o neurotransmissor da expectativa.',
      type: 'neuroscience',
      explanation: 'Quando o cérebro antecipa uma recompensa, ele libera dopamina, foca na busca e ignora consequências futuras. Hoje, a recompensa é notificação, like, ganho rápido, compra impulsiva, trade, vídeo curto. E o ciclo é instantâneo.'
    },
    {
      question: 'Por que pessoas inteligentes sofrem mais com impulsividade?',
      answer: 'Porque usam intensamente o córtex pré-frontal (planejamento, análise, controle), que consome muita energia mental. Quando esse sistema cansa, o cérebro busca recompensa rápida.',
      type: 'neuroscience',
      explanation: 'Isso não é fraqueza. É sobrecarga cognitiva. Quanto mais o pré-frontal trabalha, mais o límbico pede alívio.'
    },
    {
      question: 'Por que a rotina acalma o cérebro?',
      answer: 'Porque previsibilidade reduz incerteza, e incerteza é o maior gatilho de ansiedade. O cérebro odeia o desconhecido.',
      type: 'neuroscience',
      explanation: 'Quando você estabelece horário fixo, tarefa clara, regra definida e plano visível, o sistema de alerta diminui. A dopamina se estabiliza. A impulsividade cai.'
    }
  ];

  return (
    <section id="fundamentos" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">PARTE 1: FUNDAMENTOS</h2>
        <p className="font-garamond text-xl text-[#C9A961]">O Ser Humano e o Estímulo</p>
        <SacredDivider />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <ParchmentCard>
          <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">1.1 A Busca por Dopamina</h3>
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
          <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">1.2 Inteligência e Impulsividade</h3>
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
          <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">1.3 O Poder da Rotina</h3>
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
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6 text-center">Perguntas Fundamentais</h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <FAQAccordion 
              key={idx} 
              item={{ ...faq, isOpen: openFAQ === idx, onToggle: () => setOpenFAQ(openFAQ === idx ? null : idx) }} 
            />
          ))}
        </div>
      </ParchmentCard>
    </section>
  );
};

const MetodoSection: React.FC = () => {
  const contracts: ContractType[] = [
    {
      title: 'CONTRATO ESSENCIAL',
      icon: Shield,
      color: '#059669',
      characteristics: [
        'Mantém a vida funcionando',
        'É previsível e inevitável',
        'Não carrega juros abusivos'
      ],
      examples: ['Moradia', 'Alimentação básica', 'Saúde', 'Educação dos filhos', 'Transporte para trabalho'],
      rule: 'Não se corta. Se renegocia.',
      ruleType: 'positive'
    },
    {
      title: 'CONTRATO RUIM',
      icon: AlertCircle,
      color: '#DC2626',
      characteristics: [
        'Juros altos ou embutidos',
        'Consumo emocional ou impulsivo',
        'Prazo indefinido ou muito longo',
        'Não gera retorno'
      ],
      examples: ['Rotativo de cartão', 'Cheque especial', 'Parcelamento de lazer', 'Assinaturas não usadas'],
      rule: 'Eliminar prioritariamente.',
      ruleType: 'negative'
    },
    {
      title: 'CUSTO DE COMPORTAMENTO',
      icon: Brain,
      color: '#D97706',
      characteristics: [
        'Despesa evitável causada por impulso, dopamina ou estresse',
        'Não sustenta a operação',
        'Gera arrependimento ou tentativa de "recuperar"'
      ],
      examples: ['Trade emocional', 'Apostas', 'Compras por ansiedade', 'Juros por atraso evitável'],
      rule: 'Nunca mascarar como despesa normal. Registrar separadamente.',
      ruleType: 'warning'
    }
  ];

  const fases = [
    { fase: '1. Contenção', objetivo: 'Parar a sangria imediata', duracao: '0-30 dias' },
    { fase: '2. Estabilização', objetivo: 'Criar previsibilidade básica', duracao: '30-90 dias' },
    { fase: '3. Reconstrução', objetivo: 'Eliminar passivos tóxicos', duracao: '90-180 dias' },
    { fase: '4. Crescimento', objetivo: 'Investir com governança', duracao: '180+ dias' }
  ];

  return (
    <section id="metodo" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">PARTE 2: O MÉTODO</h2>
        <p className="font-garamond text-xl text-[#C9A961]">Turnaround Pessoal</p>
        <SacredDivider />
      </div>

      <ParchmentCard className="mb-12">
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6 text-center">
          O que é Turnaround Pessoal?
        </h3>
        <div className="text-center mb-8">
          <p className="font-garamond text-xl text-[#2B1D0E] italic">
            Parar de sangrar → Estabilizar → Reconstruir → Crescer
          </p>
          <p className="font-garamond text-lg text-[#5C4A3A] mt-4">
            Não é sobre cortar tudo. É sobre <strong className="text-[#8B2635]">eliminar contratos ruins</strong> e 
            <strong className="text-[#8B2635]"> proteger contratos essenciais</strong>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#C9A961]">
                <th className="text-left py-3 px-4 font-cinzel text-[#8B2635]">Fase</th>
                <th className="text-left py-3 px-4 font-cinzel text-[#8B2635]">Objetivo</th>
                <th className="text-left py-3 px-4 font-cinzel text-[#8B2635]">Duração</th>
              </tr>
            </thead>
            <tbody>
              {fases.map((item, idx) => (
                <tr key={idx} className="border-b border-[#C9A961]/30 hover:bg-[#C9A961]/5 transition-colors">
                  <td className="py-3 px-4 font-cinzel font-semibold text-[#2B1D0E]">{item.fase}</td>
                  <td className="py-3 px-4 font-garamond text-[#5C4A3A]">{item.objetivo}</td>
                  <td className="py-3 px-4 font-garamond text-[#5C4A3A]">{item.duracao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <BiblicalReference 
          quote="Porque qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas, para ver se tem com que a acabar?"
          reference="Lucas 14:28"
          explanation="Jesus ensina gestão de risco. Iniciar sem cálculo é arrogância; calcular antes é sabedoria. Antes de pensar em crescimento, calcule quanto custa sobreviver."
        />
      </ParchmentCard>

      <div>
        <h3 className="font-cinzel text-2xl font-bold text-[#F5EBD0] mb-6 text-center">
          Classificação de Contratos: O Coração do Método
        </h3>
        {contracts.map((contract, idx) => (
          <ContractCard key={idx} contract={contract} />
        ))}
      </div>

      <ParchmentCard className="mt-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <MythologicalReference 
              title="Janus"
              description="Deus dos começos e das escolhas, representa a importância de classificar antes de agir. Tinha duas faces: uma olhava para o passado, outra para o futuro."
              explanation="Janus representa a classificação prévia: antes de gastar, olhe para o passado e para o futuro. Ação sem classificação é movimento cego."
            />
          </div>
          <div>
            <BiblicalReference 
              quote="Examinai tudo. Retende o bem."
              reference="1 Tessalonicenses 5:21"
              explanation="'Examinai tudo' significa testar, provar, validar antes de aceitar. Não aceite gastos por inércia; examine, classifique, e só então retenha o que é essencial."
            />
          </div>
        </div>
      </ParchmentCard>
    </section>
  );
};

const ComportamentoSection: React.FC = () => (
  <section id="comportamento" className="scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">PARTE 3: COMPORTAMENTO</h2>
      <p className="font-garamond text-xl text-[#C9A961]">Quebrando Ciclos</p>
      <SacredDivider />
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <ParchmentCard>
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">3.1 O Ciclo Dopaminérgico Financeiro</h3>
        <div className="space-y-3 mb-6">
          {[
            'Estresse ou tédio → busca por estímulo',
            'Operação/decisão rápida → ganho pequeno',
            'Dopamina libera → "eu consigo!"',
            'Nova operação → risco maior',
            'Perda → frustração',
            'Tentativa de recuperar → perda maior',
            'Culpa → mais estresse → volta ao passo 1'
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-[#F5EBD0]/50 rounded">
              <span className="font-cinzel text-sm font-bold text-[#8B2635]">{idx + 1}.</span>
              <span className="font-garamond text-sm text-[#2B1D0E]">{step}</span>
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
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">3.2 Substituição de Estímulo</h3>
        <p className="font-garamond text-lg text-[#2B1D0E] mb-6">
          Não elimine o estímulo. <strong className="text-[#8B2635]">Substitua a fonte</strong>.
        </p>
        <div className="space-y-3">
          {[
            { nocivo: 'Trade / apostas', saudavel: 'Exercício físico' },
            { nocivo: 'Scroll infinito', saudavel: 'Leitura focada / estudo técnico' },
            { nocivo: 'Compras impulsivas', saudavel: 'Construir algo (projeto, sistema)' },
            { nocivo: 'Decisão sob ansiedade', saudavel: 'Registrar + esperar 24h' },
            { nocivo: 'Tela excessiva', saudavel: 'Música instrumental / ambiente controlado' }
          ].map((sub, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#F5EBD0]/50 rounded">
              <span className="font-garamond text-sm text-[#DC2626] line-through">{sub.nocivo}</span>
              <span className="text-[#C9A961]">→</span>
              <span className="font-garamond text-sm text-[#059669] font-semibold">{sub.saudavel}</span>
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
      <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6 text-center">3.3 O Papel da Família</h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-cinzel text-lg font-bold text-[#8B2635] mb-3">Protocolo de Governança Familiar</h4>
          <ol className="space-y-2 list-decimal list-inside">
            {[
              'Comunicação clara: "Estamos em modo de reorganização por X meses"',
              'Regras visíveis: o que pode, o que não pode, por quê',
              'Participação leve: crianças podem ter pequenas responsabilidades',
              'Exemplo antes de discurso: pais executando o plano primeiro',
              'Celebração de marcos: reconhecer progresso'
            ].map((item, idx) => (
              <li key={idx} className="font-garamond text-[#2B1D0E] pl-2">{item}</li>
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

const SistemaSection: React.FC = () => (
  <section id="sistema" className="scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">PARTE 4: SISTEMA</h2>
      <p className="font-garamond text-xl text-[#C9A961]">Construindo Previsibilidade</p>
      <SacredDivider />
    </div>

    <ParchmentCard className="mb-12">
      <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6">4.1 O Modelo de ERP Pessoal</h3>
      <p className="font-garamond text-lg text-[#2B1D0E] mb-6 italic">
        Trate sua vida como uma <strong className="text-[#8B2635]">microempresa com um único cliente: você mesmo</strong>.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { title: 'Módulo 1: Receitas', items: ['Fixas (salário, renda recorrente)', 'Variáveis previsíveis (13º, férias)', 'Extraordinárias (não contar como base)'] },
          { title: 'Módulo 2: Contratos', items: ['Essenciais', 'Financeiros', 'Ruins (a eliminar)'] },
          { title: 'Módulo 3: Fluxo de Caixa', items: ['Projeção mensal', 'Projeção trimestral', 'Alertas de risco'] },
          { title: 'Módulo 4: Comportamento', items: ['Registro de custos', 'Gatilhos identificados', 'Substituições aplicadas'] },
          { title: 'Módulo 5: Metas', items: ['Curto prazo (30 dias)', 'Médio prazo (90 dias)', 'Longo prazo (180+ dias)'] },
        ].map((mod, idx) => (
          <div key={idx} className="p-4 bg-[#F5EBD0]/50 rounded-lg border border-[#C9A961]/30">
            <h4 className="font-cinzel font-bold text-[#8B2635] mb-2">{mod.title}</h4>
            <ul className="space-y-1">
              {mod.items.map((item, i) => (
                <li key={i} className="font-garamond text-sm text-[#5C4A3A]">• {item}</li>
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
      <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6">4.2 A Regra dos 90 Dias</h3>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { periodo: 'Dias 1-30', foco: 'Contenção', indicador: 'Nenhuma nova dívida criada' },
          { periodo: 'Dias 31-60', foco: 'Estabilização', indicador: 'Fluxo de caixa projetado com precisão' },
          { periodo: 'Dias 61-90', foco: 'Reconstrução', indicador: 'Primeiro contrato ruim eliminado' }
        ].map((item, idx) => (
          <div key={idx} className="p-6 bg-gradient-to-br from-[#8B2635]/10 to-[#C9A961]/10 rounded-lg border border-[#C9A961]/30">
            <h4 className="font-cinzel font-bold text-[#8B2635] mb-2">{item.periodo}</h4>
            <p className="font-garamond font-semibold text-[#2B1D0E] mb-2">{item.foco}</p>
            <p className="font-garamond text-sm text-[#5C4A3A]">{item.indicador}</p>
          </div>
        ))}
      </div>

      <BiblicalReference 
        quote="Ensina-nos a contar os nossos dias, para que alcancemos coração sábio."
        reference="Salmos 90:12"
        explanation="Contar dias é consciência de finitude. 'Coração sábio' significa mente que sabe medir. Os 90 dias são um horizonte realista que impede tanto o desespero quanto a arrogância."
      />

      <MythologicalReference 
        title="As Três Graças (Cárites)"
        description="Aglaia (beleza), Eufrósine (alegria) e Talia (abundância). Dançavam juntas, representando harmonia."
        explanation="Os 90 dias são a 'dança das Graças': nos primeiros 30 dias, busca-se 'beleza' (ordem); nos segundos 30, 'alegria' (previsibilidade); nos últimos 30, 'abundância' (libertação). Disciplina abre espaço para prosperidade."
      />
    </ParchmentCard>
  </section>
);

const HumanidadeSection: React.FC = () => (
  <section id="humanidade" className="scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">PARTE 5: HUMANIDADE</h2>
      <p className="font-garamond text-xl text-[#C9A961]">Além do Financeiro</p>
      <SacredDivider />
    </div>

    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <ParchmentCard>
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">5.1 O Ser Humano Como Sistema</h3>
        <p className="font-garamond text-lg text-[#2B1D0E] mb-4">
          Sistemas são previsíveis; vontades são voláteis.
        </p>
        <div className="space-y-2 mb-6">
          {[
            { pilar: 'Corpo', desc: 'físico, energia, saúde' },
            { pilar: 'Mente', desc: 'pensamento, análise, planejamento' },
            { pilar: 'Emoção', desc: 'sentimento, impulso, conexão' },
            { pilar: 'Espírito', desc: 'propósito, valores, legado' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-[#F5EBD0]/50 rounded">
              <div className="w-2 h-2 rounded-full bg-[#8B2635]" />
              <span className="font-cinzel font-bold text-[#8B2635]">{item.pilar}</span>
              <span className="font-garamond text-sm text-[#5C4A3A]">{item.desc}</span>
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
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">5.2 Influência e Padrão</h3>
        <p className="font-garamond text-lg text-[#2B1D0E] mb-4">
          Seres humanos aprendem por <strong className="text-[#8B2635]">observação</strong>, não por discurso.
        </p>
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-red-50/50 rounded border-l-4 border-red-500">
            <p className="font-garamond text-sm text-[#2B1D0E]">
              Se você fala de disciplina mas age por impulso, o sistema inteiro desconfia.
            </p>
          </div>
          <div className="p-3 bg-green-50/50 rounded border-l-4 border-green-500">
            <p className="font-garamond text-sm text-[#2B1D0E]">
              Se você executa antes de explicar e mantém regra mesmo quando ninguém vê, o ambiente muda sozinho.
            </p>
          </div>
        </div>
        <MythologicalReference 
          title="Orfeu"
          description="Cuja música acalmava até feras, representa o poder do exemplo harmonioso."
          explanation="Quando você executa o plano com consistência, emite uma 'música' de coerência que acalma o ambiente. Quem vive em ritmo atrai quem quer dançar."
        />
      </ParchmentCard>

      <ParchmentCard>
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">5.3 Educação Formal</h3>
        <p className="font-garamond text-[#2B1D0E] mb-4">
          A escola atua no nível <strong>pré-cognitivo</strong>. A faculdade funciona como 
          <strong> adestramento sistêmico</strong>.
        </p>
        <p className="font-garamond text-[#5C4A3A] mb-6">
          O sistema não precisa de soberanos; precisa de técnicos previsíveis. Quem quer governar a própria vida precisa aprender o que a faculdade não ensina: método, previsibilidade e eliminação de contratos ruins.
        </p>
        <MythologicalReference 
          title="Dédalo e o Labirinto"
          description="Dédalo construiu o labirinto, mas quem sobreviveu foi o herói que seguiu o fio."
          explanation="A faculdade ensina a construir a engrenagem (o labirinto); o método ensina a sair dele. Técnica sem método é prisão elegante."
        />
      </ParchmentCard>

      <ParchmentCard>
        <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-4">5.4 A Estrutura Econômica</h3>
        <div className="space-y-3 mb-6">
          {[
            { pct: '95%', desc: 'Operam no modo reação. Sustentam a engrenagem.', color: 'bg-gray-500' },
            { pct: '5%', desc: 'Tentam sair do padrão, mas falham por falta de método.', color: 'bg-amber-500' },
            { pct: '<1%', desc: 'Operam com governança. Constroem sistemas.', color: 'bg-green-600' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-[#F5EBD0]/50 rounded">
              <span className={`px-3 py-1 ${item.color} text-white font-cinzel font-bold rounded`}>{item.pct}</span>
              <span className="font-garamond text-sm text-[#5C4A3A]">{item.desc}</span>
            </div>
          ))}
        </div>
        <MythologicalReference 
          title="As Moiras (Três Fates)"
          description="Cloto fia, Láquesis mede, Átropos corta. O destino é medida + corte."
          explanation="Os 95% não medem, só fiam e gastam. Os <1% medem o fio, cortam o excesso. Destino é a consequência da governança aplicada ao tempo."
        />
      </ParchmentCard>
    </div>

    <ParchmentCard>
      <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6 text-center">
        5.7 O Ciclo da Transformação
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {[
          'Método', 'Comportamento', 'Padrão', 'Previsibilidade', 'Influência'
        ].map((item, idx, arr) => (
          <React.Fragment key={idx}>
            <div className="px-6 py-3 bg-[#8B2635] text-[#F5EBD0] font-cinzel font-bold rounded-lg">
              {item}
            </div>
            {idx < arr.length - 1 && <span className="text-[#C9A961] text-2xl">→</span>}
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

const ConclusionSection: React.FC = () => (
  <section className="scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-cinzel text-4xl font-bold text-[#F5EBD0] mb-4">CONCLUSÃO</h2>
      <p className="font-garamond text-xl text-[#C9A961]">O Caminho da Liberdade com Governança</p>
      <SacredDivider />
    </div>

    <ParchmentCard className="max-w-4xl mx-auto mb-12">
      <div className="text-center mb-8">
        <Quote className="w-12 h-12 text-[#8B2635] mx-auto mb-4" />
        <p className="font-garamond text-2xl italic text-[#2B1D0E] mb-4">
          "A verdade vos libertará."
        </p>
        <p className="font-cinzel text-sm text-[#8B2635]">— João 8:32</p>
      </div>

      <p className="font-garamond text-lg text-[#2B1D0E] mb-6">
        Mas a verdade só liberta quem a <strong className="text-[#8B2635]">encara</strong>, 
        <strong className="text-[#8B2635]"> organiza</strong> e <strong className="text-[#8B2635]">age</strong>.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-red-50/50 rounded-lg">
          <h4 className="font-cinzel font-bold text-[#DC2626] mb-2">Este manual NÃO promete:</h4>
          <ul className="space-y-1">
            {['Enriquecimento rápido', 'Vida sem esforço', 'Felicidade constante'].map((item, idx) => (
              <li key={idx} className="font-garamond text-sm text-[#5C4A3A]">✕ {item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-green-50/50 rounded-lg">
          <h4 className="font-cinzel font-bold text-[#059669] mb-2">Promete apenas:</h4>
          <ul className="space-y-1">
            {['Clareza sobre o que está acontecendo', 'Método para sair do caos', 'Disciplina para não voltar', 'Dignidade para reconstruir'].map((item, idx) => (
              <li key={idx} className="font-garamond text-sm text-[#5C4A3A]">✓ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center p-6 bg-[#C9A961]/10 rounded-lg border border-[#C9A961]/30">
        <p className="font-garamond text-xl text-[#2B1D0E] italic">
          <strong className="text-[#8B2635]">O sistema cria o caos para vender conforto.</strong>
          <br />
          <strong className="text-[#8B2635]">O método conforta porque devolve o controle.</strong>
        </p>
      </div>
    </ParchmentCard>

    <ParchmentCard>
      <h3 className="font-cinzel text-2xl font-bold text-[#2B1D0E] mb-6 text-center">
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
          'Celebre marcos, não apenas resultados finais'
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-[#F5EBD0]/50 rounded">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8B2635] text-[#F5EBD0] flex items-center justify-center font-cinzel text-xs font-bold">
              {idx + 1}
            </span>
            <span className="font-garamond text-sm text-[#2B1D0E]">{item}</span>
          </div>
        ))}
      </div>
    </ParchmentCard>

    <div className="mt-12 text-center">
      <div className="inline-block p-8 bg-gradient-to-br from-[#F5EBD0] via-[#E8DCC4] to-[#D4C4A8] rounded-lg border-2 border-[#C9A961] shadow-2xl">
        <p className="font-garamond text-xl text-[#2B1D0E] mb-4 italic">
          "Não é sobre ter mais.<br />
          É sobre ser livre.<br />
          E liberdade vem de previsibilidade,<br />
          não de sorte."
        </p>
        <div className="flex justify-center">
          <WaxSeal size="md">
            <Compass className="w-8 h-8 text-white" />
          </WaxSeal>
        </div>
      </div>
    </div>
  </section>
);

export default LandingPage;