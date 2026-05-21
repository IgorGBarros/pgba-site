// src/components/portfolio/ExperienceTimeline.tsx
// Decisão: Formato LinkedIn enriquecido com mídia por experiência.
// Foco em clareza, resultado e prova visual do trabalho.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import {
  Building2, Calendar, MapPin, Briefcase, Clock, ChevronDown, ChevronUp,
  Play, Pause, ExternalLink, Code2, BarChart4, Cpu, Shield, Rocket,
  Users, Lightbulb, Target, Zap, Database, Globe, BriefcaseBusiness
} from 'lucide-react';

/* ─── ANIMATION VARIANTS (reutiliza padrões do Portfolio) ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] } },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

/* ─── COLOR MAP (mesmo padrão do Portfolio.tsx) ─── */
const COLOR_MAP = {
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', gradient: 'from-cyan-500/20 to-blue-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', gradient: 'from-violet-500/20 to-purple-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', gradient: 'from-blue-500/20 to-indigo-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', gradient: 'from-emerald-500/20 to-teal-500/20' },
} as const;
type ColorKey = keyof typeof COLOR_MAP;

/* ─── TYPES ─── */
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
}

/* ─── DADOS (Formato LinkedIn, pronto para editar) ─── */
const EXPERIENCES: Experience[] = [
  {
    id: 'mxplan-acelen',
    role: 'Analista de Dados - Suprimentos & Contratação',
    company: 'MXPLAN / ACELEN ENERGIA RENOVÁVEL S.A.',
    period: 'out de 2025 - o momento',
    duration: '8 meses',
    location: 'No local',
    type: 'Tempo integral',
    description: 'Análise de dados estratégicos para suprimentos e contratação de serviços, com foco em otimização de processos, dashboards executivos e integração de bases SAP/ERP.',
    skills: ['Power BI', 'Python', 'SAP', 'SQL', 'ETL', 'Data Modeling'],
    media: { type: 'video', source: 'youtube', url: 'SEU_ID_YOUTUBE_AQUI', title: 'Demo: Dashboard de Suprimentos ACELEN' },
    logoColor: 'cyan',
    icon: Zap,
  },
  {
    id: 'pgba-solutions',
    role: 'Fundador | Arquiteto de Soluções',
    company: 'PGBA Solutions Technologies',
    period: 'jul de 2023 - o momento',
    duration: '2 anos 11 meses',
    location: 'Salvador, BA · Remoto',
    type: 'Autônomo',
    description: [
      'Fundação e direção técnica da PGBA, focada em soluções tecnológicas para micro e pequenas empresas.',
      'Desenvolvimento de arquitetura de dados, BI, automação, fullstack e aplicações de IA orientadas a resultado.',
      'Liderança no produto próprio Minha Amora e prestação de serviços sob medida.'
    ],
    skills: ['Python', 'Django', 'React', 'Power BI', 'Docker', 'IoT', 'LGPD', 'Product Strategy'],
    media: { type: 'video', source: 'youtube', url: 'SEU_ID_YOUTUBE_AQUI', title: 'Pitch: PGBA Solutions & Minha Amora' },
    logoColor: 'violet',
    icon: Rocket,
  },
  {
    id: 'oxaala-cnpq',
    role: 'Desenvolvedor FullStack | Projeto de Pesquisa Aplicada',
    company: 'Oxaala · CNPq / UFBA / Startup',
    period: 'abr de 2024 - o momento',
    duration: '2 anos 2 meses',
    location: 'Salvador, BA · Remoto',
    type: 'Tempo integral',
    description: 'Pesquisa e inovação tecnológica em parceria universidade-startup. Desenvolvimento fullstack e validação técnica de soluções aplicadas a dados sísmicos e interpretação automatizada de perfis de poços.',
    skills: ['Python', 'Machine Learning', 'FastAPI', 'React', 'PostgreSQL', 'Geodados'],
    media: { type: 'image', source: null, url: '/assets/projects/oxaala-preview.png', title: 'Interface de Interpretação de Perfis' },
    logoColor: 'blue',
    icon: Globe,
  },
  {
    id: 'absolut-technologies',
    role: 'Especialista de Controladoria',
    company: 'absolut technologies',
    period: 'ago de 2024 - set de 2025',
    duration: '1 ano 2 meses',
    location: 'Lauro de Freitas, BA · Híbrido',
    type: 'Tempo integral',
    description: [
      'Gestão estratégica de controladoria: DRE Gerencial, Fluxo de Caixa, Contas a Pagar/Receber.',
      'Desenvolvimento de dashboards Power BI integrando Bitrix, SAP B1, projetos, vendas e logística.',
      'Administração SAP B1, ETL via SQL, automações com Power Automate e RPA Python.',
      'Governança e integração de relatórios com SharePoint.'
    ],
    skills: ['Power BI', 'SAP Business One', 'SQL', 'Power Automate', 'Python', 'Excel VBA'],
    media: { type: 'video', source: 'youtube', url: 'SEU_ID_YOUTUBE_AQUI', title: 'Case: Automação Financeira & SAP B1' },
    logoColor: 'emerald',
    icon: BarChart4,
  },
  {
    id: 'braskem-pleno',
    role: 'Analista de Logística Pleno | Suprimentos MRO',
    company: 'BRASKEM S/A (via MRO Logistics)',
    period: 'nov de 2021 - jan de 2024',
    duration: '2 anos 3 meses',
    location: 'Presencial',
    type: 'Tempo integral',
    description: 'Gestão de suprimentos MRO, cotações no COUPA, diligenciamento de pedidos, cadastro de fornecedores, tratativa de Nota QM/BPM e focal de compras para Parada Geral 2023. Automações com VBA e Python.',
    skills: ['SAP ERP', 'Python', 'VBA', 'COUPA', 'Supply Chain', 'MRO', 'Power BI'],
    media: { type: 'video', source: 'local', url: '/assets/videos/braskem-mro-automacao.mp4', title: 'Automação de Diligenciamento de Pedidos' },
    logoColor: 'cyan',
    icon: Database,
  },
  {
    id: 'braskem-jr',
    role: 'Analista de Logística JR | Materiais',
    company: 'BRASKEM S/A',
    period: 'nov de 2020 - nov de 2021',
    duration: '1 ano 1 mês',
    location: 'Presencial',
    type: 'Tempo integral',
    description: 'Criação de ferramentas Excel/Power BI para otimização de rotinas de Materiais. Automatização de relatórios de RC e Pedidos, criação de requisições, cadastro de itens SAP e apoio na Intervenção de Manutenção.',
    skills: ['SAP ERP', 'Power BI', 'Excel Avançado', 'Python', 'Logística'],
    media: null,
    logoColor: 'blue',
    icon: Briefcase,
  },
  {
    id: 'timenow-braskem',
    role: 'Técnico de Planejamento',
    company: 'BRASKEM S/A (via Time-Now Engenharia S/A)',
    period: 'mai de 2017 - jan de 2020',
    duration: '2 anos 9 meses',
    location: 'Camaçari, BA',
    type: 'Tempo integral',
    description: [
      'Extração automática de bases SAP MM/BW com VBA. Modelagem de dashboards Power BI para indicadores de custo.',
      'Desenvolvimento de formulários PowerApps com integração Power BI e aprovação via Outlook.',
      'Controle de AS/BM, acompanhamento de orçamentos, contratos PJ e criação de pedidos/FRS.'
    ],
    skills: ['SAP ERP', 'Power BI', 'VBA', 'PowerApps', 'SharePoint', 'SAP Fiori'],
    media: { type: 'image', source: null, url: '/assets/projects/timenow-dashboard.png', title: 'Dashboard de Indicadores de Manutenção' },
    logoColor: 'emerald',
    icon: Cpu,
  },
  {
    id: 'goca-engenharia',
    role: 'Projetista',
    company: 'G.OCA Engenharia',
    period: 'fev de 2015',
    duration: '1 mês',
    location: 'Presencial',
    type: 'Projeto',
    description: 'Projetos de cabeamento estruturado (dados/voz), dimensionamento de eletrocalhas/eletrodutos, montagem de racks e cabeamento para CFTV/Som. Utilização de AutoCAD.',
    skills: ['AutoCAD', 'SolidWorks', 'Cabeamento Estruturado', 'Infraestrutura'],
    media: null,
    logoColor: 'cyan',
    icon: Shield,
  },
  {
    id: 'unifacs-estagio',
    role: 'Estagiário - Laboratório de Controle e Automação',
    company: 'UNIFACS - Universidade Salvador',
    period: 'mar de 2014 - jul de 2014',
    duration: '5 meses',
    location: 'Salvador, BA',
    type: 'Estágio',
    description: 'Organização de inventário do laboratório, instalação de softwares de CLPs e desenvolvimento de programas em Ladder para aulas práticas.',
    skills: ['CLP', 'Ladder', 'Automação', 'SolidWorks'],
    media: null,
    logoColor: 'violet',
    icon: Users,
  },
];

