import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, TrendingDown, DollarSign, BarChart3, ArrowLeft,
  AlertTriangle, Layers, Brain, Loader2, Trophy, Target, Percent
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
import { inventoryApi, movementsApi, InventoryItem, Movement, formatMoney } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import ProOverlay from "../components/ProOverlay";
import UpgradeModal from "../components/UpgradeModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";

const COLORS = [
  "hsl(152, 55%, 28%)", "hsl(38, 80%, 55%)", "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 55%)", "hsl(350, 60%, 55%)", "hsl(160, 45%, 45%)",
  "hsl(30, 70%, 50%)", "hsl(220, 55%, 55%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useFeatureGates();
  const { toast } = useToast();
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  // IA States
  const [myAnalytics, setMyAnalytics] = useState<any>(null);
  const [myAnalyticsLoading, setMyAnalyticsLoading] = useState(false);
  
  // Filters for value over time
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    
    Promise.all([
      inventoryApi.list(),
      movementsApi.list()
    ])
      .then(([invRes, movRes]) => {
        setItems(invRes);
        
        const normalizedMovements = movRes.map(m => ({
          ...m,
          movement_type: (m as any).transaction_type?.toLowerCase() || m.movement_type || "saida"
        })) as Movement[];
        
        setMovements(normalizedMovements);
        setLoading(false);
      })
      .catch((err) => {
          console.error(err);
          setLoading(false);
          toast({ title: "Erro", description: "Falha ao carregar dashboard.", variant: "destructive" });
      });
  }, [user, toast]);

  // ── KPIs ──
  const totalProducts = items.length;
  
  const totalValue = items.reduce((s, i) => {
    const qty = i.total_quantity ?? i.quantity ?? 0;
    return s + (qty * Number(i.cost_price));
  }, 0);
  
  const lowStock = items.filter((i) => {
    const qty = i.total_quantity ?? i.quantity ?? 0;
    const minQty = i.min_quantity ?? 5;
    return qty <= minQty && qty > 0;
  });
  
  const now = new Date();
  
  const monthMovements = movements.filter((m) => {
    const d = new Date(m.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const salesMovements = monthMovements.filter((m) => m.movement_type === "saida" && m.sale_type === "venda");
  
  const monthSales = salesMovements.reduce((s, m) => s + (Number(m.unit_price) || 0) * Math.abs(m.quantity), 0);
  const monthProfit = salesMovements.reduce((s, m) => s + (m.profit || 0), 0);

  // 🚀 NOVAS LÓGICAS ADICIONADAS: Ticket Médio, Margem de Lucro e Top 3 Produtos
  const numberOfSales = salesMovements.length;
  const ticketMedio = numberOfSales > 0 ? (monthSales / numberOfSales) : 0;
  const margemLucro = monthSales > 0 ? (monthProfit / monthSales) * 100 : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    salesMovements.forEach((m) => {
      const cur = map.get(m.barcode) || { name: m.product_name, qty: 0, revenue: 0 };
      cur.qty += Math.abs(m.quantity);
      cur.revenue += (Number(m.unit_price) || 0) * Math.abs(m.quantity);
      map.set(m.barcode, cur);
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [salesMovements]);

  const expiringSoon = items.flatMap(item => {
      const batches = (item as any).batches || [];
      return batches.filter((b: any) => {
          if (!b.expiration_date) return false;
          const d = new Date(b.expiration_date);
          const today = new Date();
          const soon = new Date();
          soon.setMonth(soon.getMonth() + 3);
          return d <= soon && d >= today;
      }).map((b: any) => ({ ...item, ...b, product_name: item.product?.name || item.product_name }));
  });

  const categoryMap = useMemo(() => {
    const map = new Map<string, { qty: number; value: number }>();
    items.forEach((i) => {
      const cat = i.product?.category || i.category || "Geral";
      const qty = i.total_quantity ?? i.quantity ?? 0;
      const cur = map.get(cat) || { qty: 0, value: 0 };
      
      cur.qty += qty;
      cur.value += qty * Number(i.cost_price);
      map.set(cat, cur);
    });
    return map;
  }, [items]);
  
  const pieData = Array.from(categoryMap.entries()).map(([name, d]) => ({ name, value: d.qty }));
  const barData = Array.from(categoryMap.entries()).map(([name, d]) => ({ name, valor: d.value }));

  const fetchMyAnalytics = async () => {
    if (isLocked("ai_insights")) { setShowUpgrade(true); return; }
    setMyAnalyticsLoading(true);
    setTimeout(() => {
        setMyAnalytics({ total_sales: monthSales, best_product: "Em breve com a IA!" });
        setMyAnalyticsLoading(false);
    }, 1500);
  };

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Dashboard</h1>
        </div>
      </header>
      
      <main className="mx-auto max-w-5xl px-6 py-6 space-y-6">
        {/* ── KPI Cards Analíticos (Substituídos conforme solicitado) ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Ticket Médio", value: fmt(ticketMedio), icon: Target, pro: true, color: "text-blue-600" },
            { label: "Margem de Lucro", value: `${margemLucro.toFixed(1)}%`, icon: Percent, pro: true, color: "text-emerald-600" },
            { label: "Estoque Baixo", value: String(lowStock.length), icon: TrendingDown, pro: false, color: "text-destructive" },
            { label: "Próximos do Venc.", value: String(expiringSoon.length), icon: AlertTriangle, pro: false, color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="relative rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`mt-1 font-display text-xl font-bold text-foreground ${s.pro && isLocked("dashboard_kpi_advanced") ? "blur-sm select-none" : ""}`}>
                {loading ? "..." : s.value}
              </p>
              {s.pro && isLocked("dashboard_kpi_advanced") && <ProOverlay message="PRO" onClick={() => setShowUpgrade(true)} />}
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs" onClick={() => { if (!myAnalytics && !myAnalyticsLoading) fetchMyAnalytics(); }}>
              <Brain className="h-3 w-3 mr-1" /> IA Insights
            </TabsTrigger>
          </TabsList>
          
          {/* ── TAB: Overview ── */}
          <TabsContent value="overview" className="space-y-6">
            
            {/* 🚀 TOP 3 ADICIONADO AQUI, MANTENDO O RESTO DO SEU CÓDIGO INTACTO */}
            <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Top 3 Mais Vendidos (Mês)
              </h2>
              {topProducts.length > 0 ? (
                <div className="space-y-2">
                  {topProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-secondary/20 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-muted-foreground w-4">{idx + 1}º</span>
                        <div>
                          <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.qty} unidades</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{fmt(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Sem vendas no mês.</p>
              )}
              {isLocked("dashboard_charts") && <ProOverlay message="Premium" onClick={() => setShowUpgrade(true)} />}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Estoque por Categoria
                </h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>}
                {isLocked("dashboard_charts") && <ProOverlay message="Disponível no Premium" onClick={() => setShowUpgrade(true)} />}
              </div>
              
              <div className="relative rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Valor por Categoria (R$)
                </h2>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatMoney(v)} />
                      <Bar dataKey="valor" fill="hsl(152, 55%, 28%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground text-center py-10">Sem dados</p>}
                {isLocked("dashboard_charts") && <ProOverlay message="Disponível no Premium" onClick={() => setShowUpgrade(true)} />}
              </div>
            </div>

            {/* Low stock (Mantido exatamente como o seu original) */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Estoque Baixo ({lowStock.length})
              </h2>
              {lowStock.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lowStock.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-4 py-2.5">
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground block truncate">{i.product?.name || i.product_name}</span>
                        <span className="text-[10px] text-muted-foreground">{i.product?.category || i.category}</span>
                      </div>
                      <span className="text-sm font-mono text-destructive font-semibold shrink-0 ml-2">
                        {i.total_quantity ?? i.quantity}/{i.min_quantity ?? 5}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto com estoque baixo 🎉</p>}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="rounded-xl border border-border bg-card p-8 text-center">
               <Brain className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
               <h3 className="text-lg font-bold text-foreground mb-2">Assistente de IA Analítico</h3>
               <p className="text-sm text-muted-foreground max-w-md mx-auto">Em breve sua Inteligência Artificial fará a leitura de todo o seu histórico para te sugerir kits, promoções e produtos para focar!</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Dashboard Avançado"
        description="Veja lucro real, análise por categoria e alertas inteligentes."
      />
    </div>
  );
}