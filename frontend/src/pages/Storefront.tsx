import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Package, Search, ShoppingBag, Plus, Minus, Trash2, Send, Sparkles, CreditCard, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { storefrontApi, StorefrontItem, formatMoney } from "../lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { toast } from "../hooks/use-toast";
import { publicStorefrontApi } from "../lib/api";

type PaymentMethod = "pix" | "cartao";

interface BagItem extends StorefrontItem {
  qty: number;
}

// Chaves de localStorage específicas por loja
const getCartStorageKey = (storeSlug: string) => `storefront_cart_${storeSlug}`;
const getPaymentStorageKey = (storeSlug: string) => `storefront_payment_${storeSlug}`;

function loadCart(storeSlug: string): BagItem[] {
  try {
    const raw = localStorage.getItem(getCartStorageKey(storeSlug));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(bag: BagItem[], storeSlug: string) {
  localStorage.setItem(getCartStorageKey(storeSlug), JSON.stringify(bag));
}

function loadPayment(storeSlug: string): PaymentMethod {
  return (localStorage.getItem(getPaymentStorageKey(storeSlug)) as PaymentMethod) || "pix";
}

// Função helper para nomes consistentes
function getProductDisplayName(item: any): string {
  return item.product?.name ||
         item.display_name ||
         item.product_name ||
         item.custom_name ||
         "Produto sem nome";
}

export default function Storefront() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const sellerIdParam = searchParams.get("seller");
  
  const [items, setItems] = useState<StorefrontItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [sellerName, setSellerName] = useState("");
  const [sellerWhatsapp, setSellerWhatsapp] = useState("");
  
  // Estados com slug específico
  const [storeSlug, setStoreSlug] = useState<string>("");
  const [bag, setBag] = useState<BagItem[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  // ✅ NOVO: Estados para filtro de marca
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(""); // "" = todas as marcas

  

  // Carregar sacola específica da loja
  useEffect(() => {
    if (storeSlug) {
      setBag(loadCart(storeSlug));
      setPaymentMethod(loadPayment(storeSlug));
    }
  }, [storeSlug]);

  // Salvar sacola específica da loja
  useEffect(() => {
    if (storeSlug) {
      saveCart(bag, storeSlug);
    }
  }, [bag, storeSlug]);

  useEffect(() => {
    if (storeSlug) {
      localStorage.setItem(getPaymentStorageKey(storeSlug), paymentMethod);
    }
  }, [paymentMethod, storeSlug]);

  // ✅ NOVO: Processar marcas disponíveis dos produtos
useEffect(() => {
  if (items.length > 0) {
    const validBrands: string[] = [];
    
    items.forEach(item => {
      if (item.brand && typeof item.brand === 'string' && item.brand.trim() !== '') {
        validBrands.push(item.brand);
      }
    });
    
    const uniqueBrands = [...new Set(validBrands)].sort();
    setAvailableBrands(uniqueBrands);
    console.log('🏷️ Marcas disponíveis:', uniqueBrands);
  }
}, [items]);


  useEffect(() => {
  console.log('🚀 Iniciando carregamento da vitrine...', { slug, sellerIdParam });
  
  const fetchItems = slug
    ? publicStorefrontApi.listBySlug(slug)
    : publicStorefrontApi.listById(sellerIdParam || "");
    
  fetchItems.then((res: any) => {
    console.log('📦 Resposta da API:', res);
    
    const productsList = res.items || [];
    
    // ✅ NOVO: Mapear dados com marca e urgência
    const mappedItems = productsList.map((item: any) => {
      console.log('🔍 Item raw da API:', item);
      
      const productName = item.product_name || item.display_name || "Produto sem nome";
      console.log('✅ Nome mapeado:', productName);
      
      return {
        id: item.id,
        product_name: productName,
        display_name: productName,
        category: item.category || "Geral",
        brand: item.brand || null, // ✅ NOVO: Campo marca
        sale_price: item.sale_price || 0,
        total_quantity: item.total_quantity || 0,
        stock_info: item.stock_info || { // ✅ NOVO: Info de urgência
          quantity: item.total_quantity || 0,
          is_urgent: (item.total_quantity || 0) <= 3,
          display_text: (item.total_quantity || 0) > 3 ? 'Em estoque' : `Restam apenas ${item.total_quantity || 0}!`
        },
        image_url: item.image_url || null,
        // Campos adicionais necessários para StorefrontItem
        custom_name: item.custom_name || null,
        barcode: item.barcode || "",
        expiry_date: item.expiry_date || null,
        seller_name: null,
        seller_whatsapp: null,
        user_id: "",
        store_slug: null,
      };
    });
    
    console.log('🎯 Produtos mapeados:', mappedItems);
    setItems(mappedItems);
    
    // ✅ NOVO: Processar marcas da API
    if (res.brands && res.brands.available) {
      setAvailableBrands(res.brands.available);
      console.log('🏷️ Marcas da API:', res.brands.available);
    }
    
    // Definir dados da loja
    if (res.store) {
      console.log('🏪 Dados da loja:', res.store);
      setSellerName(res.store.name || "Consultor(a)");
      setSellerWhatsapp(res.store.whatsapp || "");
      
      const currentStoreSlug = res.store.slug || slug || sellerIdParam || "default";
      setStoreSlug(currentStoreSlug);
    }
    
    setLoading(false);
  }).catch((err) => {
    console.error("❌ Erro ao carregar vitrine:", err);
    setLoading(false);
  });
}, [slug, sellerIdParam]);


  // ✅ NOVO: Filtro que considera marca E busca
// ✅ CORREÇÃO: Usar função helper para comparar marca
const filtered = items.filter((item) => {
  const matchesSearch = !search || 
    getProductDisplayName(item).toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase());
  
  // ✅ CORREÇÃO: Comparação segura de marca
  const itemBrand = item.brand;
  const matchesBrand = !selectedBrand || (itemBrand && itemBrand === selectedBrand);
  
  return matchesSearch && matchesBrand;
});

  const addToBag = useCallback((item: StorefrontItem) => {
    setBag((prev) => {
      const existing = prev.find((b) => b.id === item.id);
      if (existing) {
        return prev.map((b) => b.id === item.id ? { ...b, qty: b.qty + 1 } : b);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const updateQty = (id: string, delta: number) => {
    setBag((prev) =>
      prev
        .map((b) => b.id === id ? { ...b, qty: b.qty + delta } : b)
        .filter((b) => b.qty > 0)
    );
  };

  const removeFromBag = (id: string) => {
    setBag((prev) => prev.filter((b) => b.id !== id));
  };

  const bagTotal = bag.reduce((sum, b) => sum + (b.sale_price || 0) * b.qty, 0);
  const bagCount = bag.reduce((sum, b) => sum + b.qty, 0);
  const paymentLabel = paymentMethod === "pix" ? "PIX" : "Cartão / Link de Pagamento";

  // Usar a função helper consistente
  const getDisplayName = (item: StorefrontItem | BagItem) => {
    return getProductDisplayName(item);
  };

  // Lógica do WhatsApp
  const buildWhatsappLink = (itemsList: BagItem[]) => {
    const rawPhone = sellerWhatsapp?.replace(/\D/g, "") || "";
    const phone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`;
    
    if (itemsList.length === 1 && itemsList[0].qty === 1) {
      const name = getDisplayName(itemsList[0]);
      const priceText = itemsList[0].sale_price ? ` — ${formatMoney(itemsList[0].sale_price)}` : "";
      
      const msg = `Olá ${sellerName}! 😊\n\nTenho interesse no produto:\n• ${name}${priceText}\n\n💳 Forma de pagamento: *${paymentLabel}*\n\nEstá disponível?`;
      return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
    }
    
    const lines = itemsList.map(
      (b) => `• ${b.qty}x ${getDisplayName(b)}${b.sale_price ? ` — ${formatMoney(b.sale_price * b.qty)}` : ""}`
    );
    
    const msg = `Olá ${sellerName}! 😊\n\nGostaria de solicitar os seguintes produtos:\n\n${lines.join("\n")}\n\n💰 Total estimado: *${formatMoney(bagTotal)}*\n💳 Forma de pagamento: *${paymentLabel}*\n\nPode verificar a disponibilidade e me retornar? Obrigada!`;
    
    return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
  };

  const handleDirectBuy = (item: StorefrontItem) => {
    if (!sellerWhatsapp) {
      toast({ title: "Aviso", description: "O lojista não configurou o número de WhatsApp.", variant: "destructive" });
      return;
    }
    addToBag(item);
    setBagOpen(true);
  };

  const handleSendOrder = () => {
    if (bag.length === 0 || !sellerWhatsapp) return;
    const link = buildWhatsappLink(bag);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const clearBag = () => {
    setBag([]);
    if (storeSlug) {
      localStorage.removeItem(getCartStorageKey(storeSlug));
    }
  };

  const getItemQtyInBag = (id: string) => bag.find((b) => b.id === id)?.qty || 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-28">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary-foreground)/0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 backdrop-blur-sm shadow-lg"
          >
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-2xl font-bold text-primary-foreground tracking-tight"
          >
            {sellerName ? `Vitrine de ${sellerName}` : "Vitrine Online"}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-1 text-sm text-primary-foreground/80"
          >
            Produtos disponíveis para pronta entrega
          </motion.p>
        </div>
      </header>

      {/* Search */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="-mt-6 relative z-10 mb-6"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-xl shadow-black/5 ring-1 ring-black/[0.03] focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <Search className="h-5 w-5 text-primary shrink-0" />
            <input
              type="text"
              placeholder="Buscar produto ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </motion.div>
        
        {/* ✅ NOVO: Seletor de marcas (só aparece se tiver mais de uma marca) */}
        {availableBrands.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedBrand("")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedBrand === "" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:shadow-sm"
                }`}
              >
                Todas as Marcas
                <span className="ml-2 text-xs opacity-70">
                  ({items.length})
                </span>
              </button>
              
                  {availableBrands.map((brand) => {
                    // ✅ CORREÇÃO: Filtro seguro para contar
                    const brandCount = items.filter(item => 
                      item.brand && item.brand === brand
                    ).length;
                    
                    return (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                          selectedBrand === brand 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "bg-secondary/80 text-secondary-foreground hover:bg-secondary hover:shadow-sm"
                        }`}
                      >
                        {brand}
                        <span className="ml-2 text-xs opacity-70">
                          ({brandCount})
                        </span>
                      </button>
                    );
                  })}
           
            </div>
          </motion.div>
        )}

        {/* Contador de resultados atualizado */}
        {(search || selectedBrand) && (
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""} 
              {search && ` para "${search}"`}
              {selectedBrand && ` da marca ${selectedBrand}`}
            </span>
            
            {/* Botão para limpar filtros */}
            {(search || selectedBrand) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedBrand("");
                }}
                className="text-primary hover:text-primary/80 underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <Package className="mb-3 h-14 w-14 opacity-20" />
            <p className="text-sm font-medium">
              {search || selectedBrand 
                ? "Nenhum produto encontrado com os filtros aplicados" 
                : "Nenhum produto disponível"
              }
            </p>
            <p className="text-xs mt-1">
              {search || selectedBrand 
                ? "Tente remover alguns filtros" 
                : "A loja está sem estoque no momento."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, i) => {
              const qtyInBag = getItemQtyInBag(item.id);
              const name = getDisplayName(item);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 30 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  {/* ✅ NOVO: Badge da marca (opcional) */}
                  {item.brand && availableBrands.length > 1 && (
                    <div className="absolute left-2 top-2 z-10 px-2 py-1 bg-black/70 text-white text-[10px] font-medium rounded">
                      {item.brand}
                    </div>
                  )}
                  
                  {qtyInBag > 0 && (
                    <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-md">
                      {qtyInBag}
                    </div>
                  )}
                  
                  {/* Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-secondary/30">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex flex-1 flex-col p-3 border-t border-border/50">
                    <p className="text-xs font-bold text-foreground leading-snug line-clamp-2" title={name}>
                      {name}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </p>
                    
                    <div className="mt-auto pt-3">
                      {item.sale_price ? (
                        <p className="text-base font-extrabold text-primary">
                          {formatMoney(item.sale_price)}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground">Preço sob consulta</p>
                      )}
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 flex-1 bg-secondary/50 border-transparent hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all text-xs font-semibold"
                        onClick={() => addToBag(item)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Sacola
                      </Button>
                      
                      <Button
                        size="sm"
                        className="rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm transition-all h-9 w-9 p-0 shrink-0"
                        onClick={() => handleDirectBuy(item)}
                        title="Pedir pelo WhatsApp"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bag Button */}
      <AnimatePresence>
        {bagCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 w-full max-w-[90%] sm:max-w-md px-4"
          >
            <Button
              onClick={() => setBagOpen(true)}
              className="w-full flex items-center justify-between rounded-2xl bg-foreground px-5 py-7 text-background shadow-2xl hover:bg-foreground/90 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {bagCount}
                  </span>
                </div>
                <span className="font-semibold text-sm">Ver Sacola</span>
              </div>
              
              {bagTotal > 0 && (
                <span className="text-base font-black">
                  {formatMoney(bagTotal)}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bag Sheet - permanece igual */}
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl sm:max-w-md sm:mx-auto px-4">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-foreground text-lg">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Sua Sacola
            </SheetTitle>
            <SheetDescription>
              {bag.length === 0
                ? "Sua sacola está vazia"
                : `${bagCount} ${bagCount === 1 ? "item" : "itens"} selecionado${bagCount === 1 ? "" : "s"}`}
            </SheetDescription>
          </SheetHeader>
          
          {bag.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <ShoppingBag className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Adicione produtos da vitrine</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 mt-2">
              <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-2 scrollbar-thin">
                {bag.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-secondary/30">
                      {item.image_url ? (
                        <img src={item.image_url} alt={getDisplayName(item)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{getDisplayName(item)}</p>
                      {item.sale_price && (
                        <p className="mt-1 text-sm font-extrabold text-primary">
                          {formatMoney(item.sale_price * item.qty)}
                        </p>
                      )}
                    </div>
                    
                    {/* Controles de Qtd */}
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 border border-border/50">
                      <button className="flex h-6 w-6 items-center justify-center rounded bg-background shadow-sm text-muted-foreground hover:text-foreground" onClick={() => updateQty(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-foreground">{item.qty}</span>
                      <button className="flex h-6 w-6 items-center justify-center rounded bg-background shadow-sm text-muted-foreground hover:text-foreground" onClick={() => updateQty(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10" onClick={() => removeFromBag(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Payment Method */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Como deseja pagar?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all ${
                      paymentMethod === "pix"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="text-xs font-bold">PIX</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cartao")}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all ${
                      paymentMethod === "cartao"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs font-bold">Cartão ou Link</span>
                  </button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total do Pedido</span>
                <span className="text-2xl font-black text-foreground">{formatMoney(bagTotal)}</span> {/* ✅ Usar formatMoney */}
              </div>
              
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleSendOrder}
                  className="w-full h-14 gap-2 rounded-xl bg-[#25D366] text-base font-bold text-white shadow-lg hover:bg-[#128C7E] transition-all hover:scale-[1.02]"
                >
                  <Send className="h-5 w-5" />
                  Enviar pedido pelo WhatsApp
                </Button>
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={clearBag}>
                  Esvaziar sacola
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}