// src/pages/Portfolio.tsx
// Decisão arquitetural: Foco em conversão — Skills e Projetos em destaque.
// Estrutura inspirada em portfólios de alta performance (Attekita, Rhuan, Iuri).
// Mantém design system PGBA: COLOR_MAP, animações, tema dark/light.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/pgba/ThemeToggle';
import {
  ArrowRight, ExternalLink, Github, Globe, Code2, Database,
  Cpu, ShoppingBag, BarChart4, Terminal, Zap, Shield, Rocket,
  Filter, ChevronDown, CheckCircle, Play, Users, Lightbulb,
  Target, Heart, Sparkles, MapPin, Mail, Phone, Download,
  Briefcase, Clock, ChevronUp, Award, TrendingUp, Star,
  Linkedin, FileText, MessageSquare
} from 'lucide-react';

/* ─── ANIMATION VARIANTS ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
} as const;

/* ─── COLOR MAP (PGBA Design System) ─── */
const COLOR_MAP = {
  cyan: {
    text: 'text-cyan-400', textLight: 'text-cyan-600',
    bg: 'bg-cyan-500/10', bgLight: 'bg-cyan-50',
    hoverBorder: 'hover:border-cyan-500/50', hoverBorderLight: 'hover:border-cyan-300',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    ring: 'ring-cyan-500/20', iconColor: 'text-cyan-400',
  },
  violet: {
    text: 'text-violet-400', textLight: 'text-violet-600',
    bg: 'bg-violet-500/10', bgLight: 'bg-violet-50',
    hoverBorder: 'hover:border-violet-500/50', hoverBorderLight: 'hover:border-violet-300',
    gradient: 'from-violet-500/20 to-purple-500/20',
    ring: 'ring-violet-500/20', iconColor: 'text-violet-400',
  },
  blue: {
    text: 'text-blue-400', textLight: 'text-blue-600',
    bg: 'bg-blue-500/10', bgLight: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-500/50', hoverBorderLight: 'hover:border-blue-300',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    ring: 'ring-blue-500/20', iconColor: 'text-blue-400',
  },
  emerald: {
    text: 'text-emerald-400', textLight: 'text-emerald-600',
    bg: 'bg-emerald-500/10', bgLight: 'bg-emerald-50',
    hoverBorder: 'hover:border-emerald-500/50', hoverBorderLight: 'hover:border-emerald-300',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    ring: 'ring-emerald-500/20', iconColor: 'text-emerald-400',
  },
  pink: {
    text: 'text-pink-400', textLight: 'text-pink-600',
    bg: 'bg-pink-500/10', bgLight: 'bg-pink-50',
    hoverBorder: 'hover:border-pink-500/50', hoverBorderLight: 'hover:border-pink-300',
    gradient: 'from-pink-500/20 to-rose-500/20',
    ring: 'ring-pink-500/20', iconColor: 'text-pink-400',
  },
  amber: {
    text: 'text-amber-400', textLight: 'text-amber-600',
    bg: 'bg-amber-500/10', bgLight: 'bg-amber-50',
    hoverBorder: 'hover:border-amber-500/50', hoverBorderLight: 'hover:border-amber-300',
    gradient: 'from-amber-500/20 to-orange-500/20',
    ring: 'ring-amber-500/20', iconColor: 'text-amber-400',
  },
} as const;
type ColorKey = keyof typeof COLOR_MAP;

/* ─── TYPES ─── */
interface ProjectMedia {
  type: 'image' | 'video';
  source: 'youtube' | 'vimeo' | 'local' | null;
  url: string;
  thumbnail?: string;
  alt: string;
}

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  category: string;
  status: string;
  statusColor: ColorKey;
  color: ColorKey;
  links: { demo?: string; github?: string; docs?: string };
  highlights: string[];
  metrics: { label: string; value: string }[];
  media?: ProjectMedia[];
}

interface ExperienceMedia {
  type: 'video' | 'image';
  source: 'youtube' | 'vimeo' | 'local' | null;
  url: string;
  thumbnail?: string;
  title: string;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  duration: string;
  location: string;
  type: string;
  description: string | string[];
  skills: string[];
  media?: ExperienceMedia;
  logoColor: ColorKey;
  icon: React.ElementType;
  results?: { label: string; value: string }[];
}

interface Skill {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate';
  color: ColorKey;
  icon?: React.ElementType;
}

interface SkillGroup {
  category: string;
  icon: React.ElementType;
  color: ColorKey;
  items: Skill[];
}

interface CaseStudy {
  id: string;
  client: string;
  sector: string;
  problem: string;
  solution: string;
  result: string;
  metrics: { label: string; value: string }[];
  tags: string[];
  color: ColorKey;
}

