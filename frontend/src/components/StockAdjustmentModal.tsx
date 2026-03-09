import { useState } from "react";
import { X, Loader2, Scale, Minus, Plus, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { inventoryApi, movementsApi, InventoryItem, formatMoney } from "../lib/api";
import { useToast } from "../hooks/use-toast";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onAdjusted: () => void;
}

export default function StockAdjustmentModal({ isOpen, onClose, item, onAdjusted }: StockAdjustmentModalProps) {
  const [realQty, setRealQty] = useState<number | "">(item?.quantity ?? 0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const systemQty = item?.quantity ?? 0;
  const diff = typeof realQty === "number" ? realQty - systemQty : 0;

  const handleSave = async () => {
    if (!item || typeof realQty !== "number") return;
    if (realQty === systemQty) {
      toast({ title: "Sem alteração", description: "A quantidade real é igual ao sistema." });
      return;
    }

    setLoading(true);
    try {
      // Update inventory quantity
      await inventoryApi.update(item.id, { quantity: realQty });

      // Log the adjustment movement
      await movementsApi.create({
        product_id: item.id,
        batch_id: null,
        product_name: item.product_name,
        barcode: item.barcode,
        movement_type: diff > 0 ? "entrada" : "saida",
        quantity: Math.abs(diff),
        unit_price: 0,
        sale_type: null,
        notes: notes.trim() || "Correção manual de inventário",
      });

      toast({
        title: "Estoque ajustado!",
        description: `${item.product_name}: ${systemQty} → ${realQty} (${diff > 0 ? "+" : ""}${diff})`,
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
          <div className="p-4 border-b border-border flex items-center justify-between">
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
            <div className="rounded-lg bg-secondary/50 p-3">
              <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.barcode}</p>
            </div>

            {/* System says */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">O sistema diz que tem</p>
              <p className="text-3xl font-bold text-foreground font-mono">{systemQty} <span className="text-base font-normal text-muted-foreground">un.</span></p>
            </div>

            {/* Real quantity input */}
            <div>
              <label className="text-sm font-medium text-foreground">Quanto você tem na realidade?</label>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRealQty((v) => Math.max(0, (typeof v === "number" ? v : 0) - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary text-lg font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  min={0}
                  value={realQty}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRealQty(v === "" ? "" : Math.max(0, parseInt(v) || 0));
                  }}
                  className="h-12 w-24 rounded-xl border border-input bg-background text-center font-mono text-2xl font-bold outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setRealQty((v) => (typeof v === "number" ? v : 0) + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary text-lg font-bold hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Difference */}
            {typeof realQty === "number" && realQty !== systemQty && (
              <div className={`rounded-lg p-3 text-center ${diff < 0 ? "bg-destructive/10" : "bg-primary/10"}`}>
                <div className="flex items-center justify-center gap-2">
                  {diff < 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <span className={`text-sm font-bold ${diff < 0 ? "text-destructive" : "text-primary"}`}>
                    Diferença: {diff > 0 ? "+" : ""}{diff} unidade{Math.abs(diff) !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {diff < 0 ? "Será registrada uma saída de ajuste" : "Será registrada uma entrada de ajuste"}
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs text-muted-foreground">Observação (opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Correção manual de inventário"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || typeof realQty !== "number" || realQty === systemQty}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar Ajuste
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
