import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Package, TrendingDown, DollarSign, BarChart3, ScanBarcode, List,
  ArrowDownCircle, Settings, PieChart, Store, History, User, Bell, CheckCircle2,
  Clock, Check // ✅ ADICIONAR estes ícones
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  inventoryApi, 
  movementsApi, 
  profileApi, 
  sessionApi, // ✅ ADICIONAR sessionApi
  SessionStatus, // ✅ ADICIONAR interface
  formatMoney 
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { ChatAssistant } from "../components/ChatAssistant";
import ProBadge from "../components/ProBadge";

// ✅ NOVO: Componente SessionHeader
function SessionHeader() {
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const status = await sessionApi.getStatus();
      if (status.has_session) {
        setSession(status);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  const finishSession = async () => {
    try {
      const result = await sessionApi.finishSession();
      setShowSummary(true);
      setSession(null);
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  };

  // ✅ Só renderiza se houver sessão ativa
  if (!session?.has_session) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-3">
        <Package size={18} className="text-blue-100" />
        <div>
          <span className="text-sm font-semibold">
            Cadastrando produtos...
          </span>
          <div className="flex items-center gap-2 text-blue-200 text-xs">
            <span>{session.products_count || 0} produtos</span>
            {session.duration_minutes && (
              <>
                <span>•</span>
                <Clock size={12} />
                <span>{session.duration_minutes}min</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={finishSession}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
      >
        <Check size={16} />
        Finalizar Sessão
      </button>
    </motion.div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gates } = useFeatureGates();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [inventoryData, movementsData, profileData] = await Promise.all([
        inventoryApi.list(),
        movementsApi.list(),
        profileApi.get(),
      ]);
      
      setInventory(inventoryData);
      setMovements(movementsData);
      setProfile(profileData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos do dashboard
  const totalItems = inventory.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.sale_price || 0) * (item.total_quantity || 0), 0);
  const lowStock = inventory.filter(item => (item.total_quantity || 0) <= (item.min_quantity || 0)).length;
  const recentMovements = movements.slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ NOVO: Header de Sessão */}
      <SessionHeader />
      
      {/* Header Principal */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Bem-vinda, {user?.name || profile?.display_name || "Consultora"}!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              {(user?.name || profile?.display_name || "C")[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6">
        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">{formatMoney(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-foreground">{lowStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Movimentações</p>
                <p className="text-2xl font-bold text-foreground">{movements.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <motion.button
            onClick={() => navigate("/add-product")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <ScanBarcode className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Adicionar Produto</p>
              <p className="text-xs text-muted-foreground">Escanear ou cadastrar</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate("/inventory")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <List className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Ver Estoque</p>
              <p className="text-xs text-muted-foreground">Gerenciar produtos</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate("/movements")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <History className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Histórico</p>
              <p className="text-xs text-muted-foreground">Ver movimentações</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => navigate("/storefront")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left hover:bg-accent transition-colors"
          >
            <Store className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Vitrine</p>
              <p className="text-xs text-muted-foreground">Gerenciar loja</p>
            </div>
          </motion.button>
        </div>

        {/* Movimentações Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Movimentações Recentes</h2>
          
          {recentMovements.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <History className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm font-medium">Nenhuma movimentação ainda</p>
              <p className="text-xs">As vendas e entradas aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMovements.map((movement, index) => (
                <div key={movement.id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      movement.movement_type === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{movement.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.movement_type === 'entrada' ? 'Entrada' : 'Saída'} • {movement.quantity} un.
                      </p>
                    </div>
                  </div>
                  
                  {movement.unit_price && (
                    <span className="text-sm font-semibold text-foreground">
                      {formatMoney(movement.unit_price * movement.quantity)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}