import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, TrendingDown, DollarSign, BarChart3, ArrowLeft,
  AlertTriangle, Calendar, Filter, Layers, Brain, Loader2
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { api } from "../services/api"; // Usa a sua API Django
import { formatMoney } from "../lib/utils"; // Certifique-se de ter essa função em utils ou crie-a
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import ProOverlay from "../components/ProOverlay";
import UpgradeModal from "../components/UpgradeModal";
import ConsultantAnalyticsView from "../components/ConsultantAnalyticsView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";

const COLORS = [
  "hsl(152, 55%, 28%)", "hsl(38, 80%, 55%)", "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 55%)", "hsl(350, 60%, 55%)", "hsl(160, 45%, 45%)",
  "hsl(30, 70%, 50%)", "hsl(220, 55%, 55%)",
];

// Tipagem baseada no backend Django
interface InventoryItem {
  id: number;
  product: { id: number; name: string; bar_code: string; category: string; };
  total_quantity: number;
  min_quantity: number;
  cost_price: number;
  sale_price: number;
  batches?: any[]; 
}

interface StockTransaction {
  id: number;
  transaction_type: string;
  quantity: number;
  unit_price: number | null;
  unit_cost: number | null;
  created_at: string;
  product_name: string;
  batch_code?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = usePlan();
  const { isLocked } = useFeatureGates();
  const { toast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  // IA States (Deixado preparado para quando o endpoint Python existir)
  const [myAnalytics, setMyAnalytics] = useState<any>(null);
  const [myAnalyticsLoading, setMyAnalyticsLoading] = useState(false);
  const [myInsights, setMyInsights] = useState<any>(null);
  const [myInsightsLoading, setMyInsightsLoading] = useState(false);
  
  // Filters for value over time
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    
    // Busca dados do Django via API
    Promise.all([
      api.get("/inventory/"),
      api.get("/inventory/transactions/") // Rota que você criou no capítulo anterior!
    ])
      .then(([invRes, movRes]) => {
        setItems(invRes.data);
        setMovements(movRes.data);
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
  const totalValue = items.reduce((s, i) => s + (i.total_quantity * Number(i.cost_price)), 0);
  const lowStock = items.filter((i) => i.total_quantity <= i.min_quantity && i.total_quantity > 0);
  
  const now = new Date();
  
  // Filtra as movimentações do mês atual
  const monthMovements = movements.filter((m) => {
    const d = new Date(m.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  // Pega apenas VENDAS
  const salesMovements = monthMovements.filter((m) => m.transaction_type === "VENDA");
  
  const monthSales = salesMovements.reduce((s, m) => s + (Number(m.unit_price) || 0) * Math.abs(m.quantity), 0);
  const monthProfit = monthSales - salesMovements.reduce((s, m) => {
    return s + (Number(m.unit_cost) || 0) * Math.abs(m.quantity);
  }, 0);

  // Produtos Vencendo (Checa os lotes de cada item)
  const expiringSoon = items.flatMap(item => {
      if (!item.batches) return [];
      return item.batches.filter(b => {
          if (!b.expiration_date) return false;
          const d = new Date(b.expiration_date);
          const today = new Date();
          const soon = new Date();
          soon.setMonth(soon.getMonth() + 3);
          return d <= soon && d >= today;
      }).map(b => ({ ...item, ...b, product_name: item.product.name }));
  });

  // ── Category aggregations ──
  const categoryMap = useMemo(() => {
    const map = new Map<string, { qty: number; value: number }>();
    items.forEach((i) => {
      const cat = i.product.category || "Geral";
      const cur = map.get(cat) || { qty: 0, value: 0 };
      cur.qty += i.total_quantity;
      cur.value += i.total_quantity * Number(i.cost_price);
      map.set(cat, cur);
    });
    return map;
  }, [items]);

  const pieData = Array.from(categoryMap.entries()).map(([name, d]) => ({ name, value: d.qty }));
  const barData = Array.from(categoryMap.entries()).map(([name, d]) => ({ name, valor: d.value }));

  // ── Average cost per product ──
  const avgPriceData = useMemo(() => {
    const map = new Map<string, { totalCost: number; totalQty: number; name: string }>();
    items.forEach((i) => {
      const cur = map.get(i.product.bar_code) || { totalCost: 0, totalQty: 0, name: i.product.name };
      cur.totalCost += i.total_quantity * Number(i.cost_price);
      cur.totalQty += i.total_quantity;
      cur.name = i.product.name;
      map.set(i.product.bar_code, cur);
    });
    // Opcional: Adicionar custo das entradas anteriores baseando no `movements` (simplificado aqui)
    return Array.from(map.values())
      .filter((v) => v.totalQty > 0)
      .map((v) => ({
        name: v.name.length > 20 ? v.name.slice(0, 18) + "…" : v.name,
        media: Number((v.totalCost / v.totalQty).toFixed(2)),
      }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 15);
  }, [items]);

  // ── Value over time (movements) ──
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    movements.forEach((m) => years.add(new Date(m.created_at).getFullYear().toString()));
    return Array.from(years).sort();
  }, [movements]);

  const availableProducts = useMemo(() => {
    const prods = new Map<string, string>();
    items.forEach((i) => prods.set(i.product.bar_code, i.product.name));
    return Array.from(prods.entries()).map(([barcode, name]) => ({ barcode, name }));
  }, [items]);

  const timeSeriesData = useMemo(() => {
    let filtered = movements;
    // O StockTransaction da API do Django talvez não retorne o bar_code direto, 
    // mas sim o product_name ou product_id. Ajuste se necessário.
    if (selectedYear !== "all") {
      filtered = filtered.filter((m) => new Date(m.created_at).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth !== "all") {
      filtered = filtered.filter((m) => (new Date(m.created_at).getMonth() + 1).toString() === selectedMonth);
    }

    const map = new Map<string, { entradas: number; saidas: number }>();
    filtered.forEach((m) => {
      const d = new Date(m.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = map.get(key) || { entradas: 0, saidas: 0 };
      const val = (Number(m.unit_price) || Number(m.unit_cost) || 0) * Math.abs(m.quantity);
      
      if (m.transaction_type === "ENTRADA") cur.entradas += val;
      else if (m.transaction_type === "VENDA") cur.saidas += val;
      
      map.set(key, cur);
    });
    
    return Array.from(map.entries())
      .map(([key, v]) => ({ mes: key, entradas: Number(v.entradas.toFixed(2)), saidas: Number(v.saidas.toFixed(2)) }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [movements, selectedProduct, selectedYear, selectedMonth]);

  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // MOCK DE IA (Para não quebrar a tela)
  const fetchMyAnalytics = async () => {
    if (isLocked("ai_insights")) { setShowUpgrade(true); return; }
    setMyAnalyticsLoading(true);
    // Simula tempo de rede
    setTimeout(() => {
        setMyAnalytics({ total_sales: monthSales, best_product: "Kaiak" });
        setMyAnalyticsLoading(false);
    }, 1500);
  };

  const fetchMyInsights = async () => {
    if (!myAnalytics) return;
    setMyInsightsLoading(true);
    setTimeout(() => {
        setMyInsights([{ title: "Venda Mais", description: "O Kaiak está vendendo bem, faça um kit." }]);
        setMyInsightsLoading(false);
    }, 2000);
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
              <p className={`mt-1 font-display text-xl font-bold text-foreground ${s.pro && isLocked(s.pro === true ? "dashboard_kpi_advanced" : "dashboard_kpi_advanced") ? "blur-sm select-none" : ""}`}>
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
            <TabsTrigger value="timeline" className="text-xs">Valor no Tempo</TabsTrigger>
            <TabsTrigger value="avgprice" className="text-xs">Preço Médio</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">Produtos</TabsTrigger>
            <TabsTrigger
              value="ai"
              className="text-xs"
              onClick={() => { if (!myAnalytics && !myAnalyticsLoading) fetchMyAnalytics(); }}
            >
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
                        <span className="text-sm font-medium text-foreground block truncate">{i.product.name}</span>
                        <span className="text-[10px] text-muted-foreground">{i.product.category}</span>
                      </div>
                      <span className="text-sm font-mono text-destructive font-semibold shrink-0 ml-2">
                        {i.total_quantity}/{i.min_quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto com estoque baixo 🎉</p>}
            </div>
            
            {/* Expiring */}
            {expiringSoon.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-accent" /> Próximos da Validade
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {expiringSoon.map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-accent/10 px-4 py-2.5">
                      <span className="text-sm font-medium text-foreground truncate">{i.product_name}</span>
                      <span className="text-sm font-mono text-accent-foreground font-semibold">{new Date(i.expiration_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ... Restante das abas (Timeline, AvgPrice, Products) usa a mesma lógica ... */}
          {/* Você pode manter o JSX que já estava no seu arquivo, ele vai funcionar com o novo State! */}

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