/* ─── DADOS: SKILLS (em destaque) ─── */
const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Backend & APIs',
    icon: Code2,
    color: 'cyan',
    items: [
      { name: 'Python', level: 'Expert', color: 'cyan' },
      { name: 'Django / DRF', level: 'Expert', color: 'cyan' },
      { name: 'Node.js', level: 'Advanced', color: 'cyan' },
      { name: 'FastAPI', level: 'Advanced', color: 'cyan' },
      { name: 'SQL / PostgreSQL', level: 'Advanced', color: 'cyan' },
    ],
  },
  {
    category: 'Frontend & UI',
    icon: Terminal,
    color: 'violet',
    items: [
      { name: 'React / TypeScript', level: 'Expert', color: 'violet' },
      { name: 'Tailwind CSS', level: 'Advanced', color: 'violet' },
      { name: 'Framer Motion', level: 'Advanced', color: 'violet' },
      { name: 'Next.js', level: 'Intermediate', color: 'violet' },
      { name: 'Design Systems', level: 'Advanced', color: 'violet' },
    ],
  },
  {
    category: 'Data & BI',
    icon: BarChart4,
    color: 'blue',
    items: [
      { name: 'Power BI / DAX', level: 'Expert', color: 'blue' },
      { name: 'ETL / Pandas', level: 'Advanced', color: 'blue' },
      { name: 'Modelagem P&L', level: 'Advanced', color: 'blue' },
      { name: 'SAP Integration', level: 'Advanced', color: 'blue' },
      { name: 'Analytics', level: 'Intermediate', color: 'blue' },
    ],
  },
  {
    category: 'Infra & DevOps',
    icon: Cpu,
    color: 'emerald',
    items: [
      { name: 'Docker', level: 'Advanced', color: 'emerald' },
      { name: 'Linux / Bash', level: 'Advanced', color: 'emerald' },
      { name: 'CI/CD', level: 'Intermediate', color: 'emerald' },
      { name: 'Raspberry Pi / IoT', level: 'Advanced', color: 'emerald' },
      { name: 'PIX API Integration', level: 'Advanced', color: 'emerald' },
    ],
  },
  {
    category: 'Negócio & Estratégia',
    icon: Target,
    color: 'amber',
    items: [
      { name: 'LGPD & Conformidade', level: 'Advanced', color: 'amber' },
      { name: 'Product Strategy', level: 'Advanced', color: 'amber' },
      { name: 'ROI & Métricas', level: 'Expert', color: 'amber' },
      { name: 'Automação de Processos', level: 'Expert', color: 'amber' },
      { name: 'Gestão de Projetos', level: 'Advanced', color: 'amber' },
    ],
  },
];

