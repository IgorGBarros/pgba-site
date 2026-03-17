import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search, Package, 
  Calendar, Gift, ShoppingCart, AlertTriangle, User, Settings2
} from "lucide-react";
import { motion } from "framer-motion";
import { movementsApi, Movement, formatMoney } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

// Configuração visual para cada tipo de transação
const TRANSACTION_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  entrada: { label: "Entrada", icon: ArrowUpCircle, color: "text-green-600", bg: "bg-green-100" },
  venda: { label: "Venda", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-100" },
  presente: { label: "Presente", icon: Gift, color: "text-purple-600", bg: "bg-purple-100" },
  brinde: { label: "Brinde", icon: Gift, color: "text-pink-600", bg: "bg-pink-100" },
  uso_proprio: { label: "Uso Pessoal", icon: User, color: "text-indigo-600", bg: "bg-indigo-100" },
  perda: { label: "Perda/Avaria", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  ajuste: { label: "Ajuste", icon: Settings2, color: "text-gray-600", bg: "bg-gray-100" },
  saida: { label: "Saída Genérica", icon: ArrowDownCircle, color: "text-orange-600", bg: "bg-orange-100" },
};

export default function MovementHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("TODOS");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // 🚀 Usa a nossa API centralizada que resolve os erros 404 e 500
    movementsApi.list().then((data: any[]) => {
      const normalizedData = data.map(m => {
        // Pega o tipo exato (Entrada ou Venda) para aplicar as cores
        let tType = (m.sale_type || m.transaction_type || m.movement_type || "saida").toLowerCase();
        
        return {
          ...m,
          movement_type: tType,
          product_name: m.product?.name || m.product_name || "Produto Desconhecido",
          barcode: m.product?.bar_code || m.barcode || "",
        };
      });
      
      setMovements(normalizedData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const filtered = movements.filter((m) => {
    const matchSearch = m.product_name.toLowerCase().includes(search.toLowerCase()) || m.barcode.includes(search);
    const matchFilter = filterType === "TODOS" || m.movement_type === filterType.toLowerCase() || m.transaction_type?.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchFilter;
  });

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR", { 
      day: "2-digit", month: "2-digit", year: "2-digit", 
      hour: "2-digit", minute: "2-digit" 
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-primary">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Carregando extrato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Extrato de Estoque</h1>
              <p className="text-xs text-gray-500">{movements.length} movimentações registradas</p>
            </div>
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="max-w-4xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["TODOS", "ENTRADA", "VENDA", "SAIDA"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                filterType === type
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {type === "SAIDA" ? "Saídas (Outros)" : type === "TODOS" ? "Todos" : TRANSACTION_CONFIG[type.toLowerCase()]?.label || type}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou código..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" 
          />
        </div>

        {/* Lista de Transações */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">Nenhuma movimentação</h3>
            <p className="text-gray-400 text-sm mt-1">Seu histórico de {filterType.toLowerCase()} aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              // 🚀 Busca as configurações visuais com base no tipo exato
              const config = TRANSACTION_CONFIG[item.movement_type] || TRANSACTION_CONFIG["ajuste"];
              const Icon = config.icon;
              const isEntry = item.transaction_type?.toLowerCase() === "entrada" || item.movement_type === "entrada";
              
              return (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-md transition-shadow"
                >
                  {/* Ícone do Tipo */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  {/* Detalhes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-800 truncate text-sm">
                        {item.product_name}
                      </p>
                      <span className={`text-xs font-mono font-bold shrink-0 ml-2 ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                        {isEntry ? '+' : '-'}{Math.abs(item.quantity)} un
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                      <span>{formatDate(item.created_at)}</span>
                      <span>
                        {(item.movement_type === 'venda' || item.transaction_type === 'VENDA') && (item.unit_price || item.unit_price_sold)
                          ? formatMoney(item.unit_price || item.unit_price_sold) 
                          : config.label}
                      </span>
                    </div>
                    
                    {(item.description || item.notes) && (
                      <p className="text-[10px] text-gray-400 mt-1.5 italic truncate bg-gray-50 px-2 py-1 rounded">
                        {item.description || item.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}