import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";

// 1. IMPORTAÇÕES DO FIREBASE
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";

// 2. INTERFACE DO USUÁRIO
export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
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
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CARREGAR SESSÃO INICIAL ---
  useEffect(() => {
    const loadStorageData = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      
      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
        
        try {
          // 🚀 CORREÇÃO: Removido o /api/ duplicado
          await api.get("/profile/");
        } catch (error: any) {
          if (error.response && error.response.status === 401) {
            localStorage.clear();
            delete api.defaults.headers.common["Authorization"];
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    
    loadStorageData();
  }, []);

  // --- LOGIN NORMAL (Email/Senha) ---
  const signIn = async (email: string, password: string) => {
    try {
      // 🚀 CORREÇÃO: Removido o /api/ duplicado
      const response = await api.post("/auth/login/", { email, password });
      const { access } = response.data;
      
      const userData: User = { id: 0, email: email, name: email.split('@')[0] };
      localStorage.setItem("auth_token", access);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser(userData);
      
    } catch (error) {
      console.error("Erro no login padrão:", error);
      throw error;
    }
  };

  // --- CADASTRO MANUAL ---
  const signUp = async (email: string, password: string, name: string) => {
    // 🚀 CORREÇÃO: Removido o /api/ duplicado
    await api.post("/auth/register/", { email, password, name });
  };

  // --- LOGIN GOOGLE (Firebase -> Django) ---
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const idToken = await result.user.getIdToken(true);
      if (!idToken) {
          throw new Error("Falha ao gerar credencial do Google.");
      }
      
      // 🚀 CORREÇÃO: Removido o /api/ duplicado para parar de dar 404
      const response = await api.post("/auth/firebase/", { token: idToken });
      
      const token = response.data.access; 
      
      if (!token) {
          throw new Error("Token de acesso não retornado pelo servidor Django.");
      }
      const userData: User = { 
          id: response.data.id || 0,
          email: response.data.email, 
          name: response.data.name || "Consultora" 
      };
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setUser(userData);
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
      const demoUser: User = { id: 999, email: "demo@natura.com", name: "Consultora Teste" };
      setUser(demoUser);
      localStorage.setItem("auth_user", JSON.stringify(demoUser));
      localStorage.setItem("auth_token", "demo_token_123");
      api.defaults.headers.common["Authorization"] = `Bearer demo_token_123`;
  };

  // --- LOGOUT ---
  const signOut = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    
    try { 
      await auth.signOut().catch(() => {});
      localStorage.clear();
      delete api.defaults.headers.common["Authorization"]; 
    } catch (e) {}
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
        isAuthenticated: !!user
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