import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanBarcode, Camera, Hash, DollarSign, ChevronRight, ChevronLeft,
  Check, Loader2, X, Package, Search, Lock, ImageIcon, Clock, CreditCard
} from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import ProductSearchModal from "../components/ProductSearchModal";
import UpgradeModal from "../components/UpgradeModal";
import ProBadge from "../components/ProBadge";
import { ocrApi, GlobalProduct, formatMoney } from "../lib/api";
import { productService } from "../lib/productService";
import { useAuth } from "../hooks/useAuth";
import { usePlan } from "../../src/hooks/usePlan";
import { useFeatureGates } from "../../src/hooks/useFeatureGates";
import { useToast } from "../hooks/use-toast";
import { useStockEntry } from "../hooks/useStockEntry";

const STEPS = [
  { id: "scan", label: "Código", icon: ScanBarcode },
  { id: "expiry", label: "Validade", icon: Camera },
  { id: "details", label: "Detalhes", icon: DollarSign },
  { id: "confirm", label: "Confirmar", icon: Check },
];

const CATEGORIES = ["Perfumaria", "Corpo", "Rosto", "Cabelos", "Maquiagem", "Infantil", "Casa", "Outro"];

interface EntryData {
  bar_code: string;
  name: string;
  category: string;
  natura_sku: string;
  image_url: string;
  official_price: number;
  sale_price: number;
  cost_price: number;
  quantity: number;
  batch_code: string;
  expiry_date: string;
  expiry_photo_url: string;
}

interface SessionStatus {
  has_session: boolean;
  session_id?: number;
  products_count?: number;
  total_estimated_cost?: number;
  duration_minutes?: number;
}

// ✅ API de sessão
const sessionApi = {
  getStatus: async (): Promise<SessionStatus> => {
    const response = await fetch('/api/session-control/');
    return response.json();
  },
  
  finish: async () => {
    const response = await fetch('/api/session-control/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finish' })
    });
    return response.json();
  },
  
  confirmInvestment: async (sessionId: number, data: any) => {
    const response = await fetch('/api/session-summary/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, ...data })
    });
    return response.json();
  }
};

