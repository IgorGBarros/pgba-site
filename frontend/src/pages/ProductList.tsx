import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft, AlertTriangle, ScanBarcode, ImageOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Product, productService } from "../lib/productService";
import BarcodeScanner from "../components/BarcodeScanner";
import { useToast } from "../hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.list();
      setProducts(data);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar lista", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bar_code?.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await productService.delete(deleteId);
      toast({ title: "Produto excluído" });
      setProducts(prev => prev.filter(p => p.id !== deleteId));
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteId(null);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    navigate(`/products/new?barcode=${barcode}`); 
  };

  // Helper seguro para preço
  const formatMoney = (val?: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return "R$ 0,00";
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
               <h1 className="font-bold text-lg text-gray-900">Estoque</h1>
               <p className="text-xs text-gray-500">{products.length} itens cadastrados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ScanBarcode className="h-4 w-4" />
              <span className="hidden sm:inline">Scan</span>
            </button>
            <Link
              to="/stock/entry"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Entrada</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/20"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package className="mb-3 h-12 w-12 opacity-20" />
              <p className="text-sm">Nenhum produto encontrado</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  {/* FOTO */}
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-50 border overflow-hidden relative">
                    {product.image_url ? (
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                            <ImageOff size={20} />
                        </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate font-semibold text-gray-900 text-sm">{product.name}</h3>
                            {product.quantity <= product.min_quantity && (
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                            {product.category} • SKU: {product.natura_sku || '-'}
                        </p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div className="flex items-center gap-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.quantity} un
                             </span>
                             <span className="text-sm font-bold text-gray-900">
                                {formatMoney(product.price || product.sale_price)}
                             </span>
                        </div>

                        {/* AÇÕES */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => setDeleteId(product.id!)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá o produto do seu estoque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}