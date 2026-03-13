import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, TrendingDown, DollarSign, BarChart3, ArrowLeft,
  AlertTriangle, Calendar, Layers, Brain, Loader2
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";
// 🚀 Importações consolidadas da nossa API centralizada
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
    
    // 🚀 Uso das rotas padronizadas que configuramos na api.ts
    Promise.all([
      inventoryApi.list(),
      movementsApi.list()
    ])
      .then(([invRes, movRes]) => {
        setItems(invRes);
        
        // Normaliza os dados de transações (mesma lógica do Extrato)
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
  
  // Movimentações do mês atual
  const monthMovements = movements.filter((m) => {
    const d = new Date(m.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  // Vendas do Mês
  const salesMovements = monthMovements.filter((m) => m.movement_type === "saida" && m.sale_type === "venda");
  
  const monthSales = salesMovements.reduce((s, m) => s + (Number(m.unit_price) || 0) * Math.abs(m.quantity), 0);
  const monthProfit = salesMovements.reduce((s, m) => s + (m.profit || 0), 0);

  // Produtos Vencendo (Caso o backend envie o array batches)
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

  // ── Agrupamento por Categoria ──
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

  // ── MOCK DE IA ──
  const fetchMyAnalytics = async () => {
    if (isLocked("ai_insights")) { setShowUpgrade(true); return; }
    setMyAnalyticsLoading(true);
    setTimeout(() => {
        setMyAnalytics({ total_sales: monthSales, best_product: "Em breve com a IA!" });
        setMyAnalyticsLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

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
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "Total Produtos", value: String(totalProducts), icon: Package, pro: false },
            { label: "Estoque Baixo", value: String(lowStock.length), icon: TrendingDown, pro: false },
            { label: "Vendas do Mês", value: formatMoney(monthSales), icon: DollarSign, pro: true },
            { label: "Lucro Estimado", value: formatMoney(monthProfit), icon: BarChart3, pro: true },
            { label: "Valor Total", value: formatMoney(totalValue), icon: DollarSign, pro: true },
          ].map((s) => (
            <div key={s.label} className="relative rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className={`mt-1 font-display text-xl font-bold text-foreground ${s.pro && isLocked("dashboard_kpi_advanced") ? "blur-sm select-none" : ""}`}>
                {s.value}
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
          <TabsContent value="overview" className="space-y-4">
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

            {/* Low stock */}
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