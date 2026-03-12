import { useState } from "react";
import {
  stockApi,
  inventoryApi,
  batchApi,
  movementsApi,
} from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";

/**
 * Interface que representa os dados de entrada de estoque.
 * Nomes de campos seguem exatamente o serializer do backend.
 */
export interface StockEntryData {
  bar_code: string;                 // código de barras
  quantity: number;                 // inteiro
  cost_price?: number;              // decimal
  sale_price?: number;              // decimal
  batch_code?: string;              // opcional
  expiration_date?: string | null;  // "YYYY-MM-DD"
  name?: string;                    // nome do produto
  category?: string;                // categoria
  natura_sku?: string | null;       // SKU opcional
  // campos complementares (usados localmente)
  expiry_photo_url?: string | null;
  lookup_source?: string | null;
  existing_item_id?: string | null;
}

/**
 * Hook que centraliza criação ou atualização de entradas de estoque.
 * Retorna estado de carregamento e a função saveEntry().
 */
export function useStockEntry() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  async function saveEntry(data: StockEntryData) {
    if (!user) throw new Error("Usuário não autenticado");

    setLoading(true);
    try {
      let itemId = data.existing_item_id;

      // ① Criar produto/estoque se ainda não existir
      if (!itemId) {
        const inserted = await stockApi.create({
          bar_code: data.bar_code,
          quantity: Number(data.quantity),
          cost_price: Number(data.cost_price ?? 0),
          sale_price: Number(data.sale_price ?? 0),
          batch_code: data.batch_code || "",
          expiration_date: data.expiration_date
            ? `${data.expiration_date.length === 7 ? `${data.expiration_date}-01` : data.expiration_date}`
            : undefined,
          name: data.name || "Produto sem nome",
          category: data.category || "",
          natura_sku: data.natura_sku ?? "",
        });

        // use o ID retornado para os próximos registros
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
        cost_price: data.cost_price ?? 0,
        expiry_date: data.expiration_date || null,
        expiry_photo_url: data.expiry_photo_url || null,
      });

      // ④ Registrar movimentação (StockTransaction)
      await movementsApi.create({
        product_id: itemId!,
        batch_id: null,
        product_name: data.name || "Produto sem nome",
        barcode: data.bar_code,
        movement_type: "entrada",
        quantity: data.quantity,
        unit_price: data.cost_price ?? 0,
        sale_type: null,
        notes: data.lookup_source ? `Fonte: ${data.lookup_source}` : null,
      });

      toast({
        title: "Entrada registrada!",
        description: `+${data.quantity} ${data.name || ""}`,
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

  return { loading, saveEntry };
}