/* ─── COMPONENTE: ExperienceMedia ─── */
function ExperienceMedia({ media }: { media: ExperienceMedia | undefined }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);

  if (!media) return null;

  const getEmbedUrl = () => {
    if (media.source === 'youtube') return `https://www.youtube.com/embed/${media.url}?autoplay=${isPlaying ? 1 : 0}&mute=1&rel=0`;
    if (media.source === 'vimeo') return `https://player.vimeo.com/video/${media.url}?autoplay=${isPlaying ? 1 : 0}&muted=1&title=0&byline=0`;
    return media.url;
  };

  return (
    <div className={`mt-4 rounded-xl overflow-hidden border ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="relative aspect-video group">
        {!isPlaying ? (
          <>
            {media.thumbnail ? (
              <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <div className="text-center p-6">
                  <Code2 className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{media.title}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              aria-label={`Reproduzir: ${media.title}`}
            >
              <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>
            </button>
          </>
        ) : media.source === 'local' ? (
          <video src={media.url} controls autoPlay muted className="w-full h-full object-cover" />
        ) : (
          <iframe
            src={getEmbedUrl()}
            title={media.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <div className={`px-3 py-2 flex items-center justify-between text-xs ${isDark ? 'text-slate-400 bg-slate-800/30' : 'text-slate-500 bg-white'}`}>
        <span className="font-medium truncate pr-2">{media.title}</span>
        {media.type === 'video' && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              isDark ? 'hover:bg-slate-700 text-cyan-400' : 'hover:bg-slate-100 text-cyan-600'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? 'Pausar' : 'Reproduzir'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── COMPONENTE: ExperienceCard ─── */
function ExperienceCard({ exp }: { exp: Experience }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);
  const colors = COLOR_MAP[exp.logoColor];
  const [expanded, setExpanded] = useState(false);

  const descArray = Array.isArray(exp.description) ? exp.description : [exp.description];
  const showExpand = descArray.length > 1 || descArray[0].length > 180;
  const visibleDesc = showExpand && !expanded ? descArray.slice(0, 1) : descArray;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeUp}
      className={`group relative p-5 sm:p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
        isDark
          ? 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700/50'
          : 'bg-white/70 border-slate-200 hover:bg-white hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg} ring-1 ${isDark ? 'ring-white/10' : 'ring-slate-200'}`}>
          <exp.icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold leading-tight ${dc('text-white', 'text-slate-900')}`}>{exp.role}</h3>
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mt-1 ${dc('text-slate-400', 'text-slate-500')}`}>
            <span className="font-medium">{exp.company}</span>
            <span className="hidden sm:inline">•</span>
            <span>{exp.period}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exp.duration}</span>
          </div>
          <div className={`flex flex-wrap items-center gap-2 mt-2 text-xs ${dc('text-slate-500', 'text-slate-400')}`}>
            <span className={`px-2 py-0.5 rounded-full font-medium ${dc('bg-slate-800/50 text-slate-300', 'bg-slate-100 text-slate-600')}`}>{exp.type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <ul className={`text-sm leading-relaxed space-y-2 mb-4 ${dc('text-slate-300', 'text-slate-600')}`}>
        {visibleDesc.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {showExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1 text-xs font-medium mb-4 transition-colors ${dc('text-cyan-400 hover:text-cyan-300', 'text-cyan-600 hover:text-cyan-500')}`}
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> Ver menos</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> Ver mais detalhes</>
          )}
        </button>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {exp.skills.slice(0, 6).map((skill, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-md text-xs font-medium ${dc('bg-slate-800/60 text-slate-300 ring-1 ring-slate-700/30', 'bg-slate-100 text-slate-600 ring-1 ring-slate-200')}`}
          >
            {skill}
          </span>
        ))}
        {exp.skills.length > 6 && (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${dc('text-slate-500', 'text-slate-400')}`}>
            +{exp.skills.length - 6}
          </span>
        )}
      </div>

      {/* Media Slot */}
      <ExperienceMedia media={exp.media} />
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function ExperienceTimeline({ className = '' }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <section className={`relative py-16 sm:py-24 px-4 sm:px-6 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 ${
            dc('bg-slate-900/80 border-slate-700/50 text-cyan-400', 'bg-slate-50/80 border-slate-200/50 text-cyan-600')
          }`}>
            <Briefcase className="w-3.5 h-3.5" />
            Experiência Profissional
          </motion.div>
          <motion.h2 variants={fadeUp} className={`text-2xl sm:text-3xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>
            Trajetória com <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">resultado comprovado.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className={`text-base ${dc('text-slate-300', 'text-slate-600')}`}>
            Da engenharia no chão de fábrica à arquitetura de soluções tecnológicas.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="space-y-8 relative"
        >
          {/* Linha vertical da timeline (desktop) */}
          <div className={`absolute left-4 sm:left-6 top-4 bottom-4 w-px ${dc('bg-slate-800/50', 'bg-slate-200')} hidden md:block`} />

          {EXPERIENCES.map((exp) => (
            <ExperienceCard key={exp.id} exp={exp} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}