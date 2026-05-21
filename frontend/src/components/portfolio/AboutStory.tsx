// src/components/portfolio/AboutStory.tsx
// Decisão: Narrativa em 3 atos (Origem → Evolução → Propósito)
// Foco em vender o diferencial: engenheiro + dados + negócio

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import {
  Factory, Globe, LineChart, Code2, Brain, Target, Heart,
  Rocket, Zap, Users, Shield, Lightbulb, TrendingUp, Award,
  ArrowRight, ExternalLink, Download, Mail, Phone, MapPin
} from 'lucide-react';

/* ─── ANIMATION VARIANTS ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

/* ─── COLOR MAP ─── */
const COLOR_MAP = {
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500/20 to-blue-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', gradient: 'from-violet-500/20 to-purple-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', gradient: 'from-blue-500/20 to-indigo-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-teal-500/20' },
} as const;
type ColorKey = keyof typeof COLOR_MAP;

/* ─── DADOS DA TRAJETÓRIA ─── */
const CAREER_MILESTONES = [
  {
    year: '2018-2020',
    icon: Factory,
    title: 'Engenharia no Chão de Fábrica',
    company: 'Indústria Petroquímica',
    description: 'Atuação em manutenção industrial, automação de processos e análise de dados de suprimentos. Aprendi que dado sem contexto é ruído — e que eficiência se mede em resultado, não em código.',
    skills: ['Python', 'Power BI', 'SAP', 'Lean Manufacturing'],
    color: 'emerald' as ColorKey,
    metric: { label: 'Processos otimizados', value: '15+' },
  },
  {
    year: '2020-2021',
    icon: Globe,
    title: 'Inovação & Pesquisa Aplicada',
    company: 'Projeto CNPq/UFBA',
    description: 'Desenvolvimento fullstack de soluções web para startup de impacto social. Liderei do protótipo ao deploy, aprendendo a fazer muito com recursos limitados — habilidade que levo até hoje.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Agile'],
    color: 'blue' as ColorKey,
    metric: { label: 'Features entregues', value: '30+' },
  },
  {
    year: '2021-2023',
    icon: LineChart,
    title: 'Visão Financeira & Estratégica',
    company: 'Controladoria Corporativa',
    description: 'Desenvolvimento de BI para P&L, fluxo de caixa e indicadores executivos. Traduzi necessidade de negócio em dashboards que realmente orientam decisão — não só "gráficos bonitos".',
    skills: ['Power BI', 'DAX', 'ETL', 'Modelagem Financeira'],
    color: 'violet' as ColorKey,
    metric: { label: 'Redução de tempo de reporte', value: '80%' },
  },
  {
    year: '2023-Hoje',
    icon: Rocket,
    title: 'PGBA Solutions & Produtos Próprios',
    company: 'Fundador & Desenvolvedor',
    description: 'Uno todas as experiências para criar soluções que entendem de código, de dados e de negócio. Foco em produtos próprios (como o Minha Amora) e serviços sob medida para empresas que buscam resultado real.',
    skills: ['Django', 'React', 'IoT', 'LGPD', 'Product Strategy'],
    color: 'cyan' as ColorKey,
    metric: { label: 'Projetos entregues', value: '50+' },
  },
];

const CORE_DIFFERENTIALS = [
  {
    icon: Brain,
    title: 'Pensamento Sistêmico',
    description: 'Não vejo apenas "a feature". Vejo o fluxo completo: do dado bruto à decisão executiva. Isso evita retrabalho e entrega valor real.',
    color: 'cyan' as ColorKey,
  },
  {
    icon: Target,
    title: 'Foco em ROI',
    description: 'Cada hora de desenvolvimento precisa gerar retorno mensurável. Pergunto "isso vai impactar o resultado?" antes de escrever a primeira linha.',
    color: 'violet' as ColorKey,
  },
  {
    icon: Shield,
    title: 'Ética & Conformidade',
    description: 'LGPD não é obstáculo — é fundamento. Construo soluções seguras por design, com privacidade e transparência desde o primeiro commit.',
    color: 'blue' as ColorKey,
  },
  {
    icon: Heart,
    title: 'Ação > Espera',
    description: 'Acredito mais em movimento concreto do que em "vai dar certo". Se algo pode ser melhorado hoje, não espero a condição perfeita.',
    color: 'emerald' as ColorKey,
  },
];

const TESTIMONIALS = [
  {
    quote: "O Igor tem um raro equilíbrio: entende profundamente de tecnologia, mas fala a língua do negócio. Entregou um dashboard que mudou nossa forma de tomar decisão.",
    author: "Gestor de Controladoria",
    company: "Setor de Energia",
    avatar: null, // Pode adicionar foto depois
  },
  {
    quote: "Contratamos para uma automação específica e ganhamos um parceiro estratégico. Ele antecipou necessidades que nem tínhamos identificado.",
    author: "Coordenador de Suprimentos",
    company: "Indústria Petroquímica",
    avatar: null,
  },
];

interface AboutStoryProps {
  className?: string;
}

