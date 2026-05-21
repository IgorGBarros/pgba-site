// src/components/pgba/SobreMim.tsx
// Decisão arquitetural: Componente isolado para reutilização e performance.
// Animações com Framer Motion, tema via useTheme, cores via COLOR_MAP.

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import {
  Brain, Code2, Database, Factory, Globe, LineChart, Terminal,
  Users, Shield, Sparkles, CheckCircle, ArrowRight, Heart, Target,
  Lightbulb, Rocket, BarChart4, Cpu, Zap, BookOpen
} from 'lucide-react';

/* ─── ANIMATION VARIANTS (reutiliza padrões do PGBASite) ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.4, 0.25, 1] },
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
} as const;

/* ─── COLOR MAP (mesmo padrão do PGBASite.tsx) ─── */
const COLOR_MAP = {
  cyan: {
    text: 'text-cyan-400', textLight: 'text-cyan-600',
    bg: 'bg-cyan-500/10', bgLight: 'bg-cyan-50',
    hoverBorder: 'hover:border-cyan-500/50', hoverBorderLight: 'hover:border-cyan-300',
    glow: 'from-cyan-500/5',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    ring: 'ring-cyan-500/20',
    iconColor: 'text-cyan-400',
    checkColor: 'text-cyan-400',
  },
  violet: {
    text: 'text-violet-400', textLight: 'text-violet-600',
    bg: 'bg-violet-500/10', bgLight: 'bg-violet-50',
    hoverBorder: 'hover:border-violet-500/50', hoverBorderLight: 'hover:border-violet-300',
    glow: 'from-violet-500/5',
    gradient: 'from-violet-500/20 to-purple-500/20',
    ring: 'ring-violet-500/20',
    iconColor: 'text-violet-400',
    checkColor: 'text-violet-400',
  },
  blue: {
    text: 'text-blue-400', textLight: 'text-blue-600',
    bg: 'bg-blue-500/10', bgLight: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-500/50', hoverBorderLight: 'hover:border-blue-300',
    glow: 'from-blue-500/5',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    ring: 'ring-blue-500/20',
    iconColor: 'text-blue-400',
    checkColor: 'text-blue-400',
  },
  emerald: {
    text: 'text-emerald-400', textLight: 'text-emerald-600',
    bg: 'bg-emerald-500/10', bgLight: 'bg-emerald-50',
    hoverBorder: 'hover:border-emerald-500/50', hoverBorderLight: 'hover:border-emerald-300',
    glow: 'from-emerald-500/5',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    ring: 'ring-emerald-500/20',
    iconColor: 'text-emerald-400',
    checkColor: 'text-emerald-400',
  },
} as const;

type ColorKey = keyof typeof COLOR_MAP;

/* ─── DADOS PESSOAIS ─── */
const CORE_VALUES = [
  { icon: Target, title: 'Foco em Resultado', description: 'Cada linha de código, cada dashboard, cada automação precisa gerar valor mensurável.', color: 'cyan' as ColorKey },
  { icon: Lightbulb, title: 'Inovação Aplicada', description: 'Não busco tecnologia pela tecnologia. Busco soluções que resolvem dores reais.', color: 'violet' as ColorKey },
  { icon: Shield, title: 'Ética & LGPD', description: 'Privacidade e segurança não são opcionais. São fundamentos de qualquer solução responsável.', color: 'blue' as ColorKey },
  { icon: Heart, title: 'Ação > Fé Passiva', description: 'Acredito mais em movimento concreto do que em esperar que "tudo vai dar certo".', color: 'emerald' as ColorKey },
];

const TECH_STACK = [
  { category: 'Backend', items: ['Python', 'Django', 'Node.js', 'FastAPI'], color: 'cyan' as ColorKey },
  { category: 'Frontend', items: ['React', 'TypeScript', 'Tailwind', 'Framer Motion'], color: 'violet' as ColorKey },
  { category: 'Data & IA', items: ['Power BI', 'PostgreSQL', 'Pandas', 'LLMs'], color: 'blue' as ColorKey },
  { category: 'Infra & IoT', items: ['Docker', 'Linux', 'Raspberry Pi', 'APIs PIX'], color: 'emerald' as ColorKey },
];

const PERSONAL_JOURNEY = [
  {
    icon: Factory,
    title: 'Raiz Industrial',
    description: 'Engenheiro mecatrônico com vivência em chão de fábrica, manutenção e supply chain. Aprendi que dado sem contexto é só ruído.',
    color: 'emerald' as ColorKey,
  },
  {
    icon: Globe,
    title: 'Pesquisa & Inovação',
    description: 'Projeto com CNPq/UFBA me ensinou a transformar ideias em protótipos funcionais — e a lidar com recursos limitados.',
    color: 'blue' as ColorKey,
  },
  {
    icon: LineChart,
    title: 'Visão Financeira',
    description: 'Atuação em controladoria me deu a lente do negócio: P&L, fluxo de caixa, ROI. Tecnologia precisa pagar a conta.',
    color: 'violet' as ColorKey,
  },
  {
    icon: Code2,
    title: 'PGBA Solutions',
    description: 'Hoje uno todas essas experiências para criar soluções que entendem de código, de dados e de negócio.',
    color: 'cyan' as ColorKey,
  },
];

