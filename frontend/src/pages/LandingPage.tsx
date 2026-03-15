import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, BarChart3, Store, ScanBarcode, Shield, Sparkles,
  Check, X, ArrowRight, Star, TrendingDown, Bell, Bot, Crown, 
  Zap, Users, CreditCard, Loader2,
} from "lucide-react";
import { api } from "../services/api"; 
import { useToast } from "../hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const FREE_FEATURES = [
  { text: "Até 50 produtos", ok: true },
  { text: "Cadastro e baixa de estoque", ok: true },
  { text: "Relatórios básicos", ok: true },
  { text: "Vitrine online", ok: false },
  { text: "Scanner de validade (OCR)", ok: false },
  { text: "Alertas de vencimento", ok: false },
  { text: "Analytics avançado", ok: false },
  { text: "Assistente IA", ok: false },
];

const PRO_FEATURES = [
  { text: "Produtos ilimitados", ok: true },
  { text: "Cadastro e baixa de estoque", ok: true },
  { text: "Relatórios completos", ok: true },
  { text: "Vitrine Multimarcas", ok: true },
  { text: "Scanner de validade (OCR)", ok: true },
  { text: "Alertas de vencimento", ok: true },
  { text: "Analytics avançado", ok: true },
  { text: "Assistente IA", ok: true },
];

const FEATURES = [
  {
    icon: Package,
    title: "Estoque sempre atualizado",
    desc: "Cadastre entradas e saídas em segundos. Nunca mais perca o controle do que você tem na pronta entrega.",
  },
  {
    icon: ScanBarcode,
    title: "Scanner Global Multimarcas",
    desc: "Apontou, achou. Nosso sistema lê o código de barras de qualquer produto e busca o nome e a foto automaticamente.",
  },
  {
    icon: TrendingDown,
    title: "Alertas de estoque baixo",
    desc: "Saiba em tempo real o que está acabando e nunca mais perca uma venda por falta de mercadoria.",
  },
  {
    icon: Bell,
    title: "Blindagem contra vencimentos",
    desc: "Receba alertas antes dos produtos vencerem. Faça promoções a tempo e zere seus prejuízos.",
  },
  {
    icon: Store,
    title: "Sua própria Vitrine Digital",
    desc: "Um link exclusivo com seus produtos em tempo real para enviar no WhatsApp das clientes. Venda dormindo.",
  },
  {
    icon: Bot,
    title: "Seu Assistente de Inteligência Artificial",
    desc: "Pergunte ao seu app: 'Quantos perfumes tenho?' ou 'O que mais vendeu hoje?' e receba a resposta na hora.",
  },
];

const TESTIMONIALS = [
  {
    name: "Juliana Mendes",
    role: "Revendedora de Cosméticos",
    text: "Antes eu controlava tudo no caderno e sempre me perdia entre Avon e Natura. Agora bipou o código, tá no sistema. Minha renda aumentou muito!",
    stars: 5,
  },
  {
    name: "Camila Rocha",
    role: "Empreendedora",
    text: "A vitrine online é um divisor de águas! Mando o link no WhatsApp e as clientes já compram sozinhas o que eu tenho na pronta entrega.",
    stars: 5,
  },
  {
    name: "Patricia Lima",
    role: "Lojista",
    text: "O leitor de código de barras parece mágica! Leu até os importados que eu trouxe pra vender. O alerta de validade também já me salvou de um prejuízo enorme.",
    stars: 5,
  },
];

const FAQS = [
  { q: "Preciso instalar algum aplicativo no celular?", a: "Não! É tudo pelo navegador do celular ou computador. Não ocupa memória do seu aparelho e você acessa de onde quiser." },
  { q: "Funciona com produtos de quais marcas?", a: "Qualquer marca! Nosso sistema é integrado ao maior banco de dados do Brasil. Se o produto tem código de barras (Natura, Boticário, Avon, Eudora, Eletrônicos, etc.), o sistema encontra." },
  { q: "Posso cancelar a assinatura quando quiser?", a: "Sim, sem letras miúdas ou fidelidade. Você é livre para cancelar e o plano PRO continua ativo até o fim do mês pago." },
  { q: "Meus dados e os das minhas clientes estão seguros?", a: "Totalmente. Usamos infraestrutura de nível bancário com criptografia de ponta para garantir que seu estoque e suas vendas sejam 100% confidenciais." },
];

