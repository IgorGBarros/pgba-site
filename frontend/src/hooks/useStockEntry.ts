import { useState } from "react";
import {
  stockApi,
  inventoryApi,
  batchApi,
  movementsApi,
  GlobalProduct,
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

/**
 * Interface de dados que representam uma entrada de estoque.
 * Todas as propriedades opcionais aceitam `null` para simplificar tipagem.
 */
export interface StockEntryData {
  bar_code: string;                  // código de barras
  product_name: string;
  category: string;
  sku?: string | null;               // SKU opcional
  image_url?: string | null;         // URL de imagem opcional
  official_price?: number | null;    // preço oficial opcional
  expiry_date?: string | null;       // data de validade (YYYY-MM ou YYYY-MM-DD)
  expiry_photo_url?: string | null;  // link da foto de validade
  quantity: number;                  // quantidade recebida
  cost_price: number;                // preço de custo
  lookup_source?: string | null;     // origem do lookup (inventory, fuzzy, etc.)
  existing_item_id?: string | null;  // id do item existente no estoque
}
/**
 * Hook que centraliza criação de entrada de estoque.
 * Retorna estado de carregamento e a função saveEntry() que executa toda lógica.
 */
export function useStockEntry() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Cria uma nova entrada de estoque ou atualiza uma existente.
   * Envia POST `/api/stock/entry/` e depois registra lote e movimentação.
   */
  async function saveEntry(data: StockEntryData) {
    if (!user) throw new Error("Usuário não autenticado");

    setLoading(true);
    try {
      let itemId = data.existing_item_id;

      // ① Criar produto/estoque se ainda não existir
      if (!itemId) {
            const inserted = await stockApi.create({
            bar_code: data.bar_code,
            quantity: Number(data.quantity),                       // transforma em número
            cost_price: Number(data.cost_price),                   // transforma em número
            expiration_date: data.expiry_date                      // converte mês → dia
                ? `${data.expiry_date}-01`
                : undefined,
            name: data.product_name || "Produto sem nome",
            category: data.category || "",
            natura_sku: data.sku ?? "",
            });
            itemId = inserted.id;
      } else {
        // ② Atualizar quantidade de item existente
        const existing = await inventoryApi.get(itemId);
        await inventoryApi.update(itemId, {
          quantity: existing.quantity + data.quantity,
        });
      }

      // ③ Criar lote (InventoryBatch)
      await batchApi.create(itemId!, {
        quantity: data.quantity,
        cost_price: data.cost_price,
        expiry_date: data.expiry_date || null,
        expiry_photo_url: data.expiry_photo_url || null,
      });

      // ④ Registrar movimentação (StockTransaction)
      await movementsApi.create({
        product_id: itemId!,
        batch_id: null,
        product_name: data.product_name || "Produto sem nome",
        barcode: data.bar_code,
        movement_type: "entrada",
        quantity: data.quantity,
        unit_price: data.cost_price,
        sale_type: null,
        notes: data.lookup_source ? `Fonte: ${data.lookup_source}` : null,
      });

      toast({
        title: "Entrada registrada!",
        description: `+${data.quantity} ${data.product_name}`,
      });

      return itemId;
    } catch (err: any) {
      console.error("❌ Falha ao salvar entrada:", err);
      toast({
        title: "Erro",
        description: err.message || "Falha ao registrar entrada de estoque.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    saveEntry,
  };
}