import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanBarcode, Camera, RefreshCw, X, Loader2, ImagePlus } from "lucide-react";
import BarcodeScanner from "../components/BarcodeScanner";
import { productService } from "../lib/productService";
import { useToast } from "../hooks/use-toast";
import { processImageForData } from "../lib/ocrService";

interface WizardData {
  bar_code?: string;
  name?: string;
  price?: string | number;
  cost_price?: string | number;
  quantity?: number;
  expiration_date?: string;
  batch_code?: string;
  product_id?: number;
}

export default function StockWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({ quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // PASSO 1: EAN
  const handleScanEAN = async (code: string) => {
    setData((prev) => ({ ...prev, bar_code: code }));
    toast({ title: "Buscando...", description: "Identificando produto." });
    
    try {
      const res = await productService.lookupByEan(code);
      if (res.found) {
        const foundData = res.source === 'local' ? res.data : (res.data as any).remote || res.data;
        setData((prev) => ({ 
            ...prev, 
            name: foundData.name,
            price: foundData.sale_price || foundData.price,
            product_id: foundData.id
        }));
        toast({ title: "Encontrado!", description: foundData.name });
      }
    } catch {}
    setStep(2); 
  };

  // CAPTURA DA FOTO DE VALIDADE (NATIVA)
  const handleNativeCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Mostra a foto na tela
    const objectUrl = URL.createObjectURL(file);
    setPhoto(objectUrl);
    
    // 2. OCR em Background
    setOcrLoading(true);
    toast({ title: "Lendo...", description: "Analisando validade e lote." });

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await processImageForData(base64data);
        setOcrLoading(false);

        if (result.date || result.batch) {
             setData(prev => ({
                ...prev,
                expiration_date: result.date || prev.expiration_date,
                batch_code: result.batch || prev.batch_code
             }));
             toast({ title: "Sucesso!", description: `Validade: ${result.date}` });
        } else {
             toast({ title: "Aviso", description: "Não consegui ler. Digite abaixo.", variant: "default" });
        }
    };
    reader.readAsDataURL(file);
  };

  // PASSO 3: FINALIZAR
  const handleSubmit = async () => {
    setLoading(true);
    try {
       await productService.addStock({
           bar_code: data.bar_code,
           quantity: data.quantity || 1,
           expiration_date: data.expiration_date,
           batch_code: data.batch_code,
           name: data.name || "Novo Produto", 
           price: parseFloat(String(data.price)) || 0,
           cost_price: 0,
       });
       toast({ title: "Sucesso!", description: "Entrada registrada." });
       navigate("/products");
    } catch {
       toast({ title: "Erro", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col safe-area-inset-bottom">
      
      {/* HEADER */}
      <div className="p-4 pt-8 bg-zinc-900 flex justify-between items-center">
        <button onClick={() => navigate(-1)}><X /></button>
        <div className="flex gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 w-12 rounded-full ${step >= i ? 'bg-green-500' : 'bg-zinc-700'}`} />
            ))}
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* PASSO 1: SCAN */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="flex-1 flex flex-col items-center justify-center p-6 space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">O que chegou?</h2>
                <p className="text-zinc-400">Separe os produtos por validade.</p>
              </div>
              <div className="w-full aspect-square bg-zinc-900 rounded-3xl overflow-hidden border-2 border-green-500/50 relative shadow-2xl shadow-green-900/20">
                 <BarcodeScanner onScan={handleScanEAN} onClose={()=>{}} />
              </div>
              <p className="text-xs text-zinc-500">Aponte para o código de barras</p>
            </motion.div>
          )}

          {/* PASSO 2: CÂMERA NATIVA */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="flex-1 flex flex-col p-6 space-y-6"
            >
              <div className="text-center">
                 <h2 className="text-2xl font-bold mb-2">Validade & Lote</h2>
                 <p className="text-zinc-400 text-sm">Toque na câmera para abrir.</p>
              </div>

              {/* BOTÃO DE CÂMERA GIGANTE */}
              <div 
                className="relative w-full aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-lg border-2 border-dashed border-zinc-600 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 transition active:scale-95"
                onClick={() => !photo && fileInputRef.current?.click()}
              >
                {!photo ? (
                    <>
                        <Camera size={48} className="text-zinc-400 mb-2" />
                        <p className="text-zinc-300 font-bold">Abrir Câmera</p>
                    </>
                ) : (
                    <img src={photo} alt="Validade" className="w-full h-full object-cover" />
                )}
                
                {ocrLoading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 animate-spin mb-3 text-green-500" />
                        <p className="text-sm font-bold uppercase tracking-widest">Lendo...</p>
                    </div>
                )}
                
                {/* BOTÃO RETAKE */}
                {photo && !ocrLoading && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-xl z-10"
                    >
                        <RefreshCw size={24} />
                    </button>
                )}
              </div>

              {/* INPUT ESCONDIDO */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment" // Abre câmera traseira nativa
                className="hidden"
                onChange={handleNativeCamera}
              />

              <div className="space-y-4 bg-zinc-900 p-4 rounded-xl">
                 <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Validade</label>
                    <input 
                        type="date" 
                        value={data.expiration_date || ''}
                        className="w-full bg-transparent border-b border-zinc-700 py-3 text-2xl text-white font-mono focus:border-green-500 outline-none"
                        onChange={e => setData(prev => ({...prev, expiration_date: e.target.value}))}
                    />
                 </div>
                 <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Lote</label>
                    <input 
                        value={data.batch_code || ''}
                        placeholder="Ex: L.A60073" 
                        className="w-full bg-transparent border-b border-zinc-700 py-2 text-lg text-white uppercase focus:border-green-500 outline-none"
                        onChange={e => setData(prev => ({...prev, batch_code: e.target.value}))}
                    />
                 </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl mt-auto"
              >
                Confirmar Data
              </button>
            </motion.div>
          )}

          {/* PASSO 3: QUANTIDADE */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="flex-1 flex flex-col p-6"
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-bold text-center">Quantos chegaram?</h2>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 text-center">
                    <h3 className="text-lg font-medium text-zinc-300 line-clamp-2">{data.name || "Produto Novo"}</h3>
                </div>

                <div className="flex items-center justify-center gap-6 py-8">
                    <button onClick={() => setData(prev => ({...prev, quantity: Math.max(1, (prev.quantity||1)-1)}))} 
                        className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 text-3xl font-bold">-</button>
                    <span className="text-6xl font-bold w-24 text-center">{data.quantity}</span>
                    <button onClick={() => setData(prev => ({...prev, quantity: (prev.quantity||1)+1}))} 
                        className="w-16 h-16 rounded-full bg-green-500 text-black text-3xl font-bold">+</button>
                </div>

                <div className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-zinc-400">Preço Venda</span>
                    <input 
                        type="number" 
                        className="bg-transparent text-right text-xl font-bold w-24 outline-none border-b border-zinc-700 focus:border-green-500"
                        value={data.price || ''}
                        onChange={e => setData(prev => ({...prev, price: e.target.value}))}
                    />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg shadow-xl"
              >
                {loading ? "Salvando..." : "Finalizar Entrada"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}