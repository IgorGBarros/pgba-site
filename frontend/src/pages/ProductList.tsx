import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft, AlertTriangle, ScanBarcode } from "lucide-react";
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

  const loadProducts = async () => {
    const data = await productService.list();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bar_code.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await productService.delete(deleteId);
      toast({ title: "Produto excluído" });
      loadProducts();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteId(null);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    try {
      const existing = await productService.getByBarcode(barcode);
      if (existing) {
        navigate(`/products/${existing.id}/edit`);
        toast({ title: "Produto encontrado!", description: existing.name });
      } else {
        navigate(`/products/new?barcode=${barcode}`);
        toast({ title: "Novo produto", description: `Código: ${barcode}` });
      }
    } catch {
      navigate(`/products/new?barcode=${barcode}`);
    }
  };
const formatMoney = (val: string | number | undefined) => {
  const num = Number(val); // Converte "116.90" para 116.90
  if (isNaN(num)) return "R$ 0,00";
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Produtos</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {products.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <ScanBarcode className="h-4 w-4" />
              <span className="hidden sm:inline">Escanear</span>
            </button>
            <button
              onClick={() => navigate("/products/new")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Product List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Nenhum produto encontrado</p>
            </div>
          ) : (
            filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    {product.quantity <= product.min_quantity && (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{product.category}</span>
                    <span>•</span>
                    <span className="font-mono">{product.bar_code}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className={`text-xs font-mono ${product.quantity <= product.min_quantity ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {product.quantity} un.
                  </p>
                </div>
                  <span className="text-sm font-bold text-gray-900">
                    {/* 2. Use a função aqui em vez de chamar .toFixed direto */}
                    {formatMoney(product.price || product.sale_price)}
                  </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id!)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
