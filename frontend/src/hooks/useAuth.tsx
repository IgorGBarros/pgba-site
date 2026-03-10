import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/api";

// 1. IMPORTAÇÕES DO FIREBASE (Certifique-se que o caminho "../lib/firebaseConfig" está correto)
import { auth, googleProvider, signInWithPopup } from "../firebaseConfig";

// 2. INTERFACE DO USUÁRIO
export interface User {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
}

// 3. INTERFACE DO CONTEXTO
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

  // Carrega usuário da sessão ao iniciar
  useEffect(() => {
    const loadStorageData = () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  // --- LOGIN NORMAL (Email/Senha) ---
  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("auth/login/", { username: email, password });
      const { access, user: userData } = response.data;

      localStorage.setItem("auth_token", access);
      localStorage.setItem("auth_user", JSON.stringify(userData || { email }));

      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      setUser(userData || { email, name: email.split('@')[0] });
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  // --- CADASTRO ---
  const signUp = async (email: string, password: string, name: string) => {
      await api.post("auth/register/", { username: email, email, password, first_name: name });
  };

  // --- LOGIN GOOGLE (Firebase -> Django) ---
  const signInWithGoogle = async () => {
    try {
      // Abre o popup do Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // Obtém o Token JWT do Firebase (Força renovação com 'true')
      const idToken = await result.user.getIdToken(true);

      if (!idToken) {
          throw new Error("Falha ao gerar token do Google.");
      }

      // Envia o token para o Django validar
      const response = await api.post("auth/firebase/", { token: idToken });
      
      // Salva a sessão retornada pelo seu Backend (Django)
      const token = response.data.access; 
      const userData: User = { 
          id: response.data.id || 0,
          email: response.data.email, 
          name: response.data.name || "Usuário" 
      };

      if (token) {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(userData));
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(userData);
      } else {
          throw new Error("Token de acesso não retornado pelo servidor.");
      }

    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    }
  };

  // --- LOGIN DEMO (Teste Rápido) ---
  const signInDemo = () => {
      const demoUser: User = { id: 999, email: "demo@natura.com", name: "Consultora Demo" };
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
    // Tenta deslogar do firebase também
    try { await auth.signOut(); } catch (e) {}
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