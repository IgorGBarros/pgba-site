import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Edit2, Package, ArrowLeft, Scale, Loader2, 
  AlertTriangle, Clock, ChevronDown, ChevronUp, X, BookOpen 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { inventoryApi, formatMoney } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import StockAdjustmentModal from "../components/StockAdjustmentModal";
import ProductSearchModal from "../components/ProductSearchModal";

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
  const [loading, setLoading] = useState(true);
  
  const [adjustItem, setAdjustItem] = useState<any | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  
  // 🚀 NOVOS ESTADOS: Controlam o Acordeão e o Modal de Foto
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      const data = await inventoryApi.list();
      setInventory(data);
    } catch (error) {
      toast({ title: "Erro ao carregar estoque", variant: "destructive" });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
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
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
          ) : filtered.length === 0 ? (
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
              
              const productIdToEdit = item.product?.id || item.id;
              
              // Variáveis para o Acordeão
              const isExpanded = expandedId === item.id;
              const profitUnit = (item.sale_price || 0) - (item.cost_price || 0);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  // 🚀 Torna o Card inteiro clicável para abrir o acordeão
                  className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* 🚀 FOTO CLICÁVEL: O e.stopPropagation impede de abrir/fechar o card quando clica na foto */}
                    <div 
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (imageUrl) setPreviewImage(imageUrl);
                      }}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={displayName} className="h-14 w-14 rounded-lg object-cover border border-border cursor-zoom-in" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                        {displayName}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">{category}</span>
                        <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{barcode}</span>
                        
                        {/* Alerta de Validade Global (Pega o vencimento mais próximo se houver) */}
                        {item.batches && item.batches.length > 0 && (() => {
                          const batchesWithDates = item.batches.filter((b: any) => b.expiration_date && b.quantity > 0);
                          if (batchesWithDates.length === 0) return null;
                          
                          // Pega a data mais próxima
                          const closestBatch = batchesWithDates.sort((a: any, b: any) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime())[0];
                          const exp = new Date(closestBatch.expiration_date); 
                          exp.setHours(0,0,0,0);
                          const now = new Date(); 
                          now.setHours(0,0,0,0);
                          
                          const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
                          const alertDays = parseInt(localStorage.getItem("expiry_alert_days") || "30", 10);
                          const alertEnabled = localStorage.getItem("expiry_alert_enabled") !== "false";
                          
                          if (!alertEnabled || daysLeft > alertDays) return null;
                          return (
                            <span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${
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

                  {/* Resumo do Card Fechado (Venda, Qtd e Setinha) */}
                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-3">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <p>Venda: <span className="font-bold text-foreground">{formatMoney(item.sale_price)}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <p className={`text-sm font-bold font-mono ${qty <= 0 ? "text-destructive" : "text-primary"}`}>
                        {qty} un.
                      </p>
                      <div className="p-1 rounded-full bg-secondary/50 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* 🚀 ACORDEÃO DE DETALHES COMPLETOS E AÇÕES */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-4">
                          
                          {/* Financeiro */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/30 p-2.5 rounded-lg border border-border">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Custo Unitário</p>
                              <p className="font-mono text-sm font-medium">{formatMoney(item.cost_price)}</p>
                            </div>
                            <div className="bg-secondary/30 p-2.5 rounded-lg border border-border">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Lucro Bruto Un.</p>
                              <p className={`font-mono text-sm font-bold ${profitUnit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                                {formatMoney(profitUnit)}
                              </p>
                            </div>
                          </div>

                          {/* Lotes e Validades */}
                          {item.batches && item.batches.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Lotes Ativos
                              </p>
                              {item.batches.filter((b:any) => b.quantity > 0).map((batch: any) => (
                                <div key={batch.id} className="flex justify-between items-center bg-primary/5 p-2.5 rounded-lg border border-primary/10 text-xs">
                                  <span>{batch.batch_code ? `Lote: ${batch.batch_code}` : "Lote S/N"}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">{batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString('pt-BR') : "Sem validade"}</span>
                                    <span className="font-bold">{batch.quantity} un.</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Botões de Ação */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setAdjustItem(item); }}
                              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors text-foreground"
                            >
                              <Scale className="h-3.5 w-3.5" /> Ajustar Saldo
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/products/${productIdToEdit}/edit`); }}
                              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-xs font-semibold hover:bg-secondary transition-colors text-muted-foreground"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Editar Produto
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* 🚀 MODAL DA FOTO AMPLIADA */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={previewImage} 
              alt="Visualização do Produto" 
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl" 
              onClick={(e) => e.stopPropagation()} // Impede que o clique na foto feche o modal
            />
          </motion.div>
        )}
      </AnimatePresence>

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