/* ─── DADOS: PROJETOS (cards visuais) ─── */
const PROJECTS: Project[] = [
  {
    id: 'minha-amora',
    title: 'Minha Amora',
    subtitle: 'SaaS de Gestão para Consultoras de Beleza',
    description: 'Plataforma completa para gestão de estoque, vendas e tomada de decisão para consultoras da Natura, Avon, Boticário e outras marcas.',
    longDescription: 'O Minha Amora nasceu da necessidade real de consultoras que gerenciavam seus negócios em planilhas complexas. Desenvolvi uma solução que combina simplicidade na interface com inteligência nos dados: previsão de reposição, análise de margem, acompanhamento de metas e integração futura com APIs de pagamento.',
    image: '/assets/projects/minha-amora-preview.png',
    tags: ['SaaS', 'React', 'Django', 'PostgreSQL', 'PIX API'],
    category: 'produto-proprio',
    status: 'Em desenvolvimento',
    statusColor: 'violet',
    color: 'pink',
    links: { demo: '#', github: '#', docs: '#' },
    highlights: [
      'Gestão de estoque com alertas de reposição automática',
      'Dashboard de desempenho por marca e período',
      'Exportação de relatórios para PDF/Excel',
      'Arquitetura preparada para LGPD e escalabilidade',
    ],
    metrics: [
      { label: 'Consultoras na lista', value: '150+' },
      { label: 'Marcas suportadas', value: '5+' },
      { label: 'Setup médio', value: '< 5 min' },
    ],
    media: [{ type: 'video', source: 'youtube', url: 'SEU_ID_AQUI', alt: 'Demo Minha Amora' }],
  },
  {
    id: 'smart-kiosk',
    title: 'Smart Kiosk & Vending Machine',
    subtitle: 'Hardware + Software com IoT e PIX',
    description: 'Sistema embarcado com Raspberry Pi, sensores IoT e pagamento via PIX integrado. Ideal para pontos de venda autônomos.',
    longDescription: 'Projeto que une hardware e software: Raspberry Pi como cérebro, sensores para controle de estoque físico, interface touch simplificada e módulo de pagamento PIX com fallback offline.',
    image: '/assets/projects/smart-kiosk-preview.png',
    tags: ['IoT', 'Raspberry Pi', 'Python', 'React', 'PIX', 'Linux'],
    category: 'hardware-software',
    status: 'Protótipo validado',
    statusColor: 'emerald',
    color: 'cyan',
    links: { demo: '#', github: '#', docs: '#' },
    highlights: [
      'Operação offline com sincronização assíncrona',
      'Interface touch otimizada para uso com luvas',
      'Integração com API do Mercado Pago para PIX',
      'Monitoramento remoto via dashboard web',
    ],
    metrics: [
      { label: 'Resposta offline', value: '< 200ms' },
      { label: 'Autonomia', value: '72h+' },
      { label: 'Custo hardware', value: '~R$ 400' },
    ],
    media: [{ type: 'video', source: 'youtube', url: 'SEU_ID_AQUI', alt: 'Demo Smart Kiosk' }],
  },
  {
    id: 'bi-controladoria',
    title: 'Plataforma de BI para Controladoria',
    subtitle: 'Dashboards Executivos em Tempo Real',
    description: 'Solução de Business Intelligence para acompanhamento de P&L, fluxo de caixa e indicadores estratégicos, com extração automatizada de dados de ERPs e SAP.',
    longDescription: 'Desenvolvi pipelines ETL em Python para integrar dados de múltiplas fontes (SAP, planilhas, APIs) a dashboards Power BI com atualização em tempo real.',
    image: '/assets/projects/bi-controladoria-preview.png',
    tags: ['Power BI', 'Python', 'ETL', 'SAP', 'SQL', 'DAX'],
    category: 'bi-dados',
    status: 'Entregue',
    statusColor: 'blue',
    color: 'blue',
    links: { demo: '#', docs: '#' },
    highlights: [
      'Extração automatizada de dados SAP via RFC/BAPI',
      'Modelagem dimensional para análise multidimensional',
      'Alertas de desvio de orçamento em tempo real',
      'Documentação técnica e de usuário completa',
    ],
    metrics: [
      { label: 'Redução de tempo', value: '80%' },
      { label: 'Fontes integradas', value: '4+' },
      { label: 'Atualização', value: '15 min' },
    ],
    media: [{ type: 'video', source: 'youtube', url: 'SEU_ID_AQUI', alt: 'Demo BI Controladoria' }],
  },
  {
    id: 'rpa-supply',
    title: 'Automação de Processos - Supply Chain',
    subtitle: 'RPA para Pedidos e MRO',
    description: 'Scripts Python e workflows Power Automate para eliminar entrada manual de dados em processos de compras, recebimento e manutenção industrial.',
    longDescription: 'Identifiquei gargalos repetitivos no fluxo de suprimentos e desenvolvi automações que leem e-mails, extraem dados de PDFs, validam regras de negócio e integram com ERP.',
    image: '/assets/projects/rpa-supply-preview.png',
    tags: ['Python', 'Power Automate', 'RPA', 'PDF', 'API'],
    category: 'automacao',
    status: 'Em produção',
    statusColor: 'emerald',
    color: 'emerald',
    links: { docs: '#' },
    highlights: [
      'Leitura inteligente de faturas em PDF com pdfplumber',
      'Validação de regras de negócio antes da integração',
      'Logs detalhados para auditoria e troubleshooting',
      'Arquitetura modular para fácil manutenção',
    ],
    metrics: [
      { label: 'Processos automatizados', value: '12+' },
      { label: 'Redução de erros', value: '95%' },
      { label: 'Horas economizadas', value: '40h+/mês' },
    ],
    media: [{ type: 'video', source: 'local', url: '/assets/videos/rpa-demo.mp4', alt: 'Demo RPA Supply' }],
  },
];

const PROJECT_CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: Filter },
  { id: 'produto-proprio', label: 'Produtos Próprios', icon: Rocket },
  { id: 'hardware-software', label: 'Hardware + Software', icon: Cpu },
  { id: 'bi-dados', label: 'BI & Dados', icon: BarChart4 },
  { id: 'automacao', label: 'Automação', icon: Zap },
];

