// src/components/InventorySearchModal.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package } from "lucide-react";
import { inventoryApi } from "../lib/api";

interface InventorySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
}

export default function InventorySearchModal({ isOpen, onClose, onSelect }: InventorySearchModalProps) {
  const [query, setQuery] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      inventoryApi.list().then((data) => {
        setInventory(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filtered = inventory.filter((item) => {
    if (!query) return false;
    const name = item.product?.name || item.product_name || "";
    const barcode = item.product?.bar_code || item.barcode || "";
    return name.toLowerCase().includes(query.toLowerCase()) || barcode.includes(query);
  }).slice(0, 10);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="flex h-full w-full flex-col bg-card sm:h-[600px] sm:max-w-lg sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary px-3 py-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar no seu estoque..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
              Cancelar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Carregando seu estoque...</div>
            ) : query && filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Package className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">Nenhum produto encontrado no estoque.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((item) => {
                  const qty = item.total_quantity ?? item.quantity ?? 0;
                  const name = item.product?.name || item.product_name || "Sem Nome";
                  const barcode = item.product?.bar_code || item.barcode;
                  const image = item.product?.image_url || item.image_url;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-secondary"
                    >
                      {image ? (
                        <img src={image} className="h-10 w-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{barcode}</p>
                      </div>
                      <div className="text-right text-xs">
                        <span className={`font-bold ${qty > 0 ? "text-primary" : "text-destructive"}`}>{qty} un.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}