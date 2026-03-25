import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Zap, ZapOff, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

interface ExtendedCameraCapabilities {
  torch?: boolean;
  zoom?: { min: number; max: number; step: number };
}

// 🍎 Detectar iOS para otimizações específicas
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasScannedRef = useRef(false); // Evita múltiplos scans

  useEffect(() => {
    const scannerId = "barcode-reader";
    let isMounted = true;

    const startScanner = async () => {
      try {
        setError("");
        hasScannedRef.current = false;
        setIsScanning(false);

        // Limpa instância anterior se houver
        if (scannerRef.current) {
          try { 
            await scannerRef.current.stop(); 
          } catch (e) {
            console.warn("Cleanup anterior:", e);
          }
        }

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        // ✅ Configuração otimizada para iOS (mais conservadora)
        const config = {
          fps: isIOS ? 12 : 15, // iOS: um pouco mais lento = melhor foco
          qrbox: isIOS 
            ? { width: 240, height: 160 } // iOS: área um pouco menor
            : { width: 260, height: 180 },
          aspectRatio: 1.0,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13, 
            Html5QrcodeSupportedFormats.EAN_8
          ]
        };

        await scanner.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            if (!isMounted || hasScannedRef.current) return;
            
            // Validação simples
            if (/^\d{8,14}$/.test(decodedText)) {
              hasScannedRef.current = true;
              
              // ✅ iOS: pequeno delay para mostrar resultado antes de fechar
              if (isIOS) {
                setTimeout(() => {
                  stopScanner();
                  onScan(decodedText);
                }, 200);
              } else {
                stopScanner();
                onScan(decodedText);
              }
            }
          },
          () => {} // Ignora erros de frame vazio
        );

        setIsScanning(true);

        if (isMounted) {
          // ✅ iOS: delay maior para detectar torch
          const torchDelay = isIOS ? 1000 : 500;
          setTimeout(() => {
            try {
              const capabilities = scanner.getRunningTrackCameraCapabilities() as unknown as ExtendedCameraCapabilities;
              setHasTorch(!!capabilities?.torch);
            } catch (e) {
              console.warn("Erro ao detectar torch:", e);
            }
          }, torchDelay);
        }

      } catch (err: any) {
        console.error("Scanner error:", err);
        
        let msg = "Erro ao abrir câmera.";
        if (err?.name === "NotAllowedError") msg = "Permissão de câmera negada.";
        if (err?.name === "NotFoundError") msg = "Nenhuma câmera encontrada.";
        if (err?.name === "NotReadableError") msg = isIOS ? "Câmera ocupada por outro app." : "Câmera não disponível.";
        
        if (isMounted) setError(`${msg} Tente 'Enviar Foto'.`);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current?.isScanning) {
        try { 
          await scannerRef.current.stop(); 
          setIsScanning(false);
        } catch (e) {
          console.warn("Erro ao parar scanner:", e);
        }
      }
    };

    // ✅ iOS: delay um pouco maior para garantir renderização
    const initDelay = isIOS ? 200 : 100;
    const timer = setTimeout(startScanner, initDelay);

    return () => { 
      isMounted = false; 
      clearTimeout(timer);
      stopScanner(); 
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }]
        } as any);
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn("Erro ao controlar flash:", e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      const fileScanner = new Html5Qrcode("barcode-reader-file");
      const result = await fileScanner.scanFile(file, true);
      
      // ✅ Validação também no upload
      if (/^\d{8,14}$/.test(result)) {
        onScan(result);
      } else {
        setError("Código não identificado na imagem.");
      }
    } catch (e) {
      setError("Código não identificado na imagem. Tente uma foto mais nítida.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-zinc-900 z-20">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Scanner</h2>
          {/* ✅ Indicador sutil de plataforma */}
          {isIOS && <span className="text-xs text-blue-400">📱</span>}
        </div>
        
        <div className="flex gap-4">
          {hasTorch && (
            <button 
              onClick={toggleTorch} 
              className={`p-2 rounded-full transition-colors ${torchOn ? 'bg-yellow-400 text-black' : 'bg-zinc-700'}`}
            >
              {torchOn ? <ZapOff size={20} /> : <Zap size={20} />}
            </button>
          )}
          <button onClick={onClose} className="p-2 bg-zinc-700 rounded-full">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Área da Câmera */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        <div id="barcode-reader" className="w-full h-full" />
        
        {/* ✅ Mira otimizada por plataforma */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={`${isIOS ? 'w-[65%] aspect-[3/2]' : 'w-[70%] aspect-[3/2]'} border-2 border-red-500 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}>
            <div className="absolute top-1/2 w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
            
            {/* ✅ Cantos da mira para melhor visibilidade */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white rounded-br-sm" />
          </div>
        </div>
        
        {/* ✅ Status de scanning */}
        {isScanning && !error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            {isIOS ? 'Focando...' : 'Procurando código...'}
          </div>
        )}
        
        {/* ✅ Dica discreta para iOS */}
        {isIOS && isScanning && !error && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-600/80 px-3 py-1 rounded-full text-xs">
            💡 Aproxime devagar
          </div>
        )}
        
        {error && (
          <div className="absolute bottom-10 left-4 right-4 bg-red-600/90 px-4 py-2 rounded-lg text-sm font-bold text-center">
            {error}
          </div>
        )}
      </div>

      {/* Rodapé Upload */}
      <div className="p-6 bg-zinc-900 z-20 pb-10">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <ImagePlus size={20} />
          {isIOS ? 'Enviar Foto (Alternativa)' : 'Enviar Foto (Melhor Foco)'}
        </button>
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          capture="environment" // ✅ Força câmera traseira no mobile
          onChange={handleFileUpload} 
          className="hidden" 
        />
        
        <div id="barcode-reader-file" className="hidden" />
      </div>
    </motion.div>
  );
}