export function AboutStory({ className = '' }: AboutStoryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <section className={`relative py-16 sm:py-24 px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* ─── HEADER: MANCHETE DE IMPACTO ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16 sm:mb-20 text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
            dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
          }`}>
            <Users className="w-3.5 h-3.5" />
            Sobre Mim
          </motion.div>

          <motion.h1 variants={fadeUp} className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}>
            De engenheiro no chão de fábrica a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">
              estrategista de tecnologia.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
            Minha trajetória não é linear — e isso é meu maior diferencial. 
            Unir engenharia, finanças e desenvolvimento me permite enxergar 
            problemas que outros não veem e entregar soluções que geram{' '}
            <span className="text-cyan-500 font-semibold">resultado mensurável</span>.
          </motion.p>
        </motion.div>

        {/* ─── TIMELINE INTERATIVA ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className={`text-2xl font-bold mb-8 text-center ${dc('text-white', 'text-slate-900')}`}>
            Minha Jornada em 4 Atos
          </motion.h2>

          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-px ${dc('bg-slate-800', 'bg-slate-200')}`} />

            <div className="space-y-12">
              {CAREER_MILESTONES.map((milestone, i) => {
                const colors = COLOR_MAP[milestone.color];
                const isEven = i % 2 === 0;
                
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Marker da timeline */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center ring-4 ring-slate-900 z-10">
                      <milestone.icon className="w-4 h-4 text-white" />
                    </div>

                    {/* Conteúdo */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 group ${
                        isDark
                          ? `bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/50`
                          : `bg-white/80 border-slate-200 hover:shadow-lg`
                      }`}>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors.text}`}>
                          {milestone.year}
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${dc('text-white', 'text-slate-900')}`}>
                          {milestone.title}
                        </h3>
                        <p className={`text-sm font-medium mb-3 ${dc('text-slate-400', 'text-slate-500')}`}>
                          {milestone.company}
                        </p>
                        <p className={`text-sm leading-relaxed mb-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                          {milestone.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {milestone.skills.map((skill, j) => (
                            <span
                              key={j}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                                isDark
                                  ? 'bg-slate-800 text-slate-300 ring-1 ring-slate-700/50'
                                  : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Metric Highlight */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg}`}>
                          <TrendingUp className={`w-4 h-4 ${colors.text}`} />
                          <span className={`text-xs font-bold ${colors.text}`}>
                            {milestone.metric.value}
                          </span>
                          <span className={`text-xs ${dc('text-slate-400', 'text-slate-500')}`}>
                            {milestone.metric.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Espaço vazio para alinhar grid */}
                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ─── DIFERENCIAIS (O QUE ME FAZ ÚNICO) ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className={`mb-20 p-6 sm:p-8 rounded-2xl border ${
            dc('bg-slate-900/30 border-slate-800/50', 'bg-slate-50/80 border-slate-200')
          }`}
        >
          <motion.h2 variants={fadeUp} className={`text-2xl font-bold mb-8 text-center ${dc('text-white', 'text-slate-900')}`}>
            O Que Me Faz Diferente
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_DIFFERENTIALS.map((diff, i) => {
              const colors = COLOR_MAP[diff.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`p-5 rounded-xl border transition-all duration-300 group ${
                    isDark
                      ? `bg-slate-800/30 border-slate-700/50 hover:border-${diff.color}-500/30`
                      : `bg-white/80 border-slate-200 hover:shadow-md`
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colors.bg}`}>
                    <diff.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h4 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                    {diff.title}
                  </h4>
                  <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                    {diff.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── DEPOIMENTOS (PROVA SOCIAL) ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className={`text-2xl font-bold mb-8 text-center ${dc('text-white', 'text-slate-900')}`}>
            O Que Dizem Sobre Meu Trabalho
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800/50' : 'bg-white/80 border-slate-200'
                }`}
              >
                <div className={`text-4xl mb-4 ${dc('text-cyan-400/50', 'text-cyan-200')}`}>"</div>
                <p className={`text-sm leading-relaxed mb-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dc('bg-slate-800', 'bg-slate-200')}`}>
                      <Users className={`w-5 h-5 ${dc('text-slate-500', 'text-slate-400')}`} />
                    </div>
                  )}
                  <div>
                    <div className={`text-sm font-bold ${dc('text-white', 'text-slate-900')}`}>
                      {testimonial.author}
                    </div>
                    <div className={`text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── CTA PESSOAL (CONVERSÃO) ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className={`text-center p-8 sm:p-12 rounded-2xl border relative overflow-hidden ${
            dc(
              'bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/20 border-slate-800/50',
              'bg-gradient-to-br from-white via-white to-violet-50 border-slate-200'
            )
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <motion.div variants={fadeUp} className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-2 ${dc('ring-cyan-500/30', 'ring-cyan-200')}`}>
              <Rocket className={`w-8 h-8 ${dc('text-cyan-400', 'text-cyan-500')}`} />
            </motion.div>

            <motion.h3 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Pronto para transformar sua ideia em resultado?
            </motion.h3>
            
            <motion.p variants={fadeUp} className={`text-base mb-8 max-w-2xl mx-auto ${dc('text-slate-300', 'text-slate-600')}`}>
              Se você busca alguém que entende de código, de dados e de negócio — 
              e que prioriza impacto real sobre buzzwords — vamos conversar.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:igor@pgbasolutions.com.br"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm hover:from-cyan-400 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                Enviar E-mail
              </a>
              <a
                href="https://wa.me/5571999772054"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                  dc('bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 text-slate-200', 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700')
                }`}
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="/assets/cv-igor-pgba.pdf"
                download
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-colors ${
                  dc('text-cyan-400 hover:text-cyan-300', 'text-cyan-600 hover:text-cyan-500')
                }`}
              >
                <Download className="w-4 h-4" />
                Baixar CV
              </a>
            </motion.div>

            <motion.p variants={fadeUp} className={`mt-6 text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
              <MapPin className="w-3 h-3 inline mr-1" />
              Salvador, BA • Atendimento remoto nacional • Resposta em até 24h
            </motion.p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}