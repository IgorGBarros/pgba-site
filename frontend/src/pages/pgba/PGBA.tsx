// PgbaLandingPage.tsx - Versão corrigida e melhorada
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  BarChart4, 
  Cpu, 
  Code2, 
  ArrowRight, 
  Terminal, 
  Globe, 
  Factory, 
  LineChart,
  CheckCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.4, 0.25, 1] 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function PgbaLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 font-outfit selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* ─── BACKGROUND EFFECTS MELHORADOS ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradientes de fundo mais sutis */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-600/8 to-blue-600/8 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-r from-violet-600/8 to-purple-600/8 blur-[180px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-emerald-600/5 to-teal-600/5 blur-[200px] animate-pulse [animation-delay:4s]" />
        
        {/* Grid pattern sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* ─── NAVBAR MELHORADA ─── */}
      <nav className="relative z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/10">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                PGBA<span className="text-cyan-400">.</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-medium hidden sm:block">
                Tech Solutions
              </span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#services" className="hover:text-cyan-400 transition-colors duration-200 relative group">
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#about" className="hover:text-cyan-400 transition-colors duration-200 relative group">
              The Architect
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors duration-200 relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-200 group-hover:w-full" />
            </a>
          </div>
          
          <button className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
            Book Strategy Call
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION MELHORADA ─── */}
      <section className="relative z-10 pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            custom={0} initial="hidden" animate="visible" variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-sm"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
            <span className="hidden sm:inline">International Tech Consultancy</span>
            <span className="sm:hidden">Global Tech</span>
          </motion.div>
          
          <motion.h1 
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-4 sm:mb-6"
          >
            Engineering Business Growth Through{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 animate-gradient-x">
              Data, AI & Automation.
            </span>
          </motion.h1>
          
          <motion.p 
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            We bridge the gap between complex industrial operations and cutting-edge technology. 
            From ERP integrations to AI-driven custom software, we architect systems that 
            <span className="text-cyan-400 font-semibold"> impact your bottom line</span>.
          </motion.p>
          
          <motion.div 
            custom={3} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 group">
              Discuss Your Project 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-200 font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-sm">
              View Case Studies
            </button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-16 sm:mt-20 max-w-4xl mx-auto"
          >
            {[
              { number: "8+", label: "Years Experience" },
              { number: "50+", label: "Projects Delivered" },
              { number: "15+", label: "Industries Served" },
              { number: "99%", label: "Client Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1">{stat.number}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CORE SERVICES MELHORADA ─── */}
      <section id="services" className="relative z-10 py-16 sm:py-20 md:py-24 bg-slate-900/20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-12 sm:mb-16 md:mb-20 text-center max-w-3xl mx-auto"
          >
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Core Expertise
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Delivering high-ticket solutions that transform raw data and manual workflows 
              into <span className="text-cyan-400 font-semibold">scalable digital assets</span>.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Service 1 */}
            <motion.div variants={fadeUp} className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-slate-800/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-cyan-500/20">
                <BarChart4 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Enterprise BI & Data Architecture</h3>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm sm:text-base">
                We build the bridge (ETL pipelines) between your complex databases (SAP, ERPs) and 
                real-time executive dashboards using Power BI and Python.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                  P&L and Cash Flow Modeling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                  SAP / ERP Data Extraction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-cyan-400 shrink-0" />
                  Executive Dashboards
                </li>
              </ul>
            </motion.div>

            {/* Service 2 */}
            <motion.div variants={fadeUp} className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-violet-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-slate-800/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-violet-500/20">
                <Cpu className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Process Automation (RPA)</h3>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm sm:text-base">
                Reduction of operational costs by replacing manual data entry with Python scripts and 
                Power Automate workflows. Your team focuses on strategy, bots do the typing.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-violet-400 shrink-0" />
                  Python Automation Scripts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-violet-400 shrink-0" />
                  Supply Chain & MRO Workflows
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-violet-400 shrink-0" />
                  API Integrations
                </li>
              </ul>
            </motion.div>

            {/* Service 3 */}
            <motion.div variants={fadeUp} className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-slate-800/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-500/20">
                <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Custom AI & Software Solutions</h3>
              <p className="text-slate-300 leading-relaxed mb-6 text-sm sm:text-base">
                End-to-end fullstack development. We build internal SaaS, client portals, and integrate 
                Large Language Models (LLMs) trained on your company's proprietary data.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                  React / Django Rest Framework
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                  Docker & Kubernetes Deployment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                  Natural Language to SQL (AI)
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── THE ARCHITECT SECTION MELHORADA ─── */}
      <section id="about" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} 
            className="lg:w-1/2 order-2 lg:order-1"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Why PGBA? <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                We speak Code, Industry & Finance.
              </span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              Most software agencies fail because developers don't understand business operations. 
              PGBA is led by a Senior Solutions Architect with 8+ years of experience spanning 
              Petrochemical MRO, Financial Controlling, and Hardcore Tech.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              {[
                { 
                  icon: Factory, 
                  title: "Industrial & MRO Expertise", 
                  text: "Deep understanding of Supply Chain, SAP MM, and Maintenance Planning.",
                  color: "text-emerald-400"
                },
                { 
                  icon: LineChart, 
                  title: "Financial Controlling", 
                  text: "We understand P&L, Cash Flow, and what the Board of Directors needs to see.",
                  color: "text-blue-400"
                },
                { 
                  icon: Terminal, 
                  title: "Deep Tech Execution", 
                  text: "From Python and React to Kubernetes and AI Models, we build the actual product.",
                  color: "text-violet-400"
                },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp}
                  custom={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/30 backdrop-blur-sm hover:bg-slate-800/30 transition-colors duration-200"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0 ring-1 ring-slate-700/50`}>
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} 
            custom={1} variants={fadeUp} 
            className="lg:w-1/2 w-full order-1 lg:order-2"
          >
            <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 sm:p-8 overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 blur-3xl" />
              
              <div className="font-mono text-xs sm:text-sm text-slate-400 relative z-10">
                <div className="flex gap-2 mb-4 border-b border-slate-800/50 pb-4">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                
                <p><span className="text-violet-400">const</span> <span className="text-blue-400">architect</span> = new <span className="text-emerald-400">PGBA_Solutions</span>();</p>
                <br/>
                <p><span className="text-slate-500">// Step 1: Understand the business bottleneck</span></p>
                <p>architect.<span className="text-cyan-400">analyzeFinancesAndOperations</span>(clientERP);</p>
                <br/>
                <p><span className="text-slate-500">// Step 2: Automate & Deploy</span></p>
                <p>architect.<span className="text-cyan-400">buildETLPipeline</span>(python, powerBI);</p>
                <p>architect.<span className="text-cyan-400">deployCustomAI</span>(kubernetes, react);</p>
                <br/>
                <p className="text-emerald-400 animate-pulse">❯ Execution successful. ROI maximized. 0 errors.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION MELHORADA ─── */}
      <section id="contact" className="relative z-10 py-16 sm:py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/50 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
            
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 relative z-10">
              Ready to scale your operations?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
              Currently accepting new enterprise clients. Let's schedule a 30-minute technical 
              assessment to discuss your architecture and growth opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <a 
                href="mailto:contact@pgba.tech" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm sm:text-lg transition-all duration-200 shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.7)] hover:scale-105 group"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Book a Discovery Call 
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="tel:+5511999999999" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-200 font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-sm"
              >
                <Phone className="w-4 h-4" />
                Call Direct
              </a>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-800/50 relative z-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400" />
                contact@pgba.tech
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                São Paulo, Brazil
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <Globe className="w-4 h-4 text-cyan-400" />
                Global Operations
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER MELHORADO ─── */}
      <footer className="border-t border-slate-800/50 py-6 sm:py-8 relative z-10 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base">
                PGBA<span className="text-cyan-400">.</span>
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium ml-2 hidden sm:inline">
                Data, AI & Tech Solutions
              </span>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} PGBA Solutions. Based in Brazil, engineering globally.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            <span className="text-cyan-400">Transforming businesses through technology.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}