import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Plus, 
  ScanBarcode, 
  List, 
  Settings as SettingsIcon,
  ArrowDownCircle, // Novo ícone
  PieChart,         // Novo ícone
  Settings
} from "lucide-react";
import { ChatAssistant } from "../components/ChatAssistant";
import { api } from "../services/api";


// Tipagem dos itens vindos da API
interface InventoryItem {
  id: number;
  product: {
    id: number;
    name: string;
    official_price: number;
  };
  total_quantity: number;
  min_quantity: number;
  cost_price: string | number;
  sale_price: string | number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: any;
  change: string;
  color?: string;
}

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estados para os dados do Dashboard
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Total Produtos", value: "-", icon: Package, change: "..." },
    { label: "Unidades em Estoque", value: "-", icon: BarChart3, change: "..." },
    { label: "Estoque Baixo", value: "-", icon: TrendingDown, change: "..." },
    { label: "Valor Investido", value: "R$ -", icon: DollarSign, change: "..." },
  ]);
  
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  // Carregar dados da API
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data } = await api.get<InventoryItem[]>("/inventory/");
        
        // 1. Cálculos de Totais
        const totalProdutos = data.length;
        const unidadesTotal = data.reduce((acc, item) => acc + item.total_quantity, 0);
        const valorTotal = data.reduce((acc, item) => {
          const custo = Number(item.cost_price) || 0;
          return acc + (custo * item.total_quantity);
        }, 0);

        // 2. Filtro de Estoque Baixo
        const criticalItems = data.filter(item => item.total_quantity <= item.min_quantity);

        // 3. Formatação de Moeda
        const valorFormatado = new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(valorTotal);

        // Atualiza os Cards
        setStats([
          { 
            label: "Total Produtos", 
            value: totalProdutos, 
            icon: Package, 
            change: "SKUs ativos" 
          },
          { 
            label: "Unidades em Estoque", 
            value: unidadesTotal, 
            icon: BarChart3, 
            change: "Total de itens" 
          },
          { 
            label: "Estoque Baixo", 
            value: criticalItems.length, 
            icon: TrendingDown, 
            change: "Itens críticos",
            color: criticalItems.length > 0 ? "text-destructive" : "text-primary"
          },
          { 
            label: "Valor Investido", 
            value: valorFormatado, 
            icon: DollarSign, 
            change: "Custo total" 
          },
        ]);

        setLowStockItems(criticalItems.slice(0, 5)); // Pega apenas os 5 primeiros
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                Estoque Natura
              </h1>
              <p className="text-xs text-muted-foreground">
                Gestão inteligente de inventário
              </p>
            </div>
          </div>
              <button onClick={() => navigate("/settings")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        
        {/* Loading State Simples */}
        {loading && (
          <div className="mb-6 text-sm text-muted-foreground animate-pulse">
            Carregando indicadores...
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <span className={`text-xs font-medium ${stat.color || "text-primary"}`}>
                {stat.change}
              </span>
            </div>
          ))}
        </div>

        {/* --- NOVO MENU DE AÇÕES RÁPIDAS --- */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ActionBtn 
            onClick={() => navigate("/add")} // Ajustado para rota existente de Scan/Novo
            icon={ScanBarcode} 
            label="Cadastrar" 
            desc="Escanear e cadastrar" 
            primary 
          />
          <ActionBtn 
            onClick={() => navigate("/withdraw")} 
            icon={ArrowDownCircle} 
            label="Baixa" 
            desc="Saída de produto" 
          />
          <ActionBtn 
            onClick={() => navigate("/products")} 
            icon={List} 
            label="Estoque" 
            desc="Lista completa" 
          />
          <ActionBtn 
            onClick={() => navigate("/dashboard")} 
            icon={PieChart} 
            label="Dashboard" 
            desc="Gráficos e análises" 
          />
          <ActionBtn 
            onClick={() => navigate("/products/new")} 
            icon={Plus} 
            label="Manual" 
            desc="Cadastro sem scanner" 
          />
        </div>
        
        {/* Low Stock Alert Dinâmico */}
        {lowStockItems.length > 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Produtos com Estoque Baixo
            </h2>
            <div className="mt-4 space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-destructive/5 px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {item.product.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-destructive"
                        style={{ width: `${(item.total_quantity / item.min_quantity) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-destructive font-semibold">
                      {item.total_quantity}/{item.min_quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum produto com estoque baixo. Tudo sob controle! 🎉
            </div>
          )
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          💬 Clique no botão no canto inferior direito para conversar com o assistente IA
        </p>
      </main>
      
      <ChatAssistant />
    </div>
  );
}

// --- Componente Auxiliar de Botão ---
interface ActionBtnProps {
  onClick: () => void;
  icon: any;
  label: string;
  desc: string;
  primary?: boolean;
}

function ActionBtn({ onClick, icon: Icon, label, desc, primary }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start justify-center gap-2 rounded-xl border p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 ${
        primary
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary/50"
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${primary ? "bg-white/20" : "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${primary ? "text-white" : "text-primary"}`} />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className={`text-[10px] ${primary ? "text-white/80" : "text-muted-foreground"}`}>{desc}</p>
      </div>
    </button>
  );
}