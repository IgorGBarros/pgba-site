import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanBarcode, Camera, Hash, DollarSign, ChevronRight, ChevronLeft,
  Check, Loader2, X, Package, Search, Lock
} from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import FuzzyMatchModal from "../components/FuzzyMatchModal";
import ProductSearchModal from "../components/ProductSearchModal";
import UpgradeModal from "../components/UpgradeModal";
import ProBadge from "../components/ProBadge";
import {
  inventoryApi, ocrApi, productLookupApi, batchApi,
  GlobalProduct, formatMoney
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../hooks/usePlan";
import { useFeatureGates } from "../hooks/useFeatureGates";
import { useToast } from "../hooks/use-toast";
import { useStockEntry } from "../hooks/useStockEntry";

const STEPS = [
  { id: "scan", label: "Código de Barras", icon: ScanBarcode },
  { id: "expiry", label: "Validade", icon: Camera },
  { id: "details", label: "Quantidade & Preço", icon: DollarSign },
  { id: "confirm", label: "Confirmar", icon: Check },
];

interface ProductData {
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
  lookup_source: string | null;
}

export default function AddProduct() {
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState({ feature: "", description: "" });
  
  const { loading, saveEntry } = useStockEntry();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [fuzzyModal, setFuzzyModal] = useState<{ barcode: string; suggestions: GlobalProduct[] } | null>(null);
  
  const [data, setData] = useState<ProductData>({
    barcode: "", product_name: "", category: "Outro", sku: null,
    image_url: null, official_price: null, expiry_date: "", expiry_photo_url: "",
    quantity: 1, cost_price: 0, lookup_source: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = usePlan();
  const { isLocked } = useFeatureGates();
  const { toast } = useToast();

  const triggerProGate = (feature: string, description: string) => {
    setUpgradeFeature({ feature, description });
    setShowUpgrade(true);
  };

  const handleScannerClick = () => {
    if (isLocked("barcode_scanner")) {
      triggerProGate("Scanner de Código de Barras", "Cansada de digitar? O Scanner é exclusivo PRO.");
      return;
    }
    setShowScanner(true);
  };

  const handleBarcodeInput = async (barcode: string) => {
    if (!barcode.trim()) return;
    
    setData((prev) => ({ ...prev, barcode: barcode.trim() }));
    setLookupLoading(true);
    
    try {
      const existing = await inventoryApi.getByBarcode(barcode);
      if (existing) {
        setData((prev) => ({
          ...prev,
          // 🚀 CORREÇÃO: Lendo os dados aninhados do Django (existing.product?.name)
          product_name: existing.product?.name || existing.product_name || "",
          category: existing.product?.category || existing.category || "Outro",
          image_url: existing.product?.image_url || existing.image_url || null,
          sku: existing.product?.natura_sku || existing.sku || null,
          official_price: existing.product?.official_price || existing.official_price || null,
          lookup_source: "inventory",
        }));
        const qty = existing.total_quantity ?? existing.quantity ?? 0;
        const name = existing.product?.name || existing.product_name;
        toast({ title: "Produto já cadastrado!", description: `${name} (${qty} un.)` });
        setLookupLoading(false);
        setStep(1);
        return;
      }
    } catch { /* not found */ }

    try {
      const result = await productLookupApi.lookup(barcode);
      if (result.source === "fuzzy" && result.suggestions?.length) {
        setLookupLoading(false);
        setFuzzyModal({ barcode, suggestions: result.suggestions });
        return;
      }
      if (result.product) {
        setData((prev) => ({
          ...prev,
          product_name: result.product!.name,
          category: result.product!.category || prev.category,
          sku: result.product!.sku,
          image_url: result.product!.image_url,
          official_price: result.product!.official_price,
          lookup_source: result.source,
        }));
        toast({ title: "Produto identificado!", description: result.product!.name });
      }
    } catch { /* no match */ }
    setLookupLoading(false);
    setStep(1);
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    await handleBarcodeInput(barcode);
  };

  const handleFuzzyConfirm = async (product: GlobalProduct) => {
    setFuzzyModal(null);
    setData((prev) => ({
      ...prev,
      product_name: product.name,
      category: product.category || prev.category,
      sku: product.sku,
      image_url: product.image_url,
      official_price: product.official_price,
      lookup_source: "fuzzy",
    }));
    try {
      await productLookupApi.confirmMatch(data.barcode, product.id);
    } catch { /* non-critical */ }
    setStep(1);
  };

  const selectSuggestion = (product: GlobalProduct) => {
    setData((prev) => ({
      ...prev,
      barcode: product.barcode || prev.barcode,
      product_name: product.name,
      category: product.category || prev.category,
      sku: product.sku,
      image_url: product.image_url,
      official_price: product.official_price,
      lookup_source: "search",
    }));
    setShowScanner(false);
    setStep(1);
  };

  const handleExpiryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const result = await ocrApi.uploadAndExtract(file);
      if (result.photo_url) setData((prev) => ({ ...prev, expiry_photo_url: result.photo_url! }));
      if (result.expiry_date) {
        setData((prev) => ({ ...prev, expiry_date: result.expiry_date! }));
        toast({ title: "Validade detectada!", description: result.expiry_date });
      } else {
        toast({ title: "OCR falhou", description: "Insira a validade manualmente.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao processar foto", variant: "destructive" });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data.barcode?.trim()) {
      toast({ 
        title: "Código obrigatório", 
        description: "Digite ou escaneie um código de barras válido.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      await saveEntry({
        bar_code: data.barcode.trim(),
        name: data.product_name || "Produto sem nome",
        category: data.category,
        natura_sku: data.sku,
        expiration_date: data.expiry_date,
        expiry_photo_url: data.expiry_photo_url,
        quantity: data.quantity,
        cost_price: data.cost_price,
        lookup_source: data.lookup_source,
      });
      navigate("/");
    } catch {
      // erro tratado pelo hook (toast)
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!data.barcode && !lookupLoading;
    if (step === 1) return true;
    if (step === 2) return data.quantity > 0;
    return true;
  };

  function handleFuzzySkip(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">Cadastrar Produto</h1>
          <div className="w-9" />
        </div>
      </header>

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
          {step === 0 && (
            <motion.div key="scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
             {showScanner && !isLocked("barcode_scanner") ? (
                <div className="space-y-4">
                  <BarcodeScanner 
                    onScan={handleBarcodeScan} 
                    onClose={() => {
                      setShowScanner(false);
                      setIsSearchOpen(true); // 🚀 Ao fechar, abre a modal de busca diretamente
                    }} 
                  />
                  <button
                    onClick={() => {
                      setShowScanner(false);
                      setIsSearchOpen(true); // 🚀 Ao clicar, abre a modal de busca
                    }}
                    className="w-full text-center text-sm text-muted-foreground underline mt-2"
                  >
                    Não tem código? Buscar por nome/SKU
                  </button>
                </div>
              ) : data.barcode ? (
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><ScanBarcode className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Código Lido</p>
                      <p className="font-mono text-lg font-bold text-primary">{data.barcode}</p>
                    </div>
                  </div>
                  {lookupLoading && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 py-4 text-sm text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" /> Buscando produto...
                    </div>
                  )}
                  {!lookupLoading && data.product_name && (
                    <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                      {data.image_url ? (
                        <img src={data.image_url} alt="" className="h-12 w-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted"><Package className="h-5 w-5 text-muted-foreground" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{data.product_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {data.sku && <span>SKU: {data.sku}</span>}
                          {data.official_price && <span>{formatMoney(data.official_price)}</span>}
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
                  <button type="button" onClick={() => { setData((p) => ({ ...p, barcode: "" })); setShowScanner(true); }} className="text-xs text-primary hover:underline">
                    Escanear outro código
                  </button>
                </div>
              ) : (
                <div className="space-y-6 rounded-xl border border-border bg-card p-5">
                  {/* Busca Manual (Abre Modal de Busca) */}
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
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">OU</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Digitar Código</label>
                    <input
                      type="text"
                      value={data.barcode}
                      onChange={(e) => setData((p) => ({ ...p, barcode: e.target.value }))}
                      onBlur={(e) => e.target.value.trim() && handleBarcodeInput(e.target.value)}
                      placeholder="Ex: 7891234567890"
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">O sistema buscará as informações ao sair do campo.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Validade */}
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

          {/* Step 2: Quantidade & Preço */}
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
                    <p className="mt-1 text-[10px] text-muted-foreground">Preço oficial Natura: {formatMoney(data.official_price)}</p>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
                  <p className="text-sm font-semibold text-foreground">Confirmar Cadastro</p>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
                  <Row label="Código" value={data.barcode} />
                  <Row label="Produto" value={data.product_name || "—"} />
                  <Row label="Categoria" value={data.category} />
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
                Cadastrar
              </button>
            )}
          </div>
        )}
      </main>

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

      <ProductSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(p) => selectSuggestion(p as GlobalProduct)}
      />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={upgradeFeature.feature}
        description={upgradeFeature.description}
      />
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