export default function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLocked } = useFeatureGates();
  const { toast } = useToast();
  const { loading, saveEntry } = useStockEntry();
  
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState({ feature: "", description: "" });
  
  const [ocrLoading, setOcrLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // ✅ Estados de sessão
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({ has_session: false });
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState<any>(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<EntryData>({
    bar_code: "", name: "", category: "Perfumaria", natura_sku: "",
    image_url: "", official_price: 0, sale_price: 0, cost_price: 0,
    quantity: 1, batch_code: "", expiry_date: "", expiry_photo_url: "",
  });

  useEffect(() => {
    checkSessionStatus();
  }, []);

  const checkSessionStatus = async () => {
    try {
      const status = await sessionApi.getStatus();
      console.log('Status da sessão:', status); // ✅ DEBUG
      setSessionStatus(status);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  const finishSession = async () => {
    try {
      console.log('Finalizando sessão...'); // ✅ DEBUG
      const result = await sessionApi.finish();
      console.log('Resultado da finalização:', result); // ✅ DEBUG
      
      setSessionStatus({ has_session: false });
      
      if (result.session_summary && result.session_summary.products_count > 0) {
        console.log('Mostrando modal de resumo'); // ✅ DEBUG
        setSessionSummaryData(result.session_summary);
        setShowSessionSummary(true);
      } else {
        toast({ title: "Sessão finalizada", description: "Nenhum produto foi cadastrado." });
      }
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      toast({ title: "Erro", description: "Falha ao finalizar sessão.", variant: "destructive" });
    }
  };

  const confirmInvestment = async (paymentData: any) => {
    try {
      await sessionApi.confirmInvestment(sessionSummaryData.session_id, paymentData);
      setShowInvestmentModal(false);
      setShowSessionSummary(false);
      toast({ title: "Sucesso!", description: "Investimento registrado com sucesso." });
    } catch (error) {
      console.error('Erro ao confirmar investimento:', error);
      toast({ title: "Erro", description: "Falha ao registrar investimento.", variant: "destructive" });
    }
  };

  // ... resto das funções (triggerProGate, handleScannerClick, etc.) ...
  const triggerProGate = (feature: string, description: string) => {
    setUpgradeFeature({ feature, description });
    setShowUpgrade(true);
  };

  const handleScannerClick = () => {
    if (isLocked("barcode_scanner")) {
      triggerProGate("Scanner de Código de Barras", "Mais rápido e preciso! O Scanner é exclusivo PRO.");
      return;
    }
    setShowScanner(true);
  };

  const handleLookup = async (barcode: string) => {
    if (!barcode.trim()) return;
    setLookupLoading(true);
    
    try {
      const result = await productService.lookupByEan(barcode);
      
      if (result.found) {
        const resData = result.data as any;
        const remote = resData.remote || resData;
        
        setData(prev => ({
          ...prev,
          bar_code: barcode,
          name: remote?.name || resData?.name || prev.name,
          sale_price: remote?.sale_price || resData?.sale_price || prev.sale_price,
          cost_price: prev.cost_price, 
          natura_sku: remote?.natura_sku || resData?.natura_sku || prev.natura_sku,
          image_url: remote?.image_url || resData?.image_url || prev.image_url,
          category: remote?.category || resData?.category || prev.category,
          official_price: remote?.official_price || resData?.official_price || 0
        }));
        toast({ title: "Produto Identificado!", description: "Dados carregados com sucesso." });
      } else {
        toast({ title: "Novo Código", description: "Preencha os dados no próximo passo." });
      }
    } catch {
      toast({ title: "Aviso", description: "Falha na busca remota. Preencha manualmente." });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setData(prev => ({ ...prev, bar_code: barcode }));
    await handleLookup(barcode);
    setStep(1); 
  };

  const selectSuggestion = (product: any) => {
    setData((prev) => ({
      ...prev,
      bar_code: product.bar_code || product.barcode || prev.bar_code,
      name: product.name,
      category: product.category || prev.category,
      natura_sku: product.natura_sku || product.sku || "",
      image_url: product.image_url || "",
      official_price: product.official_price || 0,
      sale_price: product.official_price || prev.sale_price,
    }));
    setIsSearchOpen(false);
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
    if (!data.bar_code?.trim()) {
      toast({ title: "Código obrigatório", description: "Digite ou escaneie o EAN.", variant: "destructive" });
      return;
    }
    
    try {
      await saveEntry({
        bar_code: data.bar_code.trim(),
        name: data.name || "Produto sem nome",
        category: data.category,
        natura_sku: data.natura_sku,
        expiration_date: data.expiry_date,
        expiry_photo_url: data.expiry_photo_url,
        quantity: data.quantity,
        cost_price: data.cost_price,
        sale_price: data.sale_price,
        batch_code: data.batch_code,
      });
      
      await checkSessionStatus();
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch {
      // O Toast de erro já vem do useStockEntry
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!data.bar_code?.trim() && !lookupLoading;
    if (step === 1) return true;
    if (step === 2) return data.quantity > 0 && data.name.trim() !== "";
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header da sessão */}
      {sessionStatus.has_session && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Package size={16} />
            <span className="text-sm font-medium">
              Cadastrando... {sessionStatus.products_count} produtos
            </span>
            <div className="flex items-center gap-1 text-blue-200">
              <Clock size={12} />
              <span className="text-xs">{sessionStatus.duration_minutes}min</span>
            </div>
          </div>
          
          <button 
            onClick={finishSession}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <Check size={14} />
            Finalizar
          </button>
        </motion.div>
      )}

      {/* ... resto do JSX permanece igual ... */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">Entrada Mágica</h1>
          <div className="w-9" />
        </div>
      </header>

      {/* ... todos os steps ... */}
      
      {/* ✅ MODAL SIMPLES INLINE - SEM COMPONENTE EXTERNO */}
      {showSessionSummary && sessionSummaryData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-black">📦 Resumo da Sessão</h3>
            <div className="space-y-2 mb-6 text-black">
              <p>Produtos cadastrados: {sessionSummaryData.products_count}</p>
              <p>Valor estimado: {formatMoney(sessionSummaryData.total_estimated_cost)}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSessionSummary(false)} 
                className="flex-1 border rounded-lg py-2 text-black"
              >
                Depois
              </button>
              <button 
                onClick={() => {
                  setShowInvestmentModal(true);
                  setShowSessionSummary(false);
                }} 
                className="flex-1 bg-blue-600 text-white rounded-lg py-2"
              >
                Registrar Investimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL DE INVESTIMENTO INLINE */}
      {showInvestmentModal && (
        <InvestmentModalInline 
          estimatedCost={sessionSummaryData?.total_estimated_cost || 0}
          onClose={() => setShowInvestmentModal(false)}
          onConfirm={confirmInvestment}
        />
      )}

      <ProductSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(p) => selectSuggestion(p)}
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
    <div className="flex items-center justify-between border-b border-border/50 pb-1 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// ✅ MODAL INLINE SIMPLES
function InvestmentModalInline({ estimatedCost, onClose, onConfirm }: any) {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [totalPaid, setTotalPaid] = useState(estimatedCost);
  const [installments, setInstallments] = useState(1);

  const handleConfirm = () => {
    onConfirm({ payment_method: paymentMethod, total_paid: totalPaid, installments });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4 text-black">💳 Registrar Investimento</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Como você pagou?</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-black"
            >
              <option value="credit_card">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Valor total pago</label>
            <input 
              type="number" 
              step="0.01"
              value={totalPaid} 
              onChange={(e) => setTotalPaid(parseFloat(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-black"
            />
          </div>
          
          {paymentMethod === 'credit_card' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Parcelas</label>
              <input 
                type="number" 
                min="1"
                value={installments} 
                onChange={(e) => setInstallments(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-black"
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-black">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white rounded-lg py-2">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}