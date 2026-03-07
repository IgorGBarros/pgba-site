import { useState, useEffect } from "react";
import { Search, X, Loader2, ChevronRight, Package, ImageOff } from "lucide-react";
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) searchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/lookup/?q=${query}`);
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
        className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-3 bg-white sticky top-0 z-10">
            <Search className="text-gray-400" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Digite nome ou código da revista..."
              className="flex-1 outline-none text-lg placeholder:text-gray-300"
            />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X className="text-gray-500" />
            </button>
          </div>

          {/* Lista Rica */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {loading ? (
              <div className="py-20 flex flex-col items-center text-primary gap-3">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="text-sm font-medium">Buscando no catálogo...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                <Package className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Nenhum produto encontrado.</p>
                <p className="text-xs mt-1">Tente palavras-chave diferentes.</p>
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id || item.natura_sku}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="w-full flex gap-4 p-3 bg-white hover:bg-green-50/50 rounded-xl border border-gray-100 hover:border-green-200 transition-all shadow-sm text-left group"
                >
                  {/* Foto */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative border border-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight group-hover:text-green-700">
                        {item.name}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                       <div className="text-xs text-gray-500 flex flex-col">
                           <span>SKU: {item.natura_sku || 'N/A'}</span>
                           <span>{item.category}</span>
                       </div>
                       <div className="text-right">
                           <span className="text-xs text-gray-400 block">Oficial</span>
                           <span className="text-green-600 font-bold text-sm">R$ {item.official_price || item.sale_price}</span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Seta */}
                  <div className="self-center">
                     <ChevronRight className="text-gray-300 group-hover:text-green-500" size={20} />
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}