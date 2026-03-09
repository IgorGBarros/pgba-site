import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Package, Search, ShoppingBag, Plus, Minus, Trash2, Send, Sparkles, CreditCard, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { storefrontApi, StorefrontItem } from "../lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

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

  // Persist cart to localStorage on every change
  useEffect(() => { saveCart(bag); }, [bag]);
  useEffect(() => { localStorage.setItem(CART_PAYMENT_KEY, paymentMethod); }, [paymentMethod]);

  useEffect(() => {
    const fetchItems = slug
      ? storefrontApi.listBySlug(slug)
      : storefrontApi.list(sellerIdParam || undefined);

    fetchItems.then((results) => {
      setItems(results);
      if (results.length > 0) {
        setSellerName(results[0].seller_name || "Consultor(a)");
        setSellerWhatsapp(results[0].seller_whatsapp || "");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
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

  const buildWhatsappLink = (itemsList: BagItem[]) => {
    const phone = sellerWhatsapp?.replace(/\D/g, "");
    if (itemsList.length === 1 && itemsList[0].qty === 1) {
      const name = getDisplayName(itemsList[0]);
      const msg = encodeURIComponent(
        `Olá ${sellerName}! 😊\n\nTenho interesse no produto:\n• ${name}${itemsList[0].sale_price ? ` — R$ ${itemsList[0].sale_price.toFixed(2)}` : ""}\n\n💳 Forma de pagamento: *${paymentLabel}*\n\nEstá disponível?`
      );
      return `https://api.whatsapp.com/send/?phone=${phone}&text=${msg}`;
    }

    const lines = itemsList.map(
      (b) =>
        `• ${b.qty}x ${getDisplayName(b)}${b.sale_price ? ` — R$ ${(b.sale_price * b.qty).toFixed(2)}` : ""}`
    );
    const msg = encodeURIComponent(
      `Olá ${sellerName}! 😊\n\nGostaria de solicitar os seguintes produtos:\n\n${lines.join("\n")}\n\n💰 Total estimado: R$ ${bagTotal.toFixed(2)}\n💳 Forma de pagamento: *${paymentLabel}*\n\nPode verificar a disponibilidade e me retornar? Obrigada!`
    );
    return `https://api.whatsapp.com/send/?phone=${phone}&text=${msg}`;
  };

  const handleDirectBuy = (item: StorefrontItem) => {
    if (!sellerWhatsapp) return;
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
            {sellerName ? `Vitrine de ${sellerName}` : "Vitrine Natura"}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-1 text-sm text-primary-foreground/70"
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
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-xl shadow-black/8 ring-1 ring-black/[0.03] focus-within:ring-2 focus-within:ring-primary/40 transition-all">
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
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
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

                  {/* Product Info — uses display_name (override or original) */}
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">{name}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.category}</p>

                    {item.sale_price && (
                      <p className="mt-auto pt-2 text-lg font-extrabold text-primary">
                        R$ {item.sale_price.toFixed(2)}
                      </p>
                    )}

                    <div className="mt-2 flex gap-1.5">
                      {sellerWhatsapp && (
                        <Button
                          size="sm"
                          className="flex-1 rounded-xl bg-[hsl(142,70%,45%)] text-[11px] text-white shadow-sm hover:bg-[hsl(142,70%,38%)] hover:shadow-md transition-all h-8"
                          onClick={() => handleDirectBuy(item)}
                        >
                          <Send className="h-3 w-3" />
                          Pedir
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-8 w-8 p-0"
                        onClick={() => addToBag(item)}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
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
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
          >
            <Button
              onClick={() => setBagOpen(true)}
              className="flex items-center gap-3 rounded-2xl bg-primary px-6 py-6 text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 hover:shadow-2xl transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="font-semibold">
                Sacola ({bagCount} {bagCount === 1 ? "item" : "itens"})
              </span>
              {bagTotal > 0 && (
                <span className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-sm font-bold">
                  R$ {bagTotal.toFixed(2)}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bag Sheet */}
      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-foreground">
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
              <ShoppingBag className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">Adicione produtos da vitrine</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="max-h-[30vh] space-y-2.5 overflow-y-auto pr-1">
                {bag.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5"
                  >
                    {/* Thumbnail */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/50">
                      {item.image_url ? (
                        <img src={item.image_url} alt={getDisplayName(item)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{getDisplayName(item)}</p>
                      {item.sale_price && (
                        <p className="mt-0.5 text-xs font-semibold text-primary">
                          R$ {(item.sale_price * item.qty).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.id, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold text-foreground">{item.qty}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7 rounded-lg" onClick={() => updateQty(item.id, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeFromBag(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forma de pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all ${
                      paymentMethod === "pix"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    PIX
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cartao")}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all ${
                      paymentMethod === "cartao"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Cartão / Link
                  </button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-muted-foreground">Total estimado</span>
                <span className="text-xl font-bold text-foreground">R$ {bagTotal.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleSendOrder}
                disabled={!sellerWhatsapp}
                className="w-full gap-2 rounded-2xl bg-[hsl(142,70%,45%)] py-6 text-base font-semibold text-white shadow-lg hover:bg-[hsl(142,70%,38%)]"
              >
                <Send className="h-4 w-4" />
                Enviar pedido para {sellerName}
              </Button>

              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={clearBag}>
                <Trash2 className="h-3.5 w-3.5" />
                Limpar sacola
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/50 bg-card/50 py-5 text-center text-xs text-muted-foreground/60">
        Vitrine digital • Estoque Natura
      </footer>
    </div>
  );
}
