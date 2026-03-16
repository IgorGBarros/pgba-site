import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search, Package, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { movementsApi, Movement, formatMoney } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  venda: { label: "Venda", emoji: "💰" },
  uso_proprio: { label: "Uso Próprio", emoji: "👤" },
  presente: { label: "Presente", emoji: "🎁" },
  brinde: { label: "Brinde", emoji: "🤝" },
  perda: { label: "Perda", emoji: "⚠️" },
};

export default function MovementHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [movements, setMovements] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "entrada" | "saida">("all");
  const [loading, setLoading] = useState(true);
  
  // 🚀 NOVO ESTADO: Controla qual card está expandido (acordeão)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    movementsApi.list().then((data: any[]) => {
      const normalizedData = data.map(m => {
        const tType = (m.transaction_type || m.movement_type || "").toLowerCase();
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
    const matchFilter = filter === "all" || m.movement_type === filter;
    return matchSearch && matchFilter;
  });

  const totalEntradas = filtered.filter((m) => m.movement_type === "entrada").reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalSaidas = filtered.filter((m) => m.movement_type === "saida").reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalReceita = filtered
    .filter((m) => m.movement_type === "saida" && m.sale_type === "venda")
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display text-lg font-bold text-foreground">Extrato de Movimentações</h1>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{movements.length}</span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-6 space-y-4">
        
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground">Entradas</p>
            <p className="font-display text-lg font-bold text-primary">+{totalEntradas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground">Saídas</p>
            <p className="font-display text-lg font-bold text-destructive">-{totalSaidas}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground">Receita (Vendas)</p>
            <p className="font-display text-lg font-bold text-foreground">{formatMoney(totalReceita)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground">Lucro Bruto</p>
            <p className={`font-display text-lg font-bold ${totalLucro >= 0 ? "text-primary" : "text-destructive"}`}>{formatMoney(totalLucro)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:border-primary/50">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar por nome ou código..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
            {(["all", "entrada", "saida"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
              const typeInfo = m.sale_type ? TYPE_LABELS[m.sale_type] : null;
              const displayQuantity = Math.abs(m.quantity);
              const isExpanded = expandedId === m.id;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  // 🚀 CLICK PARA EXPANDIR
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm cursor-pointer relative"
                >
                  {/* 🚀 DATA DE CRIAÇÃO NO TOPO (Pequena) */}
                  <div className="absolute top-2 right-3 text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(m.created_at)}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3 sm:mt-2">
                    {/* TOPO NO MOBILE / ESQUERDA NO PC */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${m.movement_type === "entrada" ? "bg-primary/10" : "bg-destructive/10"}`}>
                        {m.movement_type === "entrada" ? <ArrowUpCircle className="h-5 w-5 text-primary" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                      </div>
                      
                      <div className="min-w-0 flex-1 pr-6">
                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                          {m.product_name}
                        </p>
                        
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${m.movement_type === "entrada" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                            {m.movement_type === "entrada" ? "Entrada" : "Saída"}
                          </span>
                          <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{m.barcode}</span>
                          {typeInfo && <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{typeInfo.emoji} {typeInfo.label}</span>}
                        </div>
                      </div>
                    </div>

                    {/* BASE NO MOBILE / DIREITA NO PC */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 w-full sm:w-auto shrink-0">
                      <div className="flex flex-col sm:items-end gap-0.5">
                        <p className={`text-sm font-bold font-mono ${m.movement_type === "entrada" ? "text-primary" : "text-destructive"}`}>
                          {m.movement_type === "entrada" ? "+" : "-"}{displayQuantity} un.
                        </p>
                        {m.unit_price != null && m.unit_price > 0 && (
                          <p className="text-[10px] text-muted-foreground">{formatMoney(m.unit_price)}/un</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {m.profit != null && (
                          <p className={`text-[10px] font-medium ${m.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                            Lucro: {formatMoney(m.profit)}
                          </p>
                        )}
                        {/* 🚀 Ícone de Abrir/Fechar Acordeão */}
                        <div className="p-1 rounded-full bg-secondary/50 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🚀 ACORDEÃO COM DETALHES EXTRAS E VALIDADE (Abre ao Clicar) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Custo Unitário</p>
                            <p className="font-medium text-foreground">{formatMoney(m.unit_cost)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Valor Venda</p>
                            <p className="font-medium text-foreground">{formatMoney(m.unit_price)}</p>
                          </div>
                          
                          {/* Detalhamentos e Lote (Trás a Validade se houver) */}
                          {(m.batch_code || m.notes || m.description) && (
                            <div className="col-span-2 rounded-lg bg-secondary/30 p-2 border border-border">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Informações do Lote</p>
                              {m.batch_code && <p className="text-foreground"><span className="font-medium">Lote:</span> {m.batch_code}</p>}
                              {m.notes && <p className="text-foreground"><span className="font-medium">Validade/Obs:</span> {m.notes}</p>}
                              {m.description && <p className="text-foreground"><span className="font-medium">Descrição:</span> {m.description}</p>}
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