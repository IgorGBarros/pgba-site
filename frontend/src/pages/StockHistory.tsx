import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Package, 
  Calendar,
  Gift,
  ShoppingCart,
  AlertTriangle,
  User,
  Settings2
} from "lucide-react";
import { api } from "../services/api"; // Sua instância Axios configurada

// Tipagem baseada no seu Model Django
interface StockTransaction {
  id: number;
  transaction_type: 'ENTRADA' | 'VENDA' | 'PRESENTE' | 'BRINDE' | 'USO_PROPRIO' | 'PERDA' | 'AJUSTE';
  quantity: number;
  unit_price: string | null;
  unit_cost: string | null;
  description: string;
  created_at: string;
  product_name: string; // O backend deve serializar o nome do produto
  batch_code?: string; // Opcional, se o backend enviar
}

// Configuração visual para cada tipo de transação
const TRANSACTION_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ENTRADA: { label: "Entrada", icon: ArrowUpCircle, color: "text-green-600", bg: "bg-green-100" },
  VENDA: { label: "Venda", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
  PRESENTE: { label: "Presente", icon: Gift, color: "text-purple-600", bg: "bg-purple-100" },
  BRINDE: { label: "Brinde", icon: Gift, color: "text-pink-600", bg: "bg-pink-100" },
  USO_PROPRIO: { label: "Uso Pessoal", icon: User, color: "text-indigo-600", bg: "bg-indigo-100" },
  PERDA: { label: "Perda/Avaria", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  AJUSTE: { label: "Ajuste", icon: Settings2, color: "text-gray-600", bg: "bg-gray-100" },
};

export default function StockHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("TODOS");

  // Busca dados da API
  useEffect(() => {
    async function fetchHistory() {
      try {
        // Assume que você criou um endpoint GET /api/transactions/ no Django
        // Se precisar filtrar no backend, passe ?type=${filterType}
        const endpoint = filterType === "TODOS" 
          ? "/inventory/transactions/" 
          : `/inventory/transactions/?type=${filterType}`;
          
        const { data } = await api.get<StockTransaction[]>(endpoint);
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar histórico", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [filterType]);

  // Formata data: "25/10/2023 14:30"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Formata moeda
  const formatMoney = (val: string | null) => {
    if (!val) return "-";
    return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Extrato de Estoque</h1>
              <p className="text-xs text-gray-500">Histórico de movimentações</p>
            </div>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="max-w-4xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
          {["TODOS", "ENTRADA", "VENDA", "SAIDA"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type === "SAIDA" ? "VENDA" : type)} // Simplificação
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                (filterType === type || (type === "SAIDA" && filterType === "VENDA"))
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {type === "SAIDA" ? "Saídas (Geral)" : type === "TODOS" ? "Todos" : TRANSACTION_CONFIG[type]?.label || type}
            </button>
          ))}
        </div>
      </header>

      {/* Lista de Transações */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Carregando extrato...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">Nenhuma movimentação</h3>
            <p className="text-gray-400 text-sm">Seu histórico aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((item) => {
              const config = TRANSACTION_CONFIG[item.transaction_type] || TRANSACTION_CONFIG["AJUSTE"];
              const Icon = config.icon;
              const isEntry = item.quantity > 0;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
                >
                  {/* Ícone do Tipo */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-800 truncate text-sm">
                        {item.product_name}
                      </p>
                      <span className={`text-xs font-mono font-bold ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                        {isEntry ? '+' : ''}{item.quantity} un
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDate(item.created_at)}</span>
                      <span>
                        {item.transaction_type === 'VENDA' && item.unit_price 
                          ? formatMoney(item.unit_price) 
                          : config.label}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className="text-[10px] text-gray-400 mt-1 italic truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}