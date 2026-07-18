// src/pages/PGBASite.tsx
// v2.1 — Professional Enterprise Polish
// - Added "Why PGBA" strategic section.
// - Enhanced Glassmorphism and depth effects.
// - Improved mobile navigation experience.
// - Refined typography hierarchy for better readability.

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { PGBACanvas } from '../../components/pgba/PGBACanvas';
import { PGBALogo } from '../../components/pgba/PGBALogo';
import { ThemeToggle } from '../../components/pgba/ThemeToggle';

import { CookieConsentBanner } from '../../components/pgba/CookieConsentBanner';
import { useAnalytics } from '../../hooks/useAnalytics';
import {
  ArrowRight, ArrowDown, BarChart4, Cpu, Code2, Terminal, Globe,
  Factory, LineChart, CheckCircle, Mail, Phone, MapPin, ShoppingBag,
  Brain, Database, Shield, Users, TrendingUp, Sparkles, ExternalLink,
  ChevronRight, Menu, X,
  Wifi, Thermometer, CreditCard, Monitor, Box, Zap, Settings, Radio,
  Layers, Target, Rocket
} from 'lucide-react';

/* ─── ANIMATION VARIANTS ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, // Custom bezier for premium feel
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
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
  amber: {
    text: 'text-amber-400', textLight: 'text-amber-600',
    bg: 'bg-amber-500/10', bgLight: 'bg-amber-50',
    hoverBorder: 'hover:border-amber-500/50', hoverBorderLight: 'hover:border-amber-300',
    glow: 'from-amber-500/5',
    gradient: 'from-amber-500/20 to-orange-500/20',
    ring: 'ring-amber-500/20',
    iconColor: 'text-amber-400',
    checkColor: 'text-amber-400',
  },
  pink: {
    text: 'text-pink-400', textLight: 'text-pink-600',
    bg: 'bg-pink-500/10', bgLight: 'bg-pink-50',
    hoverBorder: 'hover:border-pink-500/50', hoverBorderLight: 'hover:border-pink-300',
    glow: 'from-pink-500/5',
    gradient: 'from-pink-500/20 to-rose-500/20',
    ring: 'ring-pink-500/20',
    iconColor: 'text-pink-400',
    checkColor: 'text-pink-400',
  }
} as const;

type ColorKey = keyof typeof COLOR_MAP;

/* ─── DATA ─── */

const SERVICES = [
  {
    icon: BarChart4,
    title: 'BI & Arquitetura de Dados',
    description: 'Construímos pipelines ETL entre seus bancos de dados (SAP, ERPs) e dashboards executivos em tempo real.',
    features: ['Modelagem P&L e Fluxo de Caixa', 'Extração de dados SAP / ERP', 'Dashboards Executivos'],
    color: 'cyan' as ColorKey,
  },
  {
    icon: Cpu,
    title: 'Automação de Processos (RPA)',
    description: 'Redução de custos operacionais substituindo entrada manual de dados por scripts Python e workflows inteligentes.',
    features: ['Scripts de Automação Python', 'Workflows Supply Chain & MRO', 'Integrações via API'],
    color: 'violet' as ColorKey,
  },
  {
    icon: Code2,
    title: 'Software & IA Sob Medida',
    description: 'Desenvolvimento fullstack end-to-end. Construímos SaaS internos, portais e integramos modelos de IA nos seus dados.',
    features: ['React / Node / Python', 'Deploy com Docker & Cloud', 'IA aplicada a negócios'],
    color: 'blue' as ColorKey,
  },
  {
    icon: Radio,
    title: 'IoT & Sistemas Kiosk',
    description: 'Sistemas completos para vending machines e kiosks inteligentes com integração IoT, sensores e pagamento PIX.',
    features: ['Raspberry Pi & Sensores', 'Pagamento PIX / Cartão integrado', 'Painel de monitoramento remoto'],
    color: 'amber' as ColorKey,
  },
];

