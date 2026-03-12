import { useState } from "react";
import { stockApi } from "../lib/api"; // 🚀 Agora só precisamos do stockApi!
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

export interface StockEntryData {
  bar_code: string;
  quantity: number;
  cost_price?: number;
  sale_price?: number;
  batch_code?: string;
  expiration_date?: string | null;
  name?: string;
  category?: string;
  natura_sku?: string | null;
  // campos complementares visuais
  expiry_photo_url?: string | null;
  lookup_source?: string | null;
  existing_item_id?: string | null;
}

export function useStockEntry() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  async function saveEntry(data: StockEntryData) {
    if (!user) throw new Error("Usuário não autenticado");
    
    setLoading(true);
    try {
      // 🔥 O BACKEND FAZ TUDO EM 1 CLIQUE! 
      // Enviamos apenas o payload formatado para /api/stock/entry/
      const response = await stockApi.create({
        bar_code: data.bar_code,
        natura_sku: data.natura_sku || "",
        name: data.name || "Produto sem nome",
        category: data.category || "Geral",
        quantity: Number(data.quantity),
        cost_price: Number(data.cost_price ?? 0),
        sale_price: Number(data.sale_price ?? 0),
        batch_code: data.batch_code || "",
        expiration_date: data.expiration_date
          ? `${data.expiration_date.length === 7 ? `${data.expiration_date}-01` : data.expiration_date}`
          : undefined,
      });

      toast({
        title: "Estoque Atualizado!",
        description: `+${data.quantity} un. de ${data.name || "Produto"} registradas.`,
      });

      // Retorna a resposta do backend caso as telas precisem de algum dado
      return response; 
      
    } catch (err: any) {
      console.error("❌ Falha ao salvar entrada:", err);
      toast({
        title: "Erro de Validação",
        description: err.response?.data?.error || err.message || "Falha ao registrar entrada de estoque.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, saveEntry };
}