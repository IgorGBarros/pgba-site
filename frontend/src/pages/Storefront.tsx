import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Package, Search, ShoppingBag, Plus, Minus, Trash2, Send, Sparkles, CreditCard, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { storefrontApi, StorefrontItem } from "../lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { toast } from "../hooks/use-toast";
import { publicStorefrontApi } from "../lib/api";
type PaymentMethod = "pix" | "cartao";

interface BagItem extends StorefrontItem {
  qty: number;
}

const CART_STORAGE_KEY = "storefront_cart";
const CART_PAYMENT_KEY = "storefront_payment";

function loadCart(): BagItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(bag: BagItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(bag));
}

function loadPayment(): PaymentMethod {
  return (localStorage.getItem(CART_PAYMENT_KEY) as PaymentMethod) || "pix";
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
  
  const [bag, setBag] = useState<BagItem[]>(loadCart);
  const [bagOpen, setBagOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(loadPayment);

  // Persiste a sacola e a forma de pagamento localmente
  useEffect(() => { saveCart(bag); }, [bag]);
  useEffect(() => { localStorage.setItem(CART_PAYMENT_KEY, paymentMethod); }, [paymentMethod]);

  useEffect(() => {
    const fetchItems = slug
      ? publicStorefrontApi.listBySlug(slug)  // ✅ API pública
      : publicStorefrontApi.listById(sellerIdParam || "");
      
    fetchItems.then((res: any) => {
      // ✅ Mapear dados do novo formato
      const productsList = res.items || [];
      
      const mappedItems = productsList.map((item: any) => ({
        id: item.id,
        product_name: item.product__name || "Produto",
        display_name: item.product__name || "Produto", 
        category: item.product__category || "Geral",
        sale_price: item.sale_price || 0,
        total_quantity: item.total_quantity || 0,
        image_url: item.product__image_url || null,
      }));

      setItems(mappedItems);

      // 3. Define os dados do lojista (Nome e WhatsApp) vindos do backend [1]
      if (res.store) {
        setSellerName(res.store.name || "Consultor(a)");
        setSellerWhatsapp(res.store.whatsapp || "");
      }
      
      setLoading(false);
    }).catch((err) => {
      console.error("Erro ao carregar vitrine:", err);
      setLoading(false);
    });
  }, [slug, sellerIdParam]);

  const filtered = items.filter(
    (i) =>
      (i.display_name || i.product_name)?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase())
  );

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
  const getDisplayName = (item: StorefrontItem | BagItem) => item.display_name || item.product_name;

  // 🚀 LÓGICA DO WHATSAPP SEGURA E CODIFICADA CORRETAMENTE
  const buildWhatsappLink = (itemsList: BagItem[]) => {
    // Remove qualquer formatação, garantindo que o número fique limpo
    const rawPhone = sellerWhatsapp?.replace(/\D/g, "") || "";
    // Adiciona o DDI (55) caso a consultora não tenha digitado
    const phone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`;
    
    if (itemsList.length === 1 && itemsList[0].qty === 1) {
      const name = getDisplayName(itemsList[0]);
      const priceText = itemsList[0].sale_price ? ` — R$ ${itemsList[0].sale_price.toFixed(2).replace('.', ',')}` : "";
      
      const msg = `Olá ${sellerName}! 😊\n\nTenho interesse no produto:\n• ${name}${priceText}\n\n💳 Forma de pagamento: *${paymentLabel}*\n\nEstá disponível?`;
      // encodeURIComponent converte os \n e espaços em códigos que a URL entende perfeitamente
      return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
    }
    
    const lines = itemsList.map(
      (b) => `• ${b.qty}x ${getDisplayName(b)}${b.sale_price ? ` — R$ ${(b.sale_price * b.qty).toFixed(2).replace('.', ',')}` : ""}`
    );
    
    const msg = `Olá ${sellerName}! 😊\n\nGostaria de solicitar os seguintes produtos:\n\n${lines.join("\n")}\n\n💰 Total estimado: *R$ ${bagTotal.toFixed(2).replace('.', ',')}*\n💳 Forma de pagamento: *${paymentLabel}*\n\nPode verificar a disponibilidade e me retornar? Obrigada!`;
    
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
    localStorage.removeItem(CART_STORAGE_KEY);
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
        
        {search && filtered.length > 0 && (
          <p className="mb-4 text-xs font-medium text-muted-foreground">
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <Package className="mb-3 h-14 w-14 opacity-20" />
            <p className="text-sm font-medium">Nenhum produto disponível</p>
            <p className="text-xs mt-1">A loja está sem estoque no momento.</p>
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
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="flex flex-1 flex-col p-3 border-t border-border/50">
                    <p className="text-xs font-bold text-foreground leading-snug line-clamp-2">{name}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{item.category}</p>
                    
                    <div className="mt-auto pt-3">
                      {item.sale_price ? (
                        <p className="text-base font-extrabold text-primary">
                          R$ {item.sale_price.toFixed(2).replace('.', ',')}
                        </p>
                      ) : (
                        <p className="text-xs italic text-muted-foreground">Preço sob consulta</p>
                      )}
                    </div>

                    {/* 🚀 BOTÕES DE AÇÃO DO PRODUTO */}
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
                  R$ {bagTotal.toFixed(2).replace('.', ',')}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bag Sheet */}
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
                          R$ {(item.sale_price * item.qty).toFixed(2).replace('.', ',')}
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
                <span className="text-2xl font-black text-foreground">R$ {bagTotal.toFixed(2).replace('.', ',')}</span>
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