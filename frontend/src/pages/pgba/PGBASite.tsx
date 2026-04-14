// src/pages/PGBASite.tsx
// Decisão arquitetural: Este componente é o orquestrador da página.
// Cada seção é um componente separado para evitar re-renders desnecessários.
// Dados estáticos ficam em pgbaSiteData.ts.

import React, { useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { PGBACanvas } from '../../components/pgba/PGBACanvas';
import { PGBALogo } from '../../components/pgba/PGBALogo';
import { ThemeToggle } from '../../components/pgba/ThemeToggle';
import {
  ArrowRight, ArrowDown, BarChart4, Cpu, Code2, Terminal, Globe,
  Factory, LineChart, CheckCircle, Mail, Phone, MapPin, ShoppingBag,
  Brain, Database, Shield, Users, TrendingUp, Sparkles, ExternalLink,
  ChevronRight, Menu, X,
} from 'lucide-react';

/* ─── ANIMATION VARIANTS ─── */
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] },
  },
} as const;

/* ─── COLOR MAP (Tailwind JIT safe) ─── */
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

/* ─── DATA ─── */
const SERVICES = [
  {
    icon: BarChart4,
    title: 'BI & Arquitetura de Dados',
    description: 'Construímos pipelines ETL entre seus bancos de dados (SAP, ERPs) e dashboards executivos em tempo real com Power BI e Python.',
    features: ['Modelagem P&L e Fluxo de Caixa', 'Extração de dados SAP / ERP', 'Dashboards Executivos'],
    color: 'cyan' as ColorKey,
  },
  {
    icon: Cpu,
    title: 'Automação de Processos (RPA)',
    description: 'Redução de custos operacionais substituindo entrada manual de dados por scripts Python e workflows Power Automate.',
    features: ['Scripts de Automação Python', 'Workflows Supply Chain & MRO', 'Integrações via API'],
    color: 'violet' as ColorKey,
  },
  {
    icon: Code2,
    title: 'Software & IA Sob Medida',
    description: 'Desenvolvimento fullstack end-to-end. Construímos SaaS internos, portais e integramos modelos de IA treinados nos seus dados.',
    features: ['React / Node / Python', 'Deploy com Docker & Cloud', 'IA aplicada a negócios'],
    color: 'blue' as ColorKey,
  },
];

const TIMELINE = [
  {
    icon: Factory, period: 'Indústria Petroquímica', role: 'Automação & Manutenção',
    description: 'Desenvolvimento de automações, relatórios gerenciais e análise de dados nos setores de manutenção, materiais e suprimentos.',
    color: 'emerald' as ColorKey,
  },
  {
    icon: Globe, period: 'Inovação & Pesquisa', role: 'Desenvolvedor FullStack',
    description: 'Participação em projeto de startup com apoio do CNPq e UFBA, desenvolvendo soluções web completas.',
    color: 'blue' as ColorKey,
  },
  {
    icon: LineChart, period: 'Controladoria & Finanças', role: 'Especialista em BI',
    description: 'Desenvolvimento de Business Intelligence e análise de dados para suporte à tomada de decisão estratégica.',
    color: 'violet' as ColorKey,
  },
  {
    icon: Database, period: 'Contratação de Serviços', role: 'Analista de Dados',
    description: 'Automação de processos, BI, aplicações Power Platform e integrações SAP em empresa do setor de energia.',
    color: 'cyan' as ColorKey,
  },
];

const CASES = [
  {
    sector: 'Indústria Petroquímica', title: 'Sistema de Apoio à Decisão',
    description: 'Automação de relatórios, análise de dados e indicadores de manutenção para otimização de processos industriais.',
    tags: ['Python', 'Power BI', 'SAP'], icon: Factory, color: 'cyan' as ColorKey,
  },
  {
    sector: 'Setor Financeiro', title: 'Plataforma de BI Gerencial',
    description: 'Dashboards executivos para P&L, fluxo de caixa e indicadores de controladoria com atualização em tempo real.',
    tags: ['Power BI', 'ETL', 'SQL'], icon: LineChart, color: 'violet' as ColorKey,
  },
  {
    sector: 'Energia', title: 'Automação de Processos',
    description: 'Workflows automatizados com Power Platform, integrações SAP e eliminação de processos manuais repetitivos.',
    tags: ['Power Automate', 'SAP', 'RPA'], icon: Cpu, color: 'blue' as ColorKey,
  },
];