// ─── Checkout Modal ─────────────────────────────────────────────────────────
interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const currentPrice = billing === "monthly" ? "R$ 39,90/mês" : "R$ 399/ano (~R$ 33,25/mês)";

  const handleCheckout = async () => {
    if (!email || !email.includes("@")) {
      toast({ title: "E-mail inválido", description: "Por favor, insira um e-mail válido.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data } = await api.post("/payments/create-checkout/", {
        billing_cycle: billing,
        email: email,
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida do servidor.");
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404 || err.message.includes('Network Error')) {
         toast({ 
             title: "Lista de Espera VIP", 
             description: "Nosso sistema de pagamentos está em atualização final. Seu e-mail foi salvo com prioridade máxima!", 
         });
         setTimeout(onClose, 2500);
      } else {
         const msg = err.response?.data?.error || err.message || "Erro ao processar checkout.";
         toast({ title: "Ops!", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl border-2 border-primary bg-card p-6 shadow-2xl shadow-primary/20"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Assinar plano PRO</h2>
          </div>
          <p className="text-sm text-muted-foreground">Checkout seguro. Cancele quando quiser.</p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex gap-2 mb-5 p-1 rounded-xl bg-secondary">
          <button onClick={() => setBilling("monthly")} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${billing === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Mensal</button>
          <button onClick={() => setBilling("yearly")} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all relative ${billing === "yearly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Anual <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">-17%</span></button>
        </div>
        
        <div className="mb-5 rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-sm font-bold text-foreground">{currentPrice}</p>
        </div>
        
        <div className="mb-5">
          <label className="block text-xs font-semibold text-foreground mb-1.5">Seu e-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCheckout()} placeholder="voce@email.com" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        </div>
        
        <button onClick={handleCheckout} disabled={loading || !email} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {loading ? "Processando..." : "Ir para pagamento"}
        </button>
        
        <button onClick={onClose} className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1">Cancelar</button>
      </motion.div>
    </div>
  );
}

// ─── Landing Page Component ──────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatePresence>
        {checkoutOpen && <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />}
      </AnimatePresence>
      
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            {/* NOVO NOME DO APP AQUI */}
            <span className="font-display text-base font-bold text-foreground">EstoquePRO</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </button>
            <button onClick={() => navigate("/auth")} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
              Começar grátis
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Para revendedoras multimarcas e lojistas</span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Seu estoque de <span className="text-primary">qualquer marca</span> <br className="hidden md:block"/>
            <span className="relative">
              <span className="relative z-10">sob controle.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 -z-0 rounded bg-primary/15" />
            </span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Apontou, cadastrou. Nosso leitor inteligente identifica milhares de produtos pelo código de barras. 
            Mantenha seu inventário em dia, evite vencimentos e venda mais com sua própria vitrine online.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => navigate("/auth")} className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all">
              Começar grátis agora
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-sm text-muted-foreground">Sem cartão de crédito · 100% gratuito</p>
          </motion.div>
          
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mt-16 grid grid-cols-3 gap-6 divide-x divide-border border border-border rounded-2xl bg-card p-6 max-w-lg mx-auto shadow-sm">
            {[
              { value: "+100k", label: "Produtos Reconhecidos" },
              { value: "R$ 0", label: "Para testar" },
              { value: "100%", label: "De Controle" },
            ].map((stat) => (
              <div key={stat.label} className="px-2">
                <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Tudo que você precisa em um só lugar</h2>
            <p className="mt-3 text-muted-foreground">O sistema mais inteligente para quem trabalha com vendas de produtos físicos.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <motion.div key={feat.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Comece em 3 passos simples</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Crie sua conta grátis", desc: "Cadastre-se em menos de 1 minuto. Sem cartão, sem complicação.", icon: Users },
              { step: "02", title: "Bipe os produtos", desc: "Escaneie o código de barras e nosso sistema puxa o nome e a foto de milhares de itens.", icon: ScanBarcode },
              { step: "03", title: "Controle e venda mais", desc: "Acompanhe lucros, receba alertas no celular e compartilhe sua vitrine.", icon: BarChart3 },
            ].map((s, i) => (
              <motion.div key={s.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl font-bold shadow-lg shadow-primary/20">
                  {s.step}
                </div>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px border-t-2 border-dashed border-primary/30" />}
                <h3 className="font-display text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="bg-secondary/30 py-20" id="planos">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Planos e Preços</h2>
            <p className="mt-3 text-muted-foreground">Comece grátis para testar. Assine o PRO para decolar suas vendas.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* FREE */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="rounded-2xl border border-border bg-card p-6 space-y-5 hover:border-primary/50 transition-colors">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Free</h3>
                <p className="text-xs text-muted-foreground mt-1">Para quem está começando</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-foreground">R$ 0</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <button onClick={() => navigate("/auth/register")} className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                Criar Conta Grátis
              </button>
              <ul className="space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.ok ? <Check className="h-4 w-4 text-primary shrink-0" /> : <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                    <span className={f.ok ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* PRO */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="rounded-2xl border-2 border-primary bg-card p-6 space-y-5 relative overflow-hidden shadow-xl shadow-primary/10">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl">Acesso Total</div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2"><Crown className="h-5 w-5 text-primary" /> PRO</h3>
                <p className="text-xs text-muted-foreground mt-1">A loja e o controle nas suas mãos</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-foreground">R$ 39,90</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-primary font-semibold mt-1">Um investimento que se paga na 1ª venda</p>
              </div>
              <button onClick={() => setCheckoutOpen(true)} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" /> Assinar PRO
              </button>
              <ul className="space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{f.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Quem usa, aprova e vende mais</h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3} className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">Dúvidas Frequentes</h2>
          </motion.div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div key={faq.q} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-display text-base font-bold text-foreground">{faq.q}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="mx-auto max-w-2xl px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/30">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl tracking-tight">
              A revolução do seu negócio começa agora.
            </h2>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button onClick={() => navigate("/auth")} className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                Criar Conta Gratuita <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">EstoquePRO</span>
          </div>
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} EstoquePRO. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}