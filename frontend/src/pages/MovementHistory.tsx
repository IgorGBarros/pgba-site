import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search, Package } from "lucide-react";
import { motion } from "framer-motion";
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
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "entrada" | "saida">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    movementsApi.list().then((data) => {
      setMovements(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const filtered = movements.filter((m) => {
    const matchSearch = m.product_name.toLowerCase().includes(search.toLowerCase()) || m.barcode.includes(search);
    const matchFilter = filter === "all" || m.movement_type === filter;
    return matchSearch && matchFilter;
  });

  const totalEntradas = filtered.filter((m) => m.movement_type === "entrada").reduce((s, m) => s + m.quantity, 0);
  const totalSaidas = filtered.filter((m) => m.movement_type === "saida").reduce((s, m) => s + m.quantity, 0);
  const totalReceita = filtered
    .filter((m) => m.movement_type === "saida" && m.sale_type === "venda")
    .reduce((s, m) => s + (m.unit_price || 0) * m.quantity, 0);
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
          <div className="space-y-2">
            {filtered.map((m, i) => {
              const typeInfo = m.sale_type ? TYPE_LABELS[m.sale_type] : null;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.movement_type === "entrada" ? "bg-primary/10" : "bg-destructive/10"}`}>
                    {m.movement_type === "entrada" ? <ArrowUpCircle className="h-5 w-5 text-primary" /> : <ArrowDownCircle className="h-5 w-5 text-destructive" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{m.product_name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.movement_type === "entrada" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {m.movement_type === "entrada" ? "Entrada" : "Saída"}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{m.barcode}</span>
                      {typeInfo && <span>· {typeInfo.emoji} {typeInfo.label}</span>}
                      {m.notes && <span>· {m.notes}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold font-mono ${m.movement_type === "entrada" ? "text-primary" : "text-destructive"}`}>
                      {m.movement_type === "entrada" ? "+" : "-"}{m.quantity}
                    </p>
                    {m.unit_price != null && m.unit_price > 0 && (
                      <p className="text-[10px] text-muted-foreground">{formatMoney(m.unit_price)}/un</p>
                    )}
                    {m.profit != null && (
                      <p className={`text-[10px] font-medium ${m.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                        Lucro: {formatMoney(m.profit)}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</p>
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
