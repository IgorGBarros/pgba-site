import {
  isDemoMode, DEMO_INVENTORY, DEMO_MOVEMENTS,
  DEMO_PROFILE, DEMO_BATCHES
} from "./demoData";

const API_BASE_URL =(import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";

// 🔑 token helpers
function getToken(): string | null {
  return localStorage.getItem("auth_token");
}
export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}
export function clearToken() {
  localStorage.removeItem("auth_token");
}

// 🔧 request helper
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
  source:
    | "local"
    | "remote"
    | "remote_learned"
    | "remote_partial"
    | "suggestion"
    | "fuzzy"          // ✅ adiciona o valor que o front usa
    | null;
  product?: GlobalProduct | null; // ✅ adiciona o campo esperado
  suggestions?: GlobalProduct[];  // ✅ adiciona o campo usado no fuzzy match
  data?: any;                     // opcional, cobre payloads diferentes
  message?: string;
}

export const productLookupApi = {
  lookup: (barcodeOrName: string) =>
    apiRequest<LookupResult>(`/api/products/lookup/?q=${encodeURIComponent(barcodeOrName)}`),

  confirmMatch: (barcode: string, productId: number) =>
    apiRequest<GlobalProduct>("/api/products/confirm-match/", {
      method: "POST",
      body: JSON.stringify({ barcode, product_id: productId }),
    }),
};

// ── Inventory (user_inventory) ──
export interface InventoryItem {
  id: string;
  barcode: string;
  product_name: string;
  custom_name: string | null;
  category: string;
  quantity: number;
  min_quantity: number;
  cost_price: number;
  sale_price: number | null;
  official_price: number | null;
  sale_type: string | null;
  expiry_date: string | null;
  expiry_photo_url: string | null;
  image_url: string | null;
  sku: string | null;
  is_available_storefront: boolean;
  created_at: string;
  updated_at: string;
}

export const inventoryApi = {
  list: () => (isDemoMode() ? Promise.resolve(DEMO_INVENTORY)
                            : apiRequest<InventoryItem[]>("/api/inventory/")),

  get: (id: string) => (isDemoMode() ? Promise.resolve(DEMO_INVENTORY.find(i => i.id === id) || DEMO_INVENTORY[0])
                                     : apiRequest<InventoryItem>(`/api/inventory/${id}/`)),

  getByBarcode: (barcode: string) => (isDemoMode() ? Promise.resolve(DEMO_INVENTORY.find(i => i.barcode === barcode) || null)
                                                   : apiRequest<InventoryItem | null>(`/api/inventory/barcode/${barcode}/`)),

  // ✅ criação corrigida para rota real
  create: (data: Partial<InventoryItem>) =>
    isDemoMode()
      ? Promise.resolve({ ...DEMO_INVENTORY[0], ...data } as InventoryItem)
      : apiRequest<InventoryItem>("/api/stock/entry/", {
          method: "POST",
          body: JSON.stringify(data),
        }),

  update: (id: string, data: Partial<InventoryItem>) =>
    apiRequest<InventoryItem>(`/api/inventory/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiRequest<void>(`/api/inventory/${id}/`, { method: "DELETE" }),
};

// ── Inventory Batches ──
export interface InventoryBatch {
  id: string;
  inventory_item_id: string;
  quantity: number;
  cost_price: number;
  expiry_date: string | null;
  expiry_photo_url: string | null;
  created_at: string;
}

export const batchApi = {
  listByItem: (itemId: string) => {
    if (isDemoMode()) return Promise.resolve(DEMO_BATCHES[itemId] || []);
    return apiRequest<InventoryBatch[]>(`/api/inventory/${itemId}/batches/`);
  },

  create: (itemId: string, data: Omit<InventoryBatch, "id" | "inventory_item_id" | "created_at">) => {
    if (isDemoMode()) return Promise.resolve({ id: "b-new", inventory_item_id: itemId, created_at: new Date().toISOString(), ...data } as InventoryBatch);
    return apiRequest<InventoryBatch>(`/api/inventory/${itemId}/batches/`, { method: "POST", body: JSON.stringify(data) });
  },
};

// ── Movements ──
export type TransactionType = "venda" | "uso_proprio" | "presente" | "brinde" | "perda";

export interface Movement {
  id: string;
  product_id: string | null;
  batch_id: string | null;
  product_name: string;
  barcode: string;
  movement_type: "entrada" | "saida";
  quantity: number;
  unit_price: number | null;
  sale_type: TransactionType | null;
  notes: string | null;
  profit: number | null;
  created_at: string;
}

export const movementsApi = {
  list: () => {
    if (isDemoMode()) return Promise.resolve(DEMO_MOVEMENTS);
    return apiRequest<Movement[]>("/api/movements/");
  },

  create: (data: Omit<Movement, "id" | "created_at" | "profit">) => {
    if (isDemoMode()) return Promise.resolve({ id: "m-new", created_at: new Date().toISOString(), profit: null, ...data } as Movement);
    return apiRequest<Movement>("/api/movements/", { method: "POST", body: JSON.stringify(data) });
  },
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
  get: () => {
    if (isDemoMode()) return Promise.resolve(DEMO_PROFILE);
    return apiRequest<Profile>("/api/profile/");
  },

  update: (data: Partial<Profile>) => {
    if (isDemoMode()) return Promise.resolve({ ...DEMO_PROFILE, ...data } as Profile);
    return apiRequest<Profile>("/api/profile/", { method: "PATCH", body: JSON.stringify(data) });
  },
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
        d1: "/products/kaiak.jpg",
        d2: "/products/luna.jpg",
        d3: "/products/tododia.jpg",
        d4: "/products/chronos.jpg",
        d6: "/products/batom.jpg",
        d7: "/products/ekos.jpg",
      };
      const demoItems: StorefrontItem[] = DEMO_INVENTORY
        .filter((i) => i.is_available_storefront && i.quantity > 0)
        .map((i) => ({
          id: i.id,
          product_name: i.product_name,
          display_name: i.custom_name || i.product_name,
          custom_name: i.custom_name,
          category: i.category,
          sale_price: i.sale_price,
          barcode: i.barcode,
          expiry_date: i.expiry_date,
          seller_name: DEMO_PROFILE.display_name,
          seller_whatsapp: DEMO_PROFILE.whatsapp_number,
          user_id: "demo",
          image_url: imageMap[i.id] || i.image_url || null,
          store_slug: DEMO_PROFILE.store_slug,
        }));
      return Promise.resolve(demoItems);
    }
    // Support both slug and ID
    const params = sellerId ? `?seller=${sellerId}` : "";
    return apiRequest<StorefrontItem[]>(`/api/storefront/${params}`);
  },

  listBySlug: (slug: string) => {
    if (slug === "demo") return storefrontApi.list("demo");
    return apiRequest<StorefrontItem[]>(`/api/storefront/?slug=${slug}`);
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
