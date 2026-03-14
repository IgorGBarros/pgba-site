import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Package, TrendingDown, DollarSign, BarChart3, Plus, ScanBarcode, List,
  ArrowDownCircle, Settings, PieChart, Store, History, User
} from "lucide-react";
import { inventoryApi, movementsApi, profileApi } from "../lib/api"; 
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { useExpiryAlerts } from "../hooks/useExpiryAlerts";
import { ChatAssistant } from "../components/ChatAssistant";
import NotificationBell from "../components/NotificationBell";
import ProBadge from "../components/ProBadge";
import UpgradeModal from "../components/UpgradeModal";
import ProfileCompletionBanner from "../components/ProfileCompletionBanner";

interface Stats {
  totalProducts: number;
  lowStockCount: number;
  totalValue: number;
  monthSales: number;
  monthProfit: number;
  lowStockItems: { name: string; qty: number; min: number }[];
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useFeatureGates();
  
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockCount: 0,
    totalValue: 0,
    monthSales: 0,
    monthProfit: 0,
    lowStockItems: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeCtx, setUpgradeCtx] = useState({ feature: "", description: "" });
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    profileApi
      .get()
      .then((p) => setStoreSlug(p.store_slug))
      .catch(() => setStoreSlug(null));
      
    Promise.all([inventoryApi.list(), movementsApi.list()])
      .then(([items, movements]) => {
        // 🚀 CORREÇÃO 1: Extração segura do Estoque Baixo
        const lowItems = items.filter((i) => {
          const qty = i.total_quantity ?? i.quantity ?? 0;
          const min = i.min_quantity ?? 5;
          return qty <= min && qty > 0;
        });

        const now = new Date();
        
        // 🚀 CORREÇÃO 2: Normalização dos Movimentos
        const monthMovements = movements.filter((m) => {
          const d = new Date(m.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).map(m => ({
          ...m,
          // Garante que a checagem funciona independente da serialização do backend
          movement_type: (m as any).transaction_type?.toLowerCase() || m.movement_type || "saida"
        }));

        const salesMovements = monthMovements.filter((m) => m.movement_type === "saida" && m.sale_type === "venda");

        const monthSales = salesMovements.reduce((s, m) => s + (m.unit_price || 0) * Math.abs(m.quantity), 0);
        
        const monthCost = salesMovements.reduce((s, m) => {
          // Busca o item no array pelo código de barras aninhado ou legado
          const item = items.find((i) => (i.product?.bar_code || i.barcode) === m.barcode);
          return s + (item ? item.cost_price : 0) * Math.abs(m.quantity);
        }, 0);

        setStats({
          totalProducts: items.length,
          lowStockCount: lowItems.length,
          totalValue: items.reduce((s, i) => {
            const qty = i.total_quantity ?? i.quantity ?? 0;
            return s + qty * i.cost_price;
          }, 0),
          monthSales,
          monthProfit: monthSales - monthCost,
          // 🚀 CORREÇÃO 3: Fallback obrigatório para string/number garantindo a tipagem Stats
          lowStockItems: lowItems.slice(0, 5).map((i) => ({
            name: i.product?.name || i.product_name || "Produto sem nome",
            qty: i.total_quantity ?? i.quantity ?? 0,
            min: i.min_quantity ?? 5,
          })),
        });
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  
  const statCards = [
    { label: "Total Produtos", value: String(stats.totalProducts), icon: Package },
    { label: "Estoque Baixo", value: String(stats.lowStockCount), icon: TrendingDown },
    { label: "Vendas do Mês", value: fmt(stats.monthSales), icon: DollarSign },
    { label: "Lucro Estimado", value: fmt(stats.monthProfit), icon: BarChart3 },
    { label: "Valor Total", value: fmt(stats.totalValue), icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Estoque Natura</h1>
              <p className="text-xs text-muted-foreground">Gestão inteligente de inventário</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={() => navigate("/profile")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <User className="h-5 w-5" />
            </button>
            <button onClick={() => navigate("/settings")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <ProfileCompletionBanner />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {loading ? "…" : stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <ActionBtn onClick={() => navigate("/add")} icon={ScanBarcode} label="Cadastrar" desc="Escanear e cadastrar" primary />
          <ActionBtn onClick={() => navigate("/withdraw")} icon={ArrowDownCircle} label="Baixa" desc="Saída de produto" />
          <ActionBtn onClick={() => navigate("/products")} icon={List} label="Estoque" desc="Lista completa" />
          <ActionBtn onClick={() => navigate("/history")} icon={History} label="Histórico" desc="Movimentações" />
          <ActionBtn onClick={() => navigate("/dashboard")} icon={PieChart} label="Dashboard" desc="Gráficos e análises" proBadge={isLocked("dashboard_charts")} />
          <ActionBtn onClick={() => navigate("/products/new")} icon={Plus} label="Manual" desc="Cadastro sem scanner" />
          <ActionBtn
            onClick={() => {
              if (storeSlug) {
                window.open(`https://gestao-estoque-k5vy.onrender.com/store/${storeSlug}`, "_blank");
              } else {
                navigate("/settings");
              }
            }}
            icon={Store}
            label="Vitrine"
            desc="Loja digital"
            proBadge={isLocked("storefront")}
          />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {!isLocked("chat_assistant")
            ? "💬 Clique no botão no canto inferior direito para conversar com o assistente IA"
            : "🔒 Assistente IA exclusivo do plano PRO"}
        </p>
      </main>
      {!isLocked("chat_assistant") && <ChatAssistant />}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={upgradeCtx.feature}
        description={upgradeCtx.description}
      />
    </div>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  desc,
  primary,
  proBadge,
}: {
  onClick: () => void;
  icon: typeof Package;
  label: string;
  desc: string;
  primary?: boolean;
  proBadge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl p-4 text-left transition-shadow hover:shadow-md ${
        primary ? "border-2 border-primary bg-primary/5" : "border border-border bg-card"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${primary ? "bg-primary" : "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${primary ? "text-primary-foreground" : "text-primary"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          {label}
          {proBadge && <ProBadge />}
        </p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </button>
  );
}