import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, Package, ArrowLeft, Scale, AlertTriangle, Clock, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { inventoryApi, InventoryItem, formatMoney } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import StockAdjustmentModal from "../components/StockAdjustmentModal";
import ProductSearchModal from "../components/ProductSearchModal";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";

function getStockStatus(qty: number, min: number): { label: string; color: string } {
  if (qty <= 0) return { label: "Esgotado", color: "bg-destructive/10 text-destructive border-destructive/20" };
  if (qty <= min) return { label: "Baixo", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" };
  return { label: "Em Estoque", color: "bg-primary/10 text-primary border-primary/20" };
}

type StockFilter = "TODOS" | "COM_ESTOQUE" | "ESGOTADO";

export default function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<StockFilter>("COM_ESTOQUE");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjustItem, setAdjustItem] = useState<any | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const loadInventory = async () => {
    try {
      const data = await inventoryApi.list();
      setInventory(data);
    } catch (error) {
      toast({ title: "Erro ao carregar estoque", variant: "destructive" });
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const filtered = inventory.filter((item) => {
    const qty = item.total_quantity ?? item.quantity ?? 0;
    const prodName = item.product?.name || item.product_name || "";
    const prodBarcode = item.product?.bar_code || item.barcode || "";
    const prodSku = item.product?.natura_sku || item.sku || "";
    const prodCat = item.product?.category || item.category || "";

    const textMatch = 
      prodName.toLowerCase().includes(search.toLowerCase()) ||
      (item.custom_name || "").toLowerCase().includes(search.toLowerCase()) ||
      prodBarcode.includes(search) ||
      prodSku.toLowerCase().includes(search.toLowerCase()) ||
      prodCat.toLowerCase().includes(search.toLowerCase());
    
    const stockMatch = 
      filterStock === "TODOS" ? true :
      filterStock === "COM_ESTOQUE" ? qty > 0 :
      qty <= 0;
      
    return textMatch && stockMatch;
  });

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await inventoryApi.delete(deleteId);
      toast({ title: "Produto removido do estoque" });
      loadInventory();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-bold text-foreground">Meu Estoque</h1>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{inventory.length}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCatalog(true)} 
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Catálogo</span>
            </button>
            <button onClick={() => navigate("/products/new")} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
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
          <input type="text" placeholder="Buscar por nome, código, SKU ou categoria..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        
        {/* Stock Filters */}
        <div className="mb-4 flex gap-2">
          <button 
            onClick={() => setFilterStock("COM_ESTOQUE")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              filterStock === "COM_ESTOQUE" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Em Estoque
          </button>
          <button 
            onClick={() => setFilterStock("ESGOTADO")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              filterStock === "ESGOTADO" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Esgotados
          </button>
          <button 
            onClick={() => setFilterStock("TODOS")}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              filterStock === "TODOS" ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Todos
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-sm">Nenhum produto encontrado</p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const qty = item.total_quantity ?? item.quantity ?? 0;
              const minQty = item.min_quantity ?? 5;
              const status = getStockStatus(qty, minQty);
              
              const prodName = item.product?.name || item.product_name || "Sem Nome";
              const displayName = item.custom_name || prodName;
              const imageUrl = item.product?.image_url || item.image_url;
              const barcode = item.product?.bar_code || item.barcode;
              const category = item.product?.category || item.category;
              const officialPrice = item.product?.official_price || item.official_price;
              
              const productIdToEdit = item.product?.id || item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  // 🚀 MUDANÇA: flex-col no mobile, sm:flex-row no desktop
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  {/* --- TOPO NO MOBILE / ESQUERDA NO PC (Foto + Info) --- */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Imagem */}
                    {imageUrl ? (
                      <img src={imageUrl} alt={displayName} className="h-14 w-14 shrink-0 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                    )}

                    {/* Textos */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                        {displayName}
                      </p>
                      
                      {/* Flex-wrap para as tags debaixo do nome não vazarem */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{category}</span>
                        <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{barcode}</span>
                        
                        {/* Lógica do Alerta de Validade */}
                        {item.expiry_date && (() => {
                          const now = new Date(); now.setHours(0,0,0,0);
                          const exp = new Date(item.expiry_date); exp.setHours(0,0,0,0);
                          const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                          const alertDays = parseInt(localStorage.getItem("expiry_alert_days") || "30", 10);
                          const alertEnabled = localStorage.getItem("expiry_alert_enabled") !== "false";
                          if (!alertEnabled || daysLeft > alertDays) return null;
                          return (
                            <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-semibold ${
                              daysLeft <= 0 || daysLeft <= 7
                                ? "border-destructive/20 bg-destructive/10 text-destructive"
                                : "border-accent/20 bg-accent/10 text-accent-foreground"
                            }`}>
                              {daysLeft <= 7 ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {daysLeft <= 0 ? "Vencido" : `${daysLeft}d`}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* --- BASE NO MOBILE / DIREITA NO PC (Preços + Botões) --- */}
                  <div className="flex items-center justify-between gap-4 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 w-full sm:w-auto">
                    
                    {/* Preços */}
                    <div className="flex flex-col gap-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      {officialPrice > 0 && (
                        <p>Oficial: <span className="font-mono text-foreground">{formatMoney(officialPrice)}</span></p>
                      )}
                      <p>Custo: <span className="font-mono text-primary">{formatMoney(item.cost_price)}</span></p>
                      {item.sale_price > 0 && (
                        <p>Venda: <span className="font-mono text-accent-foreground">{formatMoney(item.sale_price)}</span></p>
                      )}
                    </div>

                    {/* Quantidade e Ações */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className={`text-sm font-mono ${qty <= minQty ? (qty <= 0 ? "text-destructive font-bold" : "text-yellow-600 dark:text-yellow-400 font-semibold") : "text-foreground font-semibold"}`}>
                        {qty} un.
                      </p>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setAdjustItem(item)} className="rounded-lg p-2 bg-secondary/50 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                          <Scale className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigate(`/products/${productIdToEdit}/edit`)} className="rounded-lg p-2 bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(item.id)} className="rounded-lg p-2 bg-secondary/50 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* Dialogs e Modais */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto será removido do seu estoque.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StockAdjustmentModal
        isOpen={adjustItem !== null}
        onClose={() => setAdjustItem(null)}
        item={adjustItem}
        onAdjusted={loadInventory}
      />
      <ProductSearchModal
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
        onSelect={(product) => {
          toast({ 
            title: "Produto selecionado", 
            description: `${product.name} - Use "Novo" para adicionar ao estoque` 
          });
          setShowCatalog(false);
        }}
      />
    </div>
  );
}