import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Zap, ZapOff, ImagePlus, Camera, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

interface ExtendedCameraCapabilities {
  torch?: boolean;
  zoom?: { min: number; max: number; step: number };
}

// 🍎 Detecção de iOS
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [hasZoom, setHasZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [showIOSHelper, setShowIOSHelper] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasScannedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const iOS = isIOS();

  // 🔄 Cleanup seguro
  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.warn("Erro ao parar scanner:", err);
      }
    }
  }, []);

  // 🚀 Configuração otimizada por plataforma
  const getScannerConfig = () => ({
    fps: iOS ? 8 : 15, // iOS: FPS menor = melhor foco
    qrbox: iOS 
      ? { width: 200, height: 120 } // iOS: área menor = menos ruído
      : { width: 260, height: 180 },
    aspectRatio: 1.0,
    disableFlip: true, // iOS: evita processamento extra
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8
    ]
  });

  // 📷 Inicializar scanner (instância única)
  const startScanner = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setError("");
      
      // ✅ CORREÇÃO 1: Reutilizar instância no iOS
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("barcode-reader");
      }

      const scanner = scannerRef.current;
      
      // Se já está rodando, não reinicia (iOS-friendly)
      if (scanner.isScanning) {
        return;
      }

      const config = getScannerConfig();
      
      await scanner.start(
        { 
          facingMode: "environment",
          // 🍎 iOS: constraints específicos
          ...(iOS && {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          })
        }, 
        config,
        (decodedText) => {
          if (!isMountedRef.current || hasScannedRef.current) return;
          
          // Validação de código de barras
          if (/^\d{8,14}$/.test(decodedText)) {
            hasScannedRef.current = true;
            
            // ✅ CORREÇÃO 2: Não para scanner imediatamente no iOS
            if (!iOS) {
              stopScanner();
            }
            
            onScan(decodedText);
          }
        },
        () => {} // Ignora erros de frame
      );

      setIsScanning(true);

      // 🔧 Detectar capacidades da câmera
      if (isMountedRef.current) {
        try {
          const capabilities = scanner.getRunningTrackCameraCapabilities() as unknown as ExtendedCameraCapabilities;
          setHasTorch(!!capabilities?.torch);
          setHasZoom(!!(capabilities?.zoom && capabilities.zoom.max > 1));
          
          // 🍎 iOS: Aplicar zoom inicial para melhor foco
          if (iOS && capabilities?.zoom && capabilities.zoom.max >= 2) {
            setTimeout(() => applyZoom(1.8), 1000);
          }
        } catch (err) {
          console.warn("Erro ao detectar capacidades:", err);
        }
      }

    } catch (err: any) {
      console.error("Scanner error:", err);
      
      let msg = "Erro ao abrir câmera.";
      
      if (err?.name === "NotAllowedError") {
        msg = iOS 
          ? "Permissão negada. Toque em 'Permitir' quando solicitado."
          : "Permissão de câmera negada.";
      } else if (err?.name === "NotFoundError") {
        msg = "Nenhuma câmera encontrada.";
      } else if (err?.name === "NotReadableError") {
        msg = iOS 
          ? "Câmera em uso por outro app. Feche outros apps e tente novamente."
          : "Câmera não disponível.";
      }
      
      if (isMountedRef.current) {
        setError(`${msg} ${iOS ? 'Use "Enviar Foto" como alternativa.' : 'Tente "Enviar Foto".'}`);
        
        // 🍎 Mostrar dica específica do iOS após erro
        if (iOS) {
          setShowIOSHelper(true);
        }
      }
    }
  }, [iOS, onScan, stopScanner]);

  // 🔦 Toggle flash
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }]
      } as any);
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn("Erro ao controlar flash:", err);
    }
  };

  // 🔍 Controle de zoom (especialmente útil no iOS)
  const applyZoom = async (level: number) => {
    if (!scannerRef.current || !hasZoom) return;
    
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ zoom: level }]
      } as any);
      setZoomLevel(level);
    } catch (err) {
      console.warn("Erro ao aplicar zoom:", err);
    }
  };

  // 📸 Upload de arquivo
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
    } catch (err) {
      setError("Código não identificado na imagem. Tente uma foto mais nítida.");
    }
  };

  // 🚀 Inicialização
  useEffect(() => {
    isMountedRef.current = true;
    hasScannedRef.current = false;
    
    // Delay maior no iOS para garantir renderização
    const timer = setTimeout(startScanner, iOS ? 300 : 100);
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      
      // ✅ CORREÇÃO 3: Cleanup apenas no unmount final
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [startScanner]);

  // 🔄 Handler de fechamento
  const handleClose = useCallback(() => {
    hasScannedRef.current = true;
    stopScanner().then(() => {
      onClose();
    });
  }, [onClose, stopScanner]);

  return (
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
    >
      {/* Header com controles */}
      <div className="flex items-center justify-between px-4 py-4 bg-zinc-900 z-20">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">Scanner</h2>
          {iOS && <Smartphone size={16} className="text-blue-400" />}
        </div>
        
        <div className="flex gap-2">
          {/* Zoom (iOS principalmente) */}
          {hasZoom && (
            <div className="flex gap-1">
              <button 
                onClick={() => applyZoom(1)} 
                className={`px-2 py-1 text-xs rounded ${zoomLevel === 1 ? 'bg-blue-600' : 'bg-zinc-700'}`}
              >
                1x
              </button>
              <button 
                onClick={() => applyZoom(2)} 
                className={`px-2 py-1 text-xs rounded ${zoomLevel === 2 ? 'bg-blue-600' : 'bg-zinc-700'}`}
              >
                2x
              </button>
            </div>
          )}
          
          {/* Flash */}
          {hasTorch && (
            <button 
              onClick={toggleTorch} 
              className={`p-2 rounded-full ${torchOn ? 'bg-yellow-400 text-black' : 'bg-zinc-700'}`}
            >
              {torchOn ? <ZapOff size={20} /> : <Zap size={20} />}
            </button>
          )}
          
          {/* Fechar */}
          <button onClick={handleClose} className="p-2 bg-zinc-700 rounded-full">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Área da câmera */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        <div id="barcode-reader" className="w-full h-full" />
        
        {/* Mira otimizada */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className={`${iOS ? 'w-[60%] aspect-[5/3]' : 'w-[70%] aspect-[3/2]'} border-2 border-red-500 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]`}>
            <div className="absolute top-1/2 w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
            
            {/* Cantos da mira */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white rounded-br" />
          </div>
        </div>
        
        {/* Status de scanning */}
        {isScanning && !error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600/90 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            Procurando código...
          </div>
        )}
        
        {/* Erro */}
        {error && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-600/90 px-4 py-3 rounded-lg text-sm">
            <div className="font-bold mb-1">⚠️ {iOS ? 'iPhone' : 'Câmera'}</div>
            {error}
          </div>
        )}
        
        {/* Helper iOS */}
        {showIOSHelper && iOS && (
          <div className="absolute top-20 left-4 right-4 bg-blue-600/90 px-4 py-3 rounded-lg text-sm">
            <div className="font-bold mb-2">💡 Dicas para iPhone:</div>
            <ul className="text-xs space-y-1">
              <li>• Mantenha o código bem iluminado</li>
              <li>• Aproxime devagar até focar</li>
              <li>• Use o zoom 2x se disponível</li>
              <li>• "Enviar Foto" funciona melhor</li>
            </ul>
            <button 
              onClick={() => setShowIOSHelper(false)}
              className="mt-2 text-xs underline"
            >
              Entendi
            </button>
          </div>
        )}
      </div>

      {/* Rodapé com upload */}
      <div className="p-6 bg-zinc-900 z-20 pb-10">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all mb-2"
        >
          <ImagePlus size={20} />
          {iOS ? 'Enviar Foto (Recomendado para iPhone)' : 'Enviar Foto (Melhor Foco)'}
        </button>
        
        {iOS && (
          <p className="text-xs text-zinc-400 text-center">
            📱 iPhones têm melhor resultado com foto do que scanner ao vivo
          </p>
        )}
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          capture="environment"
          onChange={handleFileUpload} 
          className="hidden" 
        />
        
        <div id="barcode-reader-file" className="hidden" />
      </div>
    </motion.div>
  );
}