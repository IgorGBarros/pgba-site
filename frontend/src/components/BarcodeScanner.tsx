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

// 🍎 Detecção de iOS para ajustes específicos
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasScannedRef = useRef(false);

  const iOS = isIOS();

  useEffect(() => {
    const scannerId = "barcode-reader";
    let isMounted = true;

    const startScanner = async () => {
      try {
        setError("");
        hasScannedRef.current = false;
        
        // ✅ CORREÇÃO iOS: Não para scanner anterior se estiver funcionando
        // iOS não gosta de stop/start frequente
        if (scannerRef.current?.isScanning) {
          console.log("Scanner já rodando, reutilizando...");
          return;
        }

        // ✅ Para scanner anterior apenas se não estiver ativo
        if (scannerRef.current && !scannerRef.current.isScanning) {
          try { 
            await scannerRef.current.stop(); 
          } catch (e) {
            console.warn("Erro ao parar scanner anterior:", e);
          }
        }

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        // ✅ Configuração otimizada para iOS
        const config = {
          fps: iOS ? 10 : 15, // iOS: FPS menor = melhor foco
          qrbox: iOS 
            ? { width: 220, height: 140 } // iOS: área menor = menos ruído
            : { width: 260, height: 180 },
          aspectRatio: 1.0,
          disableFlip: iOS, // iOS: evita processamento extra
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8
          ]
        };

        // ✅ CORREÇÃO iOS: Constraints específicos para iOS
        const cameraConstraints = iOS 
          ? { 
              facingMode: "environment",
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 }
            }
          : { facingMode: "environment" };

        await scanner.start(
          cameraConstraints,
          config,
          (decodedText) => {
            if (!isMounted || hasScannedRef.current) return;
            
            // Validação simples
            if (/^\d{8,14}$/.test(decodedText)) {
              hasScannedRef.current = true;
              
              // ✅ CORREÇÃO iOS: Não para scanner imediatamente
              // Deixa o usuário ver o resultado
              setTimeout(() => {
                stopScanner();
                onScan(decodedText);
              }, iOS ? 500 : 0);
            }
          },
          (errorMessage) => {
            // Ignora erros de frame vazio (normal)
            if (!errorMessage.includes("No MultiFormat Readers")) {
              console.warn("Scanner frame error:", errorMessage);
            }
          }
        );

        setIsScanning(true);

        if (isMounted) {
          // ✅ CORREÇÃO: Remover try desnecessário
          // Pequeno delay para iOS detectar capacidades
          setTimeout(() => {
            if (scanner.isScanning) {
              try {
                const capabilities = scanner.getRunningTrackCameraCapabilities() as unknown as ExtendedCameraCapabilities;
                setHasTorch(!!capabilities?.torch);
              } catch (e) {
                console.warn("Erro ao detectar capacidades:", e);
              }
            }
          }, iOS ? 1000 : 500);
        }

      } catch (err: any) {
        console.error("Scanner error:", err);
        
        let msg = "Erro ao abrir câmera.";
        
        if (err?.name === "NotAllowedError") {
          msg = iOS 
            ? "Permissão de câmera negada. Recarregue a página e toque em 'Permitir'."
            : "Permissão de câmera negada.";
        } else if (err?.name === "NotFoundError") {
          msg = "Nenhuma câmera encontrada.";
        } else if (err?.name === "NotReadableError") {
          msg = iOS 
            ? "Câmera em uso. Feche outros apps e recarregue a página."
            : "Câmera não disponível.";
        } else if (err?.name === "OverconstrainedError") {
          msg = iOS 
            ? "Configuração de câmera não suportada. Tente recarregar."
            : "Erro de configuração da câmera.";
        }
        
        if (isMounted) {
          setError(`${msg} Tente 'Enviar Foto'.`); // ✅ CORREÇÃO: Sintaxe corrigida
          setIsScanning(false);
        }
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

    // ✅ Delay maior para iOS garantir renderização
    const timer = setTimeout(startScanner, iOS ? 300 : 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [onScan, iOS]); // ✅ Dependência iOS adicionada

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
          {iOS && <span className="text-xs bg-blue-600 px-2 py-1 rounded">iOS</span>}
        </div>
        
        <div className="flex gap-4">
          {hasTorch && (
            <button 
              onClick={toggleTorch} 
              className={`p-2 rounded-full ${torchOn ? 'bg-yellow-400 text-black' : 'bg-zinc-700'}`} // ✅ CORREÇÃO: Template literal corrigido
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
        
        {/* Mira */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={`${iOS ? 'w-[60%] aspect-[5/3]' : 'w-[70%] aspect-[3/2]'} border-2 border-red-500 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}>
            <div className="absolute top-1/2 w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
            
            {/* Cantos da mira para melhor visibilidade */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white" />
          </div>
        </div>
        
        {/* Status */}
        {isScanning && !error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            Procurando código...
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="absolute bottom-10 left-4 right-4 bg-red-600/90 px-4 py-2 rounded-lg text-sm font-bold text-center">
            {error}
          </div>
        )}
        
        {/* Dica específica para iOS */}
        {iOS && isScanning && (
          <div className="absolute top-16 left-4 right-4 bg-blue-600/90 px-3 py-2 rounded-lg text-xs text-center">
            💡 iPhone: Mantenha o código bem iluminado e aproxime devagar
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
          {iOS ? 'Enviar Foto (Recomendado para iPhone)' : 'Enviar Foto (Melhor Foco)'}
        </button>
        
        {iOS && (
          <p className="text-xs text-zinc-400 text-center mt-2">
            📱 Se a câmera não abrir, recarregue a página
          </p>
        )}
        
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