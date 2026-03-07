import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanBarcode, DollarSign, Check, Loader2, X, Package,
  ChevronRight, ChevronLeft, ShoppingBag, Gift, User as UserIcon
} from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import { api } from "../services/api"; // ✅ Importa a API configurada
import { useToast } from "../hooks/use-toast";

type SaleType = "venda" | "uso_proprio" | "presente";

interface WithdrawData {
  barcode: string;
  product_id: number; // Alterado para number (ID do Django)
  product_name: string;
  category: string;
  current_quantity: number;
  cost_price: number;
  withdraw_qty: number;
  sale_price: number | null;
  sale_type: SaleType;
}

const SALE_TYPES: { value: SaleType; label: string; icon: any; desc: string }[] = [
  { value: "venda", label: "Venda", icon: ShoppingBag, desc: "Venda para cliente" },
  { value: "uso_proprio", label: "Uso Próprio", icon: UserIcon, desc: "Consumo pessoal" },
  { value: "presente", label: "Presente", icon: Gift, desc: "Doação ou brinde" },
];

export default function WithdrawProduct() {
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const [data, setData] = useState<WithdrawData>({
    barcode: "",
    product_id: 0,
    product_name: "",
    category: "",
    current_quantity: 0,
    cost_price: 0,
    withdraw_qty: 1,
    sale_price: null,
    sale_type: "venda",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Lógica de Scan (Buscar no Inventário)
  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setNotFound(false);
    setData((p) => ({ ...p, barcode }));

    try {
      // Busca todo o inventário (idealmente o backend teria um filtro ?barcode=X)
      // Como fallback, buscamos a lista e filtramos no front
      const { data: inventory } = await api.get("/inventory/");
      
      const item = inventory.find((i: any) => i.product.bar_code === barcode);

      if (item) {
        setData((p) => ({
          ...p,
          product_id: item.id, // ID do InventoryItem
          product_name: item.product.name,
          category: item.product.category || "Geral",
          current_quantity: item.total_quantity,
          cost_price: Number(item.cost_price),
          // Sugere o preço de venda cadastrado ou o oficial
          sale_price: Number(item.sale_price > 0 ? item.sale_price : item.product.official_price),
        }));
        setStep(1);
        toast({ title: "Produto encontrado!", description: `${item.product.name} — ${item.total_quantity} un.` });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Erro ao buscar produto", error);
      toast({ title: "Erro", description: "Falha ao consultar estoque.", variant: "destructive" });
    }
  };

  // Cálculo de Margem
  const margin = data.sale_price && data.cost_price
    ? (((data.sale_price - data.cost_price) / data.cost_price) * 100).toFixed(1)
    : null;

  // 2. Lógica de Salvar (Checkout no Backend)
  const handleSave = async () => {
    setLoading(true);
    try {
      // Mapeia os tipos do front para o enum do backend Django
      const transactionMap: Record<SaleType, string> = {
        "venda": "VENDA",
        "uso_proprio": "USO_PROPRIO",
        "presente": "PRESENTE"
      };

      const payload = {
        transaction_type: transactionMap[data.sale_type],
        payment_method: "DINHEIRO", // Pode adicionar um select no futuro
        items: [
          {
            bar_code: data.barcode,
            quantity: data.withdraw_qty,
            // Se não for venda, o preço vendido é 0 (ou custo, dependendo da regra)
            // Aqui mandamos o preço definido se for venda, senão 0
            price_sold: data.sale_type === "venda" ? data.sale_price : 0
          }
        ]
      };

      await api.post("/sales/checkout/", payload);

      toast({
        title: "Baixa registrada!",
        description: `${data.withdraw_qty}x ${data.product_name} processado com sucesso.`,
      });
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erro ao processar baixa.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">Baixa de Produto</h1>
          <div className="w-9" />
        </div>
      </header>
      
      {/* Progress Steps */}
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
          
          {/* Step 0: Scan */}
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
                  {notFound && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      Produto não encontrado no seu estoque. Verifique se ele foi cadastrado.
                    </div>
                  )}
                  <button type="button" onClick={() => { setShowScanner(true); setNotFound(false); }} className="text-xs text-primary hover:underline">
                    Escanear outro código
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Type & Price */}
          {step === 1 && (
            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-5 rounded-xl border border-border bg-card p-5">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Produto Identificado</p>
                  <p className="text-sm font-semibold text-foreground">{data.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Estoque atual: <span className="font-mono font-semibold text-foreground">{data.current_quantity} un.</span></p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-medium text-foreground">Quantidade de Saída *</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => setData((p) => ({ ...p, withdraw_qty: Math.max(1, p.withdraw_qty - 1) }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">−</button>
                    <input
                      type="number"
                      min={1}
                      max={data.current_quantity}
                      value={data.withdraw_qty}
                      onChange={(e) => setData((p) => ({ ...p, withdraw_qty: Math.min(p.current_quantity, Math.max(1, parseInt(e.target.value) || 1)) }))}
                      className="h-10 w-20 rounded-lg border border-input bg-background text-center font-mono text-lg font-bold outline-none focus:border-primary"
                    />
                    <button type="button" onClick={() => setData((p) => ({ ...p, withdraw_qty: Math.min(p.current_quantity, p.withdraw_qty + 1) }))} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-lg font-bold">+</button>
                  </div>
                </div>

                {/* Sale Type */}
                <div>
                  <label className="text-sm font-medium text-foreground">Motivo da Saída</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {SALE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setData((p) => ({ ...p, sale_type: t.value }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-colors ${data.sale_type === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                      >
                        <t.icon className={`h-5 w-5 ${data.sale_type === t.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${data.sale_type === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sale Price (only for venda) */}
                {data.sale_type === "venda" && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Valor Cobrado (R$)</label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.sale_price ?? ""}
                        onChange={(e) => setData((p) => ({ ...p, sale_price: parseFloat(e.target.value) || null }))}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    {margin && (
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-muted-foreground">Custo Unit: R$ {data.cost_price.toFixed(2)}</p>
                        <p className={`text-xs font-medium ${Number(margin) >= 0 ? "text-primary" : "text-destructive"}`}>
                          Lucro: {margin}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Resumo da Operação</p>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4">
                  <Row label="Produto" value={data.product_name} />
                  <Row label="Saída" value={`${data.withdraw_qty} unidade(s)`} />
                  <Row label="Estoque Final" value={`${data.current_quantity - data.withdraw_qty} un.`} />
                  <div className="my-2 border-t border-border/50" />
                  <Row label="Tipo" value={SALE_TYPES.find((t) => t.value === data.sale_type)?.label || ""} />
                  {data.sale_type === "venda" && data.sale_price && (
                    <>
                      <Row label="Valor Total" value={`R$ ${(data.sale_price * data.withdraw_qty).toFixed(2)}`} />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {(step > 0 || (!showScanner && data.barcode && !notFound)) && (
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
            )}
            
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !data.product_id}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition-transform active:scale-95"
              >
                Próximo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirmar
              </button>
            )}
          </div>
        )}
      </main>
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