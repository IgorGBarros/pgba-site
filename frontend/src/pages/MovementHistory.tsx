import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search, Package, ChevronDown, ChevronUp, Calendar, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { movementsApi, Movement, formatMoney } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  VENDA: { label: "Venda", emoji: "💰" },
  USO_PROPRIO: { label: "Uso Próprio", emoji: "👤" },
  PRESENTE: { label: "Presente", emoji: "🎁" },
  BRINDE: { label: "Brinde", emoji: "🤝" },
  PERDA: { label: "Perda", emoji: "⚠️" },
  AJUSTE: { label: "Ajuste", emoji: "⚖️" },
  ENTRADA: { label: "Entrada", emoji: "📦" },
};

export default function MovementHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "entrada" | "saida">("all");
  const [loading, setLoading] = useState(true);
  
  // 🚀 ESTADO DO ACORDEÃO
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!user) return;
    movementsApi.list().then((data: any[]) => {
      const normalizedData = data.map(m => {
        // 🚀 LÓGICA INFALÍVEL: Define claramente se é uma operação de Entrada ou Saída
        const rawType = (m.transaction_type || m.movement_type || "").toUpperCase();
        const uiType = rawType === "ENTRADA" ? "entrada" : "saida"; // Ajustes negativos caem como saída!

        return {
          ...m,
          raw_type: rawType, // Ex: "AJUSTE", "VENDA"
          ui_type: uiType,   // Ex: "entrada", "saida"
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
    const matchFilter = filter === "all" || m.ui_type === filter;
    return matchSearch && matchFilter;
  });

  // 🚀 O PLACAR AGORA USA O "UI_TYPE" E NUNCA MAIS FICA ZERADO
  const totalEntradas = filtered.filter((m) => m.ui_type === "entrada").reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalSaidas = filtered.filter((m) => m.ui_type === "saida").reduce((s, m) => s + Math.abs(m.quantity), 0);
  
  const totalReceita = filtered
    .filter((m) => m.ui_type === "saida" && m.raw_type === "VENDA")
    .reduce((s, m) => s + (m.unit_price || m.unit_price_sold || 0) * Math.abs(m.quantity), 0);
    
  const totalLucro = filtered.filter((m) => m.profit != null).reduce((s, m) => s + (m.profit || 0), 0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display text-lg font-bold text-foreground">Extrato de Movimentações</h1>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{movements.length}</span>
        </div>
      </header>
      
      <main className="mx-auto max-w-4xl px-6 py-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Entradas</p>
            <p className="font-display text-xl font-bold text-primary">+{totalEntradas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Saídas</p>
            <p className="font-display text-xl font-bold text-destructive">-{totalSaidas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Receita (Vendas)</p>
            <p className="font-display text-xl font-bold text-foreground">{formatMoney(totalReceita)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Lucro Bruto</p>
            <p className={`font-display text-xl font-bold ${totalLucro >= 0 ? "text-primary" : "text-destructive"}`}>{formatMoney(totalLucro)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 focus-within:border-primary/50 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por nome ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "entrada", "saida"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${filter === f ? "bg-foreground text-background shadow-sm border-foreground" : "bg-card text-muted-foreground border-border hover:bg-secondary"}`}>
                {f === "all" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
              </button>
            ))}
          </div>
        </div>

        {/* Movement list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Package className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m, i) => {
              const typeInfo = TYPE_LABELS[m.raw_type] || TYPE_LABELS["AJUSTE"];
              const displayQuantity = Math.abs(m.quantity);
              const isExpanded = expandedId === m.id;
              const isEntry = m.ui_type === "entrada";
              
              const operacaoTotal = displayQuantity * (Number(m.unit_price) || Number(m.unit_cost) || 0);

              return (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.02 }} 
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm cursor-pointer relative overflow-hidden"
                >
                  {/* 🚀 DATA DE CRIAÇÃO NO TOPO (Pequena) */}
                  <div className="absolute top-2 right-3 text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(m.created_at)}
                  </div>

                  <div className="flex items-start gap-3 mt-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isEntry ? "bg-primary/10" : "bg-destructive/10"}`}>
                      {isEntry ? <ArrowUpCircle className="h-5 w-5 text-primary" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                    </div>
                    
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                          {m.product_name}
                        </p>
                        <span className={`text-sm font-mono font-bold shrink-0 ml-2 ${isEntry ? 'text-primary' : 'text-destructive'}`}>
                          {isEntry ? '+' : '-'}{displayQuantity} un.
                        </span>
                      </div>
                      
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${isEntry ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                          {isEntry ? "Entrada" : "Saída"}
                        </span>
                        <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{m.barcode}</span>
                        {typeInfo && <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{typeInfo.emoji} {typeInfo.label}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <p>Custo: <span className="font-medium text-foreground">{formatMoney(m.unit_cost)}</span></p>
                      <p>Venda: <span className="font-medium text-foreground">{formatMoney(m.unit_price)}</span></p>
                    </div>
                    <div className="p-1 rounded-full bg-secondary/50 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* 🚀 ACORDEÃO COM DETALHES (Lote, Validade e Valores Totais) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                          <div className="bg-secondary/30 p-2.5 rounded-lg border border-border">
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1 mb-0.5">
                              <Calculator className="h-3 w-3" /> Total da Operação
                            </p>
                            <p className="font-mono font-bold text-foreground">
                              {formatMoney(operacaoTotal)} <span className="text-[10px] font-normal text-muted-foreground">({displayQuantity}x)</span>
                            </p>
                          </div>

                          {m.profit != null && (
                            <div className="bg-secondary/30 p-2.5 rounded-lg border border-border">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-0.5">Lucro da Venda</p>
                              <p className={`font-mono font-bold ${m.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                                {formatMoney(m.profit)}
                              </p>
                            </div>
                          )}

                          {(m.batch_code || m.expiration_date || m.description || m.notes) && (
                            <div className="col-span-2 rounded-lg bg-primary/5 p-3 border border-primary/20 space-y-1.5">
                              <p className="text-[10px] uppercase font-semibold text-primary mb-1">Informações Adicionais</p>
                              {m.batch_code && <p className="text-foreground text-xs"><span className="font-medium">Lote:</span> {m.batch_code}</p>}
                              {m.expiration_date && <p className="text-foreground text-xs"><span className="font-medium">Validade:</span> {new Date(m.expiration_date).toLocaleDateString('pt-BR')}</p>}
                              {m.description && <p className="text-foreground text-xs"><span className="font-medium">Descrição:</span> {m.description}</p>}
                              {m.notes && <p className="text-foreground text-xs"><span className="font-medium">Notas:</span> {m.notes}</p>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}