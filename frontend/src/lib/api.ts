import {
  isDemoMode, DEMO_INVENTORY, DEMO_MOVEMENTS,
  DEMO_PROFILE, DEMO_BATCHES
} from "./demoData";

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com")
    .replace(/\/$/, "");

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearToken() {
  localStorage.removeItem("auth_token");
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 401) {
    clearToken();
    window.location.href = "/auth";
    throw new Error("Sessão expirada");
  }
  
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || body.error || `Erro ${response.status}`);
  }
  
  if (response.status === 204) return null as T;
  return response.json();
}

// ── Auth ──
export interface AuthUser {
  id: number | string;
  email: string;
  name?: string;
}
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access: string; refresh: string }>("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    apiRequest<{ token: string; user: AuthUser }>("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  firebaseLogin: (firebaseIdToken: string) =>
    apiRequest<{ access: string; refresh: string }>("/api/auth/firebase/", {
      method: "POST",
      body: JSON.stringify({ token: firebaseIdToken }),
    }),
  me: () => apiRequest<AuthUser>("/api/auth/me/"),
  logout: () => apiRequest<void>("/api/auth/logout/", { method: "POST" }).catch(() => {}),
};

// ── Product (Global Catalog) ──
export interface GlobalProduct {
  id: number;
  name: string;
  sku: string | null;
  barcode: string;
  category: string;
  official_price: number | null;
  image_url: string | null;
  brand: string | null;
  description: string | null;
}
export interface LookupResult {
  found: boolean;
  source: "local" | "remote" | "remote_learned" | "remote_partial" | "suggestion" | "fuzzy" | "none";
  product?: GlobalProduct | null; 
  suggestions?: GlobalProduct[];  
  data?: any;                     
  message?: string | null; 
}
export const productLookupApi = {
  lookup: (barcodeOrName: string | null) => {
    const query = barcodeOrName ?? "";
    return apiRequest<LookupResult>(
      `/api/products/lookup/?q=${encodeURIComponent(query)}`
    );
  },
  confirmMatch: (barcode: string, productId: number) =>
    apiRequest<GlobalProduct>("/api/products/confirm-match/", {
      method: "POST",
      body: JSON.stringify({ barcode, product_id: productId }),
    }),
};

// 🚀 1. SISTEMA DE CACHE DE MEMÓRIA (STANDBY)
let inventoryCache: InventoryItem[] | null = null;
let movementsCache: Movement[] | null = null;

export const clearAppCache = () => {
  inventoryCache = null;
  movementsCache = null;
};

