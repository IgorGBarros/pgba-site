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
        </div>

        <ScrollableQuote
          quote="Tudo me é permitido, mas nem tudo convém. Tudo me é permitido, mas eu não me deixarei dominar por nada."
          source="1 Coríntios 6:12"
          explanation="Paulo não está pregando restrição por restrição. Ele está ensinando governança pessoal. A liberdade absoluta sem governança vira escravidão química. Autonomia sem disciplina é dependência disfarçada."
          type="biblical"
        />

        <ScrollableQuote
          quote="Sísifo: condenado a empurrar uma pedra montanha acima para sempre"
          source="Mitologia Grega"
          explanation="Sísifo representa o ciclo de esforço sem conclusão. Muitas pessoas vivem o ciclo de Sísifo financeiro: ganham → gastam → se endividam → tentam recuperar → repetem. Sem método, o ciclo se repete eternamente. Esforço sem sistema é apenas movimento."
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
            Porque usam intensamente o <Rubric>córtex pré-frontal</Rubric> (planejamento, análise, controle), que consome muita energia mental. Quando esse sistema cansa, o cérebro busca recompensa rápida.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Isso não é fraqueza. É <Rubric>sobrecarga cognitiva</Rubric>.
          </p>
        </div>

        <ScrollableQuote
          quote="Melhor é o longânimo do que o herói da guerra, e o que domina o seu espírito do que o que toma uma cidade."
          source="Provérbios 16:32"
          explanation="Salomão reconheceu que a conquista externa é mais fácil que a conquista interna. Pessoas inteligentes conquistam 'cidades' (projetos, metas), mas falham em dominar o 'espírito' (impulso, ansiedade, dopamina). Inteligência sem autodomínio é vulnerabilidade disfarçada."
          type="biblical"
        />

        <ScrollableQuote
          quote="Ulisses e as Sereias: Ulisses sabia que o canto das sereias era irresistível"
          source="Mitologia Grega"
          explanation="Ulisses não confiou em sua força de vontade. Ele ordenou que os marinheiros tampassem os ouvidos com cera e o amarrassem ao mastro. Esta é a gestão de impulso por design, não por força de vontade. A sabedoria não é resistir à tentação; é projetar um ambiente onde a tentação não possa chegar."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.3 Rotina */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.3 Por que a rotina acalma o cérebro?
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>previsibilidade reduz incerteza</Rubric>, e incerteza é o maior gatilho de ansiedade. Quando você estabelece horário fixo, tarefa clara, regra definida e plano visível, o sistema de alerta diminui.
          </p>
        </div>

        <ScrollableQuote
          quote="Façam tudo com decência e ordem."
          source="1 Coríntios 14:40"
          explanation="Paulo ensina que ordem é pré-requisito para paz. A palavra grega 'taxis' significa organização militar. Decência e ordem não são virtudes morais; são ferramentas de sobrevivência neural."
          type="biblical"
        />

        <ScrollableQuote
          quote="Héstia: deusa do lar e da ordem"
          source="Mitologia Grega"
          explanation="Héstia representava o centro, a estabilidade, o fogo que nunca se apagava. Na vida moderna, Héstia é a rotina inegociável. Ordem não é rigidez; é proteção neural."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.4 Sal e Açúcar */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.4 O Papel do Sal e do Açúcar na Regulação Cerebral
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que a alimentação moderna (sal refinado e açúcar) impacta tanto a clareza mental, a ansiedade e a tomada de decisão?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque o cérebro não opera no vácuo. Ele depende de <Rubric>estabilidade bioquímica</Rubric> para tomar decisões racionais. Sal e açúcar são os dois pilares dessa regulação, mas o mundo moderno os transformou em armas de desestabilização comportamental.
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <h5 className="font-headline font-bold text-ink-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🧂</span> O Sal (Eletrólitos)
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Cérebro depende de sódio, potássio e magnésio</li>
              <li className="font-body text-sm text-ink-700">Sal integral sustenta hidratação e transmissão nervosa</li>
              <li className="font-body text-sm text-ink-700">Sal refinado causa fadiga e névoa mental</li>
              <li className="font-body text-sm text-ink-700">Soldados romanos recebiam sal como <em>salarium</em></li>
            </ul>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <h5 className="font-headline font-bold text-ink-800 mb-2 flex items-center gap-2">
              <span className="text-xl">🍬</span> O Açúcar (Dopamina)
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Pico glicêmico → insulina → queda brusca</li>
              <li className="font-body text-sm text-ink-700">Ativa sistema de recompensa intermitente</li>
              <li className="font-body text-sm text-ink-700">Cérebro em queda ativa cortisol</li>
              <li className="font-body text-sm text-ink-700">Reduz capacidade do pré-frontal de planejar</li>
            </ul>
          </div>
        </div>

        <div className="my-8 p-6 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
          <p className="font-title text-xl text-ink-800 italic">
            <strong className="text-vermillion-700">Conexão com o Método:</strong>
            <br />
            Cérebro desregulado = decisão sob estresse = contrato ruim.
            Estabilidade nutricional não é estética. É <strong>infraestrutura cognitiva</strong>.
          </p>
        </div>

        <ScrollableQuote
          quote="Vós sois o sal da terra; e se o sal for insípido, com que se há de salgar?"
          source="Mateus 5:13"
          explanation="O sal simboliza preservação e clareza. Assim como o sal conserva e dá sabor, a estabilidade bioquímica conserva a mente e dá clareza à decisão. Sem 'sal' (equilíbrio), a vida perde consistência e vira caos."
          type="biblical"
        />

        <ScrollableQuote
          quote="Néctar e Ambrosia vs. Fruto Proibido"
          source="Mitologia Grega"
          explanation="Os deuses consumiam néctar e ambrosia para manter imortalidade e clareza. O 'fruto proibido' representa o pico rápido que traz conhecimento ilusório e queda. O açúcar refinado moderno é o 'fruto' comportamental: dá pico rápido, mas drena energia de longo prazo. Sustento lento constrói; pico rápido destrói."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.5 Sono Bifásico */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.5 O Sono Bifásico e a Regulação do Ritmo Natural
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que o padrão de sono moderno (8 horas contínuas) pode estar prejudicando seu controle financeiro e comportamental?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque o sono bifásico era o padrão natural da humanidade por milênios: duas fases de sono separadas por 1–2 horas de vigília tranquila. A revolução industrial impôs o sono monofásico, desregulando o ritmo circadiano natural.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Sem esse período de vigília noturna, o cérebro perde tempo de processamento emocional e estratégico. O resultado: <Rubric>decisões mais impulsivas, menor tolerância à frustração e busca por recompensa rápida</Rubric>.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            O sono não é "desligar". É <Rubric>reorganizar</Rubric>. E reorganização exige ritmo, não rigidez artificial.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🧠 Neurociência Aplicada
          </h4>
          <ul className="list-disc list-inside space-y-2">
            <li className="font-body text-ink-700"><strong>Ritmo circadiano:</strong> regulado pela luz, temperatura e rotina. Luz artificial noturna suprime melatonina.</li>
            <li className="font-body text-ink-700"><strong>Vigília noturna natural:</strong> associada a aumento de prolactina e ocitocina, favorecendo reflexão e planejamento.</li>
            <li className="font-body text-ink-700"><strong>Córtex pré-frontal:</strong> depende de sono consolidado. Sono irregular = córtex offline = impulsividade alta.</li>
            <li className="font-body text-ink-700"><strong>Eixo HPA (estresse):</strong> sono bifásico reduz cortisol matinal e estabiliza resposta ao estresse financeiro.</li>
          </ul>
        </div>

        <ScrollableQuote
          quote="Em paz me deito e logo pego no sono, pois só tu, Senhor, me fazes repousar seguro."
          source="Salmos 4:8"
          explanation="A Bíblia reconhece a vigília como momento de clareza. O descanso é ordem divina, mas a vigília noturna era usada para oração, reflexão e planejamento. Quem dorme com pressa, acorda com ansiedade. Quem descansa com ritmo, executa com clareza."
          type="biblical"
        />

        <ScrollableQuote
          quote="Hipnos e Morfeu"
          source="Mitologia Grega"
          explanation="Hipnos personificava o sono como passagem, não como fim. Morfeu moldava os sonhos, simbolizando a reorganização simbólica do que foi vivido. A vigília entre os dois sonos era o momento em que o guerreiro revisava decisões e preparava o dia seguinte. O sono monofásico forçado pela indústria quebrou esse ciclo. Descanso com propósito, vigília com direção."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.6 Ambiente */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.6 Fatores Ambientais e Comportamentais Ocultos
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque o cérebro é um órgão de previsão que economiza energia adaptando-se ao contexto imediato. Fatores ocultos — iluminação, temperatura, ruído, organização espacial — alteram a carga cognitiva antes da consciência perceber.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Ambiente caótico gera cortisol elevado, ativa o sistema límbico e dispara decisões impulsivas. Ambiente estruturado reduz ruído mental, libera o córtex pré-frontal e permite governança.
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h5 className="font-headline font-bold text-vermillion-800 mb-2">❌ Ambiente Caótico</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Bagunça visual</li>
              <li className="font-body text-sm text-ink-700">Notificações constantes</li>
              <li className="font-body text-sm text-ink-700">Interrupções frequentes</li>
              <li className="font-body text-sm text-ink-700">Consome até 25% da capacidade executiva</li>
            </ul>
          </div>
          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h5 className="font-headline font-bold text-sage-800 mb-2">✅ Ambiente Estruturado</h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Rotina previsível</li>
              <li className="font-body text-sm text-ink-700">Zonas livres de estímulo</li>
              <li className="font-body text-sm text-ink-700">Limpeza de estímulos diária</li>
              <li className="font-body text-sm text-ink-700">Espaço limpo = mente limpa</li>
            </ul>
          </div>
        </div>

        <ScrollableQuote
          quote="O prudente vê o mal e se esconde; mas os simples passam adiante e sofrem a pena."
          source="Provérbios 22:3"
          explanation="Prudência bíblica não é medo; é proteção ambiental. O sábio não confia na força interior para resistir ao caos; ele se posiciona longe dele. No turnaround, isso se traduz em: remover gatilhos, organizar o espaço de trabalho, isolar contas e criar zonas livres de estímulo rápido. Quem controla o ambiente, controla a decisão."
          type="biblical"
        />

        <ScrollableQuote
          quote="Teseu e o Labirinto"
          source="Mitologia Grega"
          explanation="O labirinto não era apenas um lugar; era um ambiente projetado para confundir, isolar e drenar energia. Teseu só saiu porque levou o fio (método) e respeitou a estrutura. O ambiente moderno é um labirinto de notificações, promoções e crédito fácil. Sem fio (regras claras, ambiente limpo, limites visuais), a pessoa se perde. Método sem ambiente é esforço desperdiçado."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.7 Sol da Manhã */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.7 Sol da Manhã vs. Sol do Meio-Dia
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Ambos têm funções biológicas distintas e complementares. O sol da manhã (6h–10h) sincroniza o relógio circadiano, reduz cortisol basal e prepara o cérebro para foco. O sol do meio-dia (10h–14h) entrega pico de UVB para síntese de Vitamina D3 e produção de serotonina.
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gold-50/30 rounded-sm border border-gold-600/30">
            <h5 className="font-headline font-bold text-gold-800 mb-2 flex items-center gap-2">
              <Sun className="w-5 h-5" /> Sol da Manhã (6h-10h)
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Sincroniza ritmo circadiano</li>
              <li className="font-body text-sm text-ink-700">Reduz cortisol basal</li>
              <li className="font-body text-sm text-ink-700">Inibe melatonina</li>
              <li className="font-body text-sm text-ink-700">Prepara para foco e clareza</li>
              <li className="font-body text-sm text-ink-700">15-20 min ao acordar</li>
            </ul>
          </div>
          <div className="p-4 bg-gold-50/30 rounded-sm border border-gold-600/30">
            <h5 className="font-headline font-bold text-gold-800 mb-2 flex items-center gap-2">
              <Sun className="w-5 h-5" /> Sol do Meio-Dia (10h-14h)
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li className="font-body text-sm text-ink-700">Pico de UVB</li>
              <li className="font-body text-sm text-ink-700">Síntese de Vitamina D3</li>
              <li className="font-body text-sm text-ink-700">Modulação imunológica</li>
              <li className="font-body text-sm text-ink-700">Produção de serotonina</li>
              <li className="font-body text-sm text-ink-700">10-15 min com pele exposta</li>
            </ul>
          </div>
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <p className="font-title text-xl text-ink-800 italic">
            <strong className="text-vermillion-700">Regra Prática:</strong>
            <br />
            Sol {'>'} café da manhã{'>'} tela. A ordem importa.
            Luz natural primeiro, estímulo digital depois.
          </p>
        </div>

        <ScrollableQuote
          quote="E disse Deus: Haja luz. E houve luz."
          source="Gênesis 1:3"
          explanation="A luz na tradição judaico-cristã simboliza ordem, clareza e proteção. Não é apenas física; é estrutural. Quem caminha na luz (rotina matinal, exposição natural, ritmo biológico respeitado) opera com base sólida. Quem ignora a luz (noite artificial, telas, desregulação) vive em névoa cognitiva."
          type="biblical"
        />

        <ScrollableQuote
          quote="Hélio e Apolo"
          source="Mitologia Grega"
          explanation="Hélio conduzia a carruagem do sol, trazendo ordem ao caos noturno. Apolo, deus da luz e da razão, representava clareza, medida e limite. O sol não é apenas energia; é ritmo cósmico. Quando a pessoa se alinha a esse ritmo, o cérebro deixa de lutar contra a biologia e passa a operar em sincronia."
          type="mythological"
        />
      </ParchmentCard>

      {/* 1.8 Cobre e Cerâmica */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          1.8 O Cobre, a Cerâmica e a Regulação Mineral
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-vermillion-700 mb-2">
            ❓ Pergunta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Por que a transição de utensílios de cobre/cerâmica para aço inox, alumínio e antiaderentes impacta sua clareza mental e estabilidade emocional?
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            O cérebro não opera apenas com calorias; opera com <Rubric>minerais traço</Rubric>. O cobre é cofator essencial para enzimas que sintetizam dopamina e noradrenalina, produzem energia mitocondrial (ATP) e formam a bainha de mielina.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            A industrialização da cozinha substituiu materiais que liberavam minerais passivos por materiais inertes ou tóxicos. O resultado é uma deficiência silenciosa: névoa mental, fadiga crônica, irritabilidade e busca por estímulos rápidos.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🧪 Bioquímica e Neurociência Aplicada
          </h4>
          <ul className="list-disc list-inside space-y-2">
            <li className="font-body text-ink-700"><strong>Síntese de Neurotransmissores:</strong> Cobre é cofator da tirosina hidroxilase e dopamina beta-hidroxilase.</li>
            <li className="font-body text-ink-700"><strong>Produção de Energia:</strong> Atua na citocromo c oxidase, enzima chave da cadeia respiratória mitocondrial.</li>
            <li className="font-body text-ink-700"><strong>Defesa Antioxidante:</strong> Componente da superóxido dismutase (SOD).</li>
            <li className="font-body text-ink-700"><strong>Mielina e Estrutura Neural:</strong> Essencial para lisil oxidase.</li>
          </ul>
        </div>

        <ScrollableQuote
          quote="Ele se assentará como refinador e purificador de prata; purificará os filhos de Levi e os refinará como ouro e como prata."
          source="Malaquias 3:3"
          explanation="A metáfora bíblica do refinamento não é apenas espiritual; é estrutural. Assim como o fogo remove impurezas do metal para torná-lo condutor e resistente, a eliminação de toxinas ambientais e a reintrodução de minerais essenciais 'purificam' a infraestrutura biológica. Um cérebro bem mineralizado conduz sinais com clareza; um cérebro deficiente opera com ruído e curto-circuito emocional."
          type="biblical"
        />

        <ScrollableQuote
          quote="A Idade do Cobre e o Fogo de Hefesto"
          source="Mitologia Grega"
          explanation="O cobre foi o primeiro metal trabalhado em larga escala pela humanidade. Sua condutividade térmica e elétrica permitiu avanços tecnológicos que exigiam precisão. Na mitologia, Hefesto/Vulcano forjava armas e ferramentas que amplificavam a capacidade humana. A cozinha moderna trocou o cobre/cerâmica (que regulam e conduzem) por aço frio e teflon (que isolam e acumulam toxinas). Perdemos a regulação passiva e ganhamos inflamação silenciosa."
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
          explanation="Jesus ensina gestão de risco. 'Assentar-se primeiro' é a fase de contenção e planejamento. 'Calcular as despesas' é o mapeamento de contratos e passivos. Iniciar sem cálculo é arrogância; calcular antes é sabedoria."
          type="biblical"
        />
      </ParchmentCard>

      {/* 2.2 Classificação de Contratos */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          2.2 Classificação de Contratos: O Coração do Método
        </h3>
        
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
          quote="Examinai tudo. Retende o bem."
          source="1 Tessalonicenses 5:21"
          explanation="'Examinai tudo' (grego: dokimazete panta) significa testar, provar, validar antes de aceitar. No contexto financeiro, isso é a triagem de contratos. Não aceite gastos por inércia; examine, classifique, e só então retenha o que é essencial."
          type="biblical"
        />
      </ParchmentCard>

      {/* 2.3 Previsibilidade */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          2.3 A Regra de Ouro da Previsibilidade
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>renda alta sem previsibilidade gera caos</Rubric>.
          </p>
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-3">
            🔄 Fórmula da Previsibilidade
          </h4>
          <p className="font-mono text-sm text-ink-700 bg-ink-50/50 p-3 rounded-sm">
            Previsibilidade = (Receita Conhecida) - (Despesas Mapeadas) - (Contratos Classificados)
          </p>
        </div>

        <ScrollableQuote
          quote="Os planos do diligente tendem à abundância; mas todo apressado, à pobreza."
          source="Provérbios 21:5"
          explanation="'Diligente' (hebraico: charuts) significa alguém que corta, que é preciso, que planeja com exatidão. 'Apressado' (hebraico: ats) significa alguém que corre sem olhar, que age por impulso. Abundância não vem de velocidade; vem de precisão."
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
            {[
              'Estresse ou tédio → busca por estímulo',
              'Operação/decisão rápida → ganho pequeno',
              'Dopamina libera → "eu consigo!"',
              'Nova operação → risco maior',
              'Perda → frustração',
              'Tentativa de recuperar → perda maior',
              'Culpa → mais estresse → volta ao passo 1'
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
                <span className="font-headline font-bold text-vermillion-700">{idx + 1}.</span>
                <span className="font-body text-ink-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <ScrollableQuote
          quote="Ícaro: voou perto demais do sol"
          source="Mitologia Grega"
          explanation="Ícaro ganhou asas de cera e começou a voar. Seu pai, Dédalo, avisou: 'Não voe muito alto, nem muito baixo.' O ciclo dopaminérgico é Ícaro financeiro: o primeiro ganho gera euforia, a euforia gera mais risco, o risco gera queda. Sucesso inicial sem estrutura é convite para a queda."
          type="mythological"
        />
      </ParchmentCard>

      {/* 3.2 Substituição de Estímulo */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          3.2 Substituição de Estímulo: A Chave da Mudança
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Não elimine o estímulo. <Rubric>Substitua a fonte</Rubric>.
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
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Estímulo Nocivo</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Substituição Saudável</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Por que funciona</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">Trade / apostas</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">Exercício físico</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Libera dopamina + endorfina sem risco financeiro</td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">Scroll infinito</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">Leitura focada / estudo técnico</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Estímulo cognitivo com progresso real</td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">Compras impulsivas</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">Construir algo (projeto, sistema, habilidade)</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Sensação de conquista duradoura</td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">Decisão sob ansiedade</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">Registrar + esperar 24h + revisar com regra</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Ativa o pré-frontal antes do impulso</td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-vermillion-700">Tela excessiva</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-sage-700">Música instrumental / ambiente controlado</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Regula emoção sem superestimular</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollableQuote
          quote="Prometeu: trouxe o fogo aos humanos"
          source="Mitologia Grega"
          explanation="Prometeu roubou o fogo dos deuses e deu aos humanos. O fogo pode cozinhar ou queimar, aquecer ou destruir. O estímulo (dopamina) é o fogo moderno. Direcionado para construção, aquece e ilumina. Direcionado para destruição, queima. O problema não é a energia; é a direção."
          type="mythological"
        />
      </ParchmentCard>

      {/* 3.3 Família */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          3.3 O Papel da Família no Turnaround
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Com <Rubric>transparência, não dramatismo</Rubric>.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Protocolo de Governança Familiar
          </h4>
          <ol className="space-y-3">
            {[
              'Comunicação clara: "Estamos em modo de reorganização por X meses"',
              'Regras visíveis: o que pode, o que não pode, por quê',
              'Participação leve: crianças podem ter pequenas responsabilidades',
              'Exemplo antes de discurso: pais executando o plano primeiro',
              'Celebração de marcos: reconhecer progresso, não apenas resultado final'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
                <span className="font-headline font-bold text-gold-700">{idx + 1}.</span>
                <span className="font-body text-ink-700">{item}</span>
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
              <h5 className="font-headline font-bold text-ink-800 mb-2">Módulo 1: Receitas</h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Fixas (salário, renda recorrente)</li>
                <li className="font-body text-sm text-ink-700">Variáveis previsíveis (13º, férias, restituição)</li>
                <li className="font-body text-sm text-ink-700">Extraordinárias → <strong className="text-vermillion-700">não contar como base</strong></li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">Módulo 2: Contratos</h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Essenciais</li>
                <li className="font-body text-sm text-ink-700">Financeiros</li>
                <li className="font-body text-sm text-ink-700">Ruins (a eliminar)</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">Módulo 3: Fluxo de Caixa</h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Projeção mensal</li>
                <li className="font-body text-sm text-ink-700">Projeção trimestral</li>
                <li className="font-body text-sm text-ink-700">Alertas de risco</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
              <h5 className="font-headline font-bold text-ink-800 mb-2">Módulo 4: Comportamento</h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Registro de custos</li>
                <li className="font-body text-sm text-ink-700">Gatilhos identificados</li>
                <li className="font-body text-sm text-ink-700">Substituições aplicadas</li>
              </ul>
            </div>
            <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20 md:col-span-2">
              <h5 className="font-headline font-bold text-ink-800 mb-2">Módulo 5: Metas e Marcos</h5>
              <ul className="list-disc list-inside space-y-1">
                <li className="font-body text-sm text-ink-700">Curto prazo (30 dias): parar sangria</li>
                <li className="font-body text-sm text-ink-700">Médio prazo (90 dias): estabilizar</li>
                <li className="font-body text-sm text-ink-700">Longo prazo (180+ dias): reconstruir</li>
              </ul>
            </div>
          </div>
        </div>

        <ScrollableQuote
          quote="Hefesto: o ferreiro divino"
          source="Mitologia Grega"
          explanation="Hefesto era o único deus que trabalhava com as mãos. Ele construía armas, ferramentas, redes e autômatos. O ERP pessoal é a 'forja' moderna: onde você transforma dados brutos em ferramentas de decisão. Sistemas bem feitos libertam; sistemas mal feitos aprisionam."
          type="mythological"
        />
      </ParchmentCard>

      {/* 4.2 Regra dos 90 Dias */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          4.2 A Regra dos 90 Dias
        </h3>
        
        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🔄 Cronograma dos 90 Dias
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gold-100/30">
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Período</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Foco</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Indicador de Sucesso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Dias 1-30</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Contenção</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Nenhuma nova dívida criada</td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Dias 31-60</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Estabilização</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Fluxo de caixa projetado com precisão</td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Dias 61-90</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Reconstrução</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Primeiro contrato ruim eliminado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollableQuote
          quote="As Três Graças (Cárites): Aglaia (beleza), Eufrósine (alegria) e Talia (abundância)"
          source="Mitologia Grega"
          explanation="As Graças dançavam juntas, representando que beleza, alegria e abundância só existem em harmonia. Os 90 dias são a 'dança das Graças' do turnaround: nos primeiros 30 dias, você busca 'beleza' (ordem); nos segundos 30, 'alegria' (previsibilidade); nos últimos 30, 'abundância' (libertação)."
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
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-3">
            🔄 Princípio do Alinhamento Sistêmico
          </h4>
          <p className="font-mono text-sm text-ink-700 bg-ink-50/50 p-3 rounded-sm">
            Estabilidade = Corpo + Mente + Emoção + Espírito em sincronia
          </p>
        </div>

        <ScrollableQuote
          quote="Atlas: carrega o mundo nos ombros"
          source="Mitologia Grega"
          explanation="Atlas carrega o céu para que o cosmos não desabe. Na vida moderna, Atlas é a responsabilidade de manter os pilares em equilíbrio. Quando você negligencia o corpo, a mente compensa com ansiedade. Quando negligencia a emoção, o corpo compensa com doença. Equilíbrio não é passividade; é carga ativa."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.2 Influência e Padrão */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.2 Influência e Padrão: O Poder do Exemplo
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque <Rubric>seres humanos aprendem por observação, não por discurso</Rubric>.
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
          quote="Orfeu: cuja música acalmava até feras"
          source="Mitologia Grega"
          explanation="Orfeu não usava armas ou ordens; usava harmonia. Sua música era tão coerente que até predadores paravam de caçar. Na governança familiar, Orfeu é o pai/mãe que executa o plano com consistência. Quem vive em ritmo atrai quem quer dançar."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.3 Modelo Prussiano */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.3 O Modelo Prussiano e a Transição Pós-Cognitiva
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            A educação formal herdou o <Rubric>modelo prussiano</Rubric> (séculos XVIII/XIX), criado para produzir operadores padronizados, não soberanos. Foca em obediência, memorização e separação rígida entre teoria e prática.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            O modelo pós-cognitivo foca em:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
            <li className="font-body text-ink-700"><strong>Metacognição:</strong> pensar sobre o próprio pensamento</li>
            <li className="font-body text-ink-700"><strong>Governança interna:</strong> criar regras e sistemas pessoais</li>
            <li className="font-body text-ink-700"><strong>Execução sistêmica:</strong> transformar informação em rotina</li>
            <li className="font-body text-ink-700"><strong>Autonomia regulada:</strong> não depender de cobrança externa</li>
          </ul>
        </div>

        <ScrollableQuote
          quote="Dédalo e o Labirinto"
          source="Mitologia Grega"
          explanation="Dédalo construiu o labirinto, mas quem sobreviveu foi o herói que seguiu o fio. A faculdade ensina a construir a engrenagem (o labirinto); o método ensina a sair dele. Técnica sem método é prisão elegante."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.4 Estrutura Econômica */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.4 A Estrutura Econômica: 95%, 5% e &lt;1%
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            O sistema é piramidal por design funcional:
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-parchment-200/50 rounded-sm border-l-4 border-parchment-600">
            <h5 className="font-headline font-bold text-ink-800 mb-2 text-2xl">95%</h5>
            <p className="font-body text-sm text-ink-700">
              Operam no modo reação. Gastam, trabalham, pagam juros, buscam conforto imediato. São a base de sustentação do consumo e da dívida.
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border-l-4 border-gold-600">
            <h5 className="font-headline font-bold text-ink-800 mb-2 text-2xl">5%</h5>
            <p className="font-body text-sm text-ink-700">
              Tentam sair do padrão. Estudam, buscam renda extra, investem, mas muitas vezes falham por falta de método ou excesso de estímulo.
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border-l-4 border-sage-600">
            <h5 className="font-headline font-bold text-ink-800 mb-2 text-2xl">&lt;1%</h5>
            <p className="font-body text-sm text-ink-700">
              Operam com governança. Constroem sistemas, priorizam previsibilidade, eliminam contratos ruins e usam a estrutura a seu favor.
            </p>
          </div>
        </div>

        <ScrollableQuote
          quote="As Moiras (Três Fates): Cloto fia, Láquesis mede, Átropos corta"
          source="Mitologia Grega"
          explanation="Representam que o destino não é aleatório; é medida + corte. Os 95% não medem, só fiam e gastam. Os <1% medem o fio, cortam o excesso, e constroem tecido durável. Destino é a consequência da governança aplicada ao tempo."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.5 Datas Comemorativas */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.5 Datas Comemorativas e Estímulos Coletivos
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque são <Rubric>picos de dopamina coletiva</Rubric> disfarçados de cultura, pertencimento e celebração. O sistema cria o caos emocional para vender consumo imediato.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            A regra é clara: <Rubric>o evento é opcional; a previsão é obrigatória</Rubric>.
          </p>
        </div>

        <ScrollableQuote
          quote="Dionísio e as Mênades"
          source="Mitologia Grega"
          explanation="Dionísio representava o êxtase coletivo, a perda de controle racional em nome do prazer e da união tribal. As Mênades dançavam até a exaustão, perdendo a noção de realidade. A Copa e o Carnaval modernos são rituais dionisíacos: coletividade emocional que anula previsão individual. O método é a lira de Apolo: ritmo, medida e ordem que acalmam o caos."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.6 Reino vs Religião */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.6 Reino vs. Religião e a Aliança com o Poder
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Religião busca <Rubric>conforto, estrutura e influência</Rubric>. Alinha-se à política para gerir massas. Oferece consolo no caos, mas raramente exige método para sair dele.
          </p>
          <p className="font-body text-lg text-ink-700 leading-relaxed mt-4">
            Reino (ou sabedoria estrutural) exige <Rubric>prestação de contas, governança e método</Rubric>. Não oferece atalhos emocionais; oferece regras inegociáveis.
          </p>
        </div>

        <ScrollableQuote
          quote="Prometeu vs. Zeus"
          source="Mitologia Grega"
          explanation="Zeus mantinha o fogo (conhecimento/verdade) preso aos deuses, oferecendo rituais e obediência em troca de segurança. Prometeu roubou o fogo e deu aos humanos, exigindo que eles usassem a razão para construir civilização. Religião institucional é o modelo de Zeus (controle + consolo); o método é o modelo de Prometeu (verdade + responsabilidade). Só o fogo bem governado aquece; mal governado, queima a casa."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.7 Tríade da Transformação */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.7 A Tríade da Transformação
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Eles formam um <Rubric>ciclo de governança</Rubric> onde cada elemento sustenta o próximo:
          </p>
        </div>

        <div className="my-8 p-6 bg-parchment-200/50 rounded-sm border border-gold-600/30">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-3">
            🔄 O Ciclo da Transformação
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Método', 'Comportamento', 'Padrão', 'Previsibilidade', 'Influência'].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="px-4 py-2 bg-gradient-to-br from-vermillion-700 to-vermillion-800 text-parchment-100 font-headline font-bold rounded-sm">
                  {item}
                </div>
                {idx < arr.length - 1 && <ArrowRight className="w-5 h-5 text-gold-500" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <ScrollableQuote
          quote="Hermes: mensageiro dos deuses"
          source="Mitologia Grega"
          explanation="Hermes não criava as leis; ele as transmitia com clareza. Ele era o 'elo' entre o divino (método) e o humano (comportamento). Na vida moderna, Hermes é a comunicação do padrão: quando você mostra à família 'como fazemos as coisas aqui', você está sendo Hermes. Previsibilidade só vira influência quando é comunicada com clareza."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.8 Consciência e Intuição */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.8 Exploração de Fenômenos da Consciência e Intuição
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Intuição <Rubric>não é mística</Rubric>; é reconhecimento acelerado de padrões pelo cérebro, baseado em experiência prévia e processamento inconsciente. Impulso é reação química à dopamina ou cortisol. Consciência é a capacidade de pausar, observar e escolher com base em regras, não em reação.
          </p>
        </div>

        <div className="my-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h5 className="font-headline font-bold text-sage-800 mb-2">Intuição</h5>
            <p className="font-body text-sm text-ink-700">Reconhecimento de padrões. Calma, clareza, "faz sentido no plano". Gera estabilidade.</p>
          </div>
          <div className="p-4 bg-gold-50/30 rounded-sm border-l-4 border-gold-600">
            <h5 className="font-headline font-bold text-gold-800 mb-2">Consciência</h5>
            <p className="font-body text-sm text-ink-700">Capacidade de pausar, observar e escolher com base em regras. Filtra a intuição.</p>
          </div>
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h5 className="font-headline font-bold text-vermillion-800 mb-2">Impulso</h5>
            <p className="font-body text-sm text-ink-700">Reação química. Urgência, ansiedade, "preciso agora". Gera arrependimento.</p>
          </div>
        </div>

        <ScrollableQuote
          quote="Apolo vs. Dionísio"
          source="Mitologia Grega"
          explanation="Apolo representa a luz da razão, a medida, o limite claro e a consciência ordenada. Dionísio representa o êxtase, a dissolução do ego, o impulso puro e a perda de controle. A intuição saudável é apolínea: vê o padrão e age com medida. O impulso é dionisíaco: sente a urgência e age sem freio. O método de turnaround exige que o usuário convide Apolo para o conselho, mantendo Dionísio longe das decisões financeiras."
          type="mythological"
        />
      </ParchmentCard>

      {/* 5.9 Cinema */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6">
          5.9 O Cinema como Espelho Codificado
        </h3>
        
        <div className="mb-6">
          <h4 className="font-headline text-lg font-bold text-sage-700 mb-2">
            ✅ Resposta
          </h4>
          <p className="font-body text-lg text-ink-700 leading-relaxed">
            Porque a verdade direta é frequentemente rejeitada pela mente em modo defensivo. A verdade codificada em enigmas, metáforas e narrativas exige <Rubric>decifração ativa</Rubric>, e é exatamente isso que gera transformação real.
          </p>
        </div>

        <div className="my-8">
          <h4 className="font-headline text-lg font-bold text-ink-800 mb-4">
            🎬 Exemplos Clássicos e sua Leitura Comportamental
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gold-100/30">
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Filme</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Enigma/Símbolo</th>
                  <th className="border border-gold-600/30 p-3 text-left font-headline text-sm text-ink-800">Verdade Codificada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-800"><strong>Matrix</strong></td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Pílula vermelha vs. azul</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A ilusão do conforto vs. a dor da realidade. O sistema (Matrix) é o ciclo dopaminérgico financeiro.</td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-800"><strong>O Show de Truman</strong></td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">O cenário controlado</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A vida roteirizada por expectativas alheias, crédito fácil e consumo automático.</td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-800"><strong>Clube da Luta</strong></td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A explosão dos prédios</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A destruição do consumismo como identidade. A busca por significado real além do status.</td>
                </tr>
                <tr className="bg-parchment-100/30">
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-800"><strong>A Origem</strong></td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">O pião girando</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A fronteira entre ilusão e realidade. A decisão de acreditar no que se constrói, não no que se sonha.</td>
                </tr>
                <tr>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-800"><strong>Chegada</strong></td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">Linguagem não linear</td>
                  <td className="border border-gold-600/30 p-3 font-body text-sm text-ink-700">A percepção do tempo e das consequências. Aceitar o fim para construir o meio com propósito.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollableQuote
          quote="O Enigma da Esfinge"
          source="Mitologia Grega"
          explanation="A Esfinge só deixava passar quem decifrasse seu enigma. Quem errava era devorado. Na vida financeira moderna, a 'Esfinge' é o sistema de crédito, dopamina e consumo imediato. Quem não decifra o padrão (contratos, juros, comportamento), é 'devorado' pela dívida e pela ansiedade. Quem decifra, atravessa para o outro lado: autonomia."
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
            {[
              'Classifique tudo como Contrato Essencial, Contrato Ruim ou Custo de Comportamento',
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
              <li key={idx} className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
                <span className="font-headline font-bold text-vermillion-700">{idx + 1}.</span>
                <span className="font-body text-ink-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>

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
// ANEXOS
// ============================================

const AnexosSection: React.FC = () => (
  <section id="anexos" className="scroll-mt-20">
    <div className="text-center mb-12">
      <p className="font-headline text-sm text-gold-500 tracking-[0.3em] mb-4">
        FERRAMENTAS PRÁTICAS
      </p>
      <h2 className="font-display text-4xl font-bold text-parchment-200 mb-4">
        ANEXOS
      </h2>
      <p className="font-title text-xl text-gold-500 italic mb-4">
        Genéricos e Replicáveis
      </p>
      <SacredDivider icon={FileText} />
    </div>

    <div className="space-y-12">
      {/* Anexo A */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-gold-700" />
          Anexo A: Checklist de Classificação de Gastos
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <p className="font-body text-ink-700">
              <span className="font-headline font-bold text-sage-700">[ ]</span> Este gasto mantém minha operação de vida funcionando? → <span className="text-sage-700 font-bold">Essencial</span>
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <p className="font-body text-ink-700">
              <span className="font-headline font-bold text-vermillion-700">[ ]</span> Este gasto tem juros altos ou prazo indefinido? → <span className="text-vermillion-700 font-bold">Ruim</span>
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <p className="font-body text-ink-700">
              <span className="font-headline font-bold text-gold-700">[ ]</span> Este gasto foi feito por impulso, estresse ou busca de alívio? → <span className="text-gold-700 font-bold">Custo de Comportamento</span>
            </p>
          </div>
        </div>
      </ParchmentCard>

      {/* Anexo B */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-gold-700" />
          Anexo B: Protocolo Anti-Impulso (5 minutos)
        </h3>
        <ol className="space-y-3">
          {[
            'Sentiu vontade de decisão financeira sob emoção? → PARE',
            'Registre o gatilho (tédio, estresse, ansiedade?)',
            'Execute uma substituição (exercício, projeto, música)',
            'Espere 24h antes de decidir',
            'Revise com a regra: "Isso ajuda ou atrapalha meu plano de 90 dias?"'
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 bg-parchment-200/50 rounded-sm">
              <span className="font-headline font-bold text-vermillion-700">{idx + 1}.</span>
              <span className="font-body text-ink-700">{item}</span>
            </li>
          ))}
        </ol>
      </ParchmentCard>

      {/* Anexo C */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-gold-700" />
          Anexo C: Modelo de Fluxo de Caixa Simplificado
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-sage-50/30 rounded-sm border-l-4 border-sage-600">
            <h5 className="font-headline font-bold text-sage-800 mb-2">Receitas</h5>
            <ul className="space-y-1">
              <li className="font-body text-sm text-ink-700">Receita Fixa: ______</li>
              <li className="font-body text-sm text-ink-700">Receita Variável (conservadora): ______</li>
              <li className="font-body text-sm text-ink-700 font-bold">Total Receitas: ______</li>
            </ul>
          </div>
          <div className="p-4 bg-vermillion-50/30 rounded-sm border-l-4 border-vermillion-700">
            <h5 className="font-headline font-bold text-vermillion-800 mb-2">Despesas</h5>
            <ul className="space-y-1">
              <li className="font-body text-sm text-ink-700">Contratos Essenciais: ______</li>
              <li className="font-body text-sm text-ink-700">Contratos Ruins (a eliminar): ______</li>
              <li className="font-body text-sm text-ink-700">Custos de Comportamento (a reduzir): ______</li>
              <li className="font-body text-sm text-ink-700 font-bold">Total Despesas: ______</li>
            </ul>
          </div>
          <div className="p-4 bg-gold-50/30 rounded-sm border-l-4 border-gold-600">
            <h5 className="font-headline font-bold text-gold-800 mb-2">Resultado</h5>
            <ul className="space-y-1">
              <li className="font-body text-sm text-ink-700 font-bold">Saldo Projetado: ______</li>
              <li className="font-body text-sm text-vermillion-700 font-bold">Alerta: Se negativo → ativar modo contenção</li>
            </ul>
          </div>
        </div>
      </ParchmentCard>

      {/* Anexo D */}
      <ParchmentCard>
        <h3 className="font-headline text-2xl font-bold text-ink-800 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold-700" />
          Anexo D: Marco de 90 Dias
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-vermillion-700" />
              <h5 className="font-headline font-bold text-ink-800">Dia 30</h5>
            </div>
            <p className="font-body text-sm text-ink-700">
              <span className="font-headline font-bold">[ ]</span> Nenhuma nova dívida criada
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="w-5 h-5 text-gold-700" />
              <h5 className="font-headline font-bold text-ink-800">Dia 60</h5>
            </div>
            <p className="font-body text-sm text-ink-700">
              <span className="font-headline font-bold">[ ]</span> Fluxo de caixa projetado com precisão
            </p>
          </div>
          <div className="p-4 bg-parchment-200/50 rounded-sm border border-gold-600/20">
            <div className="flex items-center gap-2 mb-2">
              <Castle className="w-5 h-5 text-sage-700" />
              <h5 className="font-headline font-bold text-ink-800">Dia 90</h5>
            </div>
            <p className="font-body text-sm text-ink-700">
              <span className="font-headline font-bold">[ ]</span> Primeiro contrato ruim eliminado
            </p>
          </div>
        </div>
      </ParchmentCard>
    </div>
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
    { id: 'anexos', title: 'Anexos', shortTitle: 'Anexos', icon: FileText },
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
            <AnexosSection />
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