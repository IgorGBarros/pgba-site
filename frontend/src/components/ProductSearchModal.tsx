import { useState, useEffect } from "react";
import { Search, X, Loader2, ChevronRight, Package } from "lucide-react";
import { api } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: any) => void;
}

export default function ProductSearchModal({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) searchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      // Usa o endpoint de lookup que já suporta busca por nome/SKU
      const { data } = await api.get(`/products/lookup/?q=${query}`);
      // O endpoint pode retornar 'candidates' (sugestões) ou 'data' (match exato)
      // Vamos normalizar para sempre ser uma lista
      let list = [];
      if (data.candidates) list = data.candidates;
      else if (data.found && data.source === 'local') list = [data.data];
      
      setResults(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3">
            <Search className="text-gray-400" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Digite nome ou SKU (ex: 38854)..."
              className="flex-1 outline-none text-lg"
            />
            <button onClick={onClose}><X className="text-gray-400 hover:text-black" /></button>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="py-10 flex justify-center text-primary"><Loader2 className="animate-spin" /></div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <p>Nenhum produto encontrado.</p>
                <p className="text-xs">Tente digitar o código da revista.</p>
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id || item.natura_sku}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left border border-transparent hover:border-gray-200"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-gray-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                       <span>SKU: {item.natura_sku}</span>
                       <span>•</span>
                       <span className="text-green-600 font-medium">Ref: R$ {item.official_price}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}