// ── Inventory (user_inventory) ──
export interface InventoryItem {
  product_id: string | number | undefined;
  id: string;
  total_quantity?: number;
  min_quantity?: number;
  cost_price: number;
  sale_price: number | null;
  product?: {
    id: number | string;
    name: string;
    bar_code: string;
    natura_sku: string;
    category: string;
    image_url: string;
    official_price: number;
  };
  batches?: InventoryBatch[];
  quantity?: number;
  barcode?: string;
  product_name?: string;
  custom_name?: string | null;
  category?: string;
  official_price?: number | null;
  sale_type?: string | null;
  expiry_date?: string | null;
  expiry_photo_url?: string | null;
  image_url?: string | null;
  sku?: string | null;
  is_available_storefront?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const stockApi = {
  create: async (data: Record<string, any>) => {
    if (isDemoMode()) return { ...DEMO_INVENTORY[0], ...data } as InventoryItem;
    const res = await apiRequest<InventoryItem>("/api/stock/entry/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    clearAppCache(); // 🧹 Limpa cache ao dar entrada
    return res;
  }
};

export const inventoryApi = {
  // 🚀 2. USO DE CACHE NA LISTAGEM DE INVENTÁRIO
  list: async (forceRefresh = false) => {
    if (isDemoMode()) return DEMO_INVENTORY;
    
    // Se o cache já existe e não fomos forçados a atualizar, retorna instantâneo
    if (!forceRefresh && inventoryCache) {
      return inventoryCache;
    }

    const data = await apiRequest<InventoryItem[]>("/api/inventory/");
    inventoryCache = data; // Guarda em Standby
    return data;
  },

  get: (id: string) => (isDemoMode() ? Promise.resolve(DEMO_INVENTORY.find(i => i.id === id) || DEMO_INVENTORY[0])
                                     : apiRequest<InventoryItem>(`/api/inventory/${id}/`)),
                                     
  getByBarcode: async (barcode: string) => {
    if (isDemoMode()) return DEMO_INVENTORY.find(i => i.barcode === barcode) || null;
    
    // Usa o cache (muito mais rápido na hora do PDV)
    const items = await inventoryApi.list();
    return items.find(i => i.product?.bar_code === barcode || i.barcode === barcode) || null;
  },

  update: async (id: string, data: Partial<InventoryItem>) => {
    const res = await apiRequest<InventoryItem>(`/api/inventory/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    clearAppCache(); // 🧹 Limpa cache ao alterar
    return res;
  },

  delete: async (id: string) => {
    await apiRequest<void>(`/api/inventory/${id}/`, { method: "DELETE" });
    clearAppCache(); // 🧹 Limpa cache ao deletar
  },
};

// ── Inventory Batches ──
export interface InventoryBatch {
  id: string;
  inventory_item_id: string;
  quantity: number;
  cost_price: number;
  batch_code?: string;
  expiration_date?: string | null;
  expiry_date?: string | null;
  expiry_photo_url?: string | null;
  created_at: string;
}

export const batchApi = {
  listByItem: (itemId: string) => {
    if (isDemoMode()) return Promise.resolve(DEMO_BATCHES[itemId] || []);
    return apiRequest<InventoryBatch[]>(`/api/inventory/${itemId}/batches/`);
  },
  create: async (itemId: string, data: Omit<InventoryBatch, "id" | "inventory_item_id" | "created_at">) => {
    if (isDemoMode()) return { id: "b-new", inventory_item_id: itemId, created_at: new Date().toISOString(), ...data } as InventoryBatch;
    const res = await apiRequest<InventoryBatch>(`/api/inventory/${itemId}/batches/`, { method: "POST", body: JSON.stringify(data) });
    clearAppCache(); // 🧹 Limpa cache se adicionar lote manual
    return res;
  },
};

// ── Movements ──
export type TransactionType = "venda" | "uso_proprio" | "presente" | "brinde" | "perda";
export interface Movement {
  id: string | number;
  transaction_type?: string; 
  description?: string | null; 
  unit_cost?: number | null;
  batch_code?: string | null;
  product_id?: string | null;
  batch_id?: string | null;
  product_name: string;
  barcode: string;
  movement_type?: "entrada" | "saida";
  quantity: number;
  unit_price: number | null;
  sale_type?: TransactionType | null;
  notes?: string | null;
  profit?: number | null;
  created_at: string;
}

export const movementsApi = {
  // 🚀 3. USO DE CACHE NO EXTRATO DE MOVIMENTAÇÕES
  list: async (forceRefresh = false) => {
    if (isDemoMode()) return DEMO_MOVEMENTS;
    
    // Devolve o histórico na hora se já estiver na memória
    if (!forceRefresh && movementsCache) {
      return movementsCache;
    }

    const data = await apiRequest<Movement[]>("/api/transactions/");
    movementsCache = data; // Guarda em Standby
    return data;
  },

  create: async (data: Omit<Movement, "id" | "created_at" | "profit">) => {
    if (isDemoMode()) return { id: "m-new", created_at: new Date().toISOString(), profit: null, ...data } as Movement;
    const res = await apiRequest<Movement>("/api/transactions/", { method: "POST", body: JSON.stringify(data) });
    clearAppCache(); // 🧹 Força atualização do Extrato e Estoque após venda/baixa
    return res;
  },
};

// ── Admin ──
export const adminApi = {
  listUsers: () => apiRequest<any[]>("/api/admin/users/"),
  updatePlan: (id: string | number, plan: "free" | "pro") =>
    apiRequest<{ message: string; plan: string }>(`/api/admin/users/${id}/plan/`, {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    }),
  updateSubscription: (id: string | number, data: any) =>
    apiRequest<{ message: string }>(`/api/admin/users/${id}/subscription/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── Profile ──
export interface Profile {
  id: string;
  display_name: string | null;
  whatsapp_number: string | null;
  storefront_enabled: boolean;
  store_slug: string | null;
  plan: "free" | "pro";
}

export const profileApi = {
  get: () => (isDemoMode() ? Promise.resolve(DEMO_PROFILE) : apiRequest<Profile>("/api/profile/")),
  update: (data: Partial<Profile>) => (isDemoMode() ? Promise.resolve({ ...DEMO_PROFILE, ...data } as Profile) : apiRequest<Profile>("/api/profile/", { method: "PATCH", body: JSON.stringify(data) })),
};

// ── Storefront (public) ──
export interface StorefrontItem {
  id: string;
  product_name: string;
  display_name: string;
  custom_name: string | null;
  category: string;
  sale_price: number | null;
  barcode: string;
  expiry_date: string | null;
  seller_name: string | null;
  seller_whatsapp: string | null;
  user_id: string;
  image_url: string | null;
  store_slug: string | null;
}

export const storefrontApi = {
  list: (sellerId?: string) => {
    if (isDemoMode() || sellerId === "demo") {
      const imageMap: Record<string, string> = {
        d1: "/products/kaiak.jpg", d2: "/products/luna.jpg", d3: "/products/tododia.jpg",
        d4: "/products/chronos.jpg", d6: "/products/batom.jpg", d7: "/products/ekos.jpg",
      };
      const demoItems: StorefrontItem[] = DEMO_INVENTORY
        .filter((i) => i.is_available_storefront && (i.quantity ?? 0) > 0)
        .map((i) => ({
          id: i.id, product_name: i.product?.name || i.product_name || "Produto Demo",
          display_name: i.custom_name || i.product?.name || i.product_name || "Produto Demo",
          custom_name: i.custom_name || null, category: i.product?.category || i.category || "Geral",
          sale_price: i.sale_price ?? null, barcode: i.product?.bar_code || i.barcode || "0000000000000",
          expiry_date: i.expiry_date ?? null, seller_name: DEMO_PROFILE.display_name,
          seller_whatsapp: DEMO_PROFILE.whatsapp_number, user_id: "demo",
          image_url: imageMap[i.id] || i.product?.image_url || i.image_url || null, store_slug: DEMO_PROFILE.store_slug,
        }));
      return Promise.resolve(demoItems);
    }
    const params = sellerId ? `?seller=${sellerId}` : "";
    return apiRequest<StorefrontItem[]>(`/api/storefront/${params}`);
  },
  listBySlug: (slug: string) => {
    if (slug === "demo") return storefrontApi.list("demo");
    return apiRequest<StorefrontItem[]>(`/api/storefront/${slug}/`);
  },
};

// ── Products (Django legacy) ──
export { productService } from "./productService";

// ── OCR (file upload) ──
export const ocrApi = {
  uploadAndExtract: async (file: File): Promise<{ expiry_date?: string; photo_url?: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${API_BASE_URL}/api/ocr-expiry/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error("Erro ao processar imagem");
    return response.json();
  },
};

// ── Helpers ──
export function formatMoney(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const salesApi = {
  checkout: (payload: any) =>
    apiRequest<{ message: string; total: number }>("/api/sales/checkout/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
// lib/api.ts - SUBSTITUA ou ADICIONE

export const publicStorefrontApi = {
  listBySlug: async (slug: string) => {
    const response = await fetch(`/api/public/storefront/${slug}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // ✅ SEM Authorization header
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  listById: async (sellerId: string) => {
    const response = await fetch(`/api/public/storefront/?seller=${sellerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // ✅ SEM Authorization header
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
};