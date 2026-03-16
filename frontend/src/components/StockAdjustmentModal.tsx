import { useState, useEffect } from "react";
import { X, Loader2, Scale, Minus, Plus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { inventoryApi, movementsApi, InventoryItem } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onAdjusted: () => void;
}

export default function StockAdjustmentModal({ isOpen, onClose, item, onAdjusted }: StockAdjustmentModalProps) {
  const [realQty, setRealQty] = useState<number | "">(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 🚀 LÓGICA DE EXTRAÇÃO SEGURA (COMPATÍVEL COM O NOVO BACKEND)
  const systemQty = item?.total_quantity ?? item?.quantity ?? 0;
  const productName = item?.product?.name || item?.product_name || "Produto Desconhecido";
  const barcode = item?.product?.bar_code || item?.barcode || "";
  const productId = item?.product?.id || item?.id;

  // Atualiza o estado inicial sempre que o modal abrir ou o item mudar
  useEffect(() => {
    if (isOpen && item) {
      setRealQty(systemQty);
      setNotes("");
    }
  }, [isOpen, item, systemQty]);

  const diff = typeof realQty === "number" ? realQty - systemQty : 0;

  const handleSave = async () => {
    if (!item || typeof realQty !== "number") return;
    
    if (realQty === systemQty) {
      toast({ title: "Sem alteração", description: "A quantidade real é igual ao sistema." });
      return;
    }

    setLoading(true);
    try {
      // 1. Atualiza a quantidade do inventário da loja (suportando novo e velho padrão)
      await inventoryApi.update(item.id, { 
        total_quantity: realQty, 
        quantity: realQty 
      });

      // 2. Registra o histórico com a diferença (Entrada ou Saída)
      await movementsApi.create({
        // 🚀 CORREÇÃO AQUI: Enviando os nomes exatos que o Django espera
        transaction_type: diff > 0 ? "ENTRADA" : "SAIDA",
        description: notes.trim() || (diff < 0 ? "Ajuste de saldo (Perda/Saída)" : "Ajuste manual de saldo (Entrada)"),
        unit_cost: item.cost_price || 0,
        unit_price: 0,

        // Mantendo os campos antigos para o TypeScript não reclamar
        product_id: productId as string,
        batch_id: null,
        product_name: productName,
        barcode: barcode,
        movement_type: diff > 0 ? "entrada" : "saida",
        quantity: Math.abs(diff), // Math.abs garante que só enviamos números absolutos
        sale_type: diff < 0 ? "perda" : null, 
        notes: notes.trim(),
      } as any);

      toast({
        title: "Estoque ajustado!",
        description: `${productName}: ${systemQty} → ${realQty} (${diff > 0 ? "+" : ""}${diff})`,
      });
      
      onAdjusted();
      onClose();
    } catch (err: any) {
      toast({ title: "Erro ao ajustar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Ajustar Saldo</h2>
                <p className="text-xs text-muted-foreground">Correção manual de inventário</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="text-muted-foreground" size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Product info */}
            <div className="rounded-lg bg-secondary/50 p-3 border border-border">
              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{productName}</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{barcode}</p>
            </div>

            {/* System says */}
            <div className="text-center bg-secondary/20 py-4 rounded-xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Saldo Atual (Sistema)</p>
              <p className="text-4xl font-bold text-foreground font-mono">
                {systemQty} <span className="text-base font-normal text-muted-foreground">un.</span>
              </p>
            </div>

            {/* Real quantity input */}
            <div>
              <label className="text-sm font-medium text-foreground block text-center mb-3">Qual a quantidade real física?</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setRealQty((v) => Math.max(0, (typeof v === "number" ? v : 0) - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-border bg-secondary text-xl font-bold hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Minus className="h-6 w-6" />
                </button>
                
                <input
                  type="number"
                  min={0}
                  value={realQty}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRealQty(v === "" ? "" : Math.max(0, parseInt(v) || 0));
                  }}
                  className="h-14 w-28 rounded-xl border-2 border-primary bg-primary/5 text-center font-mono text-3xl font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                />
                
                <button
                  type="button"
                  onClick={() => setRealQty((v) => (typeof v === "number" ? v : 0) + 1)}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-border bg-secondary text-xl font-bold hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Difference Warning */}
            <div className="h-16 flex items-center justify-center">
              {typeof realQty === "number" && realQty !== systemQty && (
                <div className={`w-full rounded-xl p-3 text-center border ${diff < 0 ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20"}`}>
                  <div className="flex items-center justify-center gap-2">
                    {diff < 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    <span className={`text-sm font-bold ${diff < 0 ? "text-destructive" : "text-primary"}`}>
                      Diferença: {diff > 0 ? "+" : ""}{diff} unidade{Math.abs(diff) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-0.5 font-medium ${diff < 0 ? "text-destructive/70" : "text-primary/70"}`}>
                    {diff < 0 ? "Será registrada uma SAÍDA (Perda/Ajuste)" : "Será registrada uma ENTRADA (Ajuste)"}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Observação do Ajuste (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Contagem de inventário mensal"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex gap-3 bg-secondary/10">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || typeof realQty !== "number" || realQty === systemQty}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Ajuste"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}