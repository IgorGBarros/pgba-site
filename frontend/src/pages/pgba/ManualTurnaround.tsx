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
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.1 Por que o ser humano busca dopamina?
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que repetimos comportamentos que nos prejudicam, mesmo sabendo que são ruins?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
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

        <div className="my-8 p-6 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
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
      </ParchmentCard>

      {/* 1.2 Impulsividade */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.2 Por que pessoas inteligentes sofrem mais com impulsividade?
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que pessoas analíticas, responsáveis e técnicas parecem mais vulneráveis a vícios de dopamina?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
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
      </ParchmentCard>

      {/* 1.3 Rotina */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.3 Por que a rotina acalma o cérebro?
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que pessoas ansiosas melhoram quando têm rotina, exercício e previsibilidade?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
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
      </ParchmentCard>
    </div>
  </section>
);

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

    <div className="space-y-12">
      {/* 2.1 Turnaround */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          2.1 O que é Turnaround Pessoal?
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            O que significa "turnaround" aplicado à vida pessoal?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Turnaround é um termo corporativo para <Rubric>reestruturação de crise</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Aplicado à pessoa física, significa:
          </p>
          <div className="my-4 p-6 bg-gold-100/30 rounded-sm border border-gold-600/30">
            <p className="font-title text-xl text-center text-ink-800 italic">
              Parar de sangrar → Estabilizar → Reconstruir → Crescer
            </p>
          </div>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Não é sobre cortar tudo. É sobre <Rubric>eliminar contratos ruins</Rubric> e <Rubric>proteger contratos essenciais</Rubric>.
          </p>
        </div>

        <h4 className="font-headline text-lg font-bold text-ink-800 mb-4 mt-8">
          As 4 Fases do Turnaround Pessoal
        </h4>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-vermillion-700" />
              <h5 className="font-headline font-bold text-ink-800">1. Contenção</h5>
            </div>
            <p className="font-body text-sm text-ink-700 mb-1">
              <strong>Objetivo:</strong> Parar a sangria imediata
            </p>
            <p className="font-body text-sm text-ink-600">
              <strong>Duração:</strong> 0-30 dias
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="w-5 h-5 text-gold-700" />
              <h5 className="font-headline font-bold text-ink-800">2. Estabilização</h5>
            </div>
            <p className="font-body text-sm text-ink-700 mb-1">
              <strong>Objetivo:</strong> Criar previsibilidade básica
            </p>
            <p className="font-body text-sm text-ink-600">
              <strong>Duração:</strong> 30-90 dias
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Castle className="w-5 h-5 text-sage-700" />
              <h5 className="font-headline font-bold text-ink-800">3. Reconstrução</h5>
            </div>
            <p className="font-body text-sm text-ink-700 mb-1">
              <strong>Objetivo:</strong> Eliminar passivos tóxicos
            </p>
            <p className="font-body text-sm text-ink-600">
              <strong>Duração:</strong> 90-180 dias
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-gold-600" />
              <h5 className="font-headline font-bold text-ink-800">4. Crescimento</h5>
            </div>
            <p className="font-body text-sm text-ink-700 mb-1">
              <strong>Objetivo:</strong> Investir com governança
            </p>
            <p className="font-body text-sm text-ink-600">
              <strong>Duração:</strong> 180+ dias
            </p>
          </div>
        </div>

        <ScrollableQuote
          quote="Porque qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas, para ver se tem com que a acabar?"
          source="Lucas 14:28"
          explanation="Jesus não está falando de economia doméstica. Ele está ensinando gestão de risco. A 'torre' é qualquer projeto de vida (casa, família, negócio, patrimônio). 'Assentar-se primeiro' é a fase de contenção e planejamento. 'Calcular as despesas' é o mapeamento de contratos e passivos. 'Ver se tem com que acabar' é a análise de capacidade de pagamento. O princípio é brutal: iniciar sem cálculo é arrogância; calcular antes é sabedoria. No turnaround, isso se traduz em: antes de pensar em crescimento, calcule quanto custa sobreviver."
          type="biblical"
        />
      </ParchmentCard>

      {/* 2.2 Classificação de Contratos */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          2.2 Classificação de Contratos: O Coração do Método
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Como classificar gastos para tomar decisões melhores?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Toda movimentação financeira deve ser classificada em <Rubric>três categorias</Rubric>:
          </p>
        </div>

        <div className="space-y-6 mt-8">
          {/* Contrato Essencial */}
          <div className="p-6 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-sage-700" />
              <h4 className="font-headline text-xl font-bold text-sage-700">
                🔹 CONTRATO ESSENCIAL
              </h4>
            </div>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="font-body text-ink-700">Mantém a vida funcionando</li>
              <li className="font-body text-ink-700">É previsível e inevitável</li>
              <li className="font-body text-ink-700">Não carrega juros abusivos</li>
            </ul>
            <p className="font-body text-ink-700 mb-2">
              <strong>Exemplos:</strong> Moradia, Alimentação básica, Saúde, Educação dos filhos, Transporte para trabalho
            </p>
            <div className="mt-4 p-3 bg-sage-100/50 rounded-sm">
              <p className="font-body text-sage-800 font-semibold">
                ✅ <strong>Regra:</strong> Não se corta. Se renegocia.
              </p>
            </div>
          </div>

          {/* Contrato Ruim */}
          <div className="p-6 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-vermillion-700" />
              <h4 className="font-headline text-xl font-bold text-vermillion-700">
                🔹 CONTRATO RUIM
              </h4>
            </div>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="font-body text-ink-700">Juros altos ou embutidos</li>
              <li className="font-body text-ink-700">Consumo emocional ou impulsivo</li>
              <li className="font-body text-ink-700">Prazo indefinido ou muito longo</li>
              <li className="font-body text-ink-700">Não gera retorno</li>
            </ul>
            <p className="font-body text-ink-700 mb-2">
              <strong>Exemplos:</strong> Rotativo de cartão, Cheque especial, Parcelamento de lazer, Assinaturas não usadas
            </p>
            <div className="mt-4 p-3 bg-vermillion-100/50 rounded-sm">
              <p className="font-body text-vermillion-800 font-semibold">
                ❌ <strong>Regra:</strong> Eliminar prioritariamente.
              </p>
            </div>
          </div>

          {/* Custo de Comportamento */}
          <div className="p-6 bg-gold-50/30 rounded-sm border-l-4 border-gold-600">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-gold-700" />
              <h4 className="font-headline text-xl font-bold text-gold-700">
                🔹 CUSTO DE COMPORTAMENTO
              </h4>
            </div>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li className="font-body text-ink-700">Despesa evitável causada por impulso, dopamina ou estresse</li>
              <li className="font-body text-ink-700">Não sustenta a operação</li>
              <li className="font-body text-ink-700">Gera arrependimento ou tentativa de "recuperar"</li>
            </ul>
            <p className="font-body text-ink-700 mb-2">
              <strong>Exemplos:</strong> Trade emocional, Apostas, Compras por ansiedade, Juros por atraso evitável
            </p>
            <div className="mt-4 p-3 bg-gold-100/50 rounded-sm">
              <p className="font-body text-gold-800 font-semibold">
                ⚠️ <strong>Regra:</strong> Nunca mascarar como despesa normal. Registrar separadamente.
              </p>
            </div>
          </div>
        </div>

        <ScrollableQuote
          quote="Janus: deus dos começos e das escolhas"
          source="Mitologia Romana"
          explanation="Janus tinha duas faces: uma olhava para o passado, outra para o futuro. Ele era invocado em todo começo de empreendimento. Na gestão moderna, Janus representa a classificação prévia: antes de gastar, olhe para o passado (como esse gasto afetou meu caixa?) e para o futuro (como esse gasto afetará meu caixa?). Cada porta que se abre (cada gasto) tem consequência. Janus ensina que ação sem classificação é movimento cego."
          type="mythological"
        />

        <ScrollableQuote
          quote="Examinai tudo. Retende o bem."
          source="1 Tessalonicenses 5:21"
          explanation="'Examinai tudo' (grego: dokimazete panta) significa testar, provar, validar antes de aceitar. No contexto financeiro, isso é a triagem de contratos: teste cada gasto antes de aceitá-lo como necessário. 'Retende o bem' (grego: katechete to kalon) significa segurar firmemente o que passou no teste. A aplicação é clara: não aceite gastos por inércia; examine, classifique, e só então retenha o que é essencial."
          type="biblical"
        />
      </ParchmentCard>

      {/* 2.3 Previsibilidade */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          2.3 A Regra de Ouro da Previsibilidade
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que previsibilidade é mais importante que renda alta?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>renda alta sem previsibilidade gera caos</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Pessoas com boa renda quebram quando:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700">não sabem quanto entra</li>
            <li className="font-body text-ink-700">não sabem quanto sai</li>
            <li className="font-body text-ink-700">não projetam o futuro</li>
            <li className="font-body text-ink-700">decidem sob pressão</li>
          </ul>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Previsibilidade permite:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700">planejar amortizações</li>
            <li className="font-body text-ink-700">evitar juros</li>
            <li className="font-body text-ink-700">proteger a família</li>
            <li className="font-body text-ink-700">tomar decisões racionais</li>
          </ul>
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-3">
            🔄 Fórmula da Previsibilidade
          </h4>
          <p className="font-mono text-sm text-ink-700 bg-ink-50/50 p-3 rounded-sm">
            Previsibilidade = (Receita Conhecida) - (Despesas Mapeadas) - (Contratos Classificados)
          </p>
          <p className="font-body text-ink-700 mt-3">
            Se o resultado é visível mês a mês → há controle.
            <br />
            Se é surpresa todo mês → há caos.
          </p>
        </div>

        <ScrollableQuote
          quote="Os planos do diligente tendem à abundância; mas todo apressado, à pobreza."
          source="Provérbios 21:5"
          explanation="'Diligente' (hebraico: charuts) significa alguém que corta, que é preciso, que planeja com exatidão. 'Apressado' (hebraico: ats) significa alguém que corre sem olhar, que age por impulso. A sabedoria aqui é brutal: abundância não vem de velocidade; vem de precisão. Previsibilidade é a diligência aplicada ao tempo. Você não precisa ganhar mais; precisa saber exatamente onde cada real está indo e para onde está indo."
          type="biblical"
        />
      </ParchmentCard>
    </div>
  </section>
);

const ComportamentoSection: React.FC = () => (
  <section id="comportamento" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE III
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        COMPORTAMENTO
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        Quebrando Ciclos
      </p>
      <SacredDivider icon={Heart} />
    </div>

    <div className="space-y-12">
      {/* 3.1 Ciclo Dopaminérgico */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          3.1 O Ciclo Dopaminérgico Financeiro
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que pessoas entram em ciclos de ganhar e perder dinheiro repetidamente?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque o cérebro interpreta <Rubric>ganho aleatório</Rubric> como <Rubric>habilidade</Rubric>, mesmo quando é sorte.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            O ciclo típico:
          </h4>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">1.</span>
              <span className="font-body text-ink-700">Estresse ou tédio → busca por estímulo</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">2.</span>
              <span className="font-body text-ink-700">Operação/decisão rápida → ganho pequeno</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">3.</span>
              <span className="font-body text-ink-700">Dopamina libera → "eu consigo!"</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">4.</span>
              <span className="font-body text-ink-700">Nova operação → risco maior</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">5.</span>
              <span className="font-body text-ink-700">Perda → frustração</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">6.</span>
              <span className="font-body text-ink-700">Tentativa de recuperar → perda maior</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">7.</span>
              <span className="font-body text-ink-700">Culpa → mais estresse → volta ao passo 1</span>
            </li>
          </ol>
        </div>

        <div className="my-8 p-6 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Isso não é falta de inteligência.
            <br />
            É <Rubric>reforço intermitente</Rubric>, o mesmo mecanismo de cassinos.
          </p>
        </div>

        <ScrollableQuote
          quote="Ícaro: voou perto demais do sol"
          source="Mitologia Grega"
          explanation="Ícaro ganhou asas de cera e começou a voar. Seu pai, Dédalo, avisou: 'Não voe muito alto, nem muito baixo.' Ícaro sentiu o gosto da liberdade e voou mais alto, até o sol derreter a cera. O ciclo dopaminérgico é Ícaro financeiro: o primeiro ganho (subir) gera euforia, a euforia gera mais risco (voar mais alto), o risco gera queda (cera derretendo). O aprendizado é que sucesso inicial sem estrutura é convite para a queda. O limite (não voar muito alto) é a regra do turnaround."
          type="mythological"
        />

        <ScrollableQuote
          quote="Melhor é o pouco com o temor do SENHOR do que grande tesouro onde há inquietação."
          source="Provérbios 15:16"
          explanation="'Temor' (hebraico: yirah) aqui não é medo; é reverência à ordem, respeito ao limite, consciência das consequências. 'Inquietação' (hebraico: mehumah) significa confusão, tumulto, falta de paz. O princípio é claro: paz com pouco vale mais que riqueza com caos. No ciclo dopaminérgico, a pessoa busca o 'grande tesouro' (o ganho rápido) e paga com 'inquietação' (ansiedade, dívida, recaída). A sabedoria é optar pelo 'pouco com ordem' (previsibilidade) em vez do 'muito com caos' (impulso)."
          type="biblical"
        />
      </ParchmentCard>

      {/* 3.2 Substituição de Estímulo */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          3.2 Substituição de Estímulo: A Chave da Mudança
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Como parar um comportamento impulsivo sem sofrer com abstinência?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            O cérebro precisa de dopamina. Se você tira uma fonte sem oferecer outra, ele busca a mais forte disponível.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Tabela de Substituições Saudáveis
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gold-100/30">
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Estímulo Nocivo
                  </th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Substituição Saudável
                  </th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Por que funciona
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">
                    Trade / apostas
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">
                    Exercício físico
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Libera dopamina + endorfina sem risco financeiro
                  </td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">
                    Scroll infinito
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">
                    Leitura focada / estudo técnico
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Estímulo cognitivo com progresso real
                  </td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">
                    Compras impulsivas
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">
                    Construir algo (projeto, sistema, habilidade)
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Sensação de conquista duradoura
                  </td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">
                    Decisão sob ansiedade
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">
                    Registrar + esperar 24h + revisar com regra
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Ativa o pré-frontal antes do impulso
                  </td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">
                    Tela excessiva
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">
                    Música instrumental / ambiente controlado
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Regula emoção sem superestimular
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollableQuote
          quote="Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai."
          source="Filipenses 4:8"
          explanation="Paulo não está listando virtudes morais; está ensinando gestão de atenção. 'Nisso pensai' (grego: logizesthe) significa calcular, ponderar, direcionar o pensamento. O cérebro é um jardim: o que você planta, cresce. Se planta estímulo nocivo, colhe ansiedade. Se planta estímulo saudável, colhe estabilidade. A aplicação moderna é clara: substituição não é repressão; é redirecionamento de foco."
          type="biblical"
        />

        <ScrollableQuote
          quote="Prometeu: trouxe o fogo aos humanos"
          source="Mitologia Grega"
          explanation="Prometeu roubou o fogo dos deuses e deu aos humanos. O fogo pode cozinhar ou queimar, aquecer ou destruir. O estímulo (dopamina) é o fogo moderno. Direcionado para construção (projeto, exercício, estudo), ele aquece e ilumina. Direcionado para destruição (trade, compra, tela), ele queima. O aprendizado é que o problema não é a energia; é a direção. Substituir é redirecionar o fogo."
          type="mythological"
        />
      </ParchmentCard>

      {/* 3.3 Família */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          3.3 O Papel da Família no Turnaround
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Como envolver a família sem gerar conflito ou culpa?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Com <Rubric>transparência, não dramatismo</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            A família não precisa saber todos os detalhes financeiros. Precisa saber:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700">que existe um plano</li>
            <li className="font-body text-ink-700">que há prazo definido</li>
            <li className="font-body text-ink-700">que decisões são tomadas com método</li>
            <li className="font-body text-ink-700">que todos têm papel</li>
          </ul>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Protocolo de Governança Familiar
          </h4>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-gold-700">1.</span>
              <span className="font-body text-ink-700">
                <strong>Comunicação clara:</strong> "Estamos em modo de reorganização por X meses"
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-gold-700">2.</span>
              <span className="font-body text-ink-700">
                <strong>Regras visíveis:</strong> o que pode, o que não pode, por quê
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-gold-700">3.</span>
              <span className="font-body text-ink-700">
                <strong>Participação leve:</strong> crianças podem ter pequenas responsabilidades
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-gold-700">4.</span>
              <span className="font-body text-ink-700">
                <strong>Exemplo antes de discurso:</strong> pais executando o plano primeiro
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-gold-700">5.</span>
              <span className="font-body text-ink-700">
                <strong>Celebração de marcos:</strong> reconhecer progresso, não apenas resultado final
              </span>
            </li>
          </ol>
        </div>

        <ScrollableQuote
          quote="Mas, se alguém não tem cuidado dos seus e principalmente dos da sua própria casa, negou a fé e é pior do que o infiel."
          source="1 Timóteo 5:8"
          explanation="'Cuidar' (grego: proeino) significa prever, planejar, prover com antecedência. A fé sem cuidado prático da casa é considerada pior que a descrença, porque a descrença pelo menos é honesta; a fé sem cuidado é hipocrisia. No contexto familiar, isso significa: governança não é opcional; é obrigação. Transparência com a família não é fraqueza; é cumprimento de responsabilidade. A família que opera no improviso está 'negando a fé' na prática, mesmo que a confesse na teoria."
          type="biblical"
        />

        <ScrollableQuote
          quote="Héstia: guardiã do lar"
          source="Mitologia Grega"
          explanation="Héstia era a deusa que nunca saía de casa. Ela representava o centro que mantém tudo girando. Na governança familiar, Héstia é a regra doméstica inegociável: horário de sono, rotina de estudo, limite de tela, revisão financeira familiar. O lar organizado não é perfeição; é proteção contra o caos externo. Quando a família tem um 'centro' (regras claras), cada membro sabe seu papel e o sistema funciona."
          type="mythological"
        />
      </ParchmentCard>
    </div>
  </section>
);

const SistemaSection: React.FC = () => (
  <section id="sistema" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE IV
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        SISTEMA
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        Construindo Previsibilidade
      </p>
      <SacredDivider icon={Settings} />
    </div>

    <div className="space-y-12">
      {/* 4.1 ERP Pessoal */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          4.1 O Modelo de ERP Pessoal
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Como estruturar finanças pessoais com mentalidade corporativa?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Trate sua vida como uma <Rubric>microempresa com um único cliente: você mesmo</Rubric>.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Estrutura Mínima do ERP Pessoal
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">
                Módulo 1: Receitas
              </h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Fixas (salário, renda recorrente)</li>
                <li className="font-body text-sm text-ink-700">Variáveis previsíveis (13º, férias, restituição)</li>
                <li className="font-body text-sm text-ink-700">Extraordinárias (bônus, vendas eventuais) → <strong className="text-vermillion-700">não contar como base</strong></li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">
                Módulo 2: Contratos
              </h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Essenciais (moradia, alimentação, saúde, educação)</li>
                <li className="font-body text-sm text-ink-700">Financeiros (dívidas, juros, parcelamentos)</li>
                <li className="font-body text-sm text-ink-700">Ruins (a eliminar prioritariamente)</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">
                Módulo 3: Fluxo de Caixa
              </h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Projeção mensal (o que entra/sai)</li>
                <li className="font-body text-sm text-ink-700">Projeção trimestral (tendência)</li>
                <li className="font-body text-sm text-ink-700">Alertas de risco (quando o saldo projetado fica negativo)</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">
                Módulo 4: Comportamento
              </h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Registro de custos de comportamento</li>
                <li className="font-body text-sm text-ink-700">Gatilhos identificados</li>
                <li className="font-body text-sm text-ink-700">Substituições aplicadas</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20 md:col-span-2">
              <h5 className="font-headline font-bold text-ink-800 mb-2">
                Módulo 5: Metas e Marcos
              </h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Curto prazo (30 dias): parar sangria</li>
                <li className="font-body text-sm text-ink-700">Médio prazo (90 dias): estabilizar</li>
                <li className="font-body text-sm text-ink-700">Longo prazo (180+ dias): reconstruir</li>
              </ul>
            </div>
          </div>
        </div>

        <ScrollableQuote
          quote="Pois qual de vós, querendo edificar uma torre, não se assenta primeiro a calcular as despesas, para ver se tem com que a acabar?"
          source="Lucas 14:28"
          explanation="A torre é o ERP pessoal. 'Assentar-se' é o tempo de planejamento. 'Calcular despesas' é o mapeamento de contratos. 'Ver se tem com que acabar' é a projeção de fluxo de caixa. O princípio é que sistema sem cálculo é castelo de areia. O ERP pessoal não é planilha bonita; é ferramenta de sobrevivência que responde: 'Posso pagar isso?' antes de 'Quero pagar isso?'."
          type="biblical"
        />

        <ScrollableQuote
          quote="Hefesto: o ferreiro divino"
          source="Mitologia Grega"
          explanation="Hefesto era o único deus que trabalhava com as mãos. Ele construía armas, ferramentas, redes, e até autômatos. O ERP pessoal é a 'forja' moderna: onde você transforma dados brutos em ferramentas de decisão. Hefesto ensina que sistemas bem feitos libertam; sistemas mal feitos aprisionam. O ERP não é sobre controle; é sobre automatizar decisões para que você possa focar no que importa."
          type="mythological"
        />
      </ParchmentCard>

      {/* 4.2 Regra dos 90 Dias */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          4.2 A Regra dos 90 Dias
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que 90 dias é o horizonte ideal para mudança comportamental?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque é tempo suficiente para:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700">criar novo hábito</li>
            <li className="font-body text-ink-700">reduzir impulso antigo</li>
            <li className="font-body text-ink-700">ver resultado tangível</li>
            <li className="font-body text-ink-700">ajustar o método</li>
          </ul>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            E é tempo curto o bastante para:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700">não desanimar</li>
            <li className="font-body text-ink-700">manter foco</li>
            <li className="font-body text-ink-700">medir progresso</li>
          </ul>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Cronograma dos 90 Dias
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gold-100/30">
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Período
                  </th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Foco
                  </th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">
                    Indicador de Sucesso
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Dias 1-30
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Contenção
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Nenhuma nova dívida criada
                  </td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Dias 31-60
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Estabilização
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Fluxo de caixa projetado com precisão
                  </td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Dias 61-90
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Reconstrução
                  </td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">
                    Primeiro contrato ruim eliminado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollableQuote
          quote="Ensina-nos a contar os nossos dias, para que alcancemos coração sábio."
          source="Salmos 90:12"
          explanation="Moisés, após 40 anos no deserto, escreveu que contar dias não é obsessão com tempo; é consciência de finitude. 'Coração sábio' (hebraico: leb chakam) significa mente que sabe medir, que não se perde em ilusões de eternidade. Os 90 dias são o 'contar dias' moderno: um horizonte realista que impede tanto o desespero ('nunca vou sair') quanto a arrogância ('já resolvi tudo')."
          type="biblical"
        />

        <ScrollableQuote
          quote="As Três Graças (Cárites): Aglaia (beleza), Eufrósine (alegria) e Talia (abundância)"
          source="Mitologia Grega"
          explanation="As Graças não eram deusas isoladas; elas dançavam juntas, representando que beleza, alegria e abundância só existem em harmonia. Os 90 dias são a 'dança das Graças' do turnaround: nos primeiros 30 dias, você busca 'beleza' (ordem); nos segundos 30, 'alegria' (previsibilidade); nos últimos 30, 'abundância' (libertação). A lição é que disciplina abre espaço para prosperidade, mas só se as três dançarem juntas."
          type="mythological"
        />
      </ParchmentCard>
    </div>
  </section>
);

const HumanidadeSection: React.FC = () => (
  <section id="humanidade" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        PARTE V
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        HUMANIDADE
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        Além do Financeiro
      </p>
      <SacredDivider icon={Users} />
    </div>

    <div className="space-y-12">
      {/* 5.1 Ser Humano como Sistema */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.1 O Ser Humano Como Sistema
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que tratar a vida como "sistema" funciona melhor que tratar como "vontade"?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>sistemas são previsíveis; vontades são voláteis</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            O ser humano é composto por:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700"><strong>Corpo</strong> (físico, energia, saúde)</li>
            <li className="font-body text-ink-700"><strong>Mente</strong> (pensamento, análise, planejamento)</li>
            <li className="font-body text-ink-700"><strong>Emoção</strong> (sentimento, impulso, conexão)</li>
            <li className="font-body text-ink-700"><strong>Espírito</strong> (propósito, valores, legado)</li>
          </ul>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Quando um desses pilares está desalinhado, o sistema inteiro oscila.
          </p>
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-3">
            🔄 Princípio do Alinhamento Sistêmico
          </h4>
          <p className="font-mono text-sm text-ink-700 bg-ink-50/50 p-3 rounded-sm">
            Estabilidade = Corpo + Mente + Emoção + Espírito em sincronia
          </p>
          <p className="font-body text-ink-700 mt-3">
            Se um falha, os outros compensam — até quebrar.
          </p>
        </div>

        <ScrollableQuote
          quote="E o Deus de paz vos santifique em tudo; e todo o vosso espírito, e alma, e corpo sejam plenamente conservados irrepreensíveis para a vinda de nosso Senhor Jesus Cristo."
          source="1 Tessalonicenses 5:23"
          explanation="Paulo não está separando espírito, alma e corpo como entidades isoladas; está ensinando conservação integrada. 'Irrepreensíveis' (grego: amemptois) significa sem falhas, funcionando perfeitamente. O princípio é que paz não é ausência de problemas; é alinhamento de partes. Quando corpo (exercício), mente (planejamento), emoção (substituição de estímulo) e espírito (propósito) estão alinhados, o sistema funciona. Quando um falha, os outros compensam até exaurir."
          type="biblical"
        />

        <ScrollableQuote
          quote="Atlas: carrega o mundo nos ombros"
          source="Mitologia Grega"
          explanation="Atlas não foi punido por ser forte; foi punido por desequilibrar a ordem cósmica. Ele carrega o céu (não a Terra, como se pensa) para que o cosmos não desabe. Na vida moderna, Atlas é a responsabilidade de manter os pilares em equilíbrio. Quando você negligencia o corpo, a mente compensa com ansiedade. Quando negligencia a emoção, o corpo compensa com doença. Quando negligencia o espírito, a mente compensa com vazio. Atlas ensina que equilíbrio não é passividade; é carga ativa."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.2 Influência e Padrão */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.2 Influência e Padrão: O Poder do Exemplo
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que mudar a si mesmo é mais eficaz que cobrar mudança dos outros?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>seres humanos aprendem por observação, não por discurso</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Crianças, cônjuges, colegas — todos absorvem <Rubric>padrão</Rubric>, não palavra.
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <p className="font-body text-ink-700 mb-2">
              <strong>Se você:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">fala de disciplina mas age por impulso</li>
              <li className="font-body text-sm text-ink-700">prega previsibilidade mas decide sob pressão</li>
              <li className="font-body text-sm text-ink-700">cobra controle mas vive no improviso</li>
            </ul>
            <p className="font-body text-vermillion-700 font-semibold mt-3">
              O sistema inteiro desconfia.
            </p>
          </div>
          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <p className="font-body text-ink-700 mb-2">
              <strong>Mas se você:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">executa antes de explicar</li>
              <li className="font-body text-sm text-ink-700">mostra resultado antes de pedir adesão</li>
              <li className="font-body text-sm text-ink-700">mantém regra mesmo quando ninguém vê</li>
            </ul>
            <p className="font-body text-sage-700 font-semibold mt-3">
              O ambiente muda sozinho.
            </p>
          </div>
        </div>

        <ScrollableQuote
          quote="Seja, porém, o vosso falar: Sim, sim; Não, não. Porque o que passa disto é de procedência maligna."
          source="Mateus 5:37"
          explanation="Jesus não está pregando literalismo; está ensinando coerência entre palavra e ação. 'Sim, sim; Não, não' significa que sua ação deve corresponder exatamente à sua palavra. Quando você diz 'estou em turnaround' mas age com impulso, sua palavra perde valor. Quando sua ação corresponde à sua palavra, você se torna referência, não apenas instrução. O princípio é claro: influência não vem de discurso; vem de padrão vivo."
          type="biblical"
        />

        <ScrollableQuote
          quote="Orfeu: cuja música acalmava até feras"
          source="Mitologia Grega"
          explanation="Orfeu não usava armas ou ordens; usava harmonia. Sua música era tão coerente que até predadores paravam de caçar. Na governança familiar, Orfeu é o pai/mãe que executa o plano com consistência. Quando você treina, estuda, revisa o fluxo, e mantém a regra sem reclamar, você emite uma 'música' de coerência que acalma o ambiente. A família para de resistir não por medo, mas por ressonância com o padrão. Quem vive em ritmo atrai quem quer dançar."
          type="mythological"
        />
      </ParchmentCard>
    </div>
  </section>
);

const ConclusaoSection: React.FC = () => (
  <section id="conclusao" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        EPÍLOGO
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        CONCLUSÃO
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        O Caminho da Liberdade com Governança
      </p>
      <SacredDivider icon={Crown} />
    </div>

    <ParchmentCard className="max-w-4xl mx-auto">
      <ScrollableQuote
        quote="A verdade vos libertará."
        source="João 8:32"
        explanation="Mas a verdade só liberta quem a encara, organiza e age. Este manual não promete enriquecimento rápido, vida sem esforço, felicidade constante. Promete apenas: clareza sobre o que está acontecendo, método para sair do caos, disciplina para não voltar, dignidade para reconstruir."
        type="biblical"
      />

      <div className="mt-8 space-y-6">
        <DropCap letter="O">
          sistema cria o caos para vender conforto. O método conforta porque devolve o controle.
        </DropCap>

        <p className="font-body text-lg text-ink-700 leading-relaxed">
          Não se trata de fugir do mundo, mas de <Rubric>operar dentro dele com governança</Rubric>.
        </p>

        <div className="my-8">
          <h3 className="font-headline text-xl font-bold text-ink-800 mb-4">
            🔄 Resumo Executivo do Método
          </h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">1.</span>
              <span className="font-body text-ink-700">
                <strong>Classifique</strong> tudo como Contrato Essencial, Contrato Ruim ou Custo de Comportamento
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">2.</span>
              <span className="font-body text-ink-700">
                <strong>Elimine</strong> contratos ruins prioritariamente
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">3.</span>
              <span className="font-body text-ink-700">
                <strong>Proteja</strong> contratos essenciais a qualquer custo
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">4.</span>
              <span className="font-body text-ink-700">
                <strong>Registre</strong> custos de comportamento para identificar padrões
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">5.</span>
              <span className="font-body text-ink-700">
                <strong>Projete</strong> fluxo de caixa mês a mês
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">6.</span>
              <span className="font-body text-ink-700">
                <strong>Substitua</strong> estímulos nocivos por construtivos
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">7.</span>
              <span className="font-body text-ink-700">
                <strong>Envolva</strong> a família com transparência, não culpa
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">8.</span>
              <span className="font-body text-ink-700">
                <strong>Mantenha</strong> rotina como proteção neural
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">9.</span>
              <span className="font-body text-ink-700">
                <strong>Revise</strong> a cada 30 dias
              </span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">10.</span>
              <span className="font-body text-ink-700">
                <strong>Celebre</strong> marcos, não apenas resultados finais
              </span>
            </li>
          </ol>
        </div>

        <ScrollableQuote
          quote="Portanto, todo aquele que ouve estas minhas palavras e as pratica será comparado a um homem prudente, que edificou a sua casa sobre a rocha."
          source="Mateus 7:24"
          explanation="'Praticar' (grego: poieō) significa fazer, construir, executar. A rocha não é a ideia; é a execução consistente. A areia é o conhecimento sem prática. O método só vira liberdade quando sai do papel e entra na rotina. Praticar > ouvir. Método > motivação. Previsibilidade > sorte."
          type="biblical"
        />

        <ScrollableQuote
          quote="Teseu: saiu do labirinto com o fio de Ariadne"
          source="Mitologia Grega"
          explanation="O labirinto é o caos financeiro e comportamental. O Minotauro é o impulso que devora. O fio de Ariadne é o método registrado: o diário, a planilha, a regra, o contrato. Teseu não saiu por força; saiu por seguir o fio. O fio não é a saída; é o que permite encontrar a saída. Método não é destino; é direção."
          type="mythological"
        />

        <div className="mt-12 text-center p-8 bg-gradient-to-br from-gold-100/30 to-vermillion-50/30 rounded-sm border-2 border-gold-600/40">
          <p className="font-title text-2xl text-ink-800 italic mb-6">
            "Não é sobre ter mais.
            <br />
            É sobre ser livre.
            <br />
            E liberdade vem de previsibilidade,
            <br />
            não de sorte."
          </p>
          <div className="flex justify-center">
            <WaxSeal size="md">
              <Compass className="w-8 h-8 text-parchment-100" />
            </WaxSeal>
          </div>
        </div>
      </div>
    </ParchmentCard>
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
            <FundamentosSection />
            <MetodoSection />
            <ComportamentoSection />
            <SistemaSection />
            <HumanidadeSection />
            <ConclusaoSection />
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