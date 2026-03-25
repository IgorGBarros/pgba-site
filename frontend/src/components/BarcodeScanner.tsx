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

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const scannerId = "barcode-reader";
    let isMounted = true;

    const startScanner = async () => {
      try {
        // Importante: Limpa instância anterior se houver
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch {}
        }

        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 180 }, // Caixa um pouco menor para facilitar foco
          aspectRatio: 1.0,
          formatsToSupport: [ Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8 ]
        };

        await scanner.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            if (!isMounted) return;
            // Validação simples
            if (/^\d{8,14}$/.test(decodedText)) {
                stopScanner();
                onScan(decodedText);
            }
          },
          () => {} // Ignora erros de frame vazio
        );

        if (isMounted) {
            try {
                const capabilities = scanner.getRunningTrackCameraCapabilities() as unknown as ExtendedCameraCapabilities;
                setHasTorch(!!capabilities.torch);
            } catch {}
        }

      } catch (err: any) {
        console.error("Scanner error:", err);
        let msg = "Erro ao abrir câmera.";
        if (err?.name === "NotAllowedError") msg = "Permissão de câmera negada.";
        if (err?.name === "NotFoundError") msg = "Nenhuma câmera encontrada.";
        
        if (isMounted) setError(`${msg} Tente 'Enviar Foto'.`);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current?.isScanning) {
        try { await scannerRef.current.stop(); } catch {}
      }
    };

    // Pequeno delay para garantir que o DOM renderizou
    const timer = setTimeout(startScanner, 100);

    return () => { 
        isMounted = false; 
        clearTimeout(timer);
        stopScanner(); 
    };
  }, [onScan]);

  const toggleTorch = async () => {
    if (scannerRef.current) {
        try {
            await scannerRef.current.applyVideoConstraints({
                advanced: [{ torch: !torchOn }]
            } as any);
            setTorchOn(!torchOn);
        } catch { }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const scanner = new Html5Qrcode("barcode-reader-file");
        const result = await scanner.scanFile(file, true);
        onScan(result);
    } catch {
        setError("Código não identificado na imagem.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
    >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-zinc-900 z-20">
          <h2 className="font-bold">Scanner</h2>
          
          <div className="flex gap-4">
             {hasTorch && (
                <button onClick={toggleTorch} className={`p-2 rounded-full ${torchOn ? 'bg-yellow-400 text-black' : 'bg-zinc-700'}`}>
                    {torchOn ? <ZapOff size={20} /> : <Zap size={20} />}
                </button>
             )}
             <button onClick={onClose} className="p-2 bg-zinc-700 rounded-full">
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Área da Câmera (Full Flex) */}
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
             {/* O html5-qrcode injeta o vídeo aqui. 
                 Usamos w-full h-full e object-cover no CSS global se possível, 
                 mas aqui o container controla o tamanho. */}
             <div id="barcode-reader" className="w-full h-full" />

             {/* Mira Vermelha (Centralizada Absolutamente) */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[70%] aspect-[3/2] border-2 border-red-500 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
                    <div className="absolute top-1/2 w-full h-0.5 bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                </div>
             </div>
             
             {error && (
                <div className="absolute bottom-10 bg-red-600/90 px-4 py-2 rounded-lg text-sm font-bold">
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
            Enviar Foto (Melhor Foco)
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          
          {/* Div fantasma necessária para o scan de arquivo */}
          <div id="barcode-reader-file" className="hidden" />
        </div>
    </motion.div>
  );
}