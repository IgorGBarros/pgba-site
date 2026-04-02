// lib/api.ts - VERSÃO CORRIGIDA (REMOVER A PRIMEIRA sessionApi)

import {
  isDemoMode, DEMO_INVENTORY, DEMO_MOVEMENTS,
  DEMO_PROFILE, DEMO_BATCHES
} from "./demoData";
import { api } from "../services/api";

// ✅ Base URL sem /api/ (será adicionado pelo services/api.ts)
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

// ✅ CORREÇÃO: Função apiRequest atualizada para usar Axios quando possível
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  // ✅ CORREÇÃO: Adicionar /api/ aqui já que foi removido do services/api.ts
  const fullUrl = `${API_BASE_URL}/api${endpoint}`;
  console.log(`🔄 API Request: ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, { ...options, headers });
    
    console.log(`📊 Response Status: ${response.status} for ${endpoint}`);
    
    if (response.status === 401) {
      console.log("🔐 Token expirado, redirecionando para login");
      clearToken();
      clearAppCache();
      window.location.href = "/auth";
      throw new Error("Sessão expirada");
    }
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}`;
      try {
        const body = await response.json();
        errorMessage = body.detail || body.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      
      console.error(`❌ API Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) return null as T;
    
    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`, data);
    return data;
    
  } catch (error) {
    console.error(`❌ API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

// ── Auth (usando apiRequest para consistência) ──
export interface AuthUser {
  id: number | string;
  email: string;
  name?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string) =>
    apiRequest<{ token: string; user: AuthUser }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  firebaseLogin: (firebaseIdToken: string) =>
    apiRequest<{ access: string; refresh: string }>("/auth/firebase/", {
      method: "POST",
      body: JSON.stringify({ token: firebaseIdToken }),
    }),
  me: () => apiRequest<AuthUser>("/auth/me/"),
  logout: () => apiRequest<void>("/auth/logout/", { method: "POST" }).catch(() => {}),
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
      `/products/lookup/?q=${encodeURIComponent(query)}`
    );
  },
  confirmMatch: (barcode: string, productId: number) =>
    apiRequest<GlobalProduct>("/products/confirm-match/", {
      method: "POST",
      body: JSON.stringify({ barcode, product_id: productId }),
    }),
};

// ✅ Sistema de cache (mantido igual)
let inventoryCache: InventoryItem[] | null = null;
let movementsCache: Movement[] | null = null;
let cacheTimestamp: { inventory?: number; movements?: number } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const clearAppCache = () => {
  console.log("🧹 Limpando cache da aplicação");
  inventoryCache = null;
  movementsCache = null;
  cacheTimestamp = {};
};

function isCacheValid(type: 'inventory' | 'movements'): boolean {
  const timestamp = cacheTimestamp[type];
  if (!timestamp) return false;
  
  const isValid = Date.now() - timestamp < CACHE_DURATION;
  if (!isValid) {
    console.log(`⏰ Cache ${type} expirado`);
  }
  return isValid;
}

// ── Inventory (usando endpoints corretos) ──
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
    brand?: string;
  };
  
  batches?: InventoryBatch[];
  quantity?: number;
  barcode?: string;
  product_name?: string;
  custom_name?: string | null;
  category?: string;
  brand?: string | null;
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
    const res = await apiRequest<InventoryItem>("/stock/entry/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    clearAppCache();
    return res;
  }
};

export const inventoryApi = {
  list: async (forceRefresh = false) => {
    console.log(`📦 Carregando inventário (forceRefresh: ${forceRefresh})`);
    
    if (isDemoMode()) {
      console.log("🎭 Modo demo ativo, retornando dados demo");
      return DEMO_INVENTORY;
    }
    
    if (!forceRefresh && inventoryCache && isCacheValid('inventory')) {
      console.log("⚡ Usando cache do inventário");
      return inventoryCache;
    }
    
    try {
      console.log("🔄 Buscando inventário da API...");
      const data = await apiRequest<InventoryItem[]>("/inventory/");
      
      if (!Array.isArray(data)) {
        console.error("❌ Dados do inventário inválidos:", data);
        throw new Error("Formato de dados inválido");
      }
      
      console.log(`✅ Inventário carregado: ${data.length} itens`);
      inventoryCache = data;
      cacheTimestamp.inventory = Date.now();
      return data;
      
    } catch (error) {
      console.error("❌ Erro ao carregar inventário:", error);
      
      if (inventoryCache) {
        console.log("🔄 Usando cache antigo como fallback");
        return inventoryCache;
      }
      
      console.log("📦 Retornando inventário vazio");
      return [];
    }
  },
  
  get: (id: string) => (isDemoMode() ? Promise.resolve(DEMO_INVENTORY.find(i => i.id === id) || DEMO_INVENTORY[0])
                                     : apiRequest<InventoryItem>(`/inventory/${id}/`)),
                                     
  getByBarcode: async (barcode: string) => {
    if (isDemoMode()) return DEMO_INVENTORY.find(i => i.barcode === barcode) || null;
    
    try {
      const items = await inventoryApi.list();
      return items.find(i => i.product?.bar_code === barcode || i.barcode === barcode) || null;
    } catch (error) {
      console.error("❌ Erro ao buscar por código de barras:", error);
      return null;
    }
  },
  
  update: async (id: string, data: Partial<InventoryItem>) => {
    const res = await apiRequest<InventoryItem>(`/inventory/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    clearAppCache();
    return res;
  },
  
  delete: async (id: string) => {
    await apiRequest<void>(`/inventory/${id}/`, { method: "DELETE" });
    clearAppCache();
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
    return apiRequest<InventoryBatch[]>(`/inventory/${itemId}/batches/`);
  },
  create: async (itemId: string, data: Omit<InventoryBatch, "id" | "inventory_item_id" | "created_at">) => {
    if (isDemoMode()) return { id: "b-new", inventory_item_id: itemId, created_at: new Date().toISOString(), ...data } as InventoryBatch;
    const res = await apiRequest<InventoryBatch>(`/inventory/${itemId}/batches/`, { method: "POST", body: JSON.stringify(data) });
    clearAppCache();
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
  list: async (forceRefresh = false) => {
    console.log(`📈 Carregando movimentações (forceRefresh: ${forceRefresh})`);
    
    if (isDemoMode()) {
      console.log("🎭 Modo demo ativo, retornando movimentações demo");
      return DEMO_MOVEMENTS;
    }
    
    if (!forceRefresh && movementsCache && isCacheValid('movements')) {
      console.log("⚡ Usando cache das movimentações");
      return movementsCache;
    }
    
    try {
      console.log("🔄 Buscando movimentações da API...");
      const data = await apiRequest<Movement[]>("/transactions/");
      
      if (!Array.isArray(data)) {
        console.error("❌ Dados das movimentações inválidos:", data);
        throw new Error("Formato de dados inválido");
      }
      
      console.log(`✅ Movimentações carregadas: ${data.length} itens`);
      movementsCache = data;
      cacheTimestamp.movements = Date.now();
      return data;
      
    } catch (error) {
      console.error("❌ Erro ao carregar movimentações:", error);
      
      if (movementsCache) {
        console.log("🔄 Usando cache antigo como fallback");
        return movementsCache;
      }
      
      console.log("📈 Retornando movimentações vazias");
      return [];
    }
  },
  
  create: async (data: Omit<Movement, "id" | "created_at" | "profit">) => {
    if (isDemoMode()) return { id: "m-new", created_at: new Date().toISOString(), profit: null, ...data } as Movement;
    const res = await apiRequest<Movement>("/transactions/", { method: "POST", body: JSON.stringify(data) });
    clearAppCache();
    return res;
  },
};

// ── Admin ──
export const adminApi = {
  listUsers: () => apiRequest<any[]>("/admin/users/"),
  updatePlan: (id: string | number, plan: "free" | "pro") =>
    apiRequest<{ message: string; plan: string }>(`/admin/users/${id}/plan/`, {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    }),
  updateSubscription: (id: string | number, data: any) =>
    apiRequest<{ message: string }>(`/admin/users/${id}/subscription/`, {
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
  get: () => (isDemoMode() ? Promise.resolve(DEMO_PROFILE) : apiRequest<Profile>("/profile/")),
  update: (data: Partial<Profile>) => (isDemoMode() ? Promise.resolve({ ...DEMO_PROFILE, ...data } as Profile) : apiRequest<Profile>("/profile/", { method: "PATCH", body: JSON.stringify(data) })),
};

// ✅ Dashboard API (mantido igual)
export const dashboardApi = {
  getStats: async (forceRefresh = false) => {
    console.log(`📊 Carregando estatísticas do dashboard`);
    
    if (isDemoMode()) {
      const totalItems = DEMO_INVENTORY.length;
      const totalValue = DEMO_INVENTORY.reduce((sum, item) => sum + (item.sale_price || 0) * (item.quantity || 0), 0);
      const lowStock = DEMO_INVENTORY.filter(item => (item.quantity || 0) <= (item.min_quantity || 0)).length;
      const recentMovements = DEMO_MOVEMENTS.slice(0, 5);
      
      return {
        totalItems,
        totalValue,
        lowStock,
        recentMovements,
        totalMovements: DEMO_MOVEMENTS.length
      };
    }
    
    try {
      const [inventory, movements] = await Promise.all([
        inventoryApi.list(forceRefresh),
        movementsApi.list(forceRefresh)
      ]);
      
      const totalItems = inventory.length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.sale_price || 0) * (item.total_quantity || 0), 0);
      const lowStock = inventory.filter(item => (item.total_quantity || 0) <= (item.min_quantity || 0)).length;
      const recentMovements = movements.slice(0, 5);
      
      return {
        totalItems,
        totalValue,
        lowStock,
        recentMovements,
        totalMovements: movements.length
      };
      
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStock: 0,
        recentMovements: [],
        totalMovements: 0
      };
    }
  }
};

// ── Storefront (public) ──
export interface StorefrontItem {
  id: string;
  product_name?: string;
  display_name?: string;
  custom_name?: string | null;
  category?: string;
  brand?: string | null;
  sale_price?: number | null;
  total_quantity?: number;
  barcode?: string;
  expiry_date?: string | null;
  seller_name?: string | null;
  seller_whatsapp?: string | null;
  user_id?: string;
  image_url?: string | null;
  store_slug?: string | null;
  
  product?: {
    id: number | string;
    name: string;
    bar_code: string;
    natura_sku?: string;
    category: string;
    brand?: string | null;
    image_url?: string;
    official_price?: number;
  };
  
  stock_info?: {
    quantity: number;
    is_urgent: boolean;
    display_text: string;
  };
}

export const publicStorefrontApi = {
  listBySlug: async (slug: string) => {
    try {
      console.log(`🔍 Buscando vitrine por slug: ${slug}`);
      
      const response = await fetch(`${API_BASE_URL}/api/public/storefront/${slug}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 Status da resposta: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Não foi possível fazer parse do erro:', parseError);
        }
        
        console.error(`❌ Erro ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro na API publicStorefront:', error);
      throw error;
    }
  },
  
  listById: async (sellerId: string) => {
    try {
      console.log(`🔍 Buscando vitrine por ID: ${sellerId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/public/storefront/?seller=${sellerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Não foi possível fazer parse do erro:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro na API publicStorefront:', error);
      throw error;
    }
  }
};

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
          id: i.id, 
          product_name: i.product?.name || i.product_name || "Produto Demo",
          display_name: i.custom_name || i.product?.name || i.product_name || "Produto Demo",
          custom_name: i.custom_name || null, 
          category: i.product?.category || i.category || "Geral",
          brand: i.product?.brand || i.brand || null,
          sale_price: i.sale_price ?? null, 
          total_quantity: i.quantity ?? i.total_quantity ?? 0,
          barcode: i.product?.bar_code || i.barcode || "0000000000000",
          expiry_date: i.expiry_date ?? null, 
          seller_name: DEMO_PROFILE.display_name,
          seller_whatsapp: DEMO_PROFILE.whatsapp_number, 
          user_id: "demo",
          image_url: imageMap[i.id] || i.product?.image_url || i.image_url || null, 
          store_slug: DEMO_PROFILE.store_slug,
        }));
      return Promise.resolve(demoItems);
    }
    
    if (sellerId) {
      return publicStorefrontApi.listById(sellerId);
    }
    
    return apiRequest<StorefrontItem[]>("/storefront/");
  },
  
  listBySlug: (slug: string) => {
    if (slug === "demo") return storefrontApi.list("demo");
    return publicStorefrontApi.listBySlug(slug);
  },
};

// ── Outros serviços (mantidos iguais) ──
export { productService } from "./productService";

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

export function formatMoney(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const salesApi = {
  checkout: (payload: any) =>
    apiRequest<{ message: string; total: number }>("/sales/checkout/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ✅ FUNÇÕES HELPER (mantidas iguais)
export function getProductBrand(item: any): string | null {
  return item.product?.brand ||
         item.brand ||
         null;
}

export function getProductDisplayName(item: any): string {
  return item.product?.name ||
         item.display_name ||
         item.product_name ||
         item.custom_name ||
         "Produto sem nome";
}

export function getProductQuantity(item: any): number {
  return item.total_quantity ?? item.quantity ?? 0;
}

export const debugApi = {
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/`);
      return { status: response.status, ok: response.ok };
    } catch (error) {
      return { status: 0, ok: false, error };
    }
  },
  
  clearAllCache: () => {
    clearAppCache();
    localStorage.removeItem('demo_mode');
    console.log("🧹 Cache e configurações limpas");
  }
};

// ✅ INTERFACES PARA SESSION API
export interface SessionStatus {
  has_session: boolean;
  products_count?: number;
  duration_minutes?: number;
  total_estimated_cost?: number;
  session_id?: number;
}

export interface SessionSummary {
  products_count: number;
  total_estimated_cost: number;
  duration_minutes: number;
  session_id: number;
}

// ✅ SESSION API USANDO AXIOS (ÚNICA DECLARAÇÃO)
export const sessionApi = {
  getStatus: async (): Promise<SessionStatus> => {
    try {
      console.log('🔍 Verificando status da sessão...');
      const response = await api.get('/session-control/');
      console.log('✅ Status da sessão:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao verificar sessão:', error);
      if (error.response?.status === 404) {
        return { has_session: false };
      }
      return { has_session: false };
    }
  },

  startSession: async () => {
    const response = await api.post('/session-control/', { action: 'start' });
    return response.data;
  },

  finishSession: async () => {
    const response = await api.post('/session-control/', { action: 'finish' });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/session-summary/');
    return response.data;
  }
};