const DIFFERENTIATORS = [
  {
    icon: Target,
    title: 'Foco em ROI Imediato',
    description: 'Não vendemos apenas código. Entregamos soluções que resolvem dores reais e geram retorno financeiro rápido.',
    color: 'emerald' as ColorKey,
  },
  {
    icon: Layers,
    title: 'Modelo Híbrido Único',
    description: 'Combinamos a agilidade de produtos próprios (SaaS) com a robustez de serviços de outsourcing enterprise.',
    color: 'blue' as ColorKey,
  },
  {
    icon: Rocket,
    title: 'Inovação Aplicada',
    description: 'Tecnologia de ponta (IA, IoT) aterrissada na realidade operacional da sua empresa, sem buzzwords vazios.',
    color: 'violet' as ColorKey,
  },
];

const TIMELINE = [
  {
    icon: Factory, period: 'Indústria Petroquímica', role: 'Automação & Manutenção',
    description: 'Desenvolvimento de automações, relatórios gerenciais e análise de dados nos setores de manutenção e suprimentos.',
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
    icon: Database, period: 'Setor de Energia', role: 'Analista de Dados',
    description: 'Automação de processos, BI, aplicações Power Platform e integrações SAP em grande empresa do setor.',
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
  {
    sector: 'Varejo & IoT', title: 'Vending Machine Inteligente',
    description: 'Sistema completo de vending machine com arquitetura em 3 camadas: backend centralizado, painel web e cliente IoT.',
    tags: ['Django', 'React', 'Raspberry Pi', 'IoT', 'PIX'],
    icon: Radio, color: 'amber' as ColorKey,
  },
];

const MINHA_AMORA_FEATURES = [
  { icon: ShoppingBag, title: 'Gestão de Estoque Inteligente', description: 'Controle completo do seu estoque com alertas automáticos e sugestões de reposição.' },
  { icon: TrendingUp, title: 'Apoio à Decisão', description: 'Saiba exatamente o que comprar, quando comprar e quanto investir baseado nos seus dados.' },
  { icon: Users, title: 'Feito para Consultoras', description: 'Interface simples e intuitiva, pensada para quem não é técnica mas precisa de controle.' },
  { icon: Sparkles, title: 'Diferente de Tudo', description: 'Não é planilha, não é genérico. É inteligência real para o seu negócio de revenda.' },
];

const IOT_KIOSK_FEATURES = [
  { icon: Monitor, title: 'Kiosk Fullscreen', description: 'Interface touchscreen otimizada para TVs e displays comerciais com autostart e modo quiosque.' },
  { icon: Thermometer, title: 'Sensores & Telemetria', description: 'Monitoramento em tempo real de temperatura, umidade, energia, vazão e conectividade.' },
  { icon: CreditCard, title: 'Pagamento Integrado', description: 'PIX com QR Code em tempo real, polling automático de confirmação e suporte a cartão.' },
  { icon: Wifi, title: 'Monitoramento Remoto', description: 'Heartbeat automático, detecção online/offline, alertas e painel administrativo centralizado.' },
  { icon: Box, title: 'Controle de Estoque', description: 'Gestão de produtos e variantes com preços dinâmicos configuráveis remotamente.' },
  { icon: Zap, title: 'Acionamento IoT', description: 'Controle GPIO para relés e atuadores com validação de segurança via backend antes da liberação.' },
  { icon: Settings, title: 'Replicação Automatizada', description: 'Script de setup para novas máquinas com hostname único, configuração automática e deploy simplificado.' },
  { icon: Shield, title: 'Segurança por API Key', description: 'Cada dispositivo possui chave de autenticação única com comunicação segura via Bearer Token.' },
];

const NAV_LINKS = [
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#diferenciais', label: 'Diferenciais' },
  { href: '#produtos', label: 'Produtos' },
  { href: '#cases', label: 'Cases' },
  { href: '#contato', label: 'Contato' },
];

/* ─── MAIN COMPONENT ─── */
export default function PGBASite() {
  const { theme, setTheme } = useTheme();
  const { trackPageView, trackEvent } = useAnalytics();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const scrollToContent = () => contentRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

   // Track pageview ao carregar e ao mudar de hash (SPA navigation)
  useEffect(() => {
    trackPageView(window.location.pathname + window.location.hash, document.title);
    
    const handleHashChange = () => {
      trackPageView(window.location.pathname + window.location.hash, document.title);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [trackPageView]);

  // Helper para classes condicionais


  // Helper for conditional classes
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    
    <div className={`min-h-screen font-outfit selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-500 ${
      dc('bg-slate-950 text-slate-50', 'bg-slate-50 text-slate-900')
    }`}>
      <CookieConsentBanner />
      {/* ← Script do GA4 com Consent Mode v2 (carrega sempre, mas só envia dados com consentimento) */}
 
{/* ─── GOOGLE ANALYTICS 4 + CONSENT MODE V2 ─── */}
{import.meta.env.VITE_GA4_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA4_ID}`} />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          // Consent Mode v2 - padrão: NEGADO até usuário aceitar (LGPD)
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
          
          // Inicializa GA4 com configurações de privacidade
          gtag('js', new Date());
          gtag('config', '${import.meta.env.VITE_GA4_ID}', {
            'anonymize_ip': true,
            'allow_google_signals': false,
            'allow_ad_personalization_signals': false,
            'page_path': window.location.pathname
          });
        `,
      }}
    />
  </>
)}
      {/* ═══════════════════════════════════════
          SECTION 0 — NEURAL HERO (CAPA)
         ═══════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Background Gradient Overlay for better text readability */}
        <div className={`absolute inset-0 z-0 pointer-events-none ${
            dc('bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950', 'bg-gradient-to-b from-white/30 via-transparent to-slate-50')
        }`} />
        
        <PGBACanvas isDarkMode={isDark} />
       
        <PGBALogo isDarkMode={isDark} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 mt-8 max-w-4xl px-6 text-center"
        >
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${dc('text-white', 'text-slate-900')}`}>
            Inteligência Tecnológica <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">
              Para Negócios Reais
            </span>
          </h1>
          <p className={`text-lg md:text-xl font-medium leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
            Transformamos dados brutos, processos manuais e infraestrutura legado em 
            <span className={`font-semibold ${dc('text-cyan-400', 'text-cyan-600')}`}> decisão, eficiência e crescimento escalável.</span>
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={scrollToContent}
          className={`absolute bottom-10 z-10 flex flex-col items-center gap-2 cursor-pointer group ${
            dc('text-slate-500', 'text-slate-400')
          }`}
          aria-label="Rolar para conteúdo"
        >
          <span className="text-xs font-bold uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            Explorar Soluções
          </span>
          <ArrowDown className="w-5 h-5 animate-bounce group-hover:text-cyan-400 transition-colors" />
        </motion.button>
      </section>

      {/* ═══════════════════════════════════════
          NAVBAR STICKY
         ═══════════════════════════════════════ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? dc('bg-slate-950/80 border-slate-800/50 backdrop-blur-md shadow-lg shadow-black/20', 'bg-white/80 border-slate-200/50 backdrop-blur-md shadow-sm')
          : dc('bg-slate-950/0 border-transparent', 'bg-white/0 border-transparent')
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-tight leading-none ${dc('text-white', 'text-slate-900')}`}>
                PGBA<span className="text-cyan-500">.</span>
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold hidden sm:block ${dc('text-slate-400', 'text-slate-500')}`}>
                Solutions Technologies
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className={`hidden lg:flex items-center gap-8 text-sm font-medium ${dc('text-slate-300', 'text-slate-600')}`}>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-cyan-500 transition-colors duration-200 relative group py-2">
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA + Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                dc('text-slate-400 hover:text-white hover:bg-slate-800', 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
              }`}
              aria-label="Alternar tema"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>
            <a href="#contato" className="hidden sm:inline-flex px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5">
              Fale Conosco
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${dc('text-slate-300 hover:bg-slate-800', 'text-slate-600 hover:bg-slate-100')}`}
              aria-label="Menu mobile"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`lg:hidden border-t px-4 py-6 space-y-4 overflow-hidden backdrop-blur-xl ${
                dc('border-slate-800 bg-slate-950/95', 'border-slate-200 bg-white/95')
              }`}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                    dc('text-slate-300 hover:bg-slate-800 hover:text-cyan-400', 'text-slate-600 hover:bg-slate-100 hover:text-cyan-600')
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 px-4 text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl mt-4 shadow-lg shadow-cyan-500/20"
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
        className={`relative z-10 pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 border-b ${dc('border-slate-800/50', 'border-slate-200/50')}`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
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
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-5xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}>
              Tecnologia com{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">visão de negócio.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={`text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              A PGBA Solutions Technologies nasce da trajetória de seu fundador,
              engenheiro mecatrônico com sólida experiência em ambientes
              industriais, financeiros e tecnológicos. Uma empresa que entende de
              código, de dados e de resultado.
            </motion.p>
          </motion.div>

          {/* Timeline do Fundador */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TIMELINE.map((item, i) => {
              const colors = COLOR_MAP[item.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1 ${
                    isDark
                      ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:shadow-xl hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                    {item.role}
                  </h3>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colors.text}`}>
                    {item.period}
                  </p>
                  <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Texto institucional */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`mt-16 p-8 md:p-10 rounded-3xl border text-center max-w-4xl mx-auto relative overflow-hidden ${
              dc('bg-slate-900/30 border-slate-800/50', 'bg-slate-50/80 border-slate-200')
            }`}
          >
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500`} />
            <p className={`text-lg leading-relaxed italic font-medium ${dc('text-slate-300', 'text-slate-600')}`}>
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
            <a href="/portfolio" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-500 transition-colors">
              Portfólio Completo
              </a>
            <p className={`mt-6 text-sm font-bold uppercase tracking-widest ${dc('text-cyan-400', 'text-cyan-600')}`}>
              
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
        className={`relative z-10 py-20 md:py-32 px-4 sm:px-6 border-b ${
          dc('bg-slate-900/20 border-slate-800/50', 'bg-slate-50/50 border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
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
              className={`text-3xl md:text-5xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}
            >
              Soluções que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-400 to-violet-500">
                impactam seu resultado.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={`text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Transformamos dados brutos e processos manuais em{' '}
              <span className="text-cyan-500 font-semibold">ativos digitais escaláveis</span>.
            </motion.p>
          </motion.div>

          {/* Service Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {SERVICES.map((service, i) => {
              const colors = COLOR_MAP[service.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`group p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 ${
                    isDark
                      ? `bg-slate-900/40 border-slate-800/60 ${colors.hoverBorder} hover:bg-slate-800/60`
                      : `bg-white/60 border-slate-200 ${colors.hoverBorderLight} hover:shadow-2xl hover:bg-white`
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ${colors.ring}`}
                  >
                    <service.icon className={`w-7 h-7 ${colors.iconColor}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>
                    {service.title}
                  </h3>
                  <p className={`leading-relaxed mb-6 text-sm ${dc('text-slate-400', 'text-slate-600')}`}>
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, j) => (
                      <li
                        key={j}
                        className={`flex items-start gap-3 text-xs font-medium ${dc('text-slate-400', 'text-slate-500')}`}
                      >
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${colors.checkColor}`} />
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
          SECTION 2.5 — DIFERENCIAIS (STRATEGIC)
         ═══════════════════════════════════════ */}
      <section
        id="diferenciais"
        className={`relative z-10 py-20 md:py-32 px-4 sm:px-6 border-b ${dc('border-slate-800/50', 'border-slate-200/50')}`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto mb-16"
          >
             <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm ${
                dc('bg-slate-900/80 border-slate-700/50 text-emerald-400', 'bg-slate-50/80 border-slate-200/50 text-emerald-600')
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Por que a PGBA?
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-3xl md:text-4xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Não somos apenas uma fábrica de software.
            </motion.h2>
            <motion.p variants={fadeUp} className={`text-lg ${dc('text-slate-300', 'text-slate-600')}`}>
              Somos parceiros estratégicos focados em resolver dores reais.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {DIFFERENTIATORS.map((diff, i) => {
               const colors = COLOR_MAP[diff.color];
               return (
                 <motion.div
                   key={i}
                   variants={fadeUp}
                   className={`p-8 rounded-3xl border text-center transition-all duration-300 hover:-translate-y-1 ${
                     isDark 
                      ? 'bg-slate-900/20 border-slate-800/50 hover:bg-slate-800/40' 
                      : 'bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg'
                   }`}
                 >
                   <div className={`w-16 h-16 mx-auto rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                     <diff.icon className={`w-8 h-8 ${colors.text}`} />
                   </div>
                   <h3 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>{diff.title}</h3>
                   <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-600')}`}>{diff.description}</p>
                 </motion.div>
               )
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — PRODUTOS
         ═══════════════════════════════════════ */}
      <section
        id="produtos"
        className={`relative z-10 py-20 md:py-32 px-4 sm:px-6 border-b ${
          dc('border-slate-800/50', 'border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm ${
                dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nossos Produtos & Soluções
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className={`text-3xl md:text-5xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}
            >
              Tecnologia própria para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-500 to-orange-500">
                negócios reais.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={`text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Do varejo inteligente à automação industrial — desenvolvemos
              produtos que resolvem problemas reais com engenharia de verdade.
            </motion.p>
          </motion.div>

          {/* ─── PRODUTO 1: MINHA AMORA ─── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`relative rounded-3xl border overflow-hidden mb-12 group ${
              dc(
                'bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/30 border-slate-800/50',
                'bg-gradient-to-br from-white via-white to-pink-50 border-slate-200 shadow-2xl'
              )
            }`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-500/10 blur-3xl group-hover:opacity-75 transition-opacity duration-700" />
            
            <div className="relative z-10 p-8 sm:p-12 md:p-16">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                {/* Left: Info */}
                <div className="lg:w-1/2 space-y-8">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      dc(
                        'bg-pink-500/10 text-pink-400 ring-1 ring-pink-500/20',
                        'bg-pink-50 text-pink-600 ring-1 ring-pink-200'
                      )
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    SaaS — Produto Próprio PGBA
                  </div>
                  <h3 className={`text-3xl md:text-4xl font-bold ${dc('text-white', 'text-slate-900')}`}>
                    Minha Amora 🌸
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                      Estoque finalmente inteligente.
                    </span>
                  </h3>
                  <p className={`text-base md:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                    Pensado para consultoras da Natura, Avon, Boticário, Mary
                    Kay e outras marcas. Não é planilha, não é genérico. É uma
                    ferramenta que entende o seu negócio e te ajuda a tomar
                    decisões melhores todos os dias.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="#contato"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 group"
                    >
                      Quero Conhecer
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <span
                      className={`inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-bold ${
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
                      className={`p-6 rounded-2xl border transition-all duration-300 group/card ${
                        dc(
                          'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-pink-500/30',
                          'bg-white/80 border-slate-200 hover:shadow-lg hover:border-pink-300'
                        )
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform ${
                          dc('bg-pink-500/10', 'bg-pink-50')
                        }`}
                      >
                        <feature.icon className={`w-6 h-6 ${dc('text-pink-400', 'text-pink-500')}`} />
                      </div>
                      <h4 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                        {feature.title}
                      </h4>
                      <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── PRODUTO 2: IoT & SMART KIOSK SYSTEMS ─── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`relative rounded-3xl border overflow-hidden group ${
              dc(
                'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-slate-800/50',
                'bg-gradient-to-br from-white via-white to-amber-50 border-slate-200 shadow-2xl'
              )
            }`}
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-3xl group-hover:opacity-75 transition-opacity duration-700" />

            <div className="relative z-10 p-8 sm:p-12 md:p-16">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                {/* Left: Info */}
                <div className="lg:w-1/2 space-y-8">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      dc(
                        'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
                        'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                      )
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    IoT & Sistemas Embarcados
                  </div>
                  <h3 className={`text-3xl md:text-4xl font-bold ${dc('text-white', 'text-slate-900')}`}>
                    Smart Kiosk &{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                      Vending Machine Systems
                    </span>
                  </h3>
                  <p className={`text-base md:text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                    Desenvolvimento end-to-end de sistemas inteligentes para
                    vending machines e kiosks de autoatendimento. Arquitetura em
                    3 camadas — backend centralizado, painel administrativo web e
                    cliente embarcado com IoT.
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2">
                    {['Django', 'React', 'Raspberry Pi', 'IoT Sensors', 'PIX / Cartão', 'Docker', 'PostgreSQL', 'GPIO'].map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                          dc(
                            'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
                            'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                          )
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="#contato"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 group"
                    >
                      Solicitar Orçamento
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <span
                      className={`inline-flex items-center justify-center px-8 py-4 rounded-full text-sm font-bold ${
                        dc(
                          'text-slate-400 bg-slate-800/50 ring-1 ring-slate-700/50',
                          'text-slate-500 bg-slate-100 ring-1 ring-slate-200'
                        )
                      }`}
                    >
                      Projetos sob demanda
                    </span>
                  </div>
                </div>

                {/* Right: Features Grid */}
                <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {IOT_KIOSK_FEATURES.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={scaleIn}
                      className={`p-6 rounded-2xl border transition-all duration-300 group/card ${
                        dc(
                          'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-amber-500/30',
                          'bg-white/80 border-slate-200 hover:shadow-lg hover:border-amber-300'
                        )
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform ${
                          dc('bg-amber-500/10', 'bg-amber-50')
                        }`}
                      >
                        <feature.icon className={`w-6 h-6 ${dc('text-amber-400', 'text-amber-500')}`} />
                      </div>
                      <h4 className={`text-base font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>
                        {feature.title}
                      </h4>
                      <p className={`text-sm leading-relaxed ${dc('text-slate-400', 'text-slate-500')}`}>
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Arquitetura Visual */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`mt-16 p-8 rounded-3xl border ${
                  dc('bg-slate-800/30 border-slate-700/50', 'bg-slate-50 border-slate-200')
                }`}
              >
                <h4 className={`text-sm font-bold uppercase tracking-widest mb-8 text-center ${
                  dc('text-amber-400', 'text-amber-600')
                }`}>
                  Arquitetura do Sistema
                </h4>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                  {[
                    { icon: Monitor, title: 'Kiosk / Display', sub: 'React Fullscreen', color: 'text-amber-400' },
                    { icon: Cpu, title: 'Raspberry Pi', sub: 'IoT + Sensores + GPIO', color: 'text-emerald-400' },
                    { icon: Database, title: 'Backend Central', sub: 'Django + PostgreSQL', color: 'text-blue-400' },
                    { icon: BarChart4, title: 'Painel Admin', sub: 'React + Dashboard', color: 'text-violet-400' }
                  ].map((step, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div className={`flex flex-col items-center p-6 rounded-2xl border min-w-[140px] transition-transform hover:scale-105 ${
                        dc('bg-slate-900/50 border-slate-700/50', 'bg-white border-slate-200')
                      }`}>
                        <step.icon className={`w-8 h-8 mb-3 ${dc(step.color, step.color.replace('400', '500'))}`} />
                        <span className={`text-sm font-bold ${dc('text-white', 'text-slate-900')}`}>{step.title}</span>
                        <span className={`text-[10px] mt-1 font-medium ${dc('text-slate-500', 'text-slate-400')}`}>{step.sub}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className={`text-2xl ${dc('text-slate-600', 'text-slate-300')} rotate-90 md:rotate-0`}>→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4 — CASES
         ═══════════════════════════════════════ */}
      <section
        id="cases"
        className={`relative z-10 py-20 md:py-32 px-4 sm:px-6 border-b ${
          dc('bg-slate-900/20 border-slate-800/50', 'bg-slate-50/50 border-slate-200/50')
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
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
              className={`text-3xl md:text-5xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}
            >
              Experiência aplicada em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">
                setores reais.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={`text-lg leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}
            >
              Projetos desenvolvidos ao longo da trajetória profissional do
              fundador, aplicando tecnologia para resolver problemas reais de
              negócio.
            </motion.p>
          </motion.div>

          {/* Cases Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {CASES.map((caseItem, i) => {
              const colors = COLOR_MAP[caseItem.color];
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`group relative p-8 rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? `bg-slate-900/40 border-slate-800/60 ${colors.hoverBorder} hover:bg-slate-800/60`
                      : `bg-white/60 border-slate-200 hover:shadow-xl ${colors.hoverBorderLight} hover:bg-white`
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                      isDark ? colors.bg : colors.bgLight
                    }`}>
                      <caseItem.icon className={`w-6 h-6 ${isDark ? colors.text : colors.textLight}`} />
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                      isDark ? colors.text : colors.textLight
                    }`}>
                      {caseItem.sector}
                    </div>
                    <h3 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>
                      {caseItem.title}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-6 ${dc('text-slate-400', 'text-slate-600')}`}>
                      {caseItem.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {caseItem.tags.map((tag, j) => (
                        <span
                          key={j}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
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
          SECTION 5 — CONTATO
         ═══════════════════════════════════════ */}
      <section
        id="contato"
        className="relative z-10 py-20 md:py-32 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`p-8 sm:p-16 rounded-[2.5rem] border relative overflow-hidden backdrop-blur-sm ${
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
              <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold mb-6 ${dc('text-white', 'text-slate-900')}`}>
                Pronto para transformar{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">
                  seu negócio?
                </span>
              </h2>
              <p className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Vamos conversar sobre como a PGBA Solutions pode ajudar sua
                empresa com dados, automação, software, IoT e inteligência
                artificial. Agende uma conversa sem compromisso.
              </p>

              {/* Botões de CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a
                  href="mailto:suporte@pgbasolutions.com.br"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] hover:scale-105 group"
                >
                  <Mail className="w-5 h-5" />
                  Enviar E-mail
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://wa.me/5571999772054"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 backdrop-blur-sm border ${
                    dc(
                      'bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 hover:border-slate-500/50 text-slate-200',
                      'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-700'
                    )
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>

              {/* Info de Contato */}
              <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 mt-12 pt-8 border-t ${dc('border-slate-800/50', 'border-slate-200')} relative z-10`}>
                <div className={`flex items-center gap-3 text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
                  <Mail className="w-5 h-5 text-cyan-500" />
                  suporte@pgbasolutions.com.br
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
                  <MapPin className="w-5 h-5 text-cyan-500" />
                  Salvador, Bahia — Brasil
                </div>
                <div className={`flex items-center gap-3 text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
                  <Globe className="w-5 h-5 text-cyan-500" />
                  Atendimento remoto nacional
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════ */}
      <footer
        className={`relative z-10 border-t backdrop-blur-sm ${
          dc('border-slate-800/50 bg-slate-950', 'border-slate-200 bg-white')
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          {/* Row 1: Logo + Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className={`font-bold text-lg ${dc('text-white', 'text-slate-900')}`}>
                  PGBA<span className="text-cyan-500">.</span>
                </span>
                <span className={`text-xs uppercase tracking-wider font-semibold ml-2 hidden sm:inline ${dc('text-slate-500', 'text-slate-400')}`}>
                  Solutions Technologies
                </span>
              </div>
            </div>

            {/* Footer Nav */}
            <div className={`flex flex-wrap items-center justify-center gap-8 text-sm font-medium ${dc('text-slate-400', 'text-slate-500')}`}>
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
            className={`text-center text-sm pt-8 border-t ${
              dc('border-slate-800/50 text-slate-500', 'border-slate-200 text-slate-400')
            }`}
          >
            {/* No footer do PGBASite.tsx */}
            <a href="/privacidade" className="hover:text-cyan-500 transition-colors">
              Política de Privacidade
            </a>
            {' • '}
            <a href="/termos" className="hover:text-cyan-500 transition-colors">
              Termos de Uso
            </a>
            <p className="mb-2 font-medium">
              © {new Date().getFullYear()} PGBA Solutions Technologies.
              Todos os direitos reservados.
            </p>
            <p className="text-cyan-500 font-bold mb-8">
              Transformando dados, processos e sistemas em decisão,
              eficiência e crescimento.
            </p>
          </div>

          {/* Row 3: DISCLAIMER JURÍDICO */}
          <div
            className={`mt-8 pt-8 border-t text-center ${
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