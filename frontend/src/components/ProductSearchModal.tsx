import { useState, useEffect } from "react";
import { Search, X, Loader2, ChevronRight, Package, ImageOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { formatMoney } from "../lib/api";

interface Product {
  id: number;
  name: string;
  natura_sku?: string;
  bar_code?: string;
  category?: string;
  official_price?: number;
  image_url?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export default function ProductSearchModal({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || loaded) return;
    setLoading(true);
    api
      .get("/products/")
      .then(({ data }) => {
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          natura_sku: p.natura_sku || "",
          bar_code: p.bar_code || "",
          category: p.category || "",
          official_price: p.official_price ? parseFloat(p.official_price) : 0,
          image_url: p.image_url || null,
        }));
        setAllProducts(mapped);
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Erro ao carregar catálogo local:", err);
        setError("Falha ao carregar catálogo local.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, loaded]);

  const searchProducts = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/lookup/?q=${q}`);
      let list: Product[] = [];
      if (data.candidates?.length) list = data.candidates;
      else if (data.found && data.source === "local" && data.data) list = [data.data];
      // Fallback local se o remoto vier vazio
      if (!list.length && allProducts.length) {
        const qLower = q.toLowerCase();
        list = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(qLower) ||
            (p.natura_sku && p.natura_sku.toLowerCase().includes(qLower)) ||
            (p.bar_code && p.bar_code.includes(qLower))
        );
      }
      setResults(list.slice(0, 20));
    } catch (err) {
      console.error("Erro na busca remota:", err);
      setError("Falha ao buscar produtos.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 && isOpen) searchProducts(query);
      else setResults([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="p-4 border-b flex items-center gap-3">
            <Search className="text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome ou SKU (ex: 38854)..."
              className="flex-1 outline-none text-base bg-transparent text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={onClose}><X className="text-muted-foreground hover:text-primary" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center text-primary"><Loader2 className="animate-spin" /></div>
            ) : error ? (
              <div className="py-10 text-center text-red-500 text-sm">{error}</div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum produto encontrado.</p>
                <p className="text-xs">Digite pelo menos 2 caracteres.</p>
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 bg-muted rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : <ImageOff size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{item.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      {item.natura_sku && <span>SKU: {item.natura_sku}</span>}
                      {item.official_price && (
                        <span className="text-green-600 font-medium">
                          {formatMoney(item.official_price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/40" />
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}