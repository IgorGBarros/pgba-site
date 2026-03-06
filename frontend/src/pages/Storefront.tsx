import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Package, Search, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api"; // ✅ Usa sua API Axios

// Interface baseada na resposta do Django Serializer
interface Product {
  name: string;
  category: string;
  image_url?: string;
}

interface StorefrontItem {
  id: number;
  sale_price: number | string;
  product: Product;
  total_quantity: number;
  // Opcional: pegar a validade do lote mais próximo de vencer
  batches?: { expiration_date: string }[]; 
}

interface StoreInfo {
  name: string;
  whatsapp: string;
}

export default function Storefront() {
  const [searchParams] = useSearchParams();
  
  // O link será algo como: meudominio.com/vitrine?seller=1 (ID da loja ou User)
  const sellerId = searchParams.get("seller");
  
  const [items, setItems] = useState<StorefrontItem[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({ name: "", whatsapp: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStorefrontData = async () => {
      if (!sellerId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Busca os dados da Loja e Itens Públicos
        // Endpoint que criaremos no backend
        const { data } = await api.get(`/public/storefront/${sellerId}/`);
        
        setStoreInfo({
            name: data.store_name,
            whatsapp: data.whatsapp
        });
        setItems(data.items);
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStorefrontData();
  }, [sellerId]);

  // Filtragem local
  const filtered = items.filter(
    (i) =>
      i.product.name.toLowerCase().includes(search.toLowerCase()) ||
      i.product.category.toLowerCase().includes(search.toLowerCase())
  );

  const whatsappLink = (productName: string) => {
    const phone = storeInfo.whatsapp?.replace(/\D/g, "");
    if (!phone) return "#";
    
    const msg = encodeURIComponent(
      `Olá! Vi o produto *${productName}* na sua vitrine Natura e tenho interesse. Ainda está disponível?`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Carregando vitrine...</p>
        </div>
      </div>
    );
  }

  if (error || !sellerId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center p-6">
        <Package className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
        <h1 className="text-xl font-bold">Loja não encontrada</h1>
        <p className="text-muted-foreground">Verifique o link ou entre em contato com sua consultora.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-3 font-display text-xl font-bold text-foreground">
            {storeInfo.name || "Vitrine Natura"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Produtos disponíveis para pronta entrega
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6 pb-20">
        {/* Search */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Package className="mb-3 h-12 w-12 opacity-30" />
            <p className="text-sm">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-foreground leading-tight">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 px-2 py-0.5 bg-secondary w-fit rounded-full">
                        {item.product.category}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">
                      R$ {Number(item.sale_price).toFixed(2)}
                    </span>
                  </div>

                  {/* Exibe validade se houver lotes */}
                  {item.batches && item.batches.length > 0 && item.batches[0].expiration_date && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                       Validade próxima: {new Date(item.batches[0].expiration_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                {storeInfo.whatsapp && (
                  <a
                    href={whatsappLink(item.product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98] hover:bg-[#20bd5a]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Eu quero!
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-md py-3 text-center text-xs text-muted-foreground z-10">
        Vitrine Digital • Estoque Natura
      </footer>
    </div>
  );
}