const MINHA_AMORA_FEATURES = [
  { icon: ShoppingBag, title: 'Gestão de Estoque Inteligente', description: 'Controle completo do seu estoque com alertas automáticos e sugestões de reposição.' },
  { icon: TrendingUp, title: 'Apoio à Decisão', description: 'Saiba exatamente o que comprar, quando comprar e quanto investir baseado nos seus dados.' },
  { icon: Users, title: 'Feito para Consultoras', description: 'Interface simples e intuitiva, pensada para quem não é técnica mas precisa de controle.' },
  { icon: Sparkles, title: 'Diferente de Tudo', description: 'Não é planilha, não é genérico. É inteligência real para o seu negócio de revenda.' },
];

const NAV_LINKS = [
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#produtos', label: 'Produtos' },
  { href: '#cases', label: 'Cases' },
  { href: '#contato', label: 'Contato' },
];

/* ─── MAIN COMPONENT ─── */
export default function PGBASite() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const scrollToContent = () => contentRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Helper para classes condicionais dark/light
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen font-outfit selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-500 ${
      dc('bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50',
         'bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900')
    }`}>

      {/* ═══════════════════════════════════════
          SECTION 0 — NEURAL HERO (CAPA)
         ═══════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <PGBACanvas isDarkMode={isDark} />
        <ThemeToggle isDarkMode={isDark} onToggle={toggleTheme} />
        <PGBALogo isDarkMode={isDark} />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`relative z-10 mt-6 text-sm md:text-base font-medium tracking-wide text-center px-4 ${
            dc('text-slate-400', 'text-slate-500')
          }`}
        >
          Transformamos dados, processos e sistemas em{' '}
          <span className="text-cyan-500 font-semibold">decisão, eficiência e crescimento.</span>
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={scrollToContent}
          className={`absolute bottom-8 z-10 flex flex-col items-center gap-2 cursor-pointer group ${
            dc('text-slate-500', 'text-slate-400')
          }`}
          aria-label="Rolar para conteúdo"
        >
          <span className="text-xs font-medium uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            Explorar
          </span>
          <ArrowDown className="w-5 h-5 animate-bounce group-hover:text-cyan-400 transition-colors" />
        </motion.button>
      </section>

      {/* ═══════════════════════════════════════
          NAVBAR STICKY
         ═══════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
        dc('border-slate-800/50 bg-slate-950/80', 'border-slate-200/50 bg-white/80')
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/10">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg sm:text-xl font-bold tracking-tight leading-none ${dc('text-white', 'text-slate-900')}`}>
                PGBA<span className="text-cyan-500">.</span>
              </span>
              <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-medium hidden sm:block ${dc('text-slate-400', 'text-slate-500')}`}>
                Solutions Technologies
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-8 text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-cyan-500 transition-colors duration-200 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA + Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                dc('text-slate-400 hover:text-white hover:bg-slate-800', 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
              }`}
              aria-label="Alternar tema"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <a href="#contato" className="hidden sm:inline-flex px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
              Fale Conosco
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${dc('text-slate-400 hover:bg-slate-800', 'text-slate-500 hover:bg-slate-100')}`}
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — com AnimatePresence para exit animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t px-4 py-4 space-y-2 overflow-hidden ${
                dc('border-slate-800 bg-slate-950/95', 'border-slate-200 bg-white/95')
              }`}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    dc('text-slate-300 hover:bg-slate-800 hover:text-cyan-400',
                       'text-slate-600 hover:bg-slate-100 hover:text-cyan-600')
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 px-4 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full mt-2"
              >
                Fale Conosco
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════════════════════════
          SECTION 1 — QUEM SOMOS
         ═══════════════════════════════════════ */}
      <section
        id="quem-somos"
        ref={contentRef}
        className={`relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 border-b ${dc('border-slate-800/50', 'border-slate-200/50')}`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
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
              Nossa Origem
            </motion.div>

            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Tecnologia com{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">visão de negócio.</span>


            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              A PGBA Solutions Technologies nasce da trajetória de seu fundador,
              engenheiro mecatrônico com sólida experiência em ambientes
              industriais, financeiros e tecnológicos. Uma empresa que entende de
              código, de dados e de negócio.
            </motion.p>
          </motion.div>

          {/* Timeline do Fundador */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TIMELINE.map((item, i) => {
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
                  {i < TIMELINE.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-slate-600 to-transparent" />
                  )}

                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${colors.text}`}>
                    {item.period}
                  </div>

                  <h3 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                    {item.role}
                  </h3>

                  <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Texto institucional — juridicamente seguro conforme regras [1] */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`mt-12 p-6 sm:p-8 rounded-2xl border text-center max-w-4xl mx-auto ${
              dc('bg-slate-900/30 border-slate-800/50', 'bg-slate-50/80 border-slate-200')
            }`}
          >
            <p className={`text-sm sm:text-base leading-relaxed italic ${dc('text-slate-400', 'text-slate-500')}`}>
              "Atuei em indústria petroquímica nas áreas de manutenção, materiais
              e suprimentos, desenvolvendo automações e relatórios gerenciais.
              Participei de projetos de inovação com CNPq e UFBA como
              desenvolvedor Full Stack. Na área financeira, atuei como
              especialista em controladoria com foco em BI. Atualmente, atuo como
              Analista de Dados desenvolvendo soluções de automação, BI,
              aplicações Power Platform e integrações SAP. Toda essa bagagem
              fundamenta a missão da PGBA: levar inteligência tecnológica real
              para empresas que precisam crescer."
            </p>
            <p className={`mt-4 text-sm font-semibold ${dc('text-cyan-400', 'text-cyan-600')}`}>
              — Fundador, PGBA Solutions Technologies
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — SERVIÇOS
         ═══════════════════════════════════════ */}
      <section
        id="servicos"
        className={`relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 border-b ${
          dc('bg-slate-900/20 border-slate-800/50', 'bg-slate-50/50 border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-12 sm:mb-16 md:mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm ${
                dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Serviços
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}
            >
              Soluções que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-400 to-violet-500">
                impactam seu resultado.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Transformamos dados brutos e processos manuais em{' '}
              <span className="text-cyan-500 font-semibold">ativos digitais escaláveis</span>.
            </motion.p>
          </motion.div>

          {/* Service Cards — usando COLOR_MAP para classes JIT-safe */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {SERVICES.map((service, i) => {
              const colors = COLOR_MAP[service.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`group p-6 sm:p-8 rounded-2xl sm:rounded-3xl border backdrop-blur-sm transition-all duration-300 ${
                    isDark
                      ? `bg-slate-900/50 border-slate-800/50 ${colors.hoverBorder} hover:bg-slate-800/50`
                      : `bg-white/80 border-slate-200 ${colors.hoverBorderLight} hover:shadow-xl`
                  }`}
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ${colors.ring}`}
                  >
                    <service.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.iconColor}`} />
                  </div>

                  <h3 className={`text-lg sm:text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>
                    {service.title}
                  </h3>

                  <p className={`leading-relaxed mb-6 text-sm sm:text-base ${dc('text-slate-300', 'text-slate-600')}`}>
                    {service.description}
                  </p>

                  <ul className="space-y-2">
                    {service.features.map((feature, j) => (
                      <li
                        key={j}
                        className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}
                      >
                        <CheckCircle className={`w-3 h-3 shrink-0 ${colors.checkColor}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — PRODUTOS (MINHA AMORA)
         ═══════════════════════════════════════ */}
      <section
        id="produtos"
        className={`relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 border-b ${
          dc('border-slate-800/50', 'border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
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
                dc('bg-slate-900/80 border-slate-700/50 text-violet-400', 'bg-slate-50/80 border-slate-200/50 text-violet-600')
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Nossos Produtos
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}
            >
              Minha Amora
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                {' '}🌸
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Gestão de estoque inteligente para consultoras e revendedoras.
              Diferente de tudo que existe no mercado — feito por quem entende
              de dados e de negócio.
            </motion.p>
          </motion.div>

          {/* Product Hero Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden mb-12 ${
              dc(
                'bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/20 border-slate-800/50',
                'bg-gradient-to-br from-white via-white to-pink-50 border-slate-200 shadow-xl'
              )
            }`}
          >
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-rose-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-cyan-500/10 blur-3xl" />

            <div className="relative z-10 p-8 sm:p-12 md:p-16">
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                {/* Left: Info */}
                <div className="lg:w-1/2 space-y-6">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      dc(
                        'bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20',
                        'bg-pink-50 text-pink-600 ring-1 ring-pink-200'
                      )
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    SaaS — Produto Próprio PGBA
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-bold ${dc('text-white', 'text-slate-900')}`}>
                    O estoque da sua revenda,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                      finalmente inteligente.
                    </span>
                  </h3>

                  <p className={`text-sm sm:text-base leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                    Pensado para consultoras da Natura, Avon, Boticário, Mary
                    Kay e outras marcas. Não é planilha, não é genérico. É uma
                    ferramenta que entende o seu negócio e te ajuda a tomar
                    decisões melhores todos os dias.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="#contato"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 group"
                    >
                      Quero Conhecer
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <span
                      className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium ${
                        dc(
                          'text-slate-400 bg-slate-800/50 ring-1 ring-slate-700/50',
                          'text-slate-500 bg-slate-100 ring-1 ring-slate-200'
                        )
                      }`}
                    >
                      Em breve — Lista de espera aberta
                    </span>
                  </div>
                </div>

                {/* Right: Features Grid */}
                <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MINHA_AMORA_FEATURES.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={scaleIn}
                      className={`p-5 rounded-xl border transition-all duration-300 group ${
                        dc(
                          'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60 hover:border-pink-500/30',
                          'bg-white/80 border-slate-200 hover:shadow-lg hover:border-pink-300'
                        )
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                          dc('bg-pink-500/10', 'bg-pink-50')
                        }`}
                      >
                        <feature.icon className={`w-5 h-5 ${dc('text-pink-400', 'text-pink-500')}`} />
                      </div>
                      <h4 className={`text-sm font-bold mb-1 ${dc('text-white', 'text-slate-900')}`}>
                        {feature.title}
                      </h4>
                      <p className={`text-xs leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — CASES ANONIMIZADOS
          Decisão: Cases são anonimizados por setor,
          sem citar empresas como clientes da PGBA [1]
         ═══════════════════════════════════════ */}
      <section
        id="cases"
        className={`relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6 border-b ${
          dc('bg-slate-900/20 border-slate-800/50', 'bg-slate-50/50 border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
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
              <Shield className="w-3.5 h-3.5" />
              Projetos & Cases
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}
            >
              Experiência aplicada em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">
                setores reais.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={`text-base sm:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Projetos desenvolvidos ao longo da trajetória profissional do
              fundador, aplicando tecnologia para resolver problemas reais de
              negócio.
            </motion.p>
          </motion.div>

          {/* Cases Grid — COLOR_MAP para classes JIT-safe */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {CASES.map((caseItem, i) => {
              const colors = COLOR_MAP[caseItem.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`group relative p-6 sm:p-8 rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isDark
                      ? `bg-slate-900/50 border-slate-800/50 ${colors.hoverBorder} hover:bg-slate-800/50`
                      : `bg-white/80 border-slate-200 hover:shadow-xl ${colors.hoverBorderLight}`
                  }`}
                >
                  {/* Glow de fundo */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isDark ? colors.bg : colors.bgLight
                    }`}>
                      <caseItem.icon className={`w-6 h-6 ${isDark ? colors.text : colors.textLight}`} />
                    </div>

                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDark ? colors.text : colors.textLight
                    }`}>
                      {caseItem.sector}
                    </div>

                    <h3 className={`text-lg font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>
                      {caseItem.title}
                    </h3>

                    <p className={`text-sm leading-relaxed mb-4 ${dc('text-slate-400', 'text-slate-500')}`}>
                      {caseItem.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {caseItem.tags.map((tag, j) => (
                        <span
                          key={j}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            dc(
                              'bg-slate-800 text-slate-300 ring-1 ring-slate-700/50',
                              'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                            )
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — CONTATO (CONVERSÃO)
         ═══════════════════════════════════════ */}
      <section
        id="contato"
        className="relative z-10 py-16 sm:py-20 md:py-28 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2.5rem] border relative overflow-hidden backdrop-blur-sm ${
              dc(
                'bg-gradient-to-b from-slate-900/80 to-slate-950/80 border-slate-800/50',
                'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-2xl'
              )
            }`}
          >
            {/* Decoração superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />

            <div className="relative z-10">
              <h2 className={`text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 ${dc('text-white', 'text-slate-900')}`}>
                Pronto para transformar{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">
                  seu negócio?
                </span>
              </h2>

              <p className={`text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Vamos conversar sobre como a PGBA Solutions pode ajudar sua
                empresa com dados, automação, software e inteligência
                artificial. Agende uma conversa sem compromisso.
              </p>

              {/* Botões de CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:suporte@pgbasolutions.com.br"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm sm:text-lg transition-all duration-200 shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.7)] hover:scale-105 group"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Enviar E-mail
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="https://wa.me/5571999772054"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-sm ${
                    dc(
                      'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-200',
                      'bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700'
                    )
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>

              {/* Info de Contato */}
      

              <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t ${dc('border-slate-800/50', 'border-slate-200')} relative z-10`}
              >
                <div className={`flex items-center gap-2 text-xs sm:text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                  <Mail className="w-4 h-4 text-cyan-500" />
                  suporte@pgbasolutions.com.br
                </div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  Salvador, Bahia — Brasil
                </div>
                <div className={`flex items-center gap-2 text-xs sm:text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                  <Globe className="w-4 h-4 text-cyan-500" />
                  Atendimento remoto nacional
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER — COM DISCLAIMER JURÍDICO OBRIGATÓRIO
          Decisão arquitetural: O disclaimer é obrigatório
          conforme regras de citação de empresas [1].
          Experiências são do fundador, não clientes da PGBA.
         ═══════════════════════════════════════ */}
      <footer
        className={`relative z-10 border-t backdrop-blur-sm ${
          dc('border-slate-800/50 bg-slate-950/80', 'border-slate-200 bg-white/80')
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Row 1: Logo + Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className={`font-bold text-sm sm:text-base ${dc('text-white', 'text-slate-900')}`}>
                  PGBA<span className="text-cyan-500">.</span>
                </span>
                <span className={`text-xs uppercase tracking-wider font-medium ml-2 hidden sm:inline ${dc('text-slate-500', 'text-slate-400')}`}>
                  Solutions Technologies
                </span>
              </div>
            </div>

            {/* Footer Nav */}
            <div className={`flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-cyan-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Row 2: Copyright + Tagline */}
          <div
            className={`text-center text-xs sm:text-sm pt-6 border-t ${
              dc('border-slate-800/50 text-slate-500', 'border-slate-200 text-slate-400')
            }`}
          >
            <p className="mb-2">
              © {new Date().getFullYear()} PGBA Solutions Technologies.
              Todos os direitos reservados.
            </p>
            <p className="text-cyan-500 font-medium mb-4">
              Transformando dados, processos e sistemas em decisão,
              eficiência e crescimento.
            </p>
          </div>

          {/* Row 3: DISCLAIMER JURÍDICO OBRIGATÓRIO [1]
              Esta frase é essencial para proteção legal.
              Conforme orientação jurídica: experiências mencionadas
              são do fundador, não caracterizam clientes da PGBA. */}
          <div
            className={`mt-6 pt-6 border-t text-center ${
              dc('border-slate-800/30', 'border-slate-200/50')
            }`}
          >
            <p
              className={`text-[10px] sm:text-xs leading-relaxed max-w-4xl mx-auto ${
                dc('text-slate-600', 'text-slate-400')
              }`}
            >
              As experiências profissionais mencionadas neste site referem-se à
              trajetória do fundador da PGBA Solutions Technologies e não
              caracterizam relação comercial, parceria ou prestação de serviços
              pela empresa com as organizações citadas. Todas as marcas
              mencionadas são propriedade de seus respectivos titulares.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}