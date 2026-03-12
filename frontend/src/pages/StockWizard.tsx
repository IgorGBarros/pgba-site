import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanBarcode, Camera, Hash, DollarSign, ChevronRight, ChevronLeft,
  Check, Loader2, X, Package, Search as SearchIcon
} from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import FuzzyMatchModal from "../components/FuzzyMatchModal";
import {
  inventoryApi, movementsApi, ocrApi, productLookupApi, batchApi,
  GlobalProduct, formatMoney,
  stockApi
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

const STEPS = [
  { id: "scan", label: "Escanear", icon: ScanBarcode },
  { id: "expiry", label: "Validade", icon: Camera },
  { id: "details", label: "Qtd & Preço", icon: DollarSign },
  { id: "confirm", label: "Confirmar", icon: Check },
];

interface EntryData {
  barcode: string;
  product_name: string;
  category: string;
  sku: string | null;
  image_url: string | null;
  official_price: number | null;
  expiry_date: string;
  expiry_photo_url: string;
  quantity: number;
  cost_price: number;
  existing_item_id: string | null;
  lookup_source: string | null;
}

export default function StockWizard() {
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [fuzzyModal, setFuzzyModal] = useState<{ barcode: string; suggestions: GlobalProduct[] } | null>(null);
  const [data, setData] = useState<EntryData>({
    barcode: "", product_name: "", category: "Outro", sku: null,
    image_url: null, official_price: null, expiry_date: "", expiry_photo_url: "",
    quantity: 1, cost_price: 0, existing_item_id: null, lookup_source: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Hybrid lookup ──
  const handleBarcodeScan = async (barcode: string) => {
    
    setShowScanner(false);
    setData((p) => ({ ...p, barcode }));
    setLookupLoading(true);

    try {
      // Check user's own inventory first
      const existing = await inventoryApi.getByBarcode(barcode);
      if (existing) {
        setData((p) => ({
          ...p,
          product_name: existing.product_name,
          category: existing.category,
          image_url: existing.image_url,
          sku: existing.sku,
          official_price: existing.official_price,
          cost_price: existing.cost_price,
          existing_item_id: existing.id,
          lookup_source: "inventory",
        }));
        toast({ title: "Produto encontrado!", description: `${existing.product_name} — ${existing.quantity} un. em estoque` });
        setLookupLoading(false);
        setStep(1);
        return;
      }
    } catch { /* not in user inventory */ }

    // Global lookup (local catalog → scraper → fuzzy)
    try {
      const result = await productLookupApi.lookup(data.barcode ?? "");

      if (result.source === "fuzzy" && result.suggestions?.length) {
        setLookupLoading(false);
        setFuzzyModal({ barcode, suggestions: result.suggestions });
        return;
      }

      if (result.product) {
        applyGlobalProduct(result.product, result.source);
        toast({ title: "Produto identificado!", description: `${result.product.name} (${result.source})` });
      }
    } catch {
      // No match anywhere
    }

    setLookupLoading(false);
    setStep(1);
  };

  const applyGlobalProduct = (product: GlobalProduct, source: string) => {
    setData((p) => ({
      ...p,
      product_name: product.name,
      category: product.category || p.category,
      sku: product.sku,
      image_url: product.image_url,
      official_price: product.official_price,
      lookup_source: source,
    }));
  };

  const handleFuzzyConfirm = async (product: GlobalProduct) => {
    setFuzzyModal(null);
    applyGlobalProduct(product, "fuzzy");

    // Self-healing: link barcode to product
    try {
      await productLookupApi.confirmMatch(data.barcode, product.id);
      toast({ title: "Vínculo salvo!", description: "Próximos scans serão instantâneos." });
    } catch { /* non-critical */ }

    setStep(1);
  };

  const handleFuzzySkip = () => {
    setFuzzyModal(null);
    setStep(1);
  };

  // ── OCR ──
  const handleExpiryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const result = await ocrApi.uploadAndExtract(file);
      if (result.photo_url) {
        setData((p) => ({ ...p, expiry_photo_url: result.photo_url! }));
      }
      if (result.expiry_date) {
        setData((p) => ({ ...p, expiry_date: result.expiry_date! }));
        toast({ title: "Validade detectada!", description: result.expiry_date });
      } else {
        toast({ title: "OCR não detectou data", description: "Insira manualmente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao processar foto", variant: "destructive" });
    } finally {
      setOcrLoading(false);
    }
  };

  // ── Save (creates batch) ──
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let itemId = data.existing_item_id;

      if (!itemId) {
        // Create new inventory item
        
     const inserted = await stockApi.create({
      bar_code: data.barcode,
       quantity: data.quantity,
       cost_price: data.cost_price,
      expiration_date: data.expiry_date || undefined,     // aceita vazio
      name: data.product_name || "Produto sem nome",       // sempre string
      category: data.category || "",                       // garante string
      natura_sku: data.sku ?? "", 
     });
        itemId = inserted.id;
      } else {
        // Update existing item quantity
        const existing = await inventoryApi.get(itemId);
        await inventoryApi.update(itemId, {
          quantity: existing.quantity + data.quantity,
        });
      }

      // Create batch for this entry
      await batchApi.create(itemId, {
        quantity: data.quantity,
        cost_price: data.cost_price,
        expiry_date: data.expiry_date || null,
        expiry_photo_url: data.expiry_photo_url || null,
      });

      // Record movement
      await movementsApi.create({
        product_id: itemId,
        batch_id: null,
        product_name: data.product_name || "Produto sem nome",
        barcode: data.barcode,
        movement_type: "entrada",
        quantity: data.quantity,
        unit_price: data.cost_price,
        sale_type: null,
        notes: data.lookup_source ? `Fonte: ${data.lookup_source}` : null,
      });

      toast({ title: "Entrada registrada!", description: `+${data.quantity} ${data.product_name}` });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!data.barcode && !lookupLoading;
    if (step === 1) return true;
    if (step === 2) return data.quantity > 0 && !!data.product_name;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          <h1 className="font-display text-base font-bold text-foreground">Entrada de Estoque</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Progress */}
      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[10px] ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 0: Scan & Lookup */}
          {step === 0 && (
            <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {showScanner ? (
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => navigate("/")} />
              ) : (
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ScanBarcode className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Código Lido</p>
                      <p className="font-mono text-lg font-bold text-primary">{data.barcode}</p>
                    </div>
                  </div>

                  {lookupLoading && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 py-4 text-sm text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Buscando produto...</span>
                    </div>
                  )}

                  {!lookupLoading && data.product_name && (
                    <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                      {data.image_url ? (
                        <img src={data.image_url} alt="" className="h-12 w-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><Package className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{data.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {data.sku && <span>SKU: {data.sku}</span>}
                          {data.official_price && <span>{formatMoney(data.official_price)}</span>}
                          {data.lookup_source && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">{data.lookup_source}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!lookupLoading && !data.product_name && (
                    <div>
                      <label className="text-sm text-muted-foreground">Nome do Produto *</label>
                      <input type="text" value={data.product_name} onChange={(e) => setData((p) => ({ ...p, product_name: e.target.value }))} placeholder="Digite o nome do produto" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                  )}

                  <button type="button" onClick={() => setShowScanner(true)} className="text-xs text-primary hover:underline">Escanear outro código</button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Expiry Photo + OCR */}
          {step === 1 && (
            <motion.div key="expiry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Camera className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Foto da Validade</p>
                    <p className="text-xs text-muted-foreground">Auditoria e rastreabilidade do lote</p>
                  </div>
                </div>

                {data.expiry_photo_url ? (
                  <div className="space-y-3">
                    <img src={data.expiry_photo_url} alt="Foto da validade" className="w-full rounded-lg border border-border object-cover" style={{ maxHeight: 200 }} />
                    {ocrLoading && (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analisando imagem...
                      </div>
                    )}
                    <button type="button" onClick={() => { setData((p) => ({ ...p, expiry_photo_url: "", expiry_date: "" })); fileInputRef.current?.click(); }} className="text-xs text-primary hover:underline">Tirar outra foto</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Camera className="h-8 w-8" />
                    <span className="text-sm font-medium">Tirar foto da validade</span>
                    <span className="text-xs">Usa câmera traseira com zoom</span>
                  </button>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleExpiryPhoto} className="hidden" />

                <div>
                  <label className="text-sm text-muted-foreground">Data de Validade</label>
                  <input type="month" value={data.expiry_date} onChange={(e) => setData((p) => ({ ...p, expiry_date: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <p className="mt-1 text-[10px] text-muted-foreground">{data.expiry_date ? "✅ Validade definida" : "Opcional — pode pular"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Quantity & Price */}
          {step === 2 && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-5 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Hash className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Quantidade & Preço do Lote</p>
                    <p className="text-xs text-muted-foreground">Cada entrada cria um lote separado</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Quantidade *</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => setData((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">−</button>
                    <input type="number" min={1} value={data.quantity} onChange={(e) => setData((p) => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))} className="h-10 w-20 rounded-lg border border-input bg-background text-center font-mono text-lg font-bold outline-none focus:border-primary" />
                    <button type="button" onClick={() => setData((p) => ({ ...p, quantity: p.quantity + 1 }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">+</button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Preço de Custo (R$) *</label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="number" step="0.01" min="0" value={data.cost_price || ""} onChange={(e) => setData((p) => ({ ...p, cost_price: parseFloat(e.target.value) || 0 }))} placeholder="0.00" className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
                  </div>
                  {data.official_price && (
                    <p className="mt-1 text-[10px] text-muted-foreground">Preço oficial: {formatMoney(data.official_price)}</p>
                  )}
                </div>

                {!data.product_name && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Nome do Produto *</label>
                    <input type="text" value={data.product_name} onChange={(e) => setData((p) => ({ ...p, product_name: e.target.value }))} placeholder="Nome do produto" className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <select value={data.category} onChange={(e) => setData((p) => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    {["Perfumaria", "Corpo", "Rosto", "Cabelos", "Maquiagem", "Infantil", "Casa", "Outro"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  {data.image_url ? (
                    <img src={data.image_url} alt="" className="h-12 w-12 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"><Package className="h-6 w-6 text-primary" /></div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">Confirmar Entrada</p>
                    <p className="text-xs text-muted-foreground">{data.product_name || "Novo produto"}</p>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
                  <Row label="Código" value={data.barcode} />
                  <Row label="Produto" value={data.product_name || "—"} />
                  <Row label="Categoria" value={data.category} />
                  {data.sku && <Row label="SKU" value={data.sku} />}
                  <Row label="Validade" value={data.expiry_date || "Não informada"} />
                  <Row label="Quantidade" value={`${data.quantity} un.`} />
                  <Row label="Custo Unitário" value={formatMoney(data.cost_price)} />
                  <Row label="Custo Total" value={formatMoney(data.cost_price * data.quantity)} />
                </div>
                {data.expiry_photo_url && (
                  <img src={data.expiry_photo_url} alt="Validade" className="h-20 rounded-lg border border-border object-cover" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {(!showScanner || step > 0) && (
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                Próximo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSave} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Registrar Entrada
              </button>
            )}
          </div>
        )}
      </main>

      {/* Fuzzy Match Modal */}
      <AnimatePresence>
        {fuzzyModal && (
          <FuzzyMatchModal
            barcode={fuzzyModal.barcode}
            suggestions={fuzzyModal.suggestions}
            onConfirm={handleFuzzyConfirm}
            onSkip={handleFuzzySkip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