/* ─── DADOS: CASES DE IMPACTO ─── */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-bi',
    client: 'Empresa de Energia',
    sector: 'Controladoria',
    problem: 'Relatórios financeiros manuais levavam 3 dias para serem consolidados, com risco de erro humano e falta de visibilidade em tempo real.',
    solution: 'Desenvolvi pipeline ETL em Python integrando SAP B1, Bitrix e planilhas, com dashboards Power BI atualizados a cada 15 minutos e alertas proativos de desvios.',
    result: 'Redução de 80% no tempo de reporte, eliminação de erros manuais e tomada de decisão baseada em dados atualizados.',
    metrics: [
      { label: 'Tempo de reporte', value: '3 dias → 4h' },
      { label: 'Fontes integradas', value: '4' },
      { label: 'Atualização', value: '15 min' },
    ],
    tags: ['Power BI', 'Python', 'SAP', 'ETL'],
    color: 'blue',
  },
  {
    id: 'case-rpa',
    client: 'Indústria Petroquímica',
    sector: 'Supply Chain',
    problem: 'Equipe gastava 40h/mês em entrada manual de pedidos, cotações e diligenciamento, com alto índice de retrabalho.',
    solution: 'Automações em Python + Power Automate para leitura de e-mails, extração de PDFs, validação de regras e integração com SAP/COUPA.',
    result: 'Liberação de 40h/mês da equipe para atividades estratégicas e redução de 95% em erros de digitação.',
    metrics: [
      { label: 'Horas economizadas', value: '40h/mês' },
      { label: 'Processos automatizados', value: '12+' },
      { label: 'Redução de erros', value: '95%' },
    ],
    tags: ['Python', 'RPA', 'SAP', 'Power Automate'],
    color: 'emerald',
  },
  {
    id: 'case-iot',
    client: 'Varejo / Autônomo',
    sector: 'Ponto de Venda',
    problem: 'Pontos de venda em locais com conectividade limitada precisavam de solução offline-first com pagamento PIX.',
    solution: 'Sistema embarcado com Raspberry Pi, sensores de peso, interface touch simplificada e módulo PIX com fallback offline e sincronização assíncrona.',
    result: 'Protótipo validado operando 72h sem internet, com resposta <200ms e custo de hardware ~R$400.',
    metrics: [
      { label: 'Resposta offline', value: '< 200ms' },
      { label: 'Autonomia', value: '72h+' },
      { label: 'Custo hardware', value: '~R$ 400' },
    ],
    tags: ['IoT', 'Raspberry Pi', 'PIX', 'React'],
    color: 'cyan',
  },
];

/* ─── DADOS: EXPERIÊNCIA (formato LinkedIn compacto) ─── */
const EXPERIENCES: Experience[] = [
  {
    id: 'mxplan-acelen',
    role: 'Analista de Dados - Suprimentos',
    company: 'MXPLAN / ACELEN ENERGIA',
    period: 'out/2025 - atual',
    duration: '8 meses',
    location: 'Presencial',
    type: 'Tempo integral',
    description: 'Análise de dados para suprimentos e contratação de serviços, com dashboards executivos e integração SAP/ERP.',
    skills: ['Power BI', 'Python', 'SAP', 'SQL'],
    logoColor: 'cyan',
    icon: Zap,
    results: [{ label: 'Relatórios automatizados', value: '10+' }],
  },
  {
    id: 'pgba-solutions',
    role: 'Fundador | Arquiteto de Soluções',
    company: 'PGBA Solutions Technologies',
    period: 'jul/2023 - atual',
    duration: '2 anos 11 meses',
    location: 'Salvador, BA · Remoto',
    type: 'Autônomo',
    description: [
      'Soluções tecnológicas para micro e pequenas empresas.',
      'Arquitetura de dados, BI, automação, fullstack e IA orientada a resultado.',
      'Produto próprio: Minha Amora (gestão de estoque para consultoras).'
    ],
    skills: ['Python', 'Django', 'React', 'Power BI', 'IoT', 'LGPD'],
    logoColor: 'violet',
    icon: Rocket,
    results: [{ label: 'Projetos entregues', value: '50+' }],
  },
  {
    id: 'oxaala-cnpq',
    role: 'Desenvolvedor FullStack | Pesquisa Aplicada',
    company: 'Oxaala · CNPq/UFBA',
    period: 'abr/2024 - atual',
    duration: '2 anos 2 meses',
    location: 'Remoto',
    type: 'Tempo integral',
    description: 'Desenvolvimento fullstack para soluções aplicadas a dados sísmicos e interpretação automatizada de perfis de poços.',
    skills: ['Python', 'ML', 'FastAPI', 'React', 'PostgreSQL'],
    logoColor: 'blue',
    icon: Globe,
  },
  {
    id: 'absolut-technologies',
    role: 'Especialista de Controladoria',
    company: 'absolut technologies',
    period: 'ago/2024 - set/2025',
    duration: '1 ano 2 meses',
    location: 'Híbrido',
    type: 'Tempo integral',
    description: [
      'DRE Gerencial, Fluxo de Caixa, Contas a Pagar/Receber.',
      'Dashboards Power BI integrando Bitrix, SAP B1, projetos e logística.',
      'Automações com Power Automate e RPA Python.'
    ],
    skills: ['Power BI', 'SAP B1', 'SQL', 'Python', 'Excel'],
    logoColor: 'emerald',
    icon: BarChart4,
    results: [{ label: 'Redução de retrabalho', value: '70%' }],
  },
  {
    id: 'braskem-pleno',
    role: 'Analista de Logística Pleno | MRO',
    company: 'BRASKEM (via MRO Logistics)',
    period: 'nov/2021 - jan/2024',
    duration: '2 anos 3 meses',
    location: 'Presencial',
    type: 'Tempo integral',
    description: 'Gestão de suprimentos MRO, cotações COUPA, diligenciamento de pedidos, automações com VBA e Python.',
    skills: ['SAP ERP', 'Python', 'VBA', 'COUPA', 'Power BI'],
    logoColor: 'cyan',
    icon: Database,
  },
];

