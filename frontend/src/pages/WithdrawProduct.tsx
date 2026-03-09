import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanBarcode, DollarSign, Check, Loader2, X, Package, Search,
  ChevronRight, ChevronLeft, ShoppingBag, Gift, User as UserIcon,
  Megaphone, AlertTriangle as AlertIcon, Layers, Lock
} from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import BatchSelectModal from "../components/BatchSelectModal";
import ProductSearchModal from "../components/ProductSearchModal";
import UpgradeModal from "../components/UpgradeModal";
import ProBadge from "../components/ProBadge";
import {
  inventoryApi, movementsApi, batchApi,
  InventoryBatch, TransactionType, formatMoney, GlobalProduct
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { useToast } from "../hooks/use-toast";

const SALE_TYPES: { value: TransactionType; label: string; emoji: string; icon: typeof ShoppingBag; desc: string; hasRevenue: boolean }[] = [
  { value: "venda", label: "Venda", emoji: "💰", icon: ShoppingBag, desc: "Gera receita e lucro", hasRevenue: true },
  { value: "presente", label: "Presente", emoji: "🎁", icon: Gift, desc: "Retirada pessoal", hasRevenue: false },
  { value: "brinde", label: "Brinde", emoji: "🤝", icon: Megaphone, desc: "Despesa de marketing", hasRevenue: false },
  { value: "perda", label: "Perda", emoji: "⚠️", icon: AlertIcon, desc: "Prejuízo operacional", hasRevenue: false },
  { value: "uso_proprio", label: "Uso Próprio", emoji: "👤", icon: UserIcon, desc: "Consumo pessoal", hasRevenue: false },
];

interface WithdrawData {
  barcode: string;
  product_id: string;
  product_name: string;
  category: string;
  current_quantity: number;
  cost_price: number;
  withdraw_qty: number;
  sale_price: number | null;
  sale_type: TransactionType;
  selected_batch: InventoryBatch | null;
  batches: InventoryBatch[];
}

export default function WithdrawProduct() {
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [data, setData] = useState<WithdrawData>({
    barcode: "", product_id: "", product_name: "", category: "",
    current_quantity: 0, cost_price: 0, withdraw_qty: 1, sale_price: null,
    sale_type: "venda", selected_batch: null, batches: [],
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = usePlan();
  const { isLocked } = useFeatureGates();
  const { toast } = useToast();

  const handleScannerClick = () => {
    if (isLocked("barcode_scanner")) {
      setShowUpgrade(true);
      return;
    }
    setShowScanner(true);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setNotFound(false);
    setData((p) => ({ ...p, barcode }));

    try {
      const item = await inventoryApi.getByBarcode(barcode);
      if (!item) { setNotFound(true); return; }

      // Load batches
      let batches: InventoryBatch[] = [];
      try {
        batches = await batchApi.listByItem(item.id);
        batches = batches.filter((b) => b.quantity > 0);
      } catch { /* no batch support, fallback */ }

      const batchCost = batches.length > 0
        ? batches.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0].cost_price
        : item.cost_price;

      setData((p) => ({
        ...p,
        product_id: item.id,
        product_name: item.product_name,
        category: item.category,
        current_quantity: item.quantity,
        cost_price: batchCost,
        batches,
        selected_batch: batches.length === 1 ? batches[0] : null,
      }));

      // If multiple batches, show selector
      if (batches.length > 1) {
        setShowBatchModal(true);
      } else {
        setStep(1);
      }

      toast({ title: "Produto encontrado!", description: `${item.product_name} — ${item.quantity} un.` });
    } catch {
      setNotFound(true);
    }
  };

  const handleBatchSelect = (batch: InventoryBatch) => {
    setShowBatchModal(false);
    setData((p) => ({
      ...p,
      selected_batch: batch,
      cost_price: batch.cost_price,
      withdraw_qty: Math.min(p.withdraw_qty, batch.quantity),
    }));
    setStep(1);
  };

  const maxQty = data.selected_batch?.quantity || data.current_quantity;

  const profit = data.sale_type === "venda" && data.sale_price
    ? (data.sale_price - data.cost_price) * data.withdraw_qty
    : null;

  const margin = data.sale_price && data.cost_price && data.cost_price > 0
    ? (((data.sale_price - data.cost_price) / data.cost_price) * 100).toFixed(1)
    : null;

  const currentSaleType = SALE_TYPES.find((t) => t.value === data.sale_type)!;

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const newQty = data.current_quantity - data.withdraw_qty;
      await inventoryApi.update(data.product_id, {
        quantity: newQty,
        sale_price: data.sale_type === "venda" ? data.sale_price : undefined,
        sale_type: data.sale_type,
      });

      const unitPrice = currentSaleType.hasRevenue ? (data.sale_price || 0) : 0;

      await movementsApi.create({
        product_id: data.product_id,
        batch_id: data.selected_batch?.id || null,
        product_name: data.product_name,
        barcode: data.barcode,
        movement_type: "saida",
        quantity: data.withdraw_qty,
        sale_type: data.sale_type,
        unit_price: unitPrice,
        notes: data.selected_batch?.expiry_date
          ? `Lote: val. ${data.selected_batch.expiry_date}`
          : null,
      });

      toast({
        title: "Baixa registrada!",
        description: `${data.withdraw_qty}x ${data.product_name} (${currentSaleType.label})`,
      });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          <h1 className="font-display text-base font-bold text-foreground">Baixa / PDV</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex items-center gap-1">
          {["Escanear", "Tipo & Preço", "Confirmar"].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[10px] ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {showScanner && !isLocked("barcode_scanner") ? (
                <div className="space-y-4">
                  <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
                  <button 
                    onClick={() => setShowScanner(false)} 
                    className="w-full text-center text-sm text-muted-foreground underline mt-4"
                  >
                    Não tem código? Buscar por nome/SKU
                  </button>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  {/* Busca Manual */}
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary text-left group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Search size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">Buscar Manualmente</p>
                        <p className="text-xs text-muted-foreground">Digite o nome ou código do produto</p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border"></div>
                    <span className="text-xs text-muted-foreground">OU</span>
                    <div className="h-px flex-1 bg-border"></div>
                  </div>

                  {/* Voltar ao scanner */}
                  <button 
                    onClick={handleScannerClick}
                    className={`w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary text-left group transition-all ${isLocked("barcode_scanner") ? "opacity-80" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${!isLocked("barcode_scanner") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {!isLocked("barcode_scanner") ? <ScanBarcode size={20} /> : <Lock size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground flex items-center gap-2">
                          Escanear Código
                          {isLocked("barcode_scanner") && <ProBadge />}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {!isLocked("barcode_scanner") ? "Use a câmera para ler o código de barras" : "Exclusivo para assinantes PRO"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </button>

                  {data.barcode && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><ScanBarcode className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Código Lido</p>
                        <p className="font-mono text-lg font-bold text-primary">{data.barcode}</p>
                      </div>
                    </div>
                  )}
                  {notFound && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Produto não encontrado no seu estoque.</div>
                  )}
                </div>
              )}

              {/* Modal de Busca */}
              <ProductSearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                onSelect={(product: GlobalProduct) => {
                  setIsSearchOpen(false);
                  if (product.barcode) {
                    handleBarcodeScan(product.barcode);
                  }
                }}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-5 rounded-xl border border-border bg-card p-5">
                {/* Product info */}
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Produto</p>
                  <p className="text-sm font-semibold text-foreground">{data.product_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Estoque: <span className="font-mono font-semibold text-foreground">{data.current_quantity} un.</span></span>
                    {data.selected_batch && (
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        Lote: val. {data.selected_batch.expiry_date || "N/A"} ({data.selected_batch.quantity} un.)
                      </span>
                    )}
                  </div>
                  {data.batches.length > 1 && (
                    <button type="button" onClick={() => setShowBatchModal(true)} className="mt-1 text-xs text-primary hover:underline">Trocar lote</button>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-foreground">Quantidade de Saída *</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => setData((p) => ({ ...p, withdraw_qty: Math.max(1, p.withdraw_qty - 1) }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">−</button>
                    <input type="number" min={1} max={maxQty} value={data.withdraw_qty} onChange={(e) => setData((p) => ({ ...p, withdraw_qty: Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)) }))} className="h-10 w-20 rounded-lg border border-input bg-background text-center font-mono text-lg font-bold outline-none focus:border-primary" />
                    <button type="button" onClick={() => setData((p) => ({ ...p, withdraw_qty: Math.min(maxQty, p.withdraw_qty + 1) }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">+</button>
                  </div>
                </div>

                {/* Transaction type */}
                <div>
                  <label className="text-sm font-medium text-foreground">Classificação da Transação</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {SALE_TYPES.slice(0, 3).map((t) => (
                      <button key={t.value} type="button" onClick={() => setData((p) => ({ ...p, sale_type: t.value }))} className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-colors ${data.sale_type === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <span className="text-lg">{t.emoji}</span>
                        <span className={`text-xs font-medium ${data.sale_type === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {SALE_TYPES.slice(3).map((t) => (
                      <button key={t.value} type="button" onClick={() => setData((p) => ({ ...p, sale_type: t.value }))} className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-colors ${data.sale_type === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <span className="text-lg">{t.emoji}</span>
                        <div>
                          <span className={`text-xs font-medium ${data.sale_type === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sale price (only for venda) */}
                {data.sale_type === "venda" && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Preço de Venda (R$)</label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input type="number" step="0.01" min="0" value={data.sale_price ?? ""} onChange={(e) => setData((p) => ({ ...p, sale_price: parseFloat(e.target.value) || null }))} placeholder="0.00" className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
                    </div>
                    {margin && (
                      <p className={`mt-1 text-xs font-medium ${Number(margin) >= 0 ? "text-primary" : "text-destructive"}`}>
                        Margem: {margin}% · Lucro: {formatMoney(profit)}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Custo do lote: {formatMoney(data.cost_price)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
                  <p className="text-sm font-semibold text-foreground">Confirmar Baixa</p>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
                  <Row label="Produto" value={data.product_name} />
                  <Row label="Código" value={data.barcode} />
                  <Row label="Quantidade Saída" value={`${data.withdraw_qty} un.`} />
                  <Row label="Estoque Restante" value={`${data.current_quantity - data.withdraw_qty} un.`} />
                  <Row label="Tipo" value={`${currentSaleType.emoji} ${currentSaleType.label}`} />
                  {data.selected_batch?.expiry_date && (
                    <Row label="Lote (Validade)" value={data.selected_batch.expiry_date} />
                  )}
                  <Row label="Custo Unitário" value={formatMoney(data.cost_price)} />
                  {data.sale_type === "venda" && data.sale_price && (
                    <>
                      <Row label="Preço Venda" value={formatMoney(data.sale_price)} />
                      <Row label="Lucro Bruto" value={formatMoney(profit)} />
                      <Row label="Margem" value={`${margin}%`} />
                    </>
                  )}
                  {!currentSaleType.hasRevenue && (
                    <Row label="Receita" value="R$ 0,00" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(step > 0 || (!showScanner && data.barcode && !notFound)) && (
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 0 && !data.product_id} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                Próximo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmar Baixa
              </button>
            )}
          </div>
        )}
      </main>

      {/* Batch Selection Modal */}
      <AnimatePresence>
        {showBatchModal && data.batches.length > 0 && (
          <BatchSelectModal
            productName={data.product_name}
            batches={data.batches}
            onSelect={handleBatchSelect}
            onClose={() => { setShowBatchModal(false); setStep(1); }}
          />
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Scanner de Código de Barras"
        description="Cansada de digitar? O Scanner é exclusivo PRO."
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
