import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";
// 1. IMPORTAÇÕES DO FIREBASE
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";

// ✅ SISTEMA DE CACHE DE PROFILE
let profileCache: any | null = null;
let profileCacheTimestamp: number = 0;
const PROFILE_CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

function isProfileCacheValid(): boolean {
  return profileCache !== null && 
         (Date.now() - profileCacheTimestamp) < PROFILE_CACHE_DURATION;
}

// ✅ API DE PROFILE OTIMIZADA
const profileApi = {
  get: async (forceRefresh = false): Promise<any> => {
    console.log(`👤 Carregando profile (forceRefresh: ${forceRefresh})`);
    
    // ✅ Usar cache se válido e não forçar refresh
    if (!forceRefresh && isProfileCacheValid()) {
      console.log("⚡ Usando cache do profile");
      return profileCache!;
    }
    
    try {
      console.log("🔄 Buscando profile da API...");
      const response = await api.get('/profile/');
      const data = response.data;
      
      // ✅ Atualizar cache
      profileCache = data;
      profileCacheTimestamp = Date.now();
      
      console.log("✅ Profile carregado e cacheado:", data);
      return data;
      
    } catch (error: any) {
      console.error("❌ Erro ao carregar profile:", error);
      
      // ✅ Fallback para cache antigo se existir
      if (profileCache) {
        console.log("🔄 Usando cache antigo do profile");
        return profileCache;
      }
      
      throw error;
    }
  },

  clearCache: () => {
    console.log("🧹 Limpando cache do profile");
    profileCache = null;
    profileCacheTimestamp = 0;
  }
};

// 2. INTERFACE DO USUÁRIO
export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  // ✅ Adicionar campos do profile se necessário
  display_name?: string;
  store_name?: string;
  plan?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>; // ✅ NOVA FUNÇÃO
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false); // ✅ NOVO ESTADO

  // ✅ CARREGAR SESSÃO INICIAL OTIMIZADA
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    
    if (!storedToken) {
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    // ✅ Configurar token primeiro
    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    try {
      console.log("🔐 Token encontrado, carregando profile...");
      
      // ✅ UMA ÚNICA CHAMADA DE PROFILE COM CACHE
      const profileData = await profileApi.get();
      
      // ✅ Mesclar dados do profile com dados básicos do usuário
      const userData: User = {
        ...(storedUser ? JSON.parse(storedUser) : {}),
        ...profileData,
        id: profileData.id || (storedUser ? JSON.parse(storedUser).id : 0),
        email: profileData.email || (storedUser ? JSON.parse(storedUser).email : ''),
        name: profileData.display_name || profileData.name || (storedUser ? JSON.parse(storedUser).name : '')
      };
      
      setUser(userData);
      
      // ✅ Atualizar localStorage com dados completos
      localStorage.setItem("auth_user", JSON.stringify(userData));
      
      console.log("✅ Profile carregado na inicialização:", userData);
      
    } catch (error: any) {
      console.error("❌ Erro ao carregar profile inicial:", error);
      
      if (error.response?.status === 401) {
        // ✅ Limpar tudo se não autorizado
        localStorage.clear();
        delete api.defaults.headers.common["Authorization"];
        profileApi.clearCache();
        setUser(null);
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // ✅ LOGIN NORMAL OTIMIZADO
  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login/", { email, password });
      const { access } = response.data;
      
      // ✅ Configurar token
      localStorage.setItem("auth_token", access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      
      // ✅ Carregar profile completo após login
      const profileData = await profileApi.get(true); // Forçar refresh
      
      const userData: User = {
        id: profileData.id || 0,
        email: profileData.email || email,
        name: profileData.display_name || profileData.name || email.split('@')[0],
        ...profileData
      };
      
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setUser(userData);
      
      console.log("✅ Login realizado com profile completo:", userData);
      
    } catch (error) {
      console.error("Erro no login padrão:", error);
      throw error;
    }
  };

  // --- CADASTRO MANUAL ---
  const signUp = async (email: string, password: string, name: string) => {
    await api.post("/auth/register/", { email, password, name });
  };

  // ✅ LOGIN GOOGLE OTIMIZADO
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      
      if (!idToken) {
        throw new Error("Falha ao gerar credencial do Google.");
      }
      
      const response = await api.post("/auth/firebase/", { token: idToken });
      const token = response.data.access;
      
      if (!token) {
        throw new Error("Token de acesso não retornado pelo servidor Django.");
      }
      
      // ✅ Configurar token
      localStorage.setItem("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // ✅ Carregar profile completo
      const profileData = await profileApi.get(true); // Forçar refresh
      
      const userData: User = {
        id: profileData.id || response.data.id || 0,
        email: profileData.email || response.data.email,
        name: profileData.display_name || profileData.name || response.data.name || "Consultora",
        ...profileData
      };
      
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setUser(userData);
      
      console.log("✅ Login Google realizado com profile completo:", userData);
      
    } catch (error: any) {
      console.error("Erro completo Google Sign-In:", error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  };

  // --- LOGIN DE DEMONSTRAÇÃO ---
  const signInDemo = () => {
    const demoUser: User = { 
      id: 999, 
      email: "demo@natura.com", 
      name: "Consultora Teste",
      display_name: "Consultora Teste",
      store_name: "Loja Demo",
      plan: "FREE"
    };
    
    setUser(demoUser);
    localStorage.setItem("auth_user", JSON.stringify(demoUser));
    localStorage.setItem("auth_token", "demo_token_123");
    api.defaults.headers.common["Authorization"] = `Bearer demo_token_123`;
  };

  // ✅ LOGOUT OTIMIZADO
  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common["Authorization"];
    
    // ✅ Limpar cache do profile
    profileApi.clearCache();
    
    setUser(null);
    setIsInitialized(false); // ✅ Resetar inicialização
    
    try {
      await auth.signOut().catch(() => {});
      localStorage.clear();
    } catch (e) {
      console.warn("Erro ao fazer logout do Firebase:", e);
    }
  };

  // ✅ NOVA FUNÇÃO: Atualizar profile manualmente
  const refreshProfile = async () => {
    try {
      console.log("🔄 Atualizando profile manualmente...");
      const profileData = await profileApi.get(true); // Forçar refresh
      
      const updatedUser = {
        ...user,
        ...profileData
      };
      
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      
      console.log("✅ Profile atualizado:", updatedUser);
    } catch (error) {
      console.error("❌ Erro ao atualizar profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInDemo,
        signOut,
        isAuthenticated: !!user,
        refreshProfile // ✅ NOVA FUNÇÃO DISPONÍVEL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};