interface SobreMimProps {
  className?: string;
}

export function SobreMim({ className = '' }: SobreMimProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Helper para classes condicionais dark/light (padrão PGBA)
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <section className={`relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* ─── HEADER ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto"
        >
          <motion.div
            variants={fadeUp}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm ${
              dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Sobre Mim
          </motion.div>

          <motion.h2 
            variants={fadeUp} 
            className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}
          >
            Igor — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">Engenheiro, Dev & Estrategista.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
          >
            6+ anos unindo <span className="text-cyan-500 font-semibold">engenharia, dados e negócios</span>. 
            Acredito que tecnologia só faz sentido quando gera resultado concreto.
          </motion.p>
        </motion.div>

        {/* ─── JORNADA PESSOAL (Timeline) ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16 sm:mb-20"
        >
          <motion.h3
            variants={fadeUp}
            className={`text-xl sm:text-2xl font-bold mb-8 text-center ${dc('text-white', 'text-slate-900')}`}
          >
            Minha Trajetória
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERSONAL_JOURNEY.map((item, i) => {
              const colors = COLOR_MAP[item.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 group ${
                    isDark
                      ? `bg-slate-900/50 border-slate-800/50 hover:bg-slate-800/50`
                      : `bg-white/80 border-slate-200 hover:bg-slate-50 hover:shadow-lg`
                  }`}
                >
                  {/* Connector line (desktop) */}
                  {i < PERSONAL_JOURNEY.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-slate-600 to-transparent" />
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <h4 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                    {item.title}
                  </h4>

                  <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── CORE VALUES ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className={`mb-16 sm:mb-20 p-6 sm:p-8 rounded-2xl border ${
            dc('bg-slate-900/30 border-slate-800/50', 'bg-slate-50/80 border-slate-200')
          }`}
        >
          <motion.h3
            variants={fadeUp}
            className={`text-xl sm:text-2xl font-bold mb-6 text-center ${dc('text-white', 'text-slate-900')}`}
          >
            O que me Move
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CORE_VALUES.map((value, i) => {
              const colors = COLOR_MAP[value.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`p-5 rounded-xl border transition-all duration-300 group ${
                    isDark
                      ? `bg-slate-800/30 border-slate-700/50 hover:border-${value.color}-500/30`
                      : `bg-white/80 border-slate-200 hover:shadow-md hover:border-${value.color}-300`
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                      isDark ? colors.bg : colors.bgLight
                    }`}
                  >
                    <value.icon className={`w-5 h-5 ${isDark ? colors.text : colors.textLight}`} />
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${dc('text-white', 'text-slate-900')}`}>
                    {value.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── TECH STACK ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-16 sm:mb-20"
        >
          <motion.h3
            variants={fadeUp}
            className={`text-xl sm:text-2xl font-bold mb-8 text-center ${dc('text-white', 'text-slate-900')}`}
          >
            Stack Técnico
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((stack, i) => {
              const colors = COLOR_MAP[stack.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`p-5 rounded-xl border ${
                    isDark
                      ? `bg-slate-900/50 border-slate-800/50`
                      : `bg-white/80 border-slate-200`
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${colors.text}`}>
                    {stack.category}
                  </div>
                  <ul className="space-y-2">
                    {stack.items.map((item, j) => (
                      <li
                        key={j}
                        className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${dc('text-slate-300', 'text-slate-600')}`}
                      >
                        <CheckCircle className={`w-3 h-3 shrink-0 ${colors.checkColor}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── CTA PESSOAL ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className={`text-center p-8 sm:p-12 rounded-2xl border relative overflow-hidden ${
            dc(
              'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border-slate-800/50',
              'bg-gradient-to-br from-white via-white to-cyan-50 border-slate-200'
            )
          }`}
        >
          {/* Glow decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <Sparkles className={`w-8 h-8 mx-auto mb-4 ${dc('text-cyan-400', 'text-cyan-500')}`} />
            
            <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Vamos construir algo incrível juntos?
            </h3>
            
            <p className={`text-sm sm:text-base mb-6 max-w-2xl mx-auto ${dc('text-slate-300', 'text-slate-600')}`}>
              Se você busca alguém que entende de código, de dados e de negócio — 
              e que prioriza resultado sobre buzzword — vamos conversar.
            </p>

            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 group"
            >
              Entrar em Contato
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}