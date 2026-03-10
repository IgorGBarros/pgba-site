import { useState, useEffect } from "react";
import { Search, X, Loader2, Package, ImageOff, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalProduct, formatMoney} from "../lib/api";
import {api }from "../services/api";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: GlobalProduct) => void;
}

export default function ProductSearchModal({ isOpen, onClose, onSelect }: ProductSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Busca remota
  const searchProducts = async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/lookup/?q=${q}`);
      let list: GlobalProduct[] = [];
      if (data.candidates && data.candidates.length > 0) {
        list = data.candidates;
      } else if (data.found && data.source === "local" && data.data) {
        list = [data.data];
      }
      setResults(list);
    } catch (err) {
      console.error("Erro na busca:", err);
      setError("Falha ao buscar produtos.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ⏱️ Debounce para evitar chamadas contínuas
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isOpen) searchProducts(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, isOpen]);

  // Reset ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          className="w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header / Search Input */}
          <div className="p-4 border-b border-border flex items-center gap-3 bg-card sticky top-0 z-10">
            <Search className="text-muted-foreground shrink-0" size={20} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome ou SKU do produto..."
              className="flex-1 outline-none text-base bg-transparent text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="text-muted-foreground" size={18} />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-secondary/30">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Buscando produtos...</span>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-500 text-sm">{error}</div>
            ) : results.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <Package className="w-12 h-12 mb-3 text-muted-foreground/20" />
                <p className="font-medium text-muted-foreground">
                  {query.length >= 2 ? "Nenhum produto encontrado." : "Digite ao menos 2 caracteres."}
                </p>
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full flex gap-4 p-3 bg-card hover:bg-primary/5 rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm text-left group"
                >
                  <div className="w-16 h-16 bg-muted rounded-lg shrink-0 overflow-hidden border border-border">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-primary">
                      {item.name}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-xs text-muted-foreground flex flex-col">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.category && <span>{item.category}</span>}
                      </div>
                      {item.official_price && item.official_price > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">Oficial</span>
                          <span className="text-primary font-bold text-sm">{formatMoney(item.official_price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="self-center text-muted-foreground/30 group-hover:text-primary" size={20} />
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}