/* ─── COMPONENTES AUXILIARES ─── */

function SkillBadge({ skill }: { skill: Skill }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = COLOR_MAP[skill.color];
  
  const levelStyles = {
    Expert: 'ring-2 ring-offset-1 ' + (isDark ? 'ring-cyan-400/50 ring-offset-slate-900' : 'ring-cyan-500/30 ring-offset-white'),
    Advanced: 'ring-1 ' + (isDark ? 'ring-slate-700/50' : 'ring-slate-300'),
    Intermediate: isDark ? 'opacity-80' : 'opacity-90',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`group relative px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-default ${
        isDark 
          ? `bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-800 hover:border-${skill.color}-500/30` 
          : `bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-${skill.color}-300`
      } ${levelStyles[skill.level]}`}
    >
      <div className="flex items-center gap-2">
        <span className={colors.iconColor}>●</span>
        {skill.name}
      </div>
      <span className={`absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${
        skill.level === 'Expert' 
          ? (isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700')
          : skill.level === 'Advanced'
          ? (isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600')
          : (isDark ? 'bg-slate-800/30 text-slate-500' : 'bg-slate-50 text-slate-400')
      }`}>
        {skill.level === 'Expert' ? '★' : skill.level === 'Advanced' ? '●' : '○'}
      </span>
    </motion.div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);
  const colors = COLOR_MAP[project.color];
  const statusColors = COLOR_MAP[project.statusColor];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 ${
        isDark
          ? `bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-${project.color}-500/30`
          : `bg-white border-slate-200 hover:bg-slate-50 hover:border-${project.color}-300 hover:shadow-lg`
      }`}
    >
      {/* Imagem/Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-slate-900/80' : 'from-white/80'} to-transparent`} />
        
        {/* Badge de Status */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          isDark ? `${statusColors.bg} ${statusColors.text}` : `${statusColors.bgLight} ${statusColors.textLight}`
        }`}>
          {project.status}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <h3 className={`text-lg font-bold mb-1 ${dc('text-white', 'text-slate-900')}`}>{project.title}</h3>
        <p className={`text-sm mb-3 ${dc('text-slate-400', 'text-slate-500')}`}>{project.subtitle}</p>
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${dc('text-slate-300', 'text-slate-600')}`}>
          {project.description}
        </p>

        {/* Tags de Tech */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
              isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Métricas em Destaque */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dashed border-slate-700/30">
          {project.metrics.slice(0, 3).map((m, i) => (
            <div key={i} className="text-center">
              <div className={`text-sm font-bold ${colors.text}`}>{m.value}</div>
              <div className={`text-[9px] uppercase tracking-wide ${dc('text-slate-500', 'text-slate-400')}`}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CaseCard({ caseItem }: { caseItem: CaseStudy }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);
  const colors = COLOR_MAP[caseItem.color];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className={`p-6 rounded-2xl border ${
        isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{caseItem.sector}</span>
          <h4 className={`text-lg font-bold mt-1 ${dc('text-white', 'text-slate-900')}`}>{caseItem.client}</h4>
        </div>
        <Award className={`w-5 h-5 ${colors.iconColor}`} />
      </div>

      <div className="space-y-4">
        <div>
          <span className={`text-xs font-semibold uppercase ${dc('text-slate-500', 'text-slate-400')}`}>Problema</span>
          <p className={`text-sm mt-1 ${dc('text-slate-300', 'text-slate-600')}`}>{caseItem.problem}</p>
        </div>
        <div>
          <span className={`text-xs font-semibold uppercase ${dc('text-slate-500', 'text-slate-400')}`}>Solução</span>
          <p className={`text-sm mt-1 ${dc('text-slate-300', 'text-slate-600')}`}>{caseItem.solution}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <span className={`text-xs font-semibold uppercase ${colors.text}`}>Resultado</span>
          <p className={`text-sm mt-1 font-medium ${colors.text}`}>{caseItem.result}</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-dashed border-slate-700/30">
        {caseItem.metrics.map((m, i) => (
          <div key={i} className="text-center">
            <div className={`text-lg font-bold ${colors.text}`}>{m.value}</div>
            <div className={`text-[10px] uppercase ${dc('text-slate-500', 'text-slate-400')}`}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {caseItem.tags.map((tag, i) => (
          <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);
  const colors = COLOR_MAP[exp.logoColor];
  const [expanded, setExpanded] = useState(false);

  const descArray = Array.isArray(exp.description) ? exp.description : [exp.description];
  const visibleDesc = !expanded && descArray.length > 1 ? descArray.slice(0, 1) : descArray;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className={`relative p-5 rounded-xl border transition-all ${
        isDark ? 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700/50' : 'bg-white border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <exp.icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold ${dc('text-white', 'text-slate-900')}`}>{exp.role}</h4>
          <div className={`flex flex-wrap items-center gap-2 text-xs mt-0.5 ${dc('text-slate-400', 'text-slate-500')}`}>
            <span className="font-medium">{exp.company}</span>
            <span>•</span>
            <span>{exp.period}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exp.duration}</span>
          </div>
          <div className={`flex items-center gap-2 mt-1 text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
            <span className={`px-2 py-0.5 rounded-full ${dc('bg-slate-800/50 text-slate-300', 'bg-slate-100 text-slate-600')}`}>{exp.type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>
          </div>

          <ul className={`text-sm mt-3 space-y-1.5 ${dc('text-slate-300', 'text-slate-600')}`}>
            {visibleDesc.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${dc('bg-slate-500', 'bg-slate-400')}`} />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {descArray.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1 text-xs font-medium mt-2 ${dc('text-cyan-400 hover:text-cyan-300', 'text-cyan-600 hover:text-cyan-500')}`}
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Ver menos</> : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
            </button>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {exp.skills.slice(0, 5).map((skill, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {skill}
              </span>
            ))}
          </div>

          {/* Resultado em Destaque */}
          {exp.results?.[0] && (
            <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg ${colors.bg}`}>
              <TrendingUp className={`w-3.5 h-3.5 ${colors.iconColor}`} />
              <span className={`text-xs font-bold ${colors.text}`}>{exp.results[0].value}</span>
              <span className={`text-xs ${dc('text-slate-400', 'text-slate-500')}`}>{exp.results[0].label}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PROJECT MODAL (com suporte a vídeo) ─── */
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);
  const colors = COLOR_MAP[project.color];
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMedia = project.media?.[mediaIndex];

  const getEmbedUrl = () => {
    if (!currentMedia) return '';
    if (currentMedia.source === 'youtube') 
      return `https://www.youtube.com/embed/${currentMedia.url}?autoplay=${isPlaying ? 1 : 0}&mute=1&rel=0`;
    if (currentMedia.source === 'vimeo') 
      return `https://player.vimeo.com/video/${currentMedia.url}?autoplay=${isPlaying ? 1 : 0}&muted=1&title=0`;
    return currentMedia.url;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'
        }`}
      >
        {/* Close */}
        <button onClick={onClose} className={`absolute top-4 right-4 z-10 p-2 rounded-full ${
          isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
        }`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.bg}`}>
              {project.category === 'produto-proprio' && <ShoppingBag className={`w-7 h-7 ${colors.iconColor}`} />}
              {project.category === 'hardware-software' && <Cpu className={`w-7 h-7 ${colors.iconColor}`} />}
              {project.category === 'bi-dados' && <BarChart4 className={`w-7 h-7 ${colors.iconColor}`} />}
              {project.category === 'automacao' && <Zap className={`w-7 h-7 ${colors.iconColor}`} />}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${dc('text-white', 'text-slate-900')}`}>{project.title}</h2>
              <p className={`text-sm ${colors.text} font-medium`}>{project.subtitle}</p>
            </div>
          </div>

          {/* Media Gallery */}
          {project.media?.length ? (
            <div className="mb-6">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                {!isPlaying && currentMedia?.type === 'video' ? (
                  <>
                    {currentMedia.thumbnail ? (
                      <img src={currentMedia.thumbnail} alt={currentMedia.alt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className={`w-12 h-12 ${dc('text-slate-600', 'text-slate-400')}`} />
                      </div>
                    )}
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-cyan-500/90 flex items-center justify-center shadow-lg">
                        <Play className="w-7 h-7 text-white ml-0.5" />
                      </div>
                    </button>
                  </>
                ) : currentMedia?.type === 'video' && currentMedia.source === 'local' ? (
                  <video src={currentMedia.url} controls autoPlay muted className="w-full h-full object-cover" />
                ) : (
                  <iframe
                    src={getEmbedUrl()}
                    title={currentMedia?.alt}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              {project.media.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {project.media.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setMediaIndex(idx); setIsPlaying(false); }}
                      className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === mediaIndex ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <Play className={`w-4 h-4 ${dc('text-slate-500', 'text-slate-400')}`} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`aspect-video rounded-xl mb-6 flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <img src={project.image} alt={project.title} className="w-full h-full object-cover rounded-xl" />
            </div>
          )}

          {/* Content */}
          <p className={`text-base leading-relaxed mb-6 ${dc('text-slate-300', 'text-slate-600')}`}>{project.longDescription}</p>

          {/* Highlights */}
          <div className="mb-6">
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${colors.text}`}>Destaques</h4>
            <ul className="space-y-2">
              {project.highlights.map((h, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${dc('text-slate-300', 'text-slate-600')}`}>
                  <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${colors.iconColor}`} />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl mb-6 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            {project.metrics.map((m, i) => (
              <div key={i} className="text-center">
                <div className={`text-2xl font-bold ${colors.text}`}>{m.value}</div>
                <div className={`text-xs ${dc('text-slate-400', 'text-slate-500')}`}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed border-slate-700/30">
            {project.links.demo && (
              <a href={project.links.demo} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${
                isDark ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
              }`}>
                <Globe className="w-3.5 h-3.5" /> Demo
              </a>
            )}
            {project.links.github && (
              <a href={project.links.github} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
                <Github className="w-3.5 h-3.5" /> Código
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function Portfolio() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSkillTab, setActiveSkillTab] = useState(0);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const filteredProjects = selectedCategory === 'todos' ? PROJECTS : PROJECTS.filter(p => p.category === selectedCategory);
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen font-outfit selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-500 ${
      dc('bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50',
         'bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900')
    }`}>

      {/* ─── HEADER ─── */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
        dc('border-slate-800/50 bg-slate-950/80', 'border-slate-200/50 bg-white/80')
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className={`font-bold text-lg ${dc('text-white', 'text-slate-900')}`}>Igor Guimarães Barros<span className="text-cyan-500">.</span></span>
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle isDarkMode={isDark} onToggle={toggleTheme} />
            <a href="/pgba" className={`hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-full ${
              dc('text-slate-400 hover:text-white hover:bg-slate-800', 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
            }`}>PGBA Solutions →</a>
          </div>
        </div>
      </header>

      {/* ─── HERO: PROPOSTA DE VALOR + SOCIAL PROOF ─── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
              dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
            }`}>
              <Sparkles className="w-3.5 h-3.5" /> Portfólio Profissional
            </div>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight ${dc('text-white', 'text-slate-900')}`}>
              Transformo dados brutos em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">decisão</span>,
              {' '}processos manuais em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">automação</span>,
              {' '}ideias em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">software</span>.
            </h1>

            <p className={`text-base sm:text-lg mb-8 max-w-3xl mx-auto ${dc('text-slate-300', 'text-slate-600')}`}>
              Engenheiro mecatrônico, desenvolvedor fullstack e especialista em dados. 
              8 anos unindo código, dados e negócio para entregar resultado mensurável.
            </p>

            {/* Social Proof */}
            <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> 50+ projetos entregues</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-cyan-400" /> 8+ anos de experiência</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-400" /> Salvador/BA · Presencial - Remoto</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#projetos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 hover:scale-105">
                Ver Projetos <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/assets/cv-igor.pdf" download className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm ${
                dc('text-slate-300 hover:text-white hover:bg-slate-800', 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}>
                <Download className="w-4 h-4" /> Baixar CV
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SKILLS EM DESTAQUE (ANTES DA EXPERIÊNCIA) ─── */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 border-y ${dc('border-slate-800/50', 'border-slate-200/50')}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
              dc('bg-slate-900/80 border-slate-700/50 text-violet-400', 'bg-slate-50/80 border-slate-200/50 text-violet-600')
            }`}>
              <Code2 className="w-3.5 h-3.5" /> Stack Técnico
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Ferramentas que domino com <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">profundidade</span>.
            </motion.h2>
            <motion.p variants={fadeUp} className={`text-base max-w-2xl mx-auto ${dc('text-slate-300', 'text-slate-600')}`}>
              Combino expertise técnica com visão de negócio para entregar soluções completas — do dado bruto à decisão executiva.
            </motion.p>
          </motion.div>

          {/* Tabs de Categorias */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {SKILL_GROUPS.map((group, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSkillTab(idx)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSkillTab === idx
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25'
                    : dc('text-slate-400 hover:text-white hover:bg-slate-800', 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <group.icon className="w-4 h-4" />
                {group.category}
              </button>
            ))}
          </div>

          {/* Grid de Skills */}
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="wait">
              {SKILL_GROUPS[activeSkillTab].items.map((skill, idx) => (
                <motion.div key={skill.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.03 }}>
                  <SkillBadge skill={skill} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Legenda de Níveis */}
          <div className={`flex items-center justify-center gap-4 mt-8 text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
            <span className="flex items-center gap-1"><span className="text-cyan-400">★</span> Expert</span>
            <span className="flex items-center gap-1"><span className="text-slate-400">●</span> Advanced</span>
            <span className="flex items-center gap-1"><span className="text-slate-500">○</span> Intermediate</span>
          </div>
        </div>
      </section>

      {/* ─── PROJETOS EM DESTAQUE (Cards Visuais) ─── */}
      <section id="projetos" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
              dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
            }`}>
              <Rocket className="w-3.5 h-3.5" /> Projetos
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Soluções que geram <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">resultado real</span>.
            </motion.h2>
          </motion.div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {PROJECT_CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                    : dc('text-slate-400 hover:text-white hover:bg-slate-800', 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}
              >
                <cat.icon className="w-4 h-4" /> {cat.label}
              </motion.button>
            ))}
          </div>

          {/* Grid de Projetos */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── CASES DE IMPACTO (Problema → Solução → Resultado) ─── */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 ${dc('bg-slate-900/20', 'bg-slate-50/50')}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
              dc('bg-slate-900/80 border-slate-700/50 text-emerald-400', 'bg-slate-50/80 border-slate-200/50 text-emerald-600')
            }`}>
              <TrendingUp className="w-3.5 h-3.5" /> Cases de Impacto
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Problemas reais, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">soluções mensuráveis</span>.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERIÊNCIA PROFISSIONAL (Compacta, Formato LinkedIn) ─── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
              dc('bg-slate-900/80 border-slate-700/50 text-blue-400', 'bg-slate-50/80 border-slate-200/50 text-blue-600')
            }`}>
              <Briefcase className="w-3.5 h-3.5" /> Trajetória
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Experiência com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">resultado comprovado</span>.
            </motion.h2>
          </motion.div>

          <div className="space-y-4">
            {EXPERIENCES.map((exp) => (
              <ExperienceCard key={exp.id} exp={exp} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIFERENCIAIS (Por Que Me Contratar) ─── */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 border-y ${dc('border-slate-800/50', 'border-slate-200/50')}`}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
              Por que trabalhar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">comigo</span>?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Visão de Negócio', desc: 'Cada linha de código precisa gerar ROI. Pergunto "isso impacta o resultado?" antes de desenvolver.', color: 'cyan' },
              { icon: Shield, title: 'LGPD by Design', desc: 'Privacidade e segurança não são opcionais. Construo soluções conformes desde o primeiro commit.', color: 'violet' },
              { icon: Zap, title: 'Entrega Rápida', desc: 'Protótipos funcionais em dias, não semanas. Validação contínua com foco em valor imediato.', color: 'blue' },
              { icon: Lightbulb, title: 'Simplicidade Inteligente', desc: 'Soluções que resolvem o problema real, sem complexidade desnecessária. Menos é mais.', color: 'emerald' },
            ].map((item, i) => {
              const colors = COLOR_MAP[item.color as ColorKey];
              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className={`p-6 rounded-2xl border text-center ${dc('bg-slate-900/30 border-slate-800/50', 'bg-white border-slate-200')}`}>
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${colors.bg}`}>
                    <item.icon className={`w-6 h-6 ${colors.iconColor}`} />
                  </div>
                  <h4 className={`font-bold mb-2 ${dc('text-white', 'text-slate-900')}`}>{item.title}</h4>
                  <p className={`text-sm ${dc('text-slate-400', 'text-slate-500')}`}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL FORTE ─── */}
      <section id="contato" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className={`p-8 sm:p-12 rounded-2xl border relative overflow-hidden ${
            dc('bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border-slate-800/50', 'bg-gradient-to-br from-white via-white to-cyan-50 border-slate-200')
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 blur-3xl" />
            <div className="relative z-10">
              <Sparkles className={`w-10 h-10 mx-auto mb-6 ${dc('text-cyan-400', 'text-cyan-500')}`} />
              <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
                Pronto para transformar seu negócio com dados e tecnologia?
              </h2>
              <p className={`text-base mb-8 ${dc('text-slate-300', 'text-slate-600')}`}>
                Vamos conversar sobre como posso ajudar com automação, BI, software ou IoT. 
                
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:suporte@pgbasolutions.com.br" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25 hover:scale-105">
                  <Mail className="w-4 h-4" /> Enviar E-mail
                </a>
                <a href="https://wa.me/5571999772054" target="_blank" rel="noopener noreferrer" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm ${
                  dc('bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 text-slate-200', 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700')
                }`}>
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
                <a href="https://www.linkedin.com/in/igor-guimarães-barros" target="_blank" rel="noopener noreferrer" className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm ${
                  dc('text-cyan-400 hover:text-cyan-300', 'text-cyan-600 hover:text-cyan-500')
                }`}>
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
              <p className={`mt-6 text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
                <MapPin className="w-3 h-3 inline mr-1" /> Salvador, BA 
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER MINIMAL ─── */}
      <footer className={`border-t py-8 px-4 sm:px-6 ${dc('border-slate-800/50', 'border-slate-200/50')}`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className={`text-sm ${dc('text-slate-500', 'text-slate-400')}`}>
            © {new Date().getFullYear()} Igor Guimarães Barros — Portfólio Pessoal. Todos os direitos reservados.
          </p>
          <p className={`text-xs mt-2 ${dc('text-slate-600', 'text-slate-400')}`}>
            As experiências mencionadas referem-se à minha trajetória profissional. Marcas citadas são propriedade de seus respectivos titulares.
          </p>
        </div>
      </footer>

      {/* ─── MODAL DE PROJETO ─── */}
      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
    </div>
  );
}