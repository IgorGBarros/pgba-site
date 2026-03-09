import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Package, TrendingDown, DollarSign, BarChart3, Plus, ScanBarcode, List, ArrowDownCircle, Settings, PieChart, Store, History, Scale, Lock, Crown, AlertTriangle, Clock, User } from "lucide-react";
import { inventoryApi, movementsApi, Movement } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { useExpiryAlerts } from "../hooks/useExpiryAlerts";
import {ChatAssistant} from "../components/ChatAssistant";
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
  const { isPro, productLimit } = usePlan();
  const { isLocked } = useFeatureGates();
  const { alerts, criticalCount, totalCount } = useExpiryAlerts();
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, lowStockCount: 0, totalValue: 0, monthSales: 0, monthProfit: 0, lowStockItems: [] });
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeCtx, setUpgradeCtx] = useState({ feature: "", description: "" });

  useEffect(() => {
    if (!user) return;
    Promise.all([inventoryApi.list(), movementsApi.list()])
      .then(([items, movements]) => {
        const lowItems = items.filter((i) => i.quantity <= i.min_quantity && i.quantity > 0);
        const now = new Date();
        const monthMovements = movements.filter((m) => {
          const d = new Date(m.created_at);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const monthSales = monthMovements
          .filter((m) => m.movement_type === "saida" && m.sale_type === "venda")
          .reduce((s, m) => s + (m.unit_price || 0) * m.quantity, 0);
        const monthCost = monthMovements
          .filter((m) => m.movement_type === "saida" && m.sale_type === "venda")
          .reduce((s, m) => {
            const item = items.find((i) => i.barcode === m.barcode);
            return s + (item ? item.cost_price : 0) * m.quantity;
          }, 0);
        setStats({
          totalProducts: items.length,
          lowStockCount: lowItems.length,
          totalValue: items.reduce((s, i) => s + i.quantity * i.cost_price, 0),
          monthSales,
          monthProfit: monthSales - monthCost,
          lowStockItems: lowItems.slice(0, 5).map((i) => ({ name: i.product_name, qty: i.quantity, min: i.min_quantity })),
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
          <ActionBtn onClick={() => navigate("/settings")} icon={Store} label="Vitrine" desc="Loja digital" proBadge={isLocked("storefront")} />
        </div>

        {/* Product limit warning for free */}
        {isLocked("unlimited_products") && stats.totalProducts >= productLimit * 0.8 && (
          <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-center gap-3">
            <Crown className="h-5 w-5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {stats.totalProducts >= productLimit
                  ? `Limite de ${productLimit} produtos atingido!`
                  : `${stats.totalProducts}/${productLimit} produtos cadastrados`}
              </p>
              <p className="text-xs text-muted-foreground">Assine o PRO para produtos ilimitados</p>
            </div>
            <button onClick={() => { setUpgradeCtx({ feature: "Produtos Ilimitados", description: "Seu plano Free permite até 50 produtos." }); setShowUpgrade(true); }} className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
              Upgrade
            </button>
          </div>
        )}

        {!loading && stats.lowStockItems.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Produtos com Estoque Baixo
            </h2>
            <div className="mt-4 space-y-3">
              {stats.lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg bg-destructive/5 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-destructive" style={{ width: `${(item.qty / item.min) * 100}%` }} />
                    </div>
                    <span className="text-sm font-mono text-destructive font-semibold">{item.qty}/{item.min}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiry Alerts */}
        {!loading && totalCount > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? "text-destructive" : "text-accent"}`} />
              Alertas de Validade
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                criticalCount > 0 ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent-foreground"
              }`}>{totalCount}</span>
            </h2>
            <div className="mt-4 space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    alert.severity === "critical" ? "bg-destructive/5" : "bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {alert.severity === "critical" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 shrink-0 text-accent" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate">{alert.product_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      alert.severity === "critical"
                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                        : "border-accent/20 bg-accent/10 text-accent-foreground"
                    }`}>
                      {alert.daysLeft <= 0 ? "Vencido!" : `${alert.daysLeft}d`}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(alert.expiry_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
              {totalCount > 5 && (
                <p className="text-center text-xs text-muted-foreground pt-1">
                  +{totalCount - 5} produtos com validade próxima
                </p>
              )}
            </div>
          </div>
        )}

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

function ActionBtn({ onClick, icon: Icon, label, desc, primary, proBadge }: {
  onClick: () => void; icon: typeof Package; label: string; desc: string; primary?: boolean; proBadge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl p-4 text-left transition-shadow hover:shadow-md ${
        primary
          ? "border-2 border-primary bg-primary/5"
          : "border border